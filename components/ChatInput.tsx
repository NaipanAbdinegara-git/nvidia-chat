"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Send, Square, Globe, Paperclip, X, FileText, AlertCircle, Image } from "lucide-react";
import { Attachment } from "@/lib/types";
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES, ACCEPTED_DOC_TYPES } from "@/lib/constants";
import { extractTextFromFile } from "@/lib/fileReader";
import { v4 as uuidv4 } from "uuid";


function GlobeOffIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <Globe size={size} />
      <span className="absolute left-0 right-0 top-1/2 h-px bg-current rotate-45 origin-center" />
    </span>
  );
}

interface ChatInputProps {
  onSend:            (content: string, attachments: Attachment[]) => void;
  onStop:            () => void;
  isStreaming:       boolean;
  webSearchEnabled:  boolean;
  onToggleWebSearch: () => void;
}

export function ChatInput({ onSend, onStop, isStreaming, webSearchEnabled, onToggleWebSearch }: ChatInputProps) {
  const [value, setValue]             = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileError, setFileError]     = useState<string | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [processing, setProcessing]   = useState(false);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  }, [value]);

  // Focus on mount
  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus();
  }, [isStreaming]);

  const processFile = useCallback(async (file: File): Promise<Attachment | null> => {
    setFileError(null);
    const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
    const isDoc   = ACCEPTED_DOC_TYPES.includes(file.type) ||
                    isTextByExtension(file.name); // fallback for extensionless text files

    if (!isImage && !isDoc) {
      setFileError(`Unsupported: ${file.name.split(".").pop()?.toUpperCase() ?? file.type}`);
      return null;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`);
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const base64  = dataUrl.split(",")[1];

        // Extract text content for documents (new feature!)
        let textContent: string | undefined;
        if (!isImage) {
          textContent = (await extractTextFromFile(file)) ?? undefined;
        }

        resolve({
          id: uuidv4(),
          name: file.name,
          type: isImage ? "image" : "document",
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          dataUrl,
          base64,
          textContent,
        });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (attachments.length + arr.length > 5) {
      setFileError("Max 5 files per message.");
      return;
    }
    setProcessing(true);
    try {
      const results = await Promise.all(arr.map(processFile));
      const valid   = results.filter(Boolean) as Attachment[];
      setAttachments(prev => [...prev, ...valid]);
    } finally {
      setProcessing(false);
    }
  }, [attachments.length, processFile]);

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => {
    // Only trigger if leaving the container, not child elements
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const imageItems = Array.from(e.clipboardData.items).filter(i => i.type.startsWith("image/"));
    if (imageItems.length === 0) return;
    e.preventDefault();
    const files = imageItems.map(i => i.getAsFile()).filter(Boolean) as File[];
    await handleFiles(files);
  }, [handleFiles]);

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
    setFileError(null);
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if ((!trimmed && attachments.length === 0) || isStreaming || processing) return;
    onSend(trimmed, attachments);
    setValue("");
    setAttachments([]);
    setFileError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    // Refocus after send
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !isStreaming && !processing;

  return (
    <div
      className={`relative w-full bg-white border rounded-2xl shadow-sm transition-all ${
        isDragging
          ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20 shadow-md"
          : "border-[var(--border)] focus-within:border-[var(--border-focus)] focus-within:shadow-md"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pt-3">
          {attachments.map(att => (
            <AttachmentChip key={att.id} att={att} onRemove={removeAttachment} />
          ))}
        </div>
      )}

      {/* File error */}
      {fileError && (
        <div className="flex items-center gap-1.5 px-3 pt-2.5 text-xs text-[var(--danger)]">
          <AlertCircle size={12} className="shrink-0" />
          <span>{fileError}</span>
          <button onClick={() => setFileError(null)} className="ml-auto shrink-0"><X size={11} /></button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-1.5 px-2 py-2">
        {/* Attach */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming || processing}
          title="Attach files (images, docs, code) — max 10MB each"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40 mb-0.5"
        >
          <Paperclip size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES].join(",")}
          onChange={e => { if (e.target.files) { handleFiles(e.target.files); e.target.value = ""; } }}
        />

        {/* Web search toggle */}
        <button
          onClick={onToggleWebSearch}
          title={`${webSearchEnabled ? "Disable" : "Enable"} web search (Ctrl+Shift+W)`}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 h-9 rounded-xl text-xs font-medium transition-all mb-0.5 ${
            webSearchEnabled
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          }`}
        >
          {webSearchEnabled
            ? <><Globe size={13} /><span className="hidden sm:inline">Web</span></>
            : <><GlobeOffIcon size={13} /><span className="hidden sm:inline">Web</span></>
          }
        </button>

        <div className="w-px h-5 bg-[var(--border)] self-center shrink-0 hidden sm:block" />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            isDragging        ? "Drop files here…" :
            processing        ? "Reading file…" :
            isStreaming       ? "Responding…" :
            webSearchEnabled  ? "Ask anything — I'll search the web…" :
            attachments.length > 0 ? "Add a message or send as-is…" :
            "Message Zebra AI…"
          }
          disabled={isStreaming}
          rows={1}
          className="flex-1 min-w-0 bg-transparent resize-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] leading-relaxed py-2 disabled:cursor-wait"
          style={{ minHeight: "36px", maxHeight: "180px", fontSize: "16px" }}
        />

        {/* Send / Stop */}
        {isStreaming ? (
          <button
            onClick={onStop}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors mb-0.5 shadow-sm"
            title="Stop generating"
          >
            <Square size={12} fill="white" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all mb-0.5 ${
              canSend
                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm active:scale-95"
                : "bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed"
            }`}
            title="Send (Enter)"
          >
            {processing
              ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <Send size={14} />
            }
          </button>
        )}
      </div>

      {/* Drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/95 pointer-events-none border-2 border-dashed border-[var(--accent)]">
          <Paperclip size={20} className="text-[var(--accent)] mb-1" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Drop to attach</p>
        </div>
      )}
    </div>
  );
}

// ── Attachment chip dengan preview ──────────────────────────
function AttachmentChip({ att, onRemove }: { att: Attachment; onRemove: (id: string) => void }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div
        className="relative group flex items-center gap-1.5 bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl px-2.5 py-1.5 max-w-[180px] cursor-pointer hover:border-[var(--border-focus)] transition-colors"
        onClick={() => att.type === "document" && att.textContent && setShowPreview(true)}
        title={att.type === "document" && att.textContent ? "Click to preview content" : att.name}
      >
        {att.type === "image" ? (
          <img src={att.dataUrl} alt={att.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
        ) : (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${att.textContent ? "bg-green-500" : "bg-[var(--accent)]"}`}>
            <FileText size={14} className="text-white" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate text-[var(--text-primary)]">{att.name}</p>
          <p className="text-[10px] text-[var(--text-muted)]">
            {att.textContent ? `${(att.textContent.length / 1000).toFixed(1)}k chars` : `${(att.size / 1024).toFixed(0)}KB`}
          </p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onRemove(att.id); }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-zinc-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X size={9} />
        </button>
        {/* Green dot indicator = text extracted */}
        {att.textContent && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" title="Text extracted ✓" />
        )}
      </div>

      {/* Document content preview modal */}
      {showPreview && att.textContent && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-[var(--text-muted)]" />
                <span className="text-sm font-medium text-[var(--text-primary)]">{att.name}</span>
                <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-0.5 rounded-full">
                  {(att.size / 1024).toFixed(0)}KB
                </span>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
                <X size={14} />
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto px-4 py-3 text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap leading-relaxed">
              {att.textContent}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}

function isTextByExtension(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ["txt","md","csv","json","js","ts","jsx","tsx","html","css","xml","yaml","yml","toml","ini","py","rb","go","rs","java","php","sql","sh"].includes(ext);
}
