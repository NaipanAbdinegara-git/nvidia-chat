"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  fetchSessions, saveSession, deleteSession,
  clearAllSessions, fetchSettings, saveSettingsFS,
} from "@/lib/firestore";
import {
  getActiveSessionId, setActiveSessionId,
  createNewSession, generateTitle,
  exportSessionAsText, exportSessionAsJSON,
  getLocalSettings, saveLocalSettings,
} from "@/lib/storage";
import { AuthScreen }    from "./auth/AuthScreen";
import { LandingPage }   from "./LandingPage";
import { Sidebar }       from "./Sidebar";
import { ChatWindow }    from "./ChatWindow";
import { SettingsModal } from "./SettingsModal";
import { AuthUser, ChatSession, AppSettings, Message, SearchResult, Attachment } from "@/lib/types";
import { DEFAULT_SETTINGS, NVIDIA_MODELS } from "@/lib/constants";
import { buildApiMessages } from "@/lib/buildMessages";
import { parseNvidiaStream } from "@/lib/streaming";
import { v4 as uuidv4 } from "uuid";

function stripForStorage(session: ChatSession): ChatSession {
  return {
    ...session,
    messages: session.messages.map(m => ({
      ...m,
      attachments: m.attachments?.map(a => ({
        ...a,
        dataUrl: "",
        base64: "",
        textContent: a.textContent ? a.textContent.slice(0, 500) : undefined, // keep short preview
      })),
    })),
  };
}

