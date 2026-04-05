"use client";

import { useState, useEffect } from "react";
import { ZebraLogo } from "./ZebraLogo";
import { ArrowRight, Zap, Globe, FileText, Eye, MessageSquare, ChevronDown } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

const MODELS = [
  { name: "Llama 3.1 70B", badge: "Smart", desc: "General purpose" },
  { name: "Gemma 4 31B", badge: "Vision", desc: "Multimodal" },
  { name: "Mixtral 8x7B", badge: "MoE", desc: "Strong reasoning" },
  { name: "Nemotron 340B", badge: "Pro", desc: "NVIDIA flagship" },
];

const FEATURES = [
  {
    icon: <Zap size={20} />,
    title: "Streaming Responses",
    desc: "Real-time token streaming from NVIDIA NIM endpoints for zero-wait answers.",
  },
  {
    icon: <Globe size={20} />,
    title: "Web Search",
    desc: "Toggle live web search to ground responses with fresh, up-to-date information.",
  },
  {
    icon: <FileText size={20} />,
    title: "File & Doc Support",
    desc: "Upload PDFs, code files, CSVs, and more. Attach context directly to any message.",
  },
  {
    icon: <Eye size={20} />,
    title: "Vision Models",
    desc: "Attach images and let Gemma or other vision-capable models analyze them.",
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Persistent History",
    desc: "All chats saved to Firestore. Pick up exactly where you left off, any device.",
  },
];

