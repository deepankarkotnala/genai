"""
mcp_server/server.py — the tool boundary, made explicit.

Lesson 12. MCP (Model Context Protocol) standardises how a host application
offers tools to a model. Before it, every host invented its own tool format, so
N hosts times M tool providers meant N x M integrations. MCP makes it N + M.

Three roles, and getting them straight is most of the interview:

    HOST     the application the user talks to (an IDE, a chat app, our agent)
    CLIENT   lives inside the host; speaks MCP to one server
    SERVER   exposes capabilities: tools, resources, prompts

This file is a **server**, implemented from scratch over JSON-RPC 2.0 rather
than with an SDK, because the point of the lesson is that MCP is a *protocol*,
not a library -- about 150 lines of request routing.

The security decision this file exists to make
----------------------------------------------
It exposes `read_ticket`, `lookup_order` and `search_kb`.
It does NOT expose `issue_refund`, `draft_reply` or `escalate`.

That is not an oversight. **A tool exposed over MCP is a tool any connected host
can call**, and the approval gate from Lesson 8 lives in our process, not in the
protocol. Publishing `issue_refund` would mean trusting every future client to
reproduce policy checks, idempotency and the approval gate correctly. The
boundary is drawn where the trust ends: read-only crosses it, money does not.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agent.schemas import TOOL_SCHEMAS, ArgumentError, UnknownToolError, validate_arguments  # noqa: E402
from agent.tools import REGISTRY  # noqa: E402

PROTOCOL_VERSION = "2025-06-18"
SERVER_NAME = "support-readonly"
SERVER_VERSION = "1.0.0"

# The allowlist IS the security policy. Note it is an allowlist, not a
# deny-list: a tool added to REGISTRY by a future lesson is NOT exposed until
# someone deliberately adds it here. Deny-lists fail open; allowlists fail shut.
EXPOSED_TOOLS = {"read_ticket", "lookup_order", "search_kb"}

# Standard JSON-RPC 2.0 codes. Using the spec's numbers matters: a client
# written against the spec knows what -32601 means without reading your docs.
PARSE_ERROR = -32700
INVALID_REQUEST = -32600
METHOD_NOT_FOUND = -32601
INVALID_PARAMS = -32602
INTERNAL_ERROR = -32603


class McpError(Exception):
    def __init__(self, code: int, message: str, data: Any = None) -> None:
        super().__init__(message)
        self.code, self.message, self.data = code, message, data


@dataclass
class Server:
    """A minimal MCP server over JSON-RPC 2.0."""

    initialised: bool = False
    call_log: list[dict[str, Any]] = field(default_factory=list)

    # -- capability discovery ---------------------------------------------
    def _initialize(self, params: dict[str, Any]) -> dict[str, Any]:
        """
        The handshake. The client says what it can do; the server replies with
        what it offers. Everything after this is negotiated rather than assumed,
        which is what lets a host talk to servers it has never seen.
        """
        self.initialised = True
        return {
            "protocolVersion": PROTOCOL_VERSION,
            "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
            # We declare `tools` only. Declaring `resources` or `prompts` we do
            # not implement would be a lie the client would act on.
            "capabilities": {"tools": {"listChanged": False}},
            "instructions": (
                "Read-only support data: tickets, orders and knowledge base. "
                "No write operations are available from this server."
            ),
        }

    def _tools_list(self, params: dict[str, Any]) -> dict[str, Any]:
        """
        Capability discovery. The client learns names, descriptions and schemas
        at run time instead of having them hard-coded.

        Note it returns the SAME schema objects the agent uses in-process. One
        definition, two transports -- if they could drift apart, they would.
        """
        return {
            "tools": [
                {
                    "name": spec["name"],
                    "description": spec["description"],
                    "inputSchema": spec["parameters"],
                }
                for spec in TOOL_SCHEMAS
                if spec["name"] in EXPOSED_TOOLS
            ]
        }

    # -- invocation --------------------------------------------------------
    def _tools_call(self, params: dict[str, Any]) -> dict[str, Any]:
        name = params.get("name")
        arguments = params.get("arguments") or {}

        # The allowlist is checked BEFORE the registry, and the message does not
        # distinguish "not exposed" from "does not exist" -- otherwise the error
        # becomes a discovery oracle for tools you deliberately withheld.
        if name not in EXPOSED_TOOLS:
            raise McpError(
                METHOD_NOT_FOUND,
                f"No tool named {name!r} is available from this server.",
                data={"available": sorted(EXPOSED_TOOLS)},
            )

        handler: Callable[..., dict[str, Any]] | None = REGISTRY.get(name)
        if handler is None:                                     # pragma: no cover
            raise McpError(INTERNAL_ERROR, f"{name} is exposed but not implemented")

        try:
            clean = validate_arguments(name, arguments)
            result = handler(**clean)
        except (ArgumentError, UnknownToolError) as exc:
            raise McpError(INVALID_PARAMS, str(exc)) from exc

        self.call_log.append({"tool": name, "arguments": clean})

        # MCP returns content blocks, not raw values. A tool result is something
        # a model reads, so it is typed text -- the same reason our tools return
        # data and leave the phrasing to the model.
        return {
            "content": [{"type": "text", "text": json.dumps(result, default=str)}],
            "isError": bool(result.get("error")),
        }

    # -- dispatch ----------------------------------------------------------
    METHODS = {
        "initialize": "_initialize",
        "tools/list": "_tools_list",
        "tools/call": "_tools_call",
    }

    def handle(self, request: dict[str, Any]) -> dict[str, Any] | None:
        """One JSON-RPC request in, one response out (or None for a notification)."""
        if request.get("jsonrpc") != "2.0":
            return _error(request.get("id"), INVALID_REQUEST, "jsonrpc must be '2.0'")

        method = request.get("method")
        request_id = request.get("id")

        # No id means a notification: act, do not reply.
        if request_id is None:
            return None

        if method not in self.METHODS:
            return _error(request_id, METHOD_NOT_FOUND, f"Unknown method {method!r}")

        # Refuse work before the handshake. A server answering tools/call without
        # initialize has no idea what the client on the other end can handle.
        if method != "initialize" and not self.initialised:
            return _error(request_id, INVALID_REQUEST,
                          "initialize must be called before any other method")

        try:
            result = getattr(self, self.METHODS[method])(request.get("params") or {})
            return {"jsonrpc": "2.0", "id": request_id, "result": result}
        except McpError as exc:
            return _error(request_id, exc.code, exc.message, exc.data)
        except Exception as exc:                                # noqa: BLE001
            # Never leak an internal traceback across a protocol boundary: it is
            # free reconnaissance for whoever is on the other end.
            return _error(request_id, INTERNAL_ERROR, type(exc).__name__)


def _error(request_id: Any, code: int, message: str, data: Any = None) -> dict[str, Any]:
    err: dict[str, Any] = {"code": code, "message": message}
    if data is not None:
        err["data"] = data
    return {"jsonrpc": "2.0", "id": request_id, "error": err}


# --------------------------------------------------------------------------
# A client, so the lesson can show both ends of the wire
# --------------------------------------------------------------------------
class Client:
    """
    An in-process MCP client.

    The transport here is a direct method call. Real deployments use stdio for a
    local server or HTTP for a remote one, and that difference matters far more
    for trust than for code: a local server runs with your privileges, a remote
    one is a third party whose tool descriptions land inside your prompt.
    """

    def __init__(self, server: Server) -> None:
        self.server = server
        self._next_id = 0

    def _call(self, method: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        self._next_id += 1
        response = self.server.handle({
            "jsonrpc": "2.0", "id": self._next_id,
            "method": method, "params": params or {},
        })
        assert response is not None
        return response

    def initialize(self) -> dict[str, Any]:
        return self._call("initialize", {
            "protocolVersion": PROTOCOL_VERSION,
            "clientInfo": {"name": "support-triage-agent", "version": "1.0.0"},
            "capabilities": {},
        })

    def list_tools(self) -> list[dict[str, Any]]:
        return self._call("tools/list")["result"]["tools"]

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        return self._call("tools/call", {"name": name, "arguments": arguments})
