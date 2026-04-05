"use client";

import { useState } from "react";
import {
  X, Cpu, MessageSquareText, Type, Keyboard, Download,
  Trash2, SlidersHorizontal, Check, Info, Zap,
} from "lucide-react";
import { AppSettings } from "@/lib/types";
import { NVIDIA_MODELS, KEYBOARD_SHORTCUTS } from "@/lib/constants";

interface Props {
  settings:         AppSettings;
  onSave:           (s: AppSettings) => void;
  onClose:          () => void;
  onExportChat:     (format: "txt" | "json") => void;
  onClearAllHistory: () => void;
}

type Tab = "model" | "chat" | "display" | "shortcuts" | "data";
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "model",     label: "Model",    icon: <Cpu size={14} /> },
  { id: "chat",      label: "Chat",     icon: <MessageSquareText size={14} /> },
  { id: "display",   label: "Display",  icon: <Type size={14} /> },
  { id: "shortcuts", label: "Keys",     icon: <Keyboard size={14} /> },
  { id: "data",      label: "Data",     icon: <Download size={14} /> },
];

export function SettingsModal({ settings, onSave, onClose, onExportChat, onClearAllHistory }: Props) {
  const [form, setForm]   = useState<AppSettings>({ ...settings });
  const [tab, setTab]     = useState<Tab>("model");
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-2xl bg-white sm:border border-[var(--border)] rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh", height: "92vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-[var(--text-muted)]" />
            <h2 className="font-semibold text-sm text-[var(--text-primary)]">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Mobile tabs */}
        <div className="flex sm:hidden border-b border-[var(--border)] overflow-x-auto shrink-0 px-2 snap-x">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs whitespace-nowrap font-medium border-b-2 transition-all snap-start ${
                tab === t.id ? "border-[var(--accent)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-muted)]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop nav */}
          <nav className="hidden sm:flex w-40 border-r border-[var(--border)] py-3 px-2 shrink-0 bg-[var(--bg-sidebar)] flex-col gap-0.5">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                  tab === t.id ? "bg-[var(--bg-active)] text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">

            {/* ── Model tab ── */}
            {tab === "model" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">Select Model</h3>
                  <a
                    href="https://build.nvidia.com/explore/discover"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                  >
                    <Info size={11} /> Explore models
                  </a>
                </div>
                {NVIDIA_MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => set("selectedModel", m.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all active:scale-[0.99] ${
                      form.selectedModel === m.id
                        ? "border-[var(--accent)] bg-[var(--bg-active)]"
                        : "border-[var(--border)] hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{m.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${getBadgeStyle(m.badge)}`}>
                            {m.badge}
                          </span>
                        )}
                        {m.supportsVision && (
                          <span className="text-[10px] text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-md font-medium">
                            Vision
                          </span>
                        )}
                        {form.selectedModel === m.id && <Check size={14} className="text-[var(--accent)]" />}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{m.description}</p>
                  </button>
                ))}
                <p className="text-xs text-[var(--text-muted)] mt-3 px-1">
                  💡 <strong>Llama 3.1 8B</strong> is recommended for Vercel Hobby (free) plan — fastest TTFT.
                </p>
              </div>
            )}

            {/* ── Chat tab ── */}
            {tab === "chat" && (
              <div className="space-y-5">
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Chat Behavior</h3>

                <Toggle
                  label="Auto-generate title"
                  description="Name chats from first message"
                  value={form.autoTitle}
                  onChange={v => set("autoTitle", v)}
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">System Prompt</label>
                  <textarea
                    value={form.systemPrompt}
                    onChange={e => set("systemPrompt", e.target.value)}
                    rows={4}
                    placeholder="You are a helpful assistant…"
                    className="w-full border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[var(--border-focus)] resize-none transition-colors placeholder:text-[var(--text-muted)]"
                  />
                </div>

                <Slider
                  label="Temperature"
                  min={0} max={1} step={0.05}
                  value={form.temperature}
                  onChange={v => set("temperature", v)}
                  leftLabel="Precise"
                  rightLabel="Creative"
                  format={v => v.toFixed(2)}
                />

                <Slider
                  label="Max Tokens"
                  min={256} max={4096} step={128}
                  value={form.maxTokens}
                  onChange={v => set("maxTokens", v)}
                  leftLabel="256"
                  rightLabel="4096"
                  format={v => v.toLocaleString()}
                />
              </div>
            )}

            {/* ── Display tab ── */}
            {tab === "display" && (
              <div className="space-y-5">
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Display</h3>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Font Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["small", "medium", "large"] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => set("fontSize", size)}
                        className={`py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.97] ${
                          form.fontSize === size
                            ? "border-[var(--accent)] bg-[var(--bg-active)] text-[var(--text-primary)]"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                        }`}
                        style={{ fontSize: size === "small" ? 12 : size === "medium" ? 14 : 16 }}
                      >
                        {size[0].toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-3">
                    Preview:{" "}
                    <span style={{ fontSize: form.fontSize === "small" ? 12 : form.fontSize === "medium" ? 15 : 17 }}>
                      The quick brown fox jumps over the lazy dog
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* ── Shortcuts tab ── */}
            {tab === "shortcuts" && (
              <div>
                <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4">Keyboard Shortcuts</h3>
                <div className="space-y-0.5">
                  {KEYBOARD_SHORTCUTS.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                      <span className="text-sm text-[var(--text-secondary)]">{s.description}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {s.keys.map((k, j) => (
                          <kbd key={j} className="px-1.5 py-0.5 rounded-md bg-[var(--bg-hover)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)]">{k}</kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Data tab ── */}
            {tab === "data" && (
              <div className="space-y-5">
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Export & Data</h3>

                <div className="border border-[var(--border)] rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Export current chat</p>
                  <p className="text-xs text-[var(--text-muted)]">Download the active conversation as a file.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onExportChat("txt")}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-hover)] text-sm text-[var(--text-secondary)] transition-all active:scale-[0.97]"
                    >
                      <Download size={13} /> .txt
                    </button>
                    <button
                      onClick={() => onExportChat("json")}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-hover)] text-sm text-[var(--text-secondary)] transition-all active:scale-[0.97]"
                    >
                      <Download size={13} /> .json
                    </button>
                  </div>
                </div>

                <div className="border border-red-100 rounded-xl p-4 space-y-3 bg-red-50">
                  <p className="text-sm font-medium text-red-700">Danger zone</p>
                  <p className="text-xs text-red-400">Permanently delete all chat history. Cannot be undone.</p>
                  <button
                    onClick={() => {
                      if (confirm("Delete all history? This cannot be undone.")) {
                        onClearAllHistory();
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors active:scale-[0.97]"
                  >
                    <Trash2 size={13} /> Clear all history
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--border)] bg-[var(--bg-sidebar)] shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm bg-[var(--accent)] text-white hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {saved ? <><Check size={13} /> Saved!</> : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reusable sub-components ──────────────────────────────

function Toggle({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${value ? "bg-[var(--accent)]" : "bg-gray-200"}`}
        role="switch"
        aria-checked={value}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange, leftLabel, rightLabel, format }: {
  label: string; min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; leftLabel: string; rightLabel: string;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>
        <span className="text-sm font-mono text-[var(--text-secondary)]">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(typeof min === "number" && String(min).includes(".") ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-full accent-black h-4"
      />
      <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
        <span>{leftLabel}</span><span>{rightLabel}</span>
      </div>
    </div>
  );
}

function getBadgeStyle(badge: string): string {
  switch (badge) {
    case "Fast":   return "bg-green-50 text-green-700 border border-green-100";
    case "Smart":  return "bg-blue-50 text-blue-700 border border-blue-100";
    case "Latest": return "bg-amber-50 text-amber-700 border border-amber-100";
    case "Pro":    return "bg-zinc-100 text-zinc-600 border border-zinc-200";
    default:       return "bg-[var(--bg-hover)] text-[var(--text-muted)]";
  }
}