const EXAMPLE_PROMPTS = [
  "Explain transformer attention in plain terms",
  "Debug this Python function for me",
  "Summarize this PDF research paper",
  "Write a cold outreach email for my SaaS",
  "What's the latest in AI news today?",
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in on mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((i) => (i + 1) % EXAMPLE_PROMPTS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="landing-root"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}
    >
      {/* ── NAV ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <ZebraLogo size={28} />
            <span className="landing-brand-name">Zebra AI</span>
          </div>
          <div className="landing-nav-right">
            <span className="landing-powered">Powered by NVIDIA NIM</span>
            <button className="landing-btn-outline" onClick={onGetStarted}>
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          {/* Badge */}
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            NVIDIA NIM · Multiple frontier models
          </div>

          <h1 className="landing-h1">
            Your AI, <br />
            <span className="landing-h1-accent">no limits.</span>
          </h1>

          <p className="landing-subheading">
            Zebra AI gives you direct access to the world's most powerful open
            models — Llama, Gemma, Mistral, and more — with web search, file
            uploads, and chat history built in.
          </p>

          {/* Animated prompt ticker */}
          <div className="landing-prompt-ticker">
            <span className="landing-prompt-label">Try: </span>
            <span key={promptIndex} className="landing-prompt-text">
              {EXAMPLE_PROMPTS[promptIndex]}
            </span>
          </div>

          <button className="landing-btn-primary" onClick={onGetStarted}>
            Start chatting free
            <ArrowRight size={16} />
          </button>

          <p className="landing-fine-print">No credit card required</p>
        </div>

        {/* Scroll hint */}
        <div className="landing-scroll-hint">
          <ChevronDown size={18} className="landing-scroll-icon" />
        </div>
      </section>

      {/* ── MODEL STRIP ── */}
      <section className="landing-models-section">
        <p className="landing-models-label">Available models</p>
        <div className="landing-models-row">
          {MODELS.map((m) => (
            <div key={m.name} className="landing-model-chip">
              <span className="landing-model-badge">{m.badge}</span>
              <span className="landing-model-name">{m.name}</span>
              <span className="landing-model-desc">{m.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="landing-features-section">
        <h2 className="landing-section-title">Everything you need</h2>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing-feature-card">
              <div className="landing-feature-icon">{f.icon}</div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="landing-cta-section">
        <div className="landing-cta-box">
          <ZebraLogo size={40} />
          <h2 className="landing-cta-title">Ready to start?</h2>
          <p className="landing-cta-sub">
            Sign in with Google or create a free account.
          </p>
          <button className="landing-btn-primary landing-btn-lg" onClick={onGetStarted}>
            Get started <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <ZebraLogo size={20} />
        <span className="landing-footer-text">
          © {new Date().getFullYear()} Zebra AI · Powered by NVIDIA NIM
        </span>
      </footer>

      <style>{`
        /* ── Root ── */
        .landing-root {
          min-height: 100dvh;
          background: #ffffff;
          color: #111111;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* ── Nav ── */
        .landing-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #ebebeb;
        }
        .landing-nav-inner {
          max-width: 1040px;
          margin: 0 auto;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .landing-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .landing-brand-name {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #111;
        }
        .landing-nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .landing-powered {
          font-size: 11px;
          color: #999;
          letter-spacing: 0.01em;
          display: none;
        }
        @media (min-width: 600px) { .landing-powered { display: block; } }

        .landing-btn-outline {
          padding: 7px 18px;
          border-radius: 8px;
          border: 1px solid #d8d8d8;
          background: #fff;
          color: #111;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .landing-btn-outline:hover {
          background: #f5f5f5;
          border-color: #c0c0c0;
        }

        /* ── Hero ── */
        .landing-hero {
          position: relative;
          min-height: calc(100dvh - 56px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px 80px;
          text-align: center;
        }
        .landing-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 20%, rgba(0,0,0,0.04) 0%, transparent 70%);
          pointer-events: none;
        }
        .landing-hero-inner {
          max-width: 680px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          position: relative;
        }

        .landing-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
          color: #555;
          letter-spacing: 0.03em;
          margin-bottom: 28px;
        }
        .landing-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #76b900; /* NVIDIA green */
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .landing-h1 {
          font-size: clamp(44px, 8vw, 72px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: #111;
          margin: 0 0 20px;
        }
        .landing-h1-accent {
          color: #111;
          position: relative;
          display: inline-block;
        }
        .landing-h1-accent::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 4px;
          width: 100%;
          height: 3px;
          background: #111;
          border-radius: 2px;
        }

        .landing-subheading {
          font-size: clamp(15px, 2.5vw, 18px);
          color: #666;
          line-height: 1.65;
          margin: 0 0 32px;
          max-width: 520px;
        }

        /* Prompt ticker */
        .landing-prompt-ticker {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: #f5f5f5;
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 32px;
          min-width: 300px;
          max-width: 460px;
          text-align: left;
        }
        .landing-prompt-label {
          font-weight: 600;
          color: #888;
          flex-shrink: 0;
          font-size: 12px;
        }
        .landing-prompt-text {
          color: #333;
          animation: fadeSlideIn 0.4s ease;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .landing-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: -0.01em;
        }
        .landing-btn-primary:hover {
          background: #2a2a2a;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .landing-btn-primary:active {
          transform: translateY(0);
        }
        .landing-btn-lg {
          padding: 15px 36px;
          font-size: 16px;
        }

        .landing-fine-print {
          margin-top: 12px;
          font-size: 12px;
          color: #bbb;
        }

        /* Scroll hint */
        .landing-scroll-hint {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          color: #ccc;
          animation: bounce-down 2s ease-in-out infinite;
        }
        @keyframes bounce-down {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(5px); }
        }

        /* ── Models Strip ── */
        .landing-models-section {
          padding: 48px 24px;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
          text-align: center;
        }
        .landing-models-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #bbb;
          font-weight: 600;
          margin: 0 0 20px;
        }
        .landing-models-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          max-width: 800px;
          margin: 0 auto;
        }
        .landing-model-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #e8e8e8;
          border-radius: 100px;
          background: #fafafa;
          transition: all 0.15s;
        }
        .landing-model-chip:hover {
          border-color: #ccc;
          background: #f2f2f2;
        }
        .landing-model-badge {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: #111;
          color: #fff;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .landing-model-name {
          font-size: 13px;
          font-weight: 600;
          color: #111;
        }
        .landing-model-desc {
          font-size: 11px;
          color: #aaa;
        }

        /* ── Features ── */
        .landing-features-section {
          max-width: 1040px;
          margin: 0 auto;
          padding: 80px 24px;
        }
        .landing-section-title {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 700;
          letter-spacing: -0.03em;
          text-align: center;
          margin: 0 0 48px;
          color: #111;
        }
        .landing-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .landing-feature-card {
          padding: 24px;
          border: 1px solid #ebebeb;
          border-radius: 14px;
          background: #fafafa;
          transition: all 0.2s;
        }
        .landing-feature-card:hover {
          border-color: #d0d0d0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .landing-feature-icon {
          width: 36px;
          height: 36px;
          background: #111;
          color: #fff;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }
        .landing-feature-title {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }
        .landing-feature-desc {
          font-size: 13px;
          color: #777;
          line-height: 1.6;
          margin: 0;
        }

        /* ── CTA Bottom ── */
        .landing-cta-section {
          padding: 80px 24px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: center;
        }
        .landing-cta-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          max-width: 400px;
        }
        .landing-cta-title {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #111;
          margin: 0;
        }
        .landing-cta-sub {
          font-size: 15px;
          color: #888;
          margin: 0;
        }

        /* ── Footer ── */
        .landing-footer {
          padding: 24px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .landing-footer-text {
          font-size: 12px;
          color: #bbb;
        }
      `}</style>
    </div>
  );
}
