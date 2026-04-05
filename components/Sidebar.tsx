"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, MessageSquare, Trash2, Pencil, Check, X, Settings, PanelLeftClose } from "lucide-react";
import { ChatSession, AuthUser } from "@/lib/types";
import { NVIDIA_MODELS } from "@/lib/constants";
import { UserMenu } from "./auth/UserMenu";
import { ZebraLogo, ZebraBadge } from "./ZebraLogo";

interface SidebarProps {
  sessions: ChatSession[]; activeId: string | null; open: boolean;
  onToggle: () => void; onNewChat: () => void; onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void; onRenameSession: (id: string, title: string) => void;
  onOpenSettings: () => void; currentModel: string; user: AuthUser;
  isMobile: boolean;
}

export function Sidebar({ sessions, activeId, open, onToggle, onNewChat, onSelectSession, onDeleteSession, onRenameSession, onOpenSettings, currentModel, user, isMobile }: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editingId && editRef.current) { editRef.current.focus(); editRef.current.select(); } }, [editingId]);

  const now   = Date.now();
  const today = sessions.filter(s => now - s.updatedAt < 86_400_000);
  const week  = sessions.filter(s => now - s.updatedAt >= 86_400_000 && now - s.updatedAt < 7 * 86_400_000);
  const older = sessions.filter(s => now - s.updatedAt >= 7 * 86_400_000);
  const modelName = NVIDIA_MODELS.find(m => m.id === currentModel)?.name ?? currentModel;

  function Item({ s }: { s: ChatSession }) {
    const active  = s.id === activeId;
    const editing = editingId === s.id;

    const commit = () => {
      if (editValue.trim()) onRenameSession(s.id, editValue.trim());
      setEditingId(null);
    };

    return (
      <div
        onClick={() => { if (!editing) { onSelectSession(s.id); if (isMobile) onToggle(); } }}
        className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm select-none ${
          active ? "bg-[var(--bg-active)] text-[var(--text-primary)] font-medium" : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
        }`}
      >
        <MessageSquare size={13} className="shrink-0 opacity-40" />
        {editing ? (
          <input ref={editRef} value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditingId(null); }}
            onBlur={commit}
            onClick={e => e.stopPropagation()}
            className="flex-1 text-xs px-1.5 py-0.5 rounded-lg border border-[var(--border-focus)] outline-none bg-white text-[var(--text-primary)]"
          />
        ) : (
          <span className="flex-1 truncate text-xs leading-snug">{s.title}</span>
        )}
        {!editing && (
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
            <button onClick={e => { e.stopPropagation(); setEditingId(s.id); setEditValue(s.title); }}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-active)] text-[var(--text-muted)]"><Pencil size={11} /></button>
            <button onClick={e => { e.stopPropagation(); if (confirm("Delete this chat?")) onDeleteSession(s.id); }}
              className="p-1.5 rounded-lg hover:bg-[var(--danger-light)] text-[var(--text-muted)] hover:text-[var(--danger)]"><Trash2 size={11} /></button>
          </div>
        )}
        {editing && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={e => { e.stopPropagation(); commit(); }} className="p-1.5 rounded-lg text-green-600"><Check size={11} /></button>
            <button onClick={e => { e.stopPropagation(); setEditingId(null); }} className="p-1.5 rounded-lg text-[var(--text-muted)]"><X size={11} /></button>
          </div>
        )}
      </div>
    );
  }

  function Label({ label }: { label: string }) {
    return <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest px-3 pt-4 pb-1.5">{label}</p>;
  }

  const sidebarContent = (
    <div className="w-[88vw] sm:w-[var(--sidebar-width)] h-full flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <ZebraLogo size={28} />
          <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">Zebra AI</span>
        </div>
        <button onClick={onToggle} className="p-1.5 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors">
          <PanelLeftClose size={15} />
        </button>
      </div>

      {/* New chat */}
      <div className="px-3 py-2.5">
        <button onClick={() => { onNewChat(); if (isMobile) onToggle(); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-xs font-medium shadow-xs active:scale-[0.98]">
          <Plus size={14} /> New chat
        </button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sessions.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] text-center py-10 px-4 leading-relaxed">
            Start a conversation to see your history here
          </p>
        )}
        {today.length > 0 && <><Label label="Today" />{today.map(s => <Item key={s.id} s={s} />)}</>}
        {week.length  > 0 && <><Label label="This week" />{week.map(s => <Item key={s.id} s={s} />)}</>}
        {older.length > 0 && <><Label label="Older" />{older.map(s => <Item key={s.id} s={s} />)}</>}
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[var(--border)] space-y-1">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--bg-active)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)] shrink-0" />
          <span className="text-[11px] text-[var(--text-secondary)] font-medium truncate">{modelName}</span>
        </div>
        <button onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-xs">
          <Settings size={13} /> Settings
        </button>
        <UserMenu user={user} />
      </div>
    </div>
  );

  // Mobile: drawer overlay
  if (isMobile) {
    if (!open) return null;
    return (
      <>
        {/* Backdrop */}
        <div className="sidebar-overlay animate-fade-in" onClick={onToggle} />
        {/* Drawer */}
        <div className="fixed top-0 left-0 h-[100dvh] z-50 animate-slide-left shadow-xl max-w-[88vw]">
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop: collapsible inline
  if (!open) {
    return (
      <div className="w-14 flex flex-col items-center py-3 gap-2 border-r border-[var(--border)] bg-[var(--bg-sidebar)] shrink-0">
        <button onClick={onToggle} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors" title="Open sidebar">
          <ZebraBadge size={22} />
        </button>
        <button onClick={onNewChat} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors" title="New chat">
          <Plus size={17} />
        </button>
        <div className="flex-1" />
        <button onClick={onOpenSettings} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors" title="Settings">
          <Settings size={17} />
        </button>
      </div>
    );
  }

  return <div className="shrink-0">{sidebarContent}</div>;
}
