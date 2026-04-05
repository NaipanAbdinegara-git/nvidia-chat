// ============================================================
// lib/buildMessages.ts — Build API messages with full file content
// ============================================================

import { Message, Attachment, SearchResult, NvidiaModel } from "./types";
import { formatSearchContext } from "./searchUtils";

const MAX_HISTORY_MESSAGES = 20;

interface BuildOptions {
  history:       Message[];
  userContent:   string;
  attachments:   Attachment[];
  systemPrompt:  string;
  searchResults: SearchResult[];
  searchAnswer?: string;
  model:         NvidiaModel;
}

export function buildApiMessages(opts: BuildOptions): { role: string; content: unknown }[] {
  const { history, userContent, attachments, systemPrompt, searchResults, searchAnswer, model } = opts;
  const msgs: { role: string; content: unknown }[] = [];

  // 1. System prompt
  if (systemPrompt.trim()) {
    msgs.push({ role: "system", content: systemPrompt.trim() });
  }

  // 2. History (trimmed, text only)
  const recentHistory = history
    .filter(m => m.role !== "system")
    .slice(-MAX_HISTORY_MESSAGES)
    .map(m => ({ role: m.role, content: m.content || "" }));

  msgs.push(...recentHistory);

  // 3. User message
  const hasAttachments = attachments.length > 0;
  const hasSearch      = searchResults.length > 0;
  const hasVision      = model.supportsVision ?? false;

  if (hasVision && hasAttachments && attachments.some(a => a.type === "image")) {
    // Vision model: content array
    const contentParts: unknown[] = [];

    if (hasSearch) {
      const searchCtx = formatSearchContext(searchResults, searchAnswer);
      contentParts.push({ type: "text", text: searchCtx + "\n\nUser question: " + (userContent || "Please analyze the attached content.") });
    } else if (userContent) {
      contentParts.push({ type: "text", text: buildUserTextWithDocs(userContent, attachments) });
    }

    for (const att of attachments) {
      if (att.type === "image" && att.dataUrl) {
        contentParts.push({ type: "image_url", image_url: { url: att.dataUrl } });
      }
      // Document attachments: inject text content if available
      if (att.type === "document") {
        const docText = buildDocumentContext(att);
        contentParts.push({ type: "text", text: docText });
      }
    }

    if (contentParts.length === 0) {
      contentParts.push({ type: "text", text: "Please analyze the attached content." });
    }

    msgs.push({ role: "user", content: contentParts });

  } else {
    // Text-only model
    let textContent = "";

    if (hasSearch) {
      textContent = formatSearchContext(searchResults, searchAnswer) + "\n\nUser question: " + (userContent || "");
    } else {
      textContent = buildUserTextWithDocs(userContent, attachments);
    }

    msgs.push({ role: "user", content: textContent.trim() });
  }

  return msgs;
}

// Build user text message with document contents injected
function buildUserTextWithDocs(userContent: string, attachments: Attachment[]): string {
  if (attachments.length === 0) return userContent;

  const parts: string[] = [];

  for (const att of attachments) {
    parts.push(buildDocumentContext(att));
  }

  if (userContent) {
    parts.push(`\nUser message: ${userContent}`);
  } else if (parts.length > 0) {
    parts.push("\nPlease analyze the above file(s).");
  }

  return parts.join("\n\n");
}

function buildDocumentContext(att: Attachment): string {
  const sizeKB = (att.size / 1024).toFixed(0);

  if (att.textContent) {
    // File content was successfully extracted
    return `--- File: ${att.name} (${sizeKB}KB) ---\n${att.textContent}\n--- End of ${att.name} ---`;
  }

  // No text content (binary file or extraction failed)
  return `[Attached file: ${att.name} (${att.type}, ${sizeKB}KB) — binary content, cannot display inline]`;
}
