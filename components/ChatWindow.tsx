"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Settings, AlertCircle, X, Menu, Globe, Loader2, ChevronDown, RotateCcw } from "lucide-react";
import { ChatSession, Attachment, Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { NVIDIA_MODELS } from "@/lib/constants";
import { ZebraLogo } from "./ZebraLogo";

interface ChatWindowProps {
  session:           ChatSession | null;
  isStreaming:       boolean;
  isSearching:       boolean;
  streamStatus:      string;
  error:             string | null;
  onSend:            (content: string, attachments: Attachment[]) => void;
  onStop:            () => void;
  onRetry:           (message: Message) => void;
  onClearError:      () => void;
  sidebarOpen:       boolean;
  onToggleSidebar:   () => void;
  onOpenSettings:    () => void;
  selectedModel:     string;
  webSearchEnabled:  boolean;
  onToggleWebSearch: () => void;
}

export function ChatWindow({
  session, isStreaming, isSearching, streamStatus, error,
  onSend, onStop, onRetry, onClearError, sidebarOpen, onToggleSidebar,
  onOpenSettings, selectedModel, webSearchEnabled, onToggleWebSearch,
}: ChatWindowProps) {
  const bottomRef     = useRef<HTMLDivElement>(null);
  const scrollRef     = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Auto-scroll to bottom, but only if user is near bottom
  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  }, []);

  // Detect if user scrolled up
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 200);
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // Auto-scroll when streaming
  useEffect(() => {
    if (!isStreaming) return;
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 300) scrollToBottom(false);
  }, [session?.messages, isStreaming, scrollToBottom]);

  // Scroll to bottom when new chat starts
  useEffect(() => {
    scrollToBottom(false);
  }, [session?.id, scrollToBottom]);

  const model    = NVIDIA_MODELS.find(m => m.id === selectedModel);
  const messages = session?.messages ?? [];
  const isBusy   = isStreaming || isSearching;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-[var(--border)] bg-white shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {(!sidebarOpen) && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors shrink-0"
            >
              <Menu size={17} />
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0 animate-pulse" />
            <span className="text-sm font-medium text-[var(--text-secondary)] truncate max-w-[140px] sm:max-w-xs">
              {model?.name ?? selectedModel}
            </span>
            {model?.badge && (
              <span className={`hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0 ${getBadgeStyle(model.badge)}`}>
                {model.badge}
              </span>
            )}
            {webSearchEnabled && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full shrink-0">
                <Globe size={9} /> Web
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors shrink-0"
          title="Settings (Ctrl+Shift+S)"
        >
          <Settings size={17} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain scroll-smooth relative">
        {messages.length === 0 ? (
          <EmptyState
            modelName={model?.name ?? selectedModel}
            onSend={c => onSend(c, [])}
            webSearchEnabled={webSearchEnabled}
          />
        ) : (
          <div className="max-w-2xl mx-auto px-3 sm:px-4 py-5 sm:py-6 space-y-5">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
                onRetry={msg.role === "user" && !isStreaming ? () => onRetry(msg) : undefined}
              />
            ))}

            {/* Status indicator */}
            {isBusy && streamStatus && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] pl-11 animate-fade-in">
                <Loader2 size={13} className="animate-spin shrink-0" />
                <span>{streamStatus}</span>
              </div>
            )}

            <div ref={bottomRef} className="h-1" />
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[var(--border)] shadow-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:shadow-lg transition-all z-10 animate-fade-in"
          >
            <ChevronDown size={15} />
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-3 sm:mx-4 mb-2 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 animate-fade-in">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span className="flex-1 text-xs leading-snug">{error}</span>
          <button onClick={onClearError} className="shrink-0 p-0.5 hover:bg-red-100 rounded">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 shrink-0">
        <div className="max-w-2xl mx-auto">
          <ChatInput
            onSend={onSend}
            onStop={onStop}
            isStreaming={isBusy}
            webSearchEnabled={webSearchEnabled}
            onToggleWebSearch={onToggleWebSearch}
          />
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-2 select-none">
            <span className="font-medium text-[var(--text-secondary)]">Zebra AI</span>
            {" · "}NVIDIA NIM{webSearchEnabled ? " + Web Search" : ""}
            {" · "}AI may make mistakes
          </p>
        </div>
      </div>
    </div>
  );
}

function getBadgeStyle(badge: string): string {
  switch (badge) {
    case "Fast":   return "bg-green-50 text-green-700 border border-green-100";
    case "Smart":  return "bg-blue-50 text-blue-700 border border-blue-100";
    case "Vision": return "bg-purple-50 text-purple-700 border border-purple-100";
    case "Latest": return "bg-amber-50 text-amber-700 border border-amber-100";
    case "Pro":    return "bg-zinc-100 text-zinc-600 border border-zinc-200";
    default:       return "bg-[var(--bg-hover)] text-[var(--text-muted)]";
  }
}

function EmptyState({
  modelName, onSend, webSearchEnabled,
}: {
  modelName: string;
  onSend: (s: string) => void;
  webSearchEnabled: boolean;
}) {
  const suggestions = webSearchEnabled ? [
    { emoji: "🌐", text: "Latest AI news today" },
    { emoji: "📈", text: "Current Bitcoin price" },
    { emoji: "🔬", text: "Latest tech research 2025" },
    { emoji: "🎬", text: "Best movies this month" },
    { emoji: "⚽", text: "Football results last night" },
    { emoji: "💻", text: "Best laptops to buy 2025" },
  ] : [
    { emoji: "💬", text: "Explain how transformers work in ML" },
    { emoji: "🐍", text: "Write a Python quicksort with explanation" },
    { emoji: "🗄️", text: "SQL query to find duplicate rows" },
    { emoji: "🔒", text: "Web app security best practices" },
    { emoji: "🧮", text: "Explain Big-O complexity with examples" },
    { emoji: "🌐", text: "Explain REST vs GraphQL APIs" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <ZebraLogo size={52} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-1.5">
          How can I help?
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {webSearchEnabled
            ? <><span className="font-medium text-blue-600">Web search on</span> · {modelName}</>
            : modelName
          }
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 w-full max-w-2xl">
        {suggestions.map(s => (
          <button
            key={s.text}
            onClick={() => onSend(s.text)}
            className="text-left px-3 sm:px-4 py-3 rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-xs active:scale-[0.97]"
          >
            <span className="mr-1.5">{s.emoji}</span>
            <span className="leading-snug">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
