# Frontend — AURA Travel Voice UI

A dark glassmorphism web interface to talk to the Travel Agent from any browser.

## Stack

- **React 18** + **Vite 5**
- **LiveKit Client JS SDK v2** — WebRTC voice connection
- **Pure CSS-in-JS** — no UI library, custom animations

## Setup

### 1. Install

```bash
cd frontend
npm install
```

### 2. Make sure the backend is running

In `agents/`:

```bash
# Terminal 1
python mcp_server.py

# Terminal 2
python token_server.py   # must be on :8080

# Terminal 3
python agent.py start
```

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:5173` — click **Start Session** and speak.

## How it works

| File | Role |
|------|------|
| `src/App.jsx` | LiveKit room connection, state management |
| `src/VoiceAIAgent.jsx` | UI component (orb, transcript, controls) |

```
Click "Start Session"
    → App.jsx fetches token from token_server.py (:8080)
    → Connects to LiveKit room via livekit-client
    → room.startAudio() unlocks browser audio
    → Enables microphone
    → Agent dispatches, greets user via on_enter()
    → TranscriptionReceived events populate transcript
    → ParticipantAttributesChanged drives orb phase animations
```

## Build for production

```bash
npm run build
# Output in frontend/dist/
```
