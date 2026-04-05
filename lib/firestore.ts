// ============================================================
// FIRESTORE HELPERS (SAFE VERSION)
// Anti undefined + lebih aman untuk Firestore
// ============================================================

import {
  collection, doc, getDocs, setDoc, deleteDoc,
  getDoc, query, orderBy, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { ChatSession, AppSettings } from "./types";
import { DEFAULT_SETTINGS } from "./constants";

// 🔥 Helper: hapus semua undefined (WAJIB untuk Firestore)
function cleanData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// ── Sessions ──────────────────────────────────────────────

export async function fetchSessions(uid: string): Promise<ChatSession[]> {
  const ref = collection(db, "users", uid, "sessions");
  const q   = query(ref, orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map(d => cleanData(d.data() as ChatSession));
}

export async function saveSession(uid: string, session: ChatSession): Promise<void> {
  const ref = doc(db, "users", uid, "sessions", session.id);

  const safeSession = cleanData(session);

  await setDoc(ref, safeSession, { merge: true });
}

export async function deleteSession(uid: string, sessionId: string): Promise<void> {
  const ref = doc(db, "users", uid, "sessions", sessionId);
  await deleteDoc(ref);
}

export async function clearAllSessions(uid: string): Promise<void> {
  const ref  = collection(db, "users", uid, "sessions");
  const snap = await getDocs(ref);
  const batch = writeBatch(db);

  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// ── Settings ──────────────────────────────────────────────

const DEFAULT_APP_SETTINGS: AppSettings = {
  ...DEFAULT_SETTINGS,
};

export async function fetchSettings(uid: string): Promise<AppSettings> {
  const ref  = doc(db, "users", uid, "settings", "main");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return DEFAULT_APP_SETTINGS;
  }

  const data = cleanData(snap.data()) as Partial<AppSettings>;

  return { ...DEFAULT_APP_SETTINGS, ...data };
}

export async function saveSettingsFS(uid: string, settings: AppSettings): Promise<void> {
  const ref = doc(db, "users", uid, "settings", "main");

  const safeSettings = cleanData(settings);

  await setDoc(ref, safeSettings, { merge: true });
}
