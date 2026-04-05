// ============================================================
// lib/fileReader.ts — Extract text content from uploaded files
//
// Fitur baru: dokumen yang di-upload sekarang dibaca isinya
// dan dikirim ke AI sebagai teks, bukan cuma nama filenya.
// Support: .txt, .md, .csv, .json, .js, .ts, .html, .css, .xml
// PDF: extract teks dari raw bytes menggunakan pdfjs-dist (browser)
// ============================================================

export async function extractTextFromFile(file: File): Promise<string | null> {
  const { type, name } = file;

  // Plain text types — langsung baca
  const textTypes = [
    "text/plain", "text/markdown", "text/csv",
    "application/json", "text/javascript", "text/typescript",
    "text/html", "text/css", "application/xml", "text/xml",
  ];

  if (textTypes.includes(type) || isTextByExtension(name)) {
    try {
      const text = await file.text();
      // Limit ke 8000 chars agar tidak overflow context
      return text.slice(0, 8000) + (text.length > 8000 ? "\n\n[... truncated at 8000 chars ...]" : "");
    } catch {
      return null;
    }
  }

  // PDF — extract via simple byte reading
  // (Full PDF.js terlalu besar untuk bundle, gunakan raw text extraction)
  if (type === "application/pdf") {
    try {
      return await extractPdfText(file);
    } catch {
      return null;
    }
  }

  // Word docs — tidak bisa extract di browser tanpa library berat
  // Return null → AI akan dapat info filename saja
  return null;
}

function isTextByExtension(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ["txt", "md", "markdown", "csv", "json", "js", "ts", "jsx",
          "tsx", "html", "htm", "css", "xml", "yaml", "yml", "toml",
          "ini", "env", "sh", "py", "rb", "go", "rs", "java", "kt",
          "swift", "c", "cpp", "h", "php", "sql", "graphql"].includes(ext);
}

async function extractPdfText(file: File): Promise<string> {
  // Simple PDF text extraction — scan for readable strings
  // Ini approach sederhana tanpa library: baca raw bytes & extract visible text
  const buffer = await file.arrayBuffer();
  const bytes  = new Uint8Array(buffer);
  const raw    = new TextDecoder("latin1").decode(bytes);

  // Extract text between parentheses (PDF string objects)
  const matches: string[] = [];
  const regex = /\(([^)]{3,200})\)/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const text = match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\t/g, " ")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\");

    // Filter: hanya ambil string yang tampak seperti teks (bukan binary data)
    if (/^[\x20-\x7E\n\t ]{3,}$/.test(text) && !/^\d+(\.\d+)? \d+(\.\d+)?/.test(text)) {
      matches.push(text);
    }
  }

  if (matches.length === 0) {
    return "[PDF: could not extract text — may be scanned/image-based]";
  }

  const extracted = matches
    .join(" ")
    .replace(/\s{3,}/g, "\n")
    .slice(0, 8000);

  return `[PDF Content]\n${extracted}${extracted.length >= 8000 ? "\n[... truncated ...]" : ""}`;
}
