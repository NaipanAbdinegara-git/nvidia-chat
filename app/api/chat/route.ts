import { NextRequest, NextResponse } from "next/server";

// ============================================================
// /api/chat — NVIDIA NIM Streaming Proxy (v2 - Fixed)
//
// FIXES vs v1:
// 1. maxDuration = 300 (5 menit) — diperlukan untuk model besar
//    yang TTFT-nya bisa 30-60 detik. Tanpa ini Vercel kill
//    connection setelah 10 detik default → penyebab "stuck"!
// 2. Timeout dinaikkan ke 90s (dari 45s)
// 3. Retry lebih pintar — hanya retry timeout, bukan 5xx semua
// ============================================================

// KRITIS untuk Vercel: tanpa ini, function di-kill setelah 10s
// Vercel Hobby (free) max = 60 detik
export const maxDuration = 60;

const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";
const MAX_RETRIES     = 1; // kurangi retry agar tidak double-delay
const TIMEOUT_MS      = 55_000; // 55s — sedikit di bawah Vercel Hobby limit (60s)

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), timeoutMs);
  const signal     = options.signal
    ? combineSignals(options.signal as AbortSignal, controller.signal)
    : controller.signal;

  try {
    const res = await fetch(url, { ...options, signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function combineSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const abort = () => controller.abort();
  a.addEventListener("abort", abort, { once: true });
  b.addEventListener("abort", abort, { once: true });
  return controller.signal;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, model, temperature = 0.7, maxTokens = 1024, stream = true } = body;

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfigured: NVIDIA_API_KEY not set." },
      { status: 500 }
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages array is empty." }, { status: 400 });
  }

  if (!model || typeof model !== "string") {
    return NextResponse.json({ error: "Model is required." }, { status: 400 });
  }

  const payload = { model, messages, temperature, max_tokens: maxTokens, stream };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const nvidiaRes = await fetchWithTimeout(
        `${NVIDIA_API_BASE}/chat/completions`,
        {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body:   JSON.stringify(payload),
          signal: req.signal,
        },
        TIMEOUT_MS,
      );

      if (nvidiaRes.status >= 400 && nvidiaRes.status < 500) {
        const text = await nvidiaRes.text();
        let msg = `NVIDIA API error (${nvidiaRes.status})`;
        try {
          const parsed = JSON.parse(text);
          msg = parsed?.detail || parsed?.message || parsed?.error?.message || msg;
        } catch { msg = text || msg; }
        return NextResponse.json({ error: msg }, { status: nvidiaRes.status });
      }

      if (nvidiaRes.status >= 500) {
        lastError = new Error(`NVIDIA server error (${nvidiaRes.status})`);
        if (attempt < MAX_RETRIES) {
          await sleep(2000);
          continue;
        }
        return NextResponse.json({ error: lastError.message }, { status: 502 });
      }

      // ── Stream langsung ke client ──
      if (stream && nvidiaRes.body) {
        return new Response(nvidiaRes.body, {
          status: 200,
          headers: {
            "Content-Type":      "text/event-stream; charset=utf-8",
            "Cache-Control":     "no-cache, no-store, no-transform",
            "X-Accel-Buffering": "no",
            "Connection":        "keep-alive",
            "Transfer-Encoding": "chunked",
          },
        });
      }

      const data = await nvidiaRes.json();
      return NextResponse.json(data);

    } catch (err: unknown) {
      const e = err as Error;

      if (e.name === "AbortError" && req.signal.aborted) {
        return new Response(null, { status: 499 });
      }

      lastError = e;
      if (attempt < MAX_RETRIES) {
        await sleep(2000);
        continue;
      }
    }
  }

  const msg = lastError?.name === "AbortError"
    ? "Request timed out (90 detik). Model mungkin overloaded — coba model lebih kecil atau coba lagi."
    : (lastError?.message ?? "Unknown server error");

  return NextResponse.json({ error: msg }, { status: 504 });
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
