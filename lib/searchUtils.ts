// ============================================================
// lib/searchUtils.ts — Search helper functions
// Dipisah dari route.ts agar bisa diimport di client side
// ============================================================

import { SearchResult } from "./types";

// Format hasil search menjadi context string untuk AI
// Digunakan di buildMessages.ts
export function formatSearchContext(results: SearchResult[], answer?: string): string {
  if (results.length === 0) return "";

  const lines: string[] = ["[WEB SEARCH RESULTS]"];

  if (answer && answer.trim()) {
    lines.push(`Quick Answer: ${answer.trim()}`);
    lines.push("");
  }

  results.forEach((r, i) => {
    lines.push(`[${i + 1}] ${r.title}`);
    lines.push(`Source: ${r.url}`);
    lines.push(r.snippet);
    lines.push("");
  });

  lines.push("[END OF SEARCH RESULTS]");
  lines.push(
    "Based on the search results above, answer the user's question accurately. " +
    "Cite sources by number like [1], [2] where relevant. " +
    "If the search results don't fully answer the question, say so."
  );

  return lines.join("\n");
}
