"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthUser } from "@/lib/types";
import { LogOut, ChevronDown } from "lucide-react";

export function UserMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const initials = user.displayName
    ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "U").toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors w-full">
        {user.photoURL
          ? <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 border border-[var(--border)]" />
          : <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 border border-[var(--border-strong)]">{initials}</div>
        }
        <span className="text-xs text-[var(--text-secondary)] truncate flex-1 text-left leading-tight">
          {user.displayName ?? user.email}
        </span>
        <ChevronDown size={11} className="text-[var(--text-muted)] shrink-0" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 w-52 bg-white border border-[var(--border)] rounded-xl shadow-md py-1.5 animate-fade-in z-50">
          <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.displayName ?? "User"}</p>
            <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{user.email}</p>
          </div>
          <button onClick={() => signOut(auth)}
            className="w-[calc(100%-8px)] mx-1 flex items-center gap-2 px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors rounded-lg">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
