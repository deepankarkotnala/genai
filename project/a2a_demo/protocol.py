"""
a2a_demo/protocol.py — A2A: agents talking to agents.

Lesson 13. MCP connects an agent to *tools*. A2A connects an agent to *peers* --
another agent, possibly owned by another team or another company, which you
cannot call as a function because you do not run it.

The distinction interviewers probe:

    MCP   "here are capabilities you may invoke"     tool boundary
    A2A   "here is an agent you may delegate to"     peer boundary

Why a peer needs a different protocol from a tool: a tool call is a request and
a response. A peer may take minutes, need clarification halfway, stream partial
results, and produce several artifacts. So A2A is built around a **task with a
lifecycle** rather than a function with a return value.

Four concepts, implemented below:

    AGENT CARD   published metadata: who I am, what I can do, how to authenticate
    MESSAGE      a turn of conversation between two agents
    TASK         a unit of work with a state machine
    ARTIFACT     a durable output of a task (a draft, a report, a recommendation)

Deliberately small. This is a demonstration of the shape, not an implementation
of the specification -- and knowing the shape is what an interview tests.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any, Literal

# The task lifecycle. `input_required` is the state that makes A2A different
# from a tool call: the peer can stop and ask, then resume the same task.
TaskState = Literal["submitted", "working", "input_required", "completed", "failed", "canceled"]

TERMINAL_STATES = {"completed", "failed", "canceled"}


@dataclass
class AgentSkill:
    id: str
    name: str
    description: str
    # What this skill can be asked for, and -- just as important -- what it will
    # never do. Publishing the limit prevents a caller planning around a
    # capability you do not have.
    accepts: list[str] = field(default_factory=list)
    will_not: list[str] = field(default_factory=list)


@dataclass
class AgentCard:
    """
    Published capability metadata, the A2A analogue of MCP's `tools/list`.

    In a real deployment this is served at a well-known URL so a peer can
    discover you without a prior integration. Note `auth` and `will_not`: a card
    is a contract, and the honest half of a contract is what you refuse.
    """

    name: str
    version: str
    description: str
    skills: list[AgentSkill] = field(default_factory=list)
    auth: str = "bearer"
    streaming: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "authentication": {"schemes": [self.auth]},
            "capabilities": {"streaming": self.streaming},
            "skills": [
                {
                    "id": s.id, "name": s.name, "description": s.description,
                    "accepts": s.accepts, "willNot": s.will_not,
                }
                for s in self.skills
            ],
        }


@dataclass
class Message:
    role: Literal["user", "agent"]
    text: str
    data: dict[str, Any] = field(default_factory=dict)


@dataclass
class Artifact:
    """
    A durable output. Separate from the message stream on purpose: the
    conversation is how two agents coordinated; the artifact is the thing you
    keep, review and audit. Conflating them means a recommendation is buried in
    chat history rather than being a record.
    """

    name: str
    kind: str
    content: dict[str, Any]


@dataclass
class Task:
    """A unit of delegated work with an explicit state machine."""

    id: str
    skill_id: str
    state: TaskState = "submitted"
    messages: list[Message] = field(default_factory=list)
    artifacts: list[Artifact] = field(default_factory=list)
    error: str | None = None
    history: list[str] = field(default_factory=list)

    @classmethod
    def new(cls, skill_id: str, request: str, data: dict[str, Any] | None = None) -> "Task":
        task = cls(id="task_" + uuid.uuid4().hex[:10], skill_id=skill_id)
        task.messages.append(Message("user", request, data or {}))
        task.history.append("submitted")
        return task

    def transition(self, state: TaskState) -> None:
        """
        Move state, refusing illegal moves.

        A task that has completed cannot go back to working. Enforcing that in
        the type rather than by convention is what stops a late duplicate
        response from resurrecting finished work -- the same instinct as the
        append-only audit log in Lesson 8.
        """
        if self.state in TERMINAL_STATES:
            raise ValueError(f"task {self.id} is already {self.state}; cannot become {state}")
        self.state = state
        self.history.append(state)

    def say(self, role: Literal["user", "agent"], text: str, **data: Any) -> None:
        self.messages.append(Message(role, text, data))

    def produce(self, artifact: Artifact) -> None:
        self.artifacts.append(artifact)

    @property
    def done(self) -> bool:
        return self.state in TERMINAL_STATES
