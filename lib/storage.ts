import { ChatSession, AppSettings } from "./types";
import { LS_KEYS } from "./constants";
import { v4 as uuidv4 } from "uuid";

export function getActiveSessionId(): string | null {
  try { return localStorage.getItem(LS_KEYS.ACTIVE_SESSION); } catch { return null; }
}
export function setActiveSessionId(id: string): void {
  try { localStorage.setItem(LS_KEYS.ACTIVE_SESSION, id); } catch {}
}

export function getLocalSettings(): Partial<AppSettings> {
  try {
    const raw = localStorage.getItem(LS_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
export function saveLocalSettings(s: Partial<AppSettings>): void {
  try { localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(s)); } catch {}
}

export function createNewSession(model: string): ChatSession {
  const now = Date.now();
  return { id: uuidv4(), title: "New chat", messages: [], model, createdAt: now, updatedAt: now };
}

export function generateTitle(firstMessage: string): string {
  const t = firstMessage.trim();
  return t.length <= 45 ? t : t.slice(0, 45) + "…";
}

export function exportSessionAsText(session: ChatSession): string {
  const lines = [`# ${session.title}`, `Date: ${new Date(session.createdAt).toLocaleString()}`, `Model: ${session.model}`, "---", ""];
  for (const msg of session.messages) {
    lines.push(`[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.role === "user" ? "You" : "Assistant"}:`);
    lines.push(msg.content, "");
  }
  return lines.join("\n");
}

export function exportSessionAsJSON(session: ChatSession): string {
  return JSON.stringify(session, null, 2);
}
