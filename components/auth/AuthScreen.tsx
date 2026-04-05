"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { ZebraLogo } from "../ZebraLogo";

type Mode = "login" | "register" | "reset";

export function AuthScreen() {
  const [mode, setMode]         = useState<Mode>("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const clear = () => { setError(""); setSuccess(""); };

  const handleGoogle = async () => {
    setLoading(true); clear();
    try { await signInWithPopup(auth, googleProvider); }
    catch (e: unknown) { setError(getFriendlyError((e as { code?: string }).code)); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); clear();
    try {
      if (mode === "login")         await signInWithEmailAndPassword(auth, email, password);
      else if (mode === "register") await createUserWithEmailAndPassword(auth, email, password);
      else { await sendPasswordResetEmail(auth, email); setSuccess("Reset email sent! Check your inbox."); }
    } catch (e: unknown) { setError(getFriendlyError((e as { code?: string }).code)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-base)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo & brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ZebraLogo size={56} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Zebra AI</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Powered by NVIDIA NIM</p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-md p-5 sm:p-7">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">
            {mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Reset password"}
          </h2>

          {mode !== "reset" && (
            <>
              <button onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-primary)] transition-all disabled:opacity-50 mb-5 active:scale-[0.98]">
                <GoogleIcon /> Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-muted)]">or</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email" required autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-[var(--border-focus)] transition-colors bg-white" />
            </div>

            {mode !== "reset" && (
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-[var(--border-focus)] transition-colors bg-white" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-1">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}

            {error   && <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[var(--danger-light)] border border-red-100 text-[var(--danger)] text-xs"><AlertCircle size={13} className="shrink-0 mt-0.5" />{error}</div>}
            {success && <div className="px-3 py-2.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs">{success}</div>}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors disabled:opacity-60 active:scale-[0.98]">
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset email"}
            </button>
          </form>

          <div className="mt-5 text-center space-y-2">
            {mode === "login" && <>
              <button onClick={() => { setMode("register"); clear(); }} className="text-xs text-[var(--text-secondary)] block w-full">
                Don't have an account? <span className="font-semibold underline underline-offset-2">Sign up</span>
              </button>
              <button onClick={() => { setMode("reset"); clear(); }} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                Forgot password?
              </button>
            </>}
            {mode === "register" && <button onClick={() => { setMode("login"); clear(); }} className="text-xs text-[var(--text-secondary)]">
              Already have an account? <span className="font-semibold underline underline-offset-2">Sign in</span>
            </button>}
            {mode === "reset" && <button onClick={() => { setMode("login"); clear(); }} className="text-xs text-[var(--text-secondary)]">
              ← Back to sign in
            </button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;
}

function getFriendlyError(code?: string): string {
  switch (code) {
    case "auth/user-not-found":        return "Account not found.";
    case "auth/wrong-password":        return "Incorrect password.";
    case "auth/invalid-credential":    return "Incorrect email or password.";
    case "auth/email-already-in-use":  return "Email already registered.";
    case "auth/weak-password":         return "Password must be at least 6 characters.";
    case "auth/invalid-email":         return "Invalid email format.";
    case "auth/popup-closed-by-user":  return "Sign-in cancelled.";
    case "auth/network-request-failed":return "Network error. Check your connection.";
    default: return "Something went wrong. Please try again.";
  }
}
