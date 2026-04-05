"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, User, FileText, Globe, ExternalLink, RotateCcw, Image as ImageIcon } from "lucide-react";
import { useState, memo, useCallback } from "react";
import { Message } from "@/lib/types";
import { ZebraAvatarIcon } from "./ZebraLogo";

interface Props {
  message:     Message;
  isStreaming?: boolean;
  onRetry?:    () => void;
}

export const MessageBubble = memo(function MessageBubble({ message, isStreaming, onRetry }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser  = message.role === "user";
  const isEmpty = message.content === "" && isStreaming;

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  return (
    <div className={`flex gap-2 sm:gap-3 w-full overflow-hidden animate-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {isUser
        ? <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5 border border-black/10">
            <User size={13} className="text-white" />
          </div>
        : <div className="shrink-0 mt-0.5"><ZebraAvatarIcon size={28} /></div>
      }

      <div className={`flex-1 min-w-0 ${isUser ? "flex flex-col items-end" : ""}`}>

        {/* Web search citations */}
        {!isUser && message.searchResults && message.searchResults.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 max-w-full">
            {message.searchResults.slice(0, 4).map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-600 hover:bg-blue-100 transition-colors max-w-[160px]"
              >
                <Globe size={9} className="shrink-0" />
                <span className="truncate">{r.title}</span>
                <ExternalLink size={8} className="shrink-0 opacity-60" />
              </a>
            ))}
          </div>
        )}

        {/* User attachments */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 justify-end max-w-[90%]">
            {message.attachments.map(att => (
              <div key={att.id}>
                {att.type === "image" && att.dataUrl ? (
                  <img
                    src={att.dataUrl}
                    alt={att.name}
                    className="max-w-[180px] max-h-[140px] rounded-xl object-cover border border-[var(--border)] shadow-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl px-3 py-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${att.textContent ? "bg-green-500" : "bg-[var(--accent)]"}`}>
                      <FileText size={13} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate max-w-[100px] text-[var(--text-primary)]">{att.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {att.textContent ? "✓ read" : `${(att.size / 1024).toFixed(0)}KB`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bubble */}
        {(message.content || isEmpty) && (
          <div className={`group relative rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
            isUser
              ? "bg-[var(--accent)] text-white max-w-[90%] sm:max-w-[82%] rounded-tr-sm"
              : message.isError
              ? "bg-red-50 border border-red-200 rounded-tl-sm w-full"
              : "bg-white border border-[var(--border)] shadow-xs rounded-tl-sm w-full"
          }`}>
            {isEmpty ? (
              <TypingDots />
            ) : isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div className={`prose-chat ${isStreaming ? "typing-cursor" : ""}`}>
                <MemoizedMarkdown content={message.content} />
              </div>
            )}

            {/* Copy button for assistant */}
            {!isUser && !isStreaming && !isEmpty && message.content && (
              <button
                onClick={copy}
                className="absolute -bottom-2.5 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-[var(--border)] shadow-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[11px] transition-all z-10"
              >
                {copied
                  ? <><Check size={10} className="text-green-500" />Copied</>
                  : <><Copy size={10} />Copy</>
                }
              </button>
            )}
          </div>
        )}

        {/* Timestamp + retry */}
        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <p className="text-[11px] text-[var(--text-muted)]">
            {new Date(message.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            {!isUser && message.searchResults?.length ? <span className="ml-1 opacity-60">· web</span> : null}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Retry this message"
            >
              <RotateCcw size={10} />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ── Typing animation ──────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 h-5 px-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ── Code block with copy button ───────────────────────────
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-white/10 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e2e] border-b border-white/10">
        <span className="text-xs text-zinc-400 font-mono select-none">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white text-xs transition-all active:scale-95"
        >
          {copied
            ? <><Check size={11} className="text-green-400" /><span className="text-green-400">Copied!</span></>
            : <><Copy size={11} /><span>Copy</span></>
          }
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8rem", padding: "1rem", background: "#1a1b26" }}
        wrapLongLines={false}
        PreTag="div"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Memoized Markdown (only re-renders if content changes) ─
const MemoizedMarkdown = memo(function MemoizedMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ className, children, ...props }) {
          const match  = /language-(\w+)/.exec(className || "");
          const value  = String(children).replace(/\n$/, "");
          const isBlock = value.includes("\n") || !!match;

          if (isBlock) {
            return <CodeBlock language={match?.[1] ?? ""} value={value} />;
          }
          return (
            <code
              className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-[#d63384] text-[0.82em] font-mono border border-zinc-200"
              {...props}
            >
              {children}
            </code>
          );
        },
        // Better table styling
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-[var(--border)] rounded-xl overflow-hidden text-sm">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return <th className="px-3 py-2 bg-[var(--bg-hover)] border-b border-[var(--border)] text-left text-xs font-semibold text-[var(--text-primary)]">{children}</th>;
        },
        td({ children }) {
          return <td className="px-3 py-2 border-b border-[var(--border)] text-xs text-[var(--text-secondary)]">{children}</td>;
        },
        // Better blockquote
        blockquote({ children }) {
          return <blockquote className="border-l-4 border-[var(--accent)] pl-4 my-3 text-[var(--text-secondary)] italic">{children}</blockquote>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
});
