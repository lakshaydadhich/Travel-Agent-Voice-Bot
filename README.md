<div align="center">

# 🌍 Travel Agent Voice Bot

**Real-time AI voice assistant for travel planning**

Built with LiveKit Agents · GPT-4o-mini · Deepgram · Cartesia · Google Gemini

<br>

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![LiveKit](https://img.shields.io/badge/LiveKit_Agents-1.5-FF6B35?style=for-the-badge)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white)
![Deepgram](https://img.shields.io/badge/Deepgram-Nova--3-00B388?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

<br>

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Keys](#-api-keys) · [Frontend](#-frontend-branch)

</div>

---

## ✨ Features

| | Feature | Powered By |
|---|---------|------------|
| 🎙️ | Real-time voice conversation via WebRTC | LiveKit + Deepgram Nova-3 |
| 🤖 | Intelligent AI responses | OpenAI GPT-4o-mini |
| 🔊 | Natural text-to-speech | Cartesia Sonic-3 |
| ✈️ | Live flight search between cities | AviationStack API |
| 🏨 | Hotel discovery near any destination | Geoapify API |
| 🌤️ | Real-time weather conditions | WeatherAPI |
| 📍 | Tourist attractions & places of interest | Geoapify API |
| 🗺️ | AI-generated day-by-day travel itineraries | Google Gemini 2.5 Flash |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User (Browser / Phone)                    │
└───────────────────────────┬─────────────────────────────────┘
                            │  WebRTC Audio
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     LiveKit Cloud                            │
│              (WebRTC Media Server / Signalling)              │
└───────────────────────────┬─────────────────────────────────┘
                            │  RTC Room Events
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Travel Agent  (agent.py)                  │
│                                                              │
│   🎙️  Deepgram Nova-3 STT  →  User speech to text           │
│   🧠  GPT-4o-mini LLM      →  Understand & respond          │
│   🔊  Cartesia Sonic-3 TTS →  Text to natural speech        │
│   🔇  Silero VAD            →  Voice activity detection      │
└───────────────────────────┬─────────────────────────────────┘
                            │  MCP Tools  (HTTP/SSE :8000)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  MCP Tool Server  (mcp_server.py)            │
│                                                              │
│   ✈️  flights(origin, destination)  →  AviationStack        │
│   🏨  hotels(city)                  →  Geoapify              │
│   🌤️  weather(city)                 →  WeatherAPI            │
│   📍  places(city)                  →  Geoapify              │
│   🗺️  itinerary(destination, days)  →  Google Gemini        │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites

- Python **3.11+**
- [`uv`](https://docs.astral.sh/uv/) package manager → `pip install uv`
- A [LiveKit Cloud](https://livekit.io) account (free tier available)
- API keys for the services below

### 1. Clone the repository

```bash
git clone https://github.com/lakshaydadhich/Travel-Agent-Voice-Bot.git
cd Travel-Agent-Voice-Bot/agents
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your API keys:

```env
# LiveKit (required)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your_api_secret_here

# AI Services (required)
GOOGLE_API_KEY=your_google_ai_key

# Travel APIs
AVIATIONSTACK_KEY=your_aviationstack_key
GEOAPIFY_KEY=your_geoapify_key
WEATHERAPI_KEY=your_weatherapi_key
```

### 4. Run the agent

Open **3 terminals** inside the `agents/` folder:

```bash
# Terminal 1 — MCP Tool Server
python mcp_server.py

# Terminal 2 — Token Server  (needed for frontend)
python token_server.py

# Terminal 3 — Travel Agent
python agent.py start
```

> For quick local testing without a dispatch server: `python agent.py dev`

---

## 📁 Project Structure

```
agents/
├── agent.py            # Main voice agent (STT → LLM → TTS pipeline)
├── mcp_server.py       # MCP tool server exposing travel tools
├── token_server.py     # HTTP server that generates LiveKit access tokens
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
└── mcp_tools/
    ├── flight.py       # Flight search  (AviationStack)
    ├── hotel.py        # Hotel lookup   (Geoapify)
    ├── weather.py      # Weather data   (WeatherAPI)
    ├── places.py       # Tourist spots  (Geoapify)
    └── plan_maker.py   # AI itinerary   (Google Gemini)
```

---

## 🔑 API Keys

| Service | Used For | Free Tier |
|---------|----------|-----------|
| [LiveKit](https://livekit.io) | WebRTC media server & signalling | ✅ 100 GB/month |
| [OpenAI](https://platform.openai.com/api-keys) | GPT-4o-mini LLM | Pay-per-use |
| [Deepgram](https://console.deepgram.com) | Speech-to-text (Nova-3) | ✅ $200 credit |
| [Cartesia](https://play.cartesia.ai) | Text-to-speech (Sonic-3) | ✅ Free tier |
| [AviationStack](https://aviationstack.com) | Live flight data | ✅ 500 req/month |
| [Geoapify](https://myprojects.geoapify.com) | Hotels & places lookup | ✅ 3,000 req/day |
| [WeatherAPI](https://www.weatherapi.com) | Current weather | ✅ 1M calls/month |
| [Google AI Studio](https://aistudio.google.com/apikey) | Gemini itinerary planner | ✅ Free tier |

---

## 🌐 Frontend Branch

A full web UI is available on the **`feat/web-ui`** branch, built with React + Vite + LiveKit JS SDK.

```bash
git checkout feat/web-ui
```

Then follow the [Frontend Setup guide](frontend/README.md).

**Preview:**
- Dark glassmorphism UI with animated voice orb
- Real-time live transcript
- Latency & session duration metrics
- Works directly in any browser — no app install needed

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Voice Framework | LiveKit Agents | 1.5.1 |
| LLM | OpenAI GPT-4o-mini | via Inference API |
| STT | Deepgram Nova-3 | English-IN |
| TTS | Cartesia Sonic-3 | Custom voice |
| VAD | Silero VAD | Pre-loaded |
| Tool Protocol | FastMCP (SSE) | 2.x |
| Itinerary AI | Google Gemini 2.5 Flash | via LangChain |
| Frontend | React + Vite | 18 + 5 |
| Frontend SDK | LiveKit Client JS | 2.x |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Made with ♥ by <a href="https://github.com/lakshaydadhich">Lakshay Dadhich</a>
</div>