export function ChatApp() {
  const [user, setUser]                   = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading]     = useState(true);
  const [showLanding, setShowLanding]     = useState(true);
  const [sessions, setSessions]           = useState<ChatSession[]>([]);
  const [activeId, setActiveId]           = useState<string | null>(null);
  const [settings, setSettings]           = useState<AppSettings>({ ...DEFAULT_SETTINGS });
  const [showSettings, setShowSettings]   = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [isMobile, setIsMobile]           = useState(false);
  const [isStreaming, setIsStreaming]      = useState(false);
  const [isSearching, setIsSearching]     = useState(false);
  const [streamStatus, setStreamStatus]   = useState<string>("");
  const [error, setError]                 = useState<string | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const abortRef      = useRef<AbortController | null>(null);
  const activeIdRef   = useRef<string | null>(null); // stable ref for callbacks
  const settingsRef   = useRef<AppSettings>(settings);

  // Keep refs in sync
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // ── Auth ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (fu) {
        const u: AuthUser = { uid: fu.uid, email: fu.email, displayName: fu.displayName, photoURL: fu.photoURL };
        setUser(u);
        setShowLanding(false);
        await loadUserData(u.uid);
      } else {
        setUser(null);
        setSessions([]);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      const [fsSessions, fsSettings] = await Promise.all([fetchSessions(uid), fetchSettings(uid)]);
      const localPrefs = getLocalSettings();
      const merged: AppSettings = { ...DEFAULT_SETTINGS, ...fsSettings, ...localPrefs };
      setSettings(merged);
      settingsRef.current = merged;
      setWebSearchEnabled(merged.webSearchEnabled);

      const savedActiveId = getActiveSessionId();
      if (fsSessions.length > 0) {
        setSessions(fsSessions);
        const target = fsSessions.find(s => s.id === savedActiveId) ? savedActiveId : fsSessions[0].id;
        setActiveId(target);
        activeIdRef.current = target;
      } else {
        const fresh = createNewSession(merged.selectedModel);
        setSessions([fresh]);
        setActiveId(fresh.id);
        activeIdRef.current = fresh.id;
        await saveSession(uid, fresh);
      }
    } catch {
      setError("Failed to load data. Please refresh.");
    }
  };

  // ── Mobile detection ──
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (activeId) setActiveSessionId(activeId);
  }, [activeId]);

  const activeSession = sessions.find(s => s.id === activeId) ?? null;

  // ── Session handlers ──
  const handleNewChat = useCallback(async () => {
    if (!user) return;
    const s = createNewSession(settingsRef.current.selectedModel);
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id);
    activeIdRef.current = s.id;
    setError(null);
    await saveSession(user.uid, s);
  }, [user]);

  const handleDeleteSession = useCallback(async (id: string) => {
    if (!user) return;
    await deleteSession(user.uid, id);
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) {
        const fresh = createNewSession(settingsRef.current.selectedModel);
        setActiveId(fresh.id);
        activeIdRef.current = fresh.id;
        void saveSession(user.uid, fresh);
        return [fresh];
      }
      if (id === activeIdRef.current) {
        setActiveId(next[0].id);
        activeIdRef.current = next[0].id;
      }
      return next;
    });
  }, [user]);

  const handleRenameSession = useCallback(async (id: string, title: string) => {
    if (!user) return;
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s));
    const existing = sessions.find(s => s.id === id);
    if (existing) await saveSession(user.uid, { ...existing, title });
  }, [sessions, user]);

  const handleClearAllHistory = useCallback(async () => {
    if (!user) return;
    await clearAllSessions(user.uid);
    const fresh = createNewSession(settingsRef.current.selectedModel);
    setSessions([fresh]);
    setActiveId(fresh.id);
    activeIdRef.current = fresh.id;
    await saveSession(user.uid, fresh);
  }, [user]);

  const handleExportChat = useCallback((format: "txt" | "json") => {
    const sess = sessions.find(s => s.id === activeIdRef.current);
    if (!sess?.messages.length) { alert("No messages to export."); return; }
    const content  = format === "txt" ? exportSessionAsText(sess) : exportSessionAsJSON(sess);
    const filename = `zebra-${sess.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.${format}`;
    const url = URL.createObjectURL(new Blob([content], { type: format === "txt" ? "text/plain" : "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: filename }).click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  const handleSaveSettings = useCallback(async (ns: AppSettings) => {
    setSettings(ns);
    settingsRef.current = ns;
    setWebSearchEnabled(ns.webSearchEnabled);
    saveLocalSettings({ fontSize: ns.fontSize, autoTitle: ns.autoTitle, webSearchEnabled: ns.webSearchEnabled });
    if (user) await saveSettingsFS(user.uid, ns);
    setShowSettings(false);
  }, [user]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setIsSearching(false);
    setStreamStatus("");
  }, []);

  const handleToggleWebSearch = useCallback(() => {
    setWebSearchEnabled(prev => {
      const next = !prev;
      setSettings(curr => {
        const updated = { ...curr, webSearchEnabled: next };
        settingsRef.current = updated;
        saveLocalSettings({ fontSize: updated.fontSize, autoTitle: updated.autoTitle, webSearchEnabled: next });
        if (user) void saveSettingsFS(user.uid, updated);
        return updated;
      });
      return next;
    });
  }, [user]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        if (e.key === "O") { e.preventDefault(); handleNewChat(); }
        if (e.key === "S") { e.preventDefault(); setShowSettings(v => !v); }
        if (e.key === "E") { e.preventDefault(); handleExportChat("txt"); }
        if (e.key === "B") { e.preventDefault(); setSidebarOpen(v => !v); }
        if (e.key === "W") { e.preventDefault(); handleToggleWebSearch(); }
      }
      if (e.key === "Escape") {
        if (showSettings) { setShowSettings(false); return; }
        if (isStreaming) handleStop();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNewChat, handleExportChat, handleToggleWebSearch, showSettings, isStreaming, handleStop]);

  // ── MAIN SEND ──
  const handleSend = useCallback(async (content: string, attachments: Attachment[]) => {
    if ((!content.trim() && attachments.length === 0) || isStreaming || isSearching) return;
    if (!user) return;

    const currentActiveId  = activeIdRef.current;
    const currentSettings  = settingsRef.current;
    setError(null);

    const sessionSnapshot = sessions.find(s => s.id === currentActiveId) ?? null;

    const userMsgId      = uuidv4();
    const assistantMsgId = uuidv4();
    const now            = Date.now();

    const userMsg: Message = {
      id: userMsgId, role: "user", content: content.trim(), timestamp: now, attachments,
    };
    const assistantMsg: Message = {
      id: assistantMsgId, role: "assistant", content: "", timestamp: now + 1,
    };

    setSessions(prev => prev.map(s => {
      if (s.id !== currentActiveId) return s;
      return {
        ...s,
        messages:  [...s.messages, userMsg, assistantMsg],
        title:     s.messages.length === 0 && currentSettings.autoTitle
          ? generateTitle(content || attachments[0]?.name || "File")
          : s.title,
        updatedAt: now,
        model:     currentSettings.selectedModel,
      };
    }));

    // ── Web search ──
    let searchResults: SearchResult[] = [];
    let searchAnswer: string | undefined;

    if (webSearchEnabled && content.trim()) {
      setIsSearching(true);
      setStreamStatus("Searching the web…");
      try {
        const res  = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body:   JSON.stringify({ query: content }),
        });
        const data = await res.json();
        searchResults = data.results ?? [];
        searchAnswer  = data.answer;

        if (searchResults.length > 0) {
          setSessions(prev => prev.map(s => {
            if (s.id !== currentActiveId) return s;
            return {
              ...s,
              messages: s.messages.map(m =>
                m.id === assistantMsgId ? { ...m, searchResults } : m
              ),
            };
          }));
        }
      } catch {
        // search failed — continue without
      } finally {
        setIsSearching(false);
      }
    }

    // ── Build API messages ──
    const modelMeta = NVIDIA_MODELS.find(m => m.id === currentSettings.selectedModel)
      ?? { id: currentSettings.selectedModel, name: currentSettings.selectedModel, description: "", supportsVision: false };

    const apiMessages = buildApiMessages({
      history:       sessionSnapshot?.messages ?? [],
      userContent:   content.trim(),
      attachments,
      systemPrompt:  currentSettings.systemPrompt,
      searchResults,
      searchAnswer,
      model:         modelMeta,
    });

    // ── Stream ──
    setIsStreaming(true);
    setStreamStatus("Waiting for model…");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        signal:  controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages:    apiMessages,
          model:       currentSettings.selectedModel,
          temperature: currentSettings.temperature,
          maxTokens:   currentSettings.maxTokens,
          stream:      true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      await parseNvidiaStream(res, {
        signal: controller.signal,

        onFirstChunk: () => setStreamStatus("Typing…"),

        onChunk: (accumulated) => {
          setSessions(prev => prev.map(s => {
            if (s.id !== currentActiveId) return s;
            return {
              ...s,
              messages: s.messages.map(m =>
                m.id === assistantMsgId ? { ...m, content: accumulated } : m
              ),
            };
          }));
        },

        onDone: async (accumulated) => {
          setStreamStatus("");

          const updatedMessages: Message[] = [
            ...(sessionSnapshot?.messages ?? []),
            userMsg,
            { ...assistantMsg, content: accumulated, searchResults: searchResults.length > 0 ? searchResults : undefined },
          ];

          const finalSession: ChatSession = {
            ...(sessionSnapshot ?? createNewSession(currentSettings.selectedModel)),
            id:        currentActiveId!,
            title:     sessionSnapshot?.messages.length === 0 && currentSettings.autoTitle
              ? generateTitle(content || attachments[0]?.name || "File")
              : (sessionSnapshot?.title ?? "New chat"),
            messages:  updatedMessages,
            updatedAt: Date.now(),
            model:     currentSettings.selectedModel,
          };

          // Update UI with final state
          setSessions(prev => prev.map(s => s.id === currentActiveId ? finalSession : s));

          try {
            await saveSession(user.uid, stripForStorage(finalSession));
          } catch {
            // Firestore save failed — not fatal
          }
        },

        onError: (err) => {
          setError(err.message);
          setStreamStatus("");
          setSessions(prev => prev.map(s => {
            if (s.id !== currentActiveId) return s;
            return { ...s, messages: s.messages.filter(m => m.id !== assistantMsgId) };
          }));
        },
      });

    } catch (err: unknown) {
      const e = err as Error;
      if (e.name === "AbortError" || controller.signal.aborted) {
        setStreamStatus("");
      } else {
        setError(e.message || "Unknown error");
        setStreamStatus("");
        setSessions(prev => prev.map(s => {
          if (s.id !== currentActiveId) return s;
          return { ...s, messages: s.messages.filter(m => m.id !== assistantMsgId) };
        }));
      }
    } finally {
      setIsStreaming(false);
      setIsSearching(false);
      abortRef.current = null;
    }
  }, [isSearching, isStreaming, sessions, user, webSearchEnabled]);

  // ── Retry: resend the last user message ──
  const handleRetry = useCallback(async (message: Message) => {
    if (isStreaming || isSearching) return;
    await handleSend(message.content, message.attachments ?? []);
  }, [handleSend, isSearching, isStreaming]);

  // ── Loading screen ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--text-muted)]">Loading…</p>
        </div>
      </div>
    );
  }

  // Show landing page if user hasn't clicked "Get started" yet
  if (!user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(v => !v)}
        onNewChat={handleNewChat}
        onSelectSession={id => { setActiveId(id); activeIdRef.current = id; setError(null); }}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenSettings={() => setShowSettings(true)}
        currentModel={settings.selectedModel}
        user={user}
        isMobile={isMobile}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <ChatWindow
          session={activeSession}
          isStreaming={isStreaming}
          isSearching={isSearching}
          streamStatus={streamStatus}
          error={error}
          onSend={handleSend}
          onStop={handleStop}
          onRetry={handleRetry}
          onClearError={() => setError(null)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          onOpenSettings={() => setShowSettings(true)}
          selectedModel={settings.selectedModel}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={handleToggleWebSearch}
        />
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
          onExportChat={handleExportChat}
          onClearAllHistory={handleClearAllHistory}
        />
      )}
    </div>
  );
}
