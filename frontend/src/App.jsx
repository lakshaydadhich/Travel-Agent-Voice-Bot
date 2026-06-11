import { useCallback, useEffect, useRef, useState } from "react";
import { ConnectionState, Room, RoomEvent } from "livekit-client";
import VoiceAIAgent from "./VoiceAIAgent";

const TOKEN_SERVER = "http://localhost:8080";

export default function App() {
  const [phase, setPhase] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState(0);
  const [latency, setLatency] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const roomRef = useRef(null);
  const timerRef = useRef(null);
  const thinkTimerRef = useRef(null);
  const lastUserEndRef = useRef(null);

  const startSession = useCallback(async () => {
    try {
      const res = await fetch(`${TOKEN_SERVER}/token`);
      if (!res.ok) throw new Error(`Token server returned ${res.status}`);
      const { token, url } = await res.json();

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      // Agent state via participant attributes (livekit-agents publishes these)
      room.on(RoomEvent.ParticipantAttributesChanged, (changed, participant) => {
        if (participant.isLocal) return;
        const state = changed["lk.agent.state"];
        if (!state) return;
        clearTimeout(thinkTimerRef.current);
        setPhase(state === "listening" ? "listening" : state === "thinking" ? "thinking" : "speaking");
      });

      // Fallback: detect agent speaking via active speakers
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        if (speakers.some((p) => !p.isLocal)) {
          clearTimeout(thinkTimerRef.current);
          setPhase("speaking");
        }
      });

      // Real transcriptions from STT
      room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
        const finals = segments.filter((s) => s.isFinal);
        if (!finals.length) return;
        const text = finals.map((s) => s.text).join(" ").trim();
        if (!text) return;

        const isUser = participant?.isLocal ?? false;
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (isUser) {
          lastUserEndRef.current = Date.now();
          thinkTimerRef.current = setTimeout(() => setPhase("thinking"), 150);
        } else if (lastUserEndRef.current) {
          setLatency(Date.now() - lastUserEndRef.current);
          lastUserEndRef.current = null;
        }

        setMessages((m) => [...m, { role: isUser ? "user" : "agent", text, time }]);
      });

      // Clean up on server disconnect
      room.on(RoomEvent.Disconnected, () => {
        clearInterval(timerRef.current);
        clearTimeout(thinkTimerRef.current);
        setPhase("idle");
        roomRef.current = null;
      });

      await room.connect(url, token);
      // Unlock browser audio playback for remote participant (agent) audio
      await room.startAudio();
      await room.localParticipant.setMicrophoneEnabled(true);

      setPhase("listening");
      setMessages([]);
      setTimer(0);
      setLatency(null);
      setIsMuted(false);
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } catch (err) {
      console.error("Session start failed:", err);
      alert(
        `Could not connect to the agent.\n\n${err.message}\n\nMake sure token_server.py and agent.py are both running.`
      );
    }
  }, []);

  const stopSession = useCallback(async () => {
    if (roomRef.current) await roomRef.current.disconnect();
    clearInterval(timerRef.current);
    clearTimeout(thinkTimerRef.current);
    setPhase("idle");
    setTimer(0);
  }, []);

  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return;
    const mic = roomRef.current.localParticipant;
    const next = !mic.isMicrophoneEnabled;
    await mic.setMicrophoneEnabled(next);
    setIsMuted(!next);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) roomRef.current.disconnect();
      clearInterval(timerRef.current);
      clearTimeout(thinkTimerRef.current);
    };
  }, []);

  return (
    <VoiceAIAgent
      phase={phase}
      messages={messages}
      timer={timer}
      latency={latency}
      isMuted={isMuted}
      onStart={startSession}
      onStop={stopSession}
      onMute={toggleMute}
    />
  );
}
