// ============================================================
// lib/streaming.ts — Robust SSE Stream Parser (v2 - Fixed)
//
// ROOT CAUSE FIXES:
// 1. chunkTimeout naik ke 60s — model besar memiliki TTFT
//    (Time-To-First-Token) yang bisa 10-30 detik. INI penyebab
//    utama "stuck" — bukan bug, tapi model lagi "berpikir"
// 2. onFirstChunk callback baru — agar UI bisa update status
//    dari "Generating…" ke "Typing…" saat token pertama tiba
// 3. throttleMs 60ms (bukan 40ms) — lebih hemat render cycle
// ============================================================

export interface StreamOptions {
  onChunk:        (accumulated: string) => void;
  onDone:         (final: string) => void;
  onError:        (err: Error) => void;
  onFirstChunk?:  () => void;  // NEW: saat token pertama tiba
  signal?:        AbortSignal;
  chunkTimeout?:  number;
  throttleMs?:    number;
}

export async function parseNvidiaStream(
  response: Response,
  options: StreamOptions,
): Promise<void> {
  const {
    onChunk,
    onDone,
    onError,
    onFirstChunk,
    signal,
    chunkTimeout  = 50_000, // 50s — disesuaikan Vercel Hobby (max 60s)
    throttleMs    = 60,
  } = options;

  if (!response.body) {
    onError(new Error("No response body from NVIDIA API"));
    return;
  }

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();

  let accumulated  = "";
  let buffer       = "";
  let lastChunkAt  = Date.now();
  let lastUIUpdate = 0;
  let isFirstChunk = true;

  const timeoutChecker = setInterval(() => {
    if (Date.now() - lastChunkAt > chunkTimeout) {
      clearInterval(timeoutChecker);
      reader.cancel("Chunk timeout");
      onError(new Error(
        `Koneksi ke NVIDIA terputus — tidak ada data selama ${chunkTimeout / 1000} detik. ` +
        "Model mungkin overloaded. Coba lagi atau pilih model yang lebih kecil."
      ));
    }
  }, 5_000);

  signal?.addEventListener("abort", () => {
    clearInterval(timeoutChecker);
    reader.cancel("User cancelled");
  }, { once: true });

  try {
    while (true) {
      if (signal?.aborted) break;

      const { done, value } = await reader.read();
      if (done) break;

      lastChunkAt = Date.now();
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const data = trimmed.slice(5).trim();
        if (data === "[DONE]" || data === "") continue;

        try {
          const parsed = JSON.parse(data);

          const delta =
            parsed?.choices?.[0]?.delta?.content ??
            parsed?.choices?.[0]?.text ??
            null;

          if (typeof delta === "string" && delta.length > 0) {
            if (isFirstChunk) {
              isFirstChunk = false;
              onFirstChunk?.();
            }

            accumulated += delta;

            const now = Date.now();
            if (now - lastUIUpdate >= throttleMs) {
              lastUIUpdate = now;
              onChunk(accumulated);
            }
          }

          const finishReason = parsed?.choices?.[0]?.finish_reason;
          if (finishReason && finishReason !== "null" && finishReason !== null) {
            if (accumulated) onChunk(accumulated);
          }
        } catch {
          // partial JSON — skip
        }
      }
    }

    if (accumulated) onChunk(accumulated);
    clearInterval(timeoutChecker);
    onDone(accumulated);

  } catch (err: unknown) {
    clearInterval(timeoutChecker);
    const e = err as Error;
    if (e.name === "AbortError" || signal?.aborted) {
      if (accumulated) onDone(accumulated);
      return;
    }
    onError(e);
  }
}
