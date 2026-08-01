"""
schemas.py — tool declarations and the argument validator.

Two ideas live here, and both are interview material.

1. A tool declaration is a *prompt*. The model never sees your Python. It sees
   the name, the description and the parameter schema. If a tool is picked at
   the wrong time, the first thing to fix is usually the description, not the
   model.

2. Validation is your job, not the model's. Even with schema-constrained
   decoding, a model can produce a *schema-valid* call that is *semantically*
   wrong -- a well-formed string in `ticket_id` that names no ticket. Schema
   validity and semantic validity are different guarantees, and you need both.

The validator below is deliberately hand-written rather than pulled from
`jsonschema`. It is about fifty lines, it has no dependencies, and being able to
explain exactly what it checks is worth more in an interview than importing
something you cannot describe.
"""

from __future__ import annotations

from typing import Any


class ToolError(Exception):
    """Base class for anything wrong with a tool call."""


class UnknownToolError(ToolError):
    """The model asked for a tool that does not exist."""


class ArgumentError(ToolError):
    """The arguments did not satisfy the declared schema."""


# --------------------------------------------------------------------------
# Tool declarations. This list is what gets handed to the model.
# --------------------------------------------------------------------------
TOOL_SCHEMAS: list[dict[str, Any]] = [
    {
        "name": "read_ticket",
        # Written for a reader who has no other context. Note it says what the
        # tool is *for*, not just what it does, and it names the id format --
        # the two things that most improve tool-selection accuracy.
        "description": (
            "Fetch one support ticket by its id. Use this first whenever the "
            "request mentions a ticket. Ids look like TCK-1001."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "ticket_id": {
                    "type": "string",
                    "description": "Ticket id, e.g. TCK-1001",
                }
            },
            "required": ["ticket_id"],
            "additionalProperties": False,
        },
    },
    {
        "name": "lookup_order",
        "description": (
            "Fetch one order: amount, status, age in days, and whether it is "
            "refund eligible. Use this when a ticket references an order. Ids "
            "look like ORD-5581."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "order_id": {
                    "type": "string",
                    "description": "Order id, e.g. ORD-5581",
                }
            },
            "required": ["order_id"],
            "additionalProperties": False,
        },
    },
    {
        "name": "issue_refund",
        # Every clause here is doing safety work. It says the default is a
        # recommendation, that a human token is required to execute, and that
        # policy is checked elsewhere -- so the model does not believe arguing
        # about eligibility is part of its job.
        "description": (
            "Prepare a refund. By default this only CHECKS policy and returns a "
            "recommendation -- it does not move money. Executing a refund "
            "requires dry_run=false AND an approval_token issued by a human. "
            "Eligibility is decided by policy, not by you: if policy refuses, "
            "explain the reason to the customer or escalate."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string", "description": "Order to refund, e.g. ORD-5581"},
                "amount": {
                    "type": "number",
                    "description": "Amount to refund; cannot exceed the order total",
                    "minimum": 0.01,
                },
                "reason": {
                    "type": "string",
                    "description": "Why this refund is being requested",
                    "minLength": 5,
                },
                "approval_token": {
                    "type": "string",
                    "description": "Token from a human approver. You cannot create one.",
                },
                "dry_run": {
                    "type": "boolean",
                    "description": "True (default) checks policy only. False attempts payment.",
                },
            },
            "required": ["order_id", "amount", "reason"],
            "additionalProperties": False,
        },
    },
    {
        "name": "escalate",
        # Giving up needs to be an *available action*, not an absence of action.
        # An agent with no escalate tool has only two options when it cannot
        # establish the facts: guess, or loop. Both are worse than handing over.
        "description": (
            "Hand this ticket to a human, with a reason. Use this when you "
            "cannot establish the facts, when policy forbids what the customer "
            "asked for, or when the request needs authority you do not have. "
            "Escalating is a correct outcome, not a failure."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "ticket_id": {"type": "string", "description": "Ticket being escalated"},
                "reason": {
                    "type": "string",
                    "description": "Why a human is needed, specifically",
                    "minLength": 10,
                },
                "urgency": {
                    "type": "string",
                    "description": "How soon a human should look",
                    "enum": ["low", "normal", "high"],
                },
            },
            "required": ["ticket_id", "reason"],
            "additionalProperties": False,
        },
    },
    {
        "name": "draft_reply",
        # Note what this description does NOT say: it does not say "send".
        # The name and the description together set the model's expectation of
        # how far its authority reaches. A tool called `send_reply` would invite
        # the model to believe it had already contacted the customer.
        "description": (
            "Compose a draft reply to the customer. Returns the draft for a "
            "human to review -- it does not send anything. Cite the knowledge "
            "base article ids you relied on so the reviewer can check them."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "ticket_id": {"type": "string", "description": "Ticket being answered"},
                "summary": {
                    "type": "string",
                    "description": "One or two sentences on what is wrong",
                    "minLength": 10,
                },
                "next_step": {
                    "type": "string",
                    "description": "What happens next, in plain language",
                    "minLength": 5,
                },
                "citations": {
                    "type": "array",
                    "description": "Knowledge base article ids supporting the reply",
                    "items": {"type": "string"},
                    "maxItems": 4,
                },
            },
            "required": ["ticket_id", "summary", "next_step"],
            "additionalProperties": False,
        },
    },
    {
        "name": "search_kb",
        "description": (
            "Search the support knowledge base for the policy that applies. "
            "Use this before advising a customer, so the answer quotes policy "
            "rather than inventing it. Query with a topic such as 'billing', "
            "'refund', 'shipping' or 'checkout'."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Topic or keywords to search for",
                    "minLength": 2,
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum articles to return (1-5, default 3)",
                    "minimum": 1,
                    "maximum": 5,
                },
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
]


