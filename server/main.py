from __future__ import annotations

import json
import math
import os
import time
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv


class PolicyStepRequest(BaseModel):
    instance: dict[str, Any] = Field(default_factory=dict)
    observation: dict[str, Any] = Field(default_factory=dict)
    provider: str | None = None
    ttlMs: int | None = None


class PolicyStepResponse(BaseModel):
    actions: list[dict[str, Any]]
    reason: str
    provider: str
    ttlMs: int


BASE_DIR = Path(__file__).resolve().parent
ROOT_ENV = BASE_DIR.parent / ".env"
SERVER_ENV = BASE_DIR / ".env"
load_dotenv(ROOT_ENV, override=False)
load_dotenv(SERVER_ENV, override=False)

REQUEST_TIMEOUT_MS = int(os.getenv("RL_REQUEST_TIMEOUT_MS", "5000"))
DEFAULT_PROVIDER = os.getenv("RL_PROVIDER", "heuristic").lower()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_URL = os.getenv("OPENAI_URL", "https://api.openai.com/v1/chat/completions")
OPENAI_RESPONSES_URL = os.getenv("OPENAI_RESPONSES_URL", "https://api.openai.com/v1/responses")
OPENAI_USE_RESPONSES_API = os.getenv("OPENAI_USE_RESPONSES_API", "false").lower() in {
    "1", "true", "yes", "on"
}

HF_API_KEY = os.getenv("HF_API_KEY", "")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
HF_URL = os.getenv("HF_URL", f"https://api-inference.huggingface.co/models/{HF_MODEL}")

PORT = int(os.getenv("RL_POLICY_PORT", "8091"))

app = FastAPI(title="Gaesup RL Policy Server", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _clamp(value: int, min_value: int, max_value: int) -> int:
    return max(min_value, min(max_value, value))


def _resolve_default_target(observation: dict[str, Any]) -> list[float]:
    perceived = observation.get("perceived")
    if isinstance(perceived, list) and perceived:
        first = perceived[0]
        if isinstance(first, dict):
            pos = first.get("position")
            if isinstance(pos, list) and len(pos) >= 3:
                return [float(pos[0]), float(pos[1]), float(pos[2])]

    pos = observation.get("position")
    if isinstance(pos, list) and len(pos) >= 3:
        return [float(pos[0]), float(pos[1]), float(pos[2])]
    return [0.0, 0.0, 0.0]


def _coerce_action(action: Any, observation: dict[str, Any]) -> dict[str, Any] | None:
    if isinstance(action, str):
        action_type = action.strip()
        if action_type == "idle":
            return {"type": "idle"}
        if action_type == "wander":
            return {"type": "wander"}
        if action_type == "lookAt":
            return {"type": "lookAt", "target": _resolve_default_target(observation)}
        return None

    if not isinstance(action, dict):
        return None

    action_type = action.get("type")
    if not isinstance(action_type, str):
        return None

    if action_type == "lookAt":
        target = action.get("target")
        if not (isinstance(target, list) and len(target) >= 3):
            return {**action, "target": _resolve_default_target(observation)}
        return action

    if action_type == "moveTo":
        target = action.get("target")
        if not (isinstance(target, list) and len(target) >= 3):
            return None
        return action

    return action


def _normalize_actions(actions: Any, observation: dict[str, Any]) -> list[dict[str, Any]]:
    if not isinstance(actions, list):
        return []
    normalized: list[dict[str, Any]] = []
    for action in actions:
        coerced = _coerce_action(action, observation)
        if coerced is None:
            continue
        normalized.append(coerced)
        if len(normalized) >= 4:
            break
    return normalized


def _ensure_motion_action(actions: list[dict[str, Any]], observation: dict[str, Any]) -> list[dict[str, Any]]:
    has_motion = any(action.get("type") in {"moveTo", "patrol", "wander"} for action in actions)
    if has_motion:
        return actions

    current = _resolve_default_target(observation)
    timestamp = float(observation.get("timestamp") or time.time())
    angle = (math.sin(timestamp * 0.73) * 0.5 + 0.5) * math.pi * 2
    radius = 2.4
    target = [
        float(current[0]) + math.cos(angle) * radius,
        float(current[1]),
        float(current[2]) + math.sin(angle) * radius,
    ]
    return [
        *actions,
        {"type": "moveTo", "target": target, "speed": 2.0, "animationId": "walk"},
    ][:4]


def _extract_json(text: str) -> dict[str, Any] | None:
    text = text.strip()
    if not text:
        return None
    try:
        parsed = json.loads(text)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        pass

    first = text.find("{")
    last = text.rfind("}")
    if first >= 0 and last > first:
        try:
            parsed = json.loads(text[first:last + 1])
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            return None
    return None


def _extract_openai_responses_text(body: dict[str, Any]) -> str:
    direct = body.get("output_text")
    if isinstance(direct, str) and direct.strip():
        return direct

    output = body.get("output")
    if not isinstance(output, list):
        return ""
    for entry in output:
        if not isinstance(entry, dict):
            continue
        content = entry.get("content")
        if not isinstance(content, list):
            continue
        for item in content:
            if not isinstance(item, dict):
                continue
            text = item.get("text")
            if isinstance(text, str) and text.strip():
                return text
    return ""


def _build_prompt(payload: PolicyStepRequest) -> str:
    observation_text = json.dumps(payload.observation, ensure_ascii=False)
    return "\n".join(
        [
            "You are an NPC control policy.",
            'Return strict JSON only: {"actions":[...], "reason":"..."}',
            "Allowed action types: moveTo, patrol, wander, playAnimation, speak, interact, remember, idle, lookAt",
            "Prefer at most 2 actions per step.",
            f"Observation: {observation_text}",
        ]
    )


def _heuristic_policy(payload: PolicyStepRequest) -> PolicyStepResponse:
    observation = payload.observation or {}
    position = observation.get("position") or [0, 0, 0]
    if not isinstance(position, list) or len(position) < 3:
        position = [0, 0, 0]

    perceived = observation.get("perceived")
    if isinstance(perceived, list) and perceived:
        nearest = perceived[0] if isinstance(perceived[0], dict) else {}
        nearest_pos = nearest.get("position") or position
        nearest_name = nearest.get("name") if isinstance(nearest.get("name"), str) else "friend"
        actions = [
            {"type": "moveTo", "target": nearest_pos, "speed": 2.4, "animationId": "walk"},
            {"type": "speak", "text": f"Hey {nearest_name}!", "duration": 1.2},
        ]
        return PolicyStepResponse(
            actions=actions,
            reason="heuristic nearest-follow",
            provider="heuristic",
            ttlMs=_clamp(payload.ttlMs or 700, 200, 2000),
        )

    timestamp = float(observation.get("timestamp") or time.time())
    angle = (math.sin(timestamp * 0.91) * 0.5 + 0.5) * math.pi * 2
    radius = 3.5
    target = [
        float(position[0]) + math.cos(angle) * radius,
        float(position[1]),
        float(position[2]) + math.sin(angle) * radius,
    ]
    return PolicyStepResponse(
        actions=[{"type": "moveTo", "target": target, "speed": 2.0, "animationId": "walk"}],
        reason="heuristic wander",
        provider="heuristic",
        ttlMs=_clamp(payload.ttlMs or 700, 200, 2000),
    )


async def _call_openai(payload: PolicyStepRequest) -> PolicyStepResponse | None:
    if not OPENAI_API_KEY:
        return None

    if OPENAI_USE_RESPONSES_API:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_MS / 1000) as client:
            response = await client.post(
                OPENAI_RESPONSES_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                },
                json={
                    "model": OPENAI_MODEL,
                    "temperature": 0.2,
                    "input": [
                        {"role": "system", "content": "You are a game NPC policy model."},
                        {"role": "user", "content": _build_prompt(payload)},
                    ],
                },
            )
        if response.status_code >= 300:
            return None
        body = response.json()
        content = _extract_openai_responses_text(body)
        parsed = _extract_json(content if isinstance(content, str) else "")
        if not parsed:
            return None
        actions = _ensure_motion_action(
            _normalize_actions(parsed.get("actions"), payload.observation),
            payload.observation,
        )
        return PolicyStepResponse(
            actions=actions,
            reason=parsed.get("reason") if isinstance(parsed.get("reason"), str) else "openai policy",
            provider="openai",
            ttlMs=_clamp(payload.ttlMs or 700, 200, 2000),
        )

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_MS / 1000) as client:
        response = await client.post(
            OPENAI_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENAI_API_KEY}",
            },
            json={
                "model": OPENAI_MODEL,
                "temperature": 0.2,
                "messages": [
                    {"role": "system", "content": "You are a game NPC policy model."},
                    {"role": "user", "content": _build_prompt(payload)},
                ],
            },
        )
    if response.status_code >= 300:
        return None
    body = response.json()
    content = (
        body.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )
    parsed = _extract_json(content if isinstance(content, str) else "")
    if not parsed:
        return None
    actions = _ensure_motion_action(
        _normalize_actions(parsed.get("actions"), payload.observation),
        payload.observation,
    )
    return PolicyStepResponse(
        actions=actions,
        reason=parsed.get("reason") if isinstance(parsed.get("reason"), str) else "openai policy",
        provider="openai",
        ttlMs=_clamp(payload.ttlMs or 700, 200, 2000),
    )


