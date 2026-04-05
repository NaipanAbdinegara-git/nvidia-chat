import { NextRequest, NextResponse } from "next/server";

// ============================================================
// /api/search — Tavily Search Proxy
//
// FIXES vs versi lama:
// 1. Extract "clean search query" dari user input sebelum kirim ke Tavily
//    → user nanya "siapa presiden RI sekarang?" → query: "presiden Indonesia 2025"
//    → bukan raw chat message yang panjang dengan context
// 2. Tambah field answer dari Tavily (direct answer jika ada)
// 3. Trim snippet agar tidak terlalu panjang
// 4. Timeout 10 detik untuk Tavily
// 5. Graceful error — return empty results, jangan crash
// ============================================================

// Types didefinisikan di lib/types.ts — tidak di-export dari sini
// agar Next.js tidak complain tentang invalid route exports
interface SearchResponse {
  results:      import("@/lib/types").SearchResult[];
  query:        string;
  cleanedQuery: string;
  answer?:      string;
}

const TAVILY_TIMEOUT_MS = 10_000;

// ── Extract clean search query dari user message ──
function extractSearchQuery(userMessage: string): string {
  const msg = userMessage.trim();

  // Jika sudah pendek (<= 80 char), pakai langsung
  if (msg.length <= 80) return msg;

  // Ambil kalimat pertama
  const firstSentence = msg.split(/[.!?\n]/)[0].trim();
  if (firstSentence.length >= 10 && firstSentence.length <= 120) {
    return firstSentence;
  }

  // Fallback: ambil 80 karakter pertama
  return msg.slice(0, 80).trim();
}

export async function POST(req: NextRequest) {
  let query: string;
  try {
    const body = await req.json();
    query = body.query;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!query?.trim()) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TAVILY_API_KEY not set", results: [], query, cleanedQuery: query },
      { status: 500 }
    );
  }

  const cleanedQuery = extractSearchQuery(query);

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TAVILY_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      signal:  controller.signal,
      body: JSON.stringify({
        api_key:        apiKey,
        query:          cleanedQuery,
        search_depth:   "basic",
        max_results:    5,
        include_answer: true,       // minta direct answer dari Tavily
        include_domains: [],        // semua domain
        exclude_domains: [],
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[/api/search] Tavily error:", res.status, errText);
      // Return empty results daripada crash — AI tetap bisa jawab tanpa search
      return NextResponse.json({
        results: [],
        query,
        cleanedQuery,
        answer: undefined,
        error: `Tavily error ${res.status}`,
      } satisfies SearchResponse & { error: string });
    }

    const data = await res.json();

    const results: import("@/lib/types").SearchResult[] = (data.results ?? []).map((r: Record<string, unknown>) => ({
      title:   String(r.title   ?? ""),
      url:     String(r.url     ?? ""),
      snippet: String(r.content ?? "").slice(0, 400), // trim agar context tidak terlalu panjang
      score:   typeof r.score === "number" ? r.score : undefined,
    }));

    // Sort by relevance score descending
    results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const response: SearchResponse = {
      results,
      query,
      cleanedQuery,
      answer: typeof data.answer === "string" && data.answer.length > 0
        ? data.answer
        : undefined,
    };

    return NextResponse.json(response);

  } catch (err: unknown) {
    clearTimeout(timer);
    const e = err as Error;

    if (e.name === "AbortError") {
      console.error("[/api/search] Tavily timeout");
      return NextResponse.json({
        results: [],
        query,
        cleanedQuery,
        error: "Search timed out",
      });
    }

    console.error("[/api/search] Unexpected error:", e.message);
    return NextResponse.json({
      results: [],
      query,
      cleanedQuery,
      error: e.message,
    });
  }
}
