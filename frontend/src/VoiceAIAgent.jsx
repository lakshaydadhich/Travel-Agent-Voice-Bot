import { useState, useEffect, useRef } from "react";

/* ─────────────────────────── STYLES ─────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #05050a;
    --surface: #0d0d1a;
    --border: rgba(120,100,255,0.15);
    --accent: #7c5cfc;
    --accent2: #00e5ff;
    --accent3: #ff3cac;
    --text: #e8e4ff;
    --muted: #7a7a9a;
    --glow: rgba(124,92,252,0.45);
    --glow2: rgba(0,229,255,0.35);
    --glow3: rgba(255,60,172,0.35);
  }
  body { background: var(--bg); }

  .va-root {
    font-family: 'Syne', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    display: flex; flex-direction: column;
    overflow: hidden; position: relative;
  }

  .va-root::before {
    content:''; position:fixed; inset:0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events:none; z-index:9999; opacity:0.55;
  }

  .bg-orb { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; animation:bgFloat 9s ease-in-out infinite; }
  .bg-orb-1 { width:520px;height:520px; background:radial-gradient(circle,rgba(124,92,252,.18) 0%,transparent 70%); top:-120px;left:-120px; }
  .bg-orb-2 { width:420px;height:420px; background:radial-gradient(circle,rgba(0,229,255,.12) 0%,transparent 70%); bottom:-100px;right:-100px; animation-delay:-3s; }
  .bg-orb-3 { width:320px;height:320px; background:radial-gradient(circle,rgba(255,60,172,.1) 0%,transparent 70%); top:45%;left:50%;transform:translate(-50%,-50%); animation-delay:-6s; }
  @keyframes bgFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(22px,-22px) scale(1.05)} 66%{transform:translate(-16px,12px) scale(.97)} }

  .header {
    position:relative; z-index:10;
    display:flex; align-items:center; justify-content:space-between;
    padding:20px 36px;
    border-bottom:1px solid var(--border);
    backdrop-filter:blur(24px);
    background:rgba(13,13,26,.65);
  }
  .logo { display:flex; align-items:center; gap:10px; font-size:17px; font-weight:800; letter-spacing:-.5px; }
  .logo-gem {
    width:34px; height:34px;
    background:linear-gradient(135deg,var(--accent),var(--accent2));
    border-radius:9px; display:flex; align-items:center; justify-content:center;
    font-size:15px; box-shadow:0 0 22px var(--glow);
    animation:gemGlow 4s ease-in-out infinite;
  }
  @keyframes gemGlow { 0%,100%{box-shadow:0 0 22px var(--glow)} 50%{box-shadow:0 0 38px var(--glow),0 0 60px rgba(0,229,255,.2)} }
  .logo-name span { color:var(--accent2); }

  .header-right { display:flex; align-items:center; gap:12px; }

  .gh-btn {
    display:flex; align-items:center; gap:7px;
    padding:7px 15px; border-radius:100px;
    border:1px solid var(--border);
    background:rgba(255,255,255,.04);
    color:var(--muted); font-family:'Space Mono',monospace;
    font-size:11px; letter-spacing:.5px;
    cursor:pointer; text-decoration:none;
    transition:all .25s; position:relative; overflow:hidden;
  }
  .gh-btn::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(124,92,252,.15),rgba(0,229,255,.1));
    opacity:0; transition:opacity .25s;
  }
  .gh-btn:hover { border-color:rgba(124,92,252,.55); color:var(--text); transform:translateY(-1px); box-shadow:0 4px 20px rgba(124,92,252,.22); }
  .gh-btn:hover::before { opacity:1; }
  .gh-btn svg { flex-shrink:0; transition:transform .3s; }
  .gh-btn:hover svg { transform:rotate(-10deg) scale(1.15); }

  .status-pill {
    display:flex; align-items:center; gap:8px;
    padding:6px 14px; border-radius:100px;
    border:1px solid var(--border);
    background:rgba(124,92,252,.08);
    font-family:'Space Mono',monospace; font-size:11px; color:var(--muted);
    transition:all .35s;
  }
  .status-pill.active { border-color:rgba(0,229,255,.35); color:var(--accent2); background:rgba(0,229,255,.07); }
  .status-pill.thinking { border-color:rgba(255,60,172,.35); color:var(--accent3); background:rgba(255,60,172,.07); }
  .s-dot { width:7px; height:7px; border-radius:50%; background:var(--muted); transition:all .35s; }
  .status-pill.active .s-dot { background:var(--accent2); box-shadow:0 0 8px var(--accent2); animation:sdBlink 1.1s ease-in-out infinite; }
  .status-pill.thinking .s-dot { background:var(--accent3); box-shadow:0 0 8px var(--accent3); animation:sdBlink .7s ease-in-out infinite; }
  @keyframes sdBlink { 0%,100%{opacity:1} 50%{opacity:.35} }

  .main {
    position:relative; z-index:5; flex:1;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding:32px 24px 40px; gap:34px;
  }

  .info-block { text-align:center; display:flex; flex-direction:column; align-items:center; gap:6px; }
  .agent-eyebrow { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:4px; color:var(--accent); text-transform:uppercase; }
  .agent-title {
    font-size:42px; font-weight:800; letter-spacing:-2px; line-height:1;
    background:linear-gradient(135deg,#fff 0%,rgba(232,228,255,.5) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .agent-sub { font-size:13px; color:var(--muted); max-width:360px; line-height:1.65; font-family:'Space Mono',monospace; }

  .scene { position:relative; display:flex; align-items:center; justify-content:center; width:300px; height:300px; }
  .ring { position:absolute; border-radius:50%; border:1px solid; animation:ringPulse 3.2s ease-in-out infinite; pointer-events:none; }
  .ring-1 { width:100%;height:100%; border-color:rgba(124,92,252,.13); }
  .ring-2 { width:80%;height:80%;   border-color:rgba(124,92,252,.2);  animation-delay:-.6s; }
  .ring-3 { width:60%;height:60%;   border-color:rgba(124,92,252,.28); animation-delay:-1.2s; }
  @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:.55} }

  .orbit-dot {
    position:absolute; width:9px; height:9px; border-radius:50%;
    background:var(--accent2); box-shadow:0 0 12px var(--accent2);
    animation:orbitSpin 4s linear infinite;
    opacity:0; transition:opacity .5s;
  }
  .orbit-dot.visible { opacity:1; }
  .orbit-dot-2 { background:var(--accent3); box-shadow:0 0 12px var(--accent3); animation-delay:-2s; }
  @keyframes orbitSpin {
    from { transform: rotate(0deg) translateX(148px); }
    to   { transform: rotate(360deg) translateX(148px); }
  }

  .core {
    position:relative; width:148px; height:148px; border-radius:50%;
    background:radial-gradient(circle at 35% 35%,rgba(124,92,252,.95),rgba(0,229,255,.45) 55%,rgba(255,60,172,.2));
    box-shadow:0 0 45px var(--glow),0 0 90px rgba(124,92,252,.2),inset 0 0 30px rgba(255,255,255,.06);
    cursor:pointer; z-index:2;
    display:flex; align-items:center; justify-content:center;
    transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;
    user-select:none;
  }
  .core:hover:not(.no-hover) { transform:scale(1.07); box-shadow:0 0 72px var(--glow),0 0 130px rgba(124,92,252,.3); }
  .core:active { transform:scale(.95); }
  .core.listening { animation:coreListenPulse 1.6s ease-in-out infinite; box-shadow:0 0 65px var(--glow),0 0 130px rgba(124,92,252,.35); }
  .core.speaking  { animation:coreSpeak .55s ease-in-out infinite alternate; background:radial-gradient(circle at 35% 35%,rgba(0,229,255,.95),rgba(124,92,252,.65) 50%,rgba(255,60,172,.3)); box-shadow:0 0 65px var(--glow2),0 0 130px rgba(0,229,255,.22); }
  .core.thinking  { animation:coreThink 1.8s ease-in-out infinite; }
  @keyframes coreListenPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.09)} }
  @keyframes coreSpeak { 0%{transform:scale(1) scaleY(1)} 100%{transform:scale(1.07) scaleY(1.04)} }
  @keyframes coreThink { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.04);filter:brightness(1.35)} }
  .core-icon { font-size:38px; filter:drop-shadow(0 0 10px rgba(255,255,255,.55)); pointer-events:none; }
  .core-hint { position:absolute; bottom:-34px; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:2px; color:var(--muted); white-space:nowrap; text-transform:uppercase; transition:opacity .3s; }

  .waveform-wrap { width:100%; max-width:480px; opacity:0; transform:translateY(8px); transition:opacity .4s,transform .4s; }
  .waveform-wrap.visible { opacity:1; transform:translateY(0); }
  .waveform-canvas { width:100%; height:64px; border-radius:12px; display:block; }

  .controls-panel { display:flex; flex-direction:column; align-items:center; gap:16px; width:100%; max-width:480px; }
  .btn-row { display:flex; align-items:center; gap:14px; }

  .btn-main {
    padding:15px 44px; border-radius:100px;
    border:none; cursor:pointer; font-family:'Syne',sans-serif;
    font-size:16px; font-weight:700; letter-spacing:-.3px;
    position:relative; overflow:hidden;
    transition:all .28s cubic-bezier(.34,1.56,.64,1);
  }
  .btn-main.start { background:linear-gradient(135deg,var(--accent) 0%,#a78bff 100%); color:#fff; box-shadow:0 8px 30px rgba(124,92,252,.45); }
  .btn-main.start:hover { transform:translateY(-3px) scale(1.04); box-shadow:0 14px 42px rgba(124,92,252,.6),0 0 0 4px rgba(124,92,252,.18); }
  .btn-main.stop { background:rgba(255,60,172,.1); color:var(--accent3); border:1px solid rgba(255,60,172,.35); box-shadow:0 0 20px rgba(255,60,172,.1); }
  .btn-main.stop:hover { transform:translateY(-2px); background:rgba(255,60,172,.22); box-shadow:0 8px 28px rgba(255,60,172,.25); }
  .btn-main .ripple { position:absolute; border-radius:50%; background:rgba(255,255,255,.25); transform:scale(0); animation:rippleAnim .6s linear; pointer-events:none; }
  @keyframes rippleAnim { to{transform:scale(4);opacity:0} }

  .btn-icon {
    width:52px; height:52px; border-radius:50%;
    border:1px solid var(--border); background:rgba(255,255,255,.04);
    cursor:pointer; color:var(--muted); font-size:18px;
    transition:all .22s; display:flex; align-items:center; justify-content:center;
    position:relative; overflow:hidden;
  }
  .btn-icon:hover { border-color:rgba(124,92,252,.5); color:var(--text); background:rgba(124,92,252,.12); transform:scale(1.09); }
  .btn-icon.active { border-color:rgba(255,60,172,.45); color:var(--accent3); background:rgba(255,60,172,.08); }
  .tooltip-wrap { position:relative; display:flex; align-items:center; justify-content:center; }
  .tooltip { position:absolute; bottom:calc(100% + 9px); background:rgba(13,13,26,.96); border:1px solid var(--border); color:var(--text); font-family:'Space Mono',monospace; font-size:10px; letter-spacing:1px; white-space:nowrap; padding:5px 10px; border-radius:6px; pointer-events:none; opacity:0; transform:translateY(4px); transition:all .2s; backdrop-filter:blur(12px); }
  .tooltip-wrap:hover .tooltip { opacity:1; transform:translateY(0); }

  .sliders-row { display:flex; gap:20px; align-items:center; padding:14px 22px; border-radius:16px; border:1px solid var(--border); background:rgba(13,13,26,.6); backdrop-filter:blur(18px); width:100%; animation:slideUp .35s cubic-bezier(.34,1.56,.64,1); }
  .slider-group { display:flex; flex-direction:column; gap:6px; flex:1; }
  .slider-label { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:2px; color:var(--muted); text-transform:uppercase; display:flex; justify-content:space-between; }
  .slider-label span { color:var(--accent2); }
  input[type=range] { -webkit-appearance:none; appearance:none; width:100%; height:3px; border-radius:2px; outline:none; background:rgba(255,255,255,.1); cursor:pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:var(--accent); box-shadow:0 0 8px var(--glow); transition:transform .2s,box-shadow .2s; }
  input[type=range]:hover::-webkit-slider-thumb { transform:scale(1.35); box-shadow:0 0 16px var(--glow); }

  .metrics { display:flex; gap:20px; align-items:center; padding:12px 24px; border-radius:100px; border:1px solid var(--border); background:rgba(13,13,26,.55); backdrop-filter:blur(20px); animation:slideUp .4s cubic-bezier(.34,1.56,.64,1); }
  @keyframes slideUp { from{opacity:0;transform:translateY(12px)} }
  .metric { display:flex; flex-direction:column; align-items:center; gap:2px; }
  .metric-val { font-family:'Space Mono',monospace; font-size:17px; font-weight:700; color:var(--text); }
  .metric-val.green { color:#4ade80; }
  .metric-val.blue  { color:var(--accent2); }
  .metric-val.pink  { color:var(--accent3); }
  .metric-lbl { font-size:8px; letter-spacing:2px; color:var(--muted); text-transform:uppercase; font-family:'Space Mono',monospace; }
  .metric-sep { width:1px; height:26px; background:var(--border); }

  .transcript-area { width:100%; max-width:640px; background:rgba(13,13,26,.72); border:1px solid var(--border); border-radius:20px; backdrop-filter:blur(22px); overflow:hidden; }
  .tr-header { padding:13px 20px; border-bottom:1px solid var(--border); font-family:'Space Mono',monospace; font-size:10px; letter-spacing:2.5px; color:var(--muted); text-transform:uppercase; display:flex; align-items:center; justify-content:space-between; }
  .tr-header-left { display:flex; align-items:center; gap:8px; }
  .tr-clear { background:none; border:none; cursor:pointer; color:var(--muted); font-family:'Space Mono',monospace; font-size:9px; letter-spacing:1px; text-transform:uppercase; padding:3px 8px; border-radius:4px; transition:all .2s; }
  .tr-clear:hover { color:var(--accent3); background:rgba(255,60,172,.08); }
  .tr-body { padding:18px; min-height:130px; max-height:210px; overflow-y:auto; display:flex; flex-direction:column; gap:14px; scrollbar-width:thin; scrollbar-color:var(--border) transparent; }
  .msg { display:flex; flex-direction:column; gap:3px; animation:msgIn .38s cubic-bezier(.34,1.56,.64,1) both; }
  @keyframes msgIn { from{opacity:0;transform:translateY(10px) scale(.96)} }
  .msg-meta { display:flex; align-items:center; gap:8px; }
  .msg-role { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:2px; text-transform:uppercase; }
  .msg.user .msg-role { color:var(--accent); }
  .msg.agent .msg-role { color:var(--accent2); }
  .msg-time { font-family:'Space Mono',monospace; font-size:8px; color:var(--muted); }
  .msg-text { font-size:13.5px; line-height:1.65; color:var(--text); }
  .msg.agent .msg-text { color:rgba(232,228,255,.82); }
  .cursor-blink { display:inline-block; width:2px; height:13px; background:var(--accent2); margin-left:2px; vertical-align:middle; animation:cursorBlink .7s step-end infinite; }
  @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
  .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; height:110px; gap:8px; color:var(--muted); font-size:12px; font-family:'Space Mono',monospace; opacity:.55; }

  .think-dots { display:flex; gap:5px; align-items:center; }
  .think-dots span { width:7px; height:7px; border-radius:50%; background:var(--accent2); animation:td 1.1s ease-in-out infinite; }
  .think-dots span:nth-child(2){animation-delay:.18s}
  .think-dots span:nth-child(3){animation-delay:.36s}
  @keyframes td { 0%,100%{opacity:.3;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }

  .particle { position:fixed; pointer-events:none; z-index:9998; border-radius:50%; animation:particleFly var(--dur,.8s) ease-out forwards; }
  @keyframes particleFly { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--tx,0),var(--ty,-80px)) scale(0)} }

  .footer { position:relative; z-index:10; text-align:center; padding:14px; font-family:'Space Mono',monospace; font-size:10px; color:var(--muted); border-top:1px solid var(--border); background:rgba(13,13,26,.5); backdrop-filter:blur(12px); opacity:.55; letter-spacing:1px; }
`;

/* ─────────────────────────── GITHUB ICON ─────────────────────────── */
const GitHubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