def schema_for(name: str) -> dict[str, Any]:
    for spec in TOOL_SCHEMAS:
        if spec["name"] == name:
            return spec
    raise UnknownToolError(
        f"No tool named {name!r}. Available tools: "
        + ", ".join(s["name"] for s in TOOL_SCHEMAS)
    )


# --------------------------------------------------------------------------
# The validator
# --------------------------------------------------------------------------
_JSON_TYPES: dict[str, type | tuple[type, ...]] = {
    "string": str,
    "integer": int,
    "number": (int, float),
    "boolean": bool,
    "object": dict,
    "array": list,
}


def validate_arguments(tool_name: str, arguments: Any) -> dict[str, Any]:
    """
    Check `arguments` against the tool's declared schema and return a clean copy.

    Raises ArgumentError with a message aimed at whoever has to fix it -- which
    in an agent is often the model itself, on a repair attempt. A message like
    "unexpected argument 'ticket'" is actionable; "invalid input" is not.
    """
    spec = schema_for(tool_name)
    schema = spec["parameters"]

    if not isinstance(arguments, dict):
        raise ArgumentError(
            f"{tool_name}: arguments must be an object, got {type(arguments).__name__}"
        )

    properties: dict[str, Any] = schema.get("properties", {})
    required: list[str] = schema.get("required", [])

    # Both classes of key problem are collected before raising. A misspelled
    # argument produces *two* faults at once -- the unexpected key and the
    # missing one it was meant to be -- and reporting only the second sends a
    # repair attempt hunting for the wrong thing. "unexpected 'ticket'; missing
    # 'ticket_id'" is a fix instruction; "missing 'ticket_id'" alone is a riddle.
    faults: list[str] = []

    if schema.get("additionalProperties") is False:
        unexpected = set(arguments) - set(properties)
        if unexpected:
            faults.append(
                "unexpected argument(s) "
                + ", ".join(sorted(repr(u) for u in unexpected))
            )

    missing = [key for key in required if key not in arguments]
    if missing:
        faults.append(
            "missing required argument(s) " + ", ".join(repr(k) for k in missing)
        )

    if faults:
        allowed = ", ".join(sorted(properties)) or "(none)"
        raise ArgumentError(
            f"{tool_name}: " + "; ".join(faults) + f". Allowed: {allowed}"
        )

    clean: dict[str, Any] = {}
    for key, value in arguments.items():
        rule = properties.get(key, {})
        expected = rule.get("type")

        if expected:
            python_type = _JSON_TYPES.get(expected)
            # bool is a subclass of int in Python; an agent passing True where a
            # count belongs is a real bug, so reject it rather than coerce.
            if expected in ("integer", "number") and isinstance(value, bool):
                raise ArgumentError(
                    f"{tool_name}.{key}: expected {expected}, got boolean"
                )
            if python_type and not isinstance(value, python_type):
                raise ArgumentError(
                    f"{tool_name}.{key}: expected {expected}, "
                    f"got {type(value).__name__}"
                )

        if expected == "string":
            if "minLength" in rule and len(value) < rule["minLength"]:
                raise ArgumentError(
                    f"{tool_name}.{key}: must be at least "
                    f"{rule['minLength']} characters"
                )
            if "enum" in rule and value not in rule["enum"]:
                raise ArgumentError(
                    f"{tool_name}.{key}: must be one of {rule['enum']}, got {value!r}"
                )

        if expected in ("integer", "number"):
            if "minimum" in rule and value < rule["minimum"]:
                raise ArgumentError(
                    f"{tool_name}.{key}: must be >= {rule['minimum']}, got {value}"
                )
            if "maximum" in rule and value > rule["maximum"]:
                raise ArgumentError(
                    f"{tool_name}.{key}: must be <= {rule['maximum']}, got {value}"
                )

        # Arrays need their *contents* checked, not just their type. A list of
        # citations where one entry is a dict will pass an `isinstance(value,
        # list)` check and then explode somewhere far away -- validate at the
        # boundary, where the error can still name the offending index.
        if expected == "array":
            if "maxItems" in rule and len(value) > rule["maxItems"]:
                raise ArgumentError(
                    f"{tool_name}.{key}: at most {rule['maxItems']} items, "
                    f"got {len(value)}"
                )
            item_type = (rule.get("items") or {}).get("type")
            if item_type:
                py = _JSON_TYPES.get(item_type)
                for i, item in enumerate(value):
                    if py and not isinstance(item, py):
                        raise ArgumentError(
                            f"{tool_name}.{key}[{i}]: expected {item_type}, "
                            f"got {type(item).__name__}"
                        )

        clean[key] = value

    return clean