async def _call_huggingface(payload: PolicyStepRequest) -> PolicyStepResponse | None:
    if not HF_API_KEY:
        return None
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_MS / 1000) as client:
        response = await client.post(
            HF_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {HF_API_KEY}",
            },
            json={
                "inputs": _build_prompt(payload),
                "parameters": {
                    "max_new_tokens": 220,
                    "temperature": 0.2,
                    "return_full_text": False,
                },
            },
        )
    if response.status_code >= 300:
        return None
    body = response.json()
    generated_text = ""
    if isinstance(body, list) and body:
        first = body[0]
        if isinstance(first, dict):
            generated_text = first.get("generated_text", "")
    elif isinstance(body, dict):
        generated_text = body.get("generated_text", "")
    parsed = _extract_json(generated_text if isinstance(generated_text, str) else "")
    if not parsed:
        return None
    actions = _ensure_motion_action(
        _normalize_actions(parsed.get("actions"), payload.observation),
        payload.observation,
    )
    return PolicyStepResponse(
        actions=actions,
        reason=parsed.get("reason") if isinstance(parsed.get("reason"), str) else "huggingface policy",
        provider="huggingface",
        ttlMs=_clamp(payload.ttlMs or 700, 200, 2000),
    )


async def _resolve_policy(payload: PolicyStepRequest, provider: str) -> PolicyStepResponse:
    try:
        if provider == "openai":
            out = await _call_openai(payload)
            return out or _heuristic_policy(payload)
        if provider == "huggingface":
            out = await _call_huggingface(payload)
            return out or _heuristic_policy(payload)
        return _heuristic_policy(payload)
    except Exception:
        return _heuristic_policy(payload)


@app.post("/policy/step", response_model=PolicyStepResponse)
async def policy_step(
    payload: PolicyStepRequest,
    x_policy_provider: str | None = Header(default=None),
) -> PolicyStepResponse:
    provider = (x_policy_provider or payload.provider or DEFAULT_PROVIDER).lower()
    return await _resolve_policy(payload, provider)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