/* ─────────────────────────── PARTICLES ─────────────────────────── */
let pid = 0;
function spawnParticles(x, y, setParticles) {
  const colors = ["#7c5cfc","#00e5ff","#ff3cac","#a78bff","#ffffff"];
  const ps = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const dist = 55 + Math.random() * 65;
    return {
      id: pid++, x, y,
      size: 4 + Math.random() * 7,
      color: colors[i % colors.length],
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist - 35,
      dur: 0.5 + Math.random() * 0.55,
    };
  });
  setParticles(p => [...p, ...ps]);
  setTimeout(() => setParticles(p => p.filter(pt => !ps.find(n => n.id === pt.id))), 1300);
}

/* ─────────────────────────── WAVEFORM ─────────────────────────── */
function WaveformCanvas({ phase }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 480;
    const H = 64;
    canvas.width = W * (window.devicePixelRatio || 1);
    canvas.height = H * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const draw = () => {
      tRef.current += phase === "speaking" ? 0.13 : phase === "listening" ? 0.065 : 0.018;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);
      const amp = phase === "speaking" ? 22 : phase === "listening" ? 13 : 4;
      const freq = phase === "speaking" ? 3 : 2;
      const alpha = phase === "idle" ? 0.2 : 0.9;

      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, `rgba(124,92,252,0)`);
      grad.addColorStop(0.2, `rgba(124,92,252,${alpha})`);
      grad.addColorStop(0.5, `rgba(0,229,255,${alpha})`);
      grad.addColorStop(0.8, `rgba(255,60,172,${alpha})`);
      grad.addColorStop(1, `rgba(255,60,172,0)`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = phase !== "idle" ? 14 : 0;
      ctx.shadowColor = "rgba(0,229,255,.5)";

      for (let x = 0; x <= W; x++) {
        const n = x / W;
        const y = H / 2
          + Math.sin(n * Math.PI * freq * 2 + t) * amp * Math.sin(n * Math.PI)
          + Math.sin(n * Math.PI * freq * 3.7 + t * 1.3) * amp * 0.35 * Math.sin(n * Math.PI)
          + (phase === "speaking" ? Math.sin(n * Math.PI * 7 + t * 2.1) * amp * 0.28 : 0);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      for (let x = 0; x <= W; x++) {
        const n = x / W;
        const y = H / 2 + Math.sin(n * Math.PI * freq * 2 + t + .5) * amp * .55 * Math.sin(n * Math.PI);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  return <canvas ref={canvasRef} className="waveform-canvas" />;
}

/* ─────────────────────────── TYPING TEXT ─────────────────────────── */
function TypingText({ text, onDone }) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setShown(""); setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); onDone && onDone(); }
    }, 22);
    return () => clearInterval(iv);
  }, [text]);
  return <span>{shown}{!done && <span className="cursor-blink" />}</span>;
}

