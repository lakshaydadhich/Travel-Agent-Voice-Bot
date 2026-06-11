import datetime
import logging
import os
from pathlib import Path

from dotenv import load_dotenv

from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    room_io,
)

from livekit.plugins import silero
from livekit.agents.llm.mcp import MCPServerHTTP

# -----------------------------
# 🔧 Setup
# -----------------------------
logger = logging.getLogger("agent")

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

AGENT_DISPATCH_NAME = os.getenv("AGENT_DISPATCH_NAME", "travel-agent")

# -----------------------------
# 🤖 Assistant
# -----------------------------
class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""
You are a smart travel voice assistant.

You help users with:
- Hotels
- Flights
- Weather
- Places to visit
- Travel itinerary

IMPORTANT RULES:
- ALWAYS use tools when required
- AFTER calling a tool, ALWAYS explain the result to the user
- NEVER stay silent after tool execution
- Speak naturally like a human
- Keep answers short and clear

Example:
User: Top places in Jaipur
Response: You can visit Hawa Mahal, City Palace and Amber Fort.
"""
        )

    async def on_enter(self) -> None:
        hour = datetime.datetime.now().hour
        if hour < 12:
            greeting = "Good morning! I'm your travel assistant. Where are you planning to go?"
        elif hour < 18:
            greeting = "Good afternoon! I'm your travel assistant. How can I help you plan your trip?"
        else:
            greeting = "Good evening! I'm your travel assistant. Ready to help you plan something amazing?"
        await self.session.say(greeting)

# -----------------------------
# 🚀 Server Setup
# -----------------------------
server = AgentServer()

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

server.setup_fnc = prewarm

# -----------------------------
# 🎤 Agent Session
# -----------------------------
@server.rtc_session(agent_name=AGENT_DISPATCH_NAME)
async def my_agent(ctx: JobContext):

    ctx.log_context_fields = {"room": ctx.room.name}

    session = AgentSession(
        stt=inference.STT(
            model="deepgram/nova-3",
            language="en-IN",   # ✅ better accuracy
        ),
        llm=inference.LLM(
            model="openai/gpt-4o-mini"   # ✅ stable (avoid Gemini error)
        ),
        tts=inference.TTS(
            model="cartesia/sonic-3",
            voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        ),
        mcp_servers=[
            MCPServerHTTP(
                url="http://127.0.0.1:8000/sse"   # ✅ correct endpoint
            )
        ],
        turn_handling={"turn_detection": "vad"},
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(),
        ),
    )

    await ctx.connect()

# -----------------------------
# ▶️ Run App
# -----------------------------
if __name__ == "__main__":
    cli.run_app(server)