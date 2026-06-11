import json
import os
import uuid
from pathlib import Path

from aiohttp import web
from dotenv import load_dotenv
from livekit import api

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
AGENT_NAME = os.getenv("AGENT_DISPATCH_NAME", "travel-agent")


async def handle_token(request):
    room_name = f"travel-{uuid.uuid4().hex[:8]}"
    identity = f"user-{uuid.uuid4().hex[:6]}"

    token = (
        api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        .with_identity(identity)
        .with_name("User")
        .with_grants(api.VideoGrants(room_join=True, room=room_name))
        .to_jwt()
    )

    lk = api.LiveKitAPI(
        url=LIVEKIT_URL,
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET,
    )
    try:
        await lk.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(agent_name=AGENT_NAME, room=room_name)
        )
        print(f"[token] dispatched {AGENT_NAME} → room={room_name}")
    except Exception as e:
        print(f"[token] agent dispatch warning: {e}")
    finally:
        await lk.aclose()

    return web.Response(
        text=json.dumps({"token": token, "url": LIVEKIT_URL, "room": room_name}),
        content_type="application/json",
        headers={"Access-Control-Allow-Origin": "*"},
    )


async def handle_options(request):
    return web.Response(
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )


async def handle_health(request):
    return web.Response(
        text=json.dumps({"status": "ok"}),
        content_type="application/json",
        headers={"Access-Control-Allow-Origin": "*"},
    )


app = web.Application()
app.router.add_get("/token", handle_token)
app.router.add_get("/health", handle_health)
app.router.add_options("/token", handle_options)

if __name__ == "__main__":
    print("Token server → http://localhost:8080")
    print("Health check → http://localhost:8080/health")
    web.run_app(app, host="0.0.0.0", port=8080)