/* ─────────────────────────── APP ─────────────────────────── */
export default function VoiceAIAgent({ phase, messages, timer, latency, isMuted, onStart, onStop, onMute }) {
  const [localMessages, setLocalMessages] = useState([]);
  const [volume, setVolume] = useState(75);
  const [particles, setParticles] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const transcriptRef = useRef(null);

  // Sync messages from props and add typing flag to latest agent message
  useEffect(() => {
    if (!messages.length) { setLocalMessages([]); return; }
    setLocalMessages(messages.map((m, i) => ({
      ...m,
      typing: m.role === "agent" && i === messages.length - 1,
    })));
  }, [messages]);

  useEffect(() => {
    if (transcriptRef.current)
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [localMessages]);

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const addRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement("span");
    r.className = "ripple";
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
  };

  const handleStart = (e) => {
    if (e) { addRipple(e); spawnParticles(e.clientX, e.clientY, setParticles); }
    onStart();
  };

  const handleStop = (e) => {
    if (e) { addRipple(e); spawnParticles(e.clientX, e.clientY, setParticles); }
    onStop();
  };

  const isActive = phase !== "idle";
  const pillClass = `status-pill${phase === "listening" || phase === "speaking" ? " active" : ""}${phase === "thinking" ? " thinking" : ""}`;
  const pillLabel = { idle: "Offline", listening: "Listening...", thinking: "Processing...", speaking: "Speaking" }[phase] ?? "Offline";

  return (
    <>
      <style>{STYLES}</style>

      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: p.x - p.size / 2, top: p.y - p.size / 2,
          width: p.size, height: p.size,
          background: p.color,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          "--tx": `${p.tx}px`, "--ty": `${p.ty}px`, "--dur": `${p.dur}s`,
        }} />
      ))}

      <div className="va-root">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />

        {/* HEADER */}
        <header className="header">
          <div className="logo">
            <div className="logo-gem">✦</div>
            <div className="logo-name">AURA<span>AI</span></div>
          </div>
          <div className="header-right">
            <a className="gh-btn" href="https://github.com" target="_blank" rel="noreferrer">
              <GitHubIcon size={15} />
              <span>GitHub</span>
            </a>
            <div className={pillClass}>
              <div className="s-dot" />
              {pillLabel}
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="main">
          <div className="info-block">
            <div className="agent-eyebrow">Voice AI Agent</div>
            <div className="agent-title">AURA</div>
            <div className="agent-sub">Adaptive Unified Response Agent — always listening, always ready</div>
          </div>

          {/* ORB SCENE */}
          <div className="scene">
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />
            <div className={`orbit-dot${isActive ? " visible" : ""}`} />
            <div className={`orbit-dot orbit-dot-2${isActive ? " visible" : ""}`} />
            <div
              className={`core${phase === "listening" ? " listening" : ""}${phase === "speaking" ? " speaking" : ""}${phase === "thinking" ? " thinking" : ""}${isActive ? " no-hover" : ""}`}
              onClick={!isActive ? handleStart : undefined}
            >
              {phase === "thinking"
                ? <div className="think-dots"><span /><span /><span /></div>
                : <span className="core-icon">{phase === "speaking" ? "🔊" : "🎙️"}</span>
              }
            </div>
            {!isActive && <div className="core-hint">tap to begin</div>}
          </div>

          {/* WAVEFORM */}
          <div className={`waveform-wrap${isActive ? " visible" : ""}`}>
            <WaveformCanvas phase={phase} />
          </div>

          {/* METRICS */}
          {isActive && (
            <div className="metrics">
              <div className="metric">
                <div className="metric-val green">{formatTime(timer)}</div>
                <div className="metric-lbl">Duration</div>
              </div>
              <div className="metric-sep" />
              <div className="metric">
                <div className="metric-val blue">{latency != null ? `${latency}ms` : "—"}</div>
                <div className="metric-lbl">Latency</div>
              </div>
              <div className="metric-sep" />
              <div className="metric">
                <div className="metric-val pink">{messages.length}</div>
                <div className="metric-lbl">Turns</div>
              </div>
            </div>
          )}

          {/* TRANSCRIPT */}
          <div className="transcript-area">
            <div className="tr-header">
              <div className="tr-header-left"><span>◎</span> Live Transcript</div>
              {localMessages.length > 0 && (
                <button className="tr-clear" onClick={() => setLocalMessages([])}>Clear</button>
              )}
            </div>
            <div className="tr-body" ref={transcriptRef}>
              {localMessages.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: 26, opacity: .35 }}>📜</div>
                  <div>Transcript will appear here</div>
                </div>
              ) : localMessages.map((msg, i) => (
                <div key={i} className={`msg ${msg.role}`}>
                  <div className="msg-meta">
                    <div className="msg-role">{msg.role === "user" ? "You" : "Aura"}</div>
                    <div className="msg-time">{msg.time}</div>
                  </div>
                  <div className="msg-text">
                    {msg.typing && i === localMessages.length - 1 && msg.role === "agent"
                      ? <TypingText text={msg.text} onDone={() =>
                          setLocalMessages(m => m.map((x, j) => j === i ? { ...x, typing: false } : x))
                        } />
                      : msg.text
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTROLS */}
          <div className="controls-panel">
            <div className="btn-row">
              <div className="tooltip-wrap">
                <button className={`btn-icon${isMuted ? " active" : ""}`} onClick={onMute}>
                  {isMuted ? "🔇" : "🔈"}
                </button>
                <div className="tooltip">{isMuted ? "Unmute" : "Mute"}</div>
              </div>

              <button
                className={`btn-main ${isActive ? "stop" : "start"}`}
                onClick={(e) => { isActive ? handleStop(e) : handleStart(e); }}
              >
                {isActive ? "End Session" : "Start Session"}
              </button>

              <div className="tooltip-wrap">
                <button
                  className={`btn-icon${showSettings ? " active" : ""}`}
                  onClick={() => setShowSettings(s => !s)}
                >
                  ⚙️
                </button>
                <div className="tooltip">Settings</div>
              </div>
            </div>

            {showSettings && (
              <div className="sliders-row">
                <div className="slider-group">
                  <div className="slider-label">Volume <span>{volume}%</span></div>
                  <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(+e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          Built with ♥ · AURA Travel Voice Agent · LiveKit Powered
        </footer>
      </div>
    </>
  );
}
