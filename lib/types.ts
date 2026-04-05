export interface Attachment {
  id:       string;
  name:     string;
  type:     "image" | "document";
  mimeType: string;
  size:     number;
  dataUrl:  string;  // base64 data URL — for preview & API
  base64:   string;  // pure base64
  textContent?: string; // extracted text content for documents
}

export interface Message {
  id:            string;
  role:          "user" | "assistant" | "system";
  content:       string;
  timestamp:     number;
  searchResults?: SearchResult[];
  attachments?:  Attachment[];
  isError?:      boolean; // untuk mark message error
}

export interface SearchResult {
  title:    string;
  url:      string;
  snippet:  string;
  score?:   number;
}

export interface ChatSession {
  id:        string;
  title:     string;
  messages:  Message[];
  model:     string;
  createdAt: number;
  updatedAt: number;
}

export interface NvidiaModel {
  id:              string;
  name:            string;
  description:     string;
  supportsVision?: boolean;
  badge?:          string | null; // "Fast" | "Smart" | "Vision" | "Latest" | "Pro" | null
}

export interface AppSettings {
  selectedModel:    string;
  systemPrompt:     string;
  temperature:      number;
  maxTokens:        number;
  fontSize:         "small" | "medium" | "large";
  autoTitle:        boolean;
  webSearchEnabled: boolean;
}

export interface ChatRequestBody {
  messages:     Pick<Message, "role" | "content">[];
  model:        string;
  temperature?: number;
  maxTokens?:   number;
  stream?:      boolean;
}

export interface AuthUser {
  uid:         string;
  email:       string | null;
  displayName: string | null;
  photoURL:    string | null;
}
