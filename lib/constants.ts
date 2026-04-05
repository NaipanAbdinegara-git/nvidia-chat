import { NvidiaModel } from "./types";

export const NVIDIA_MODELS: NvidiaModel[] = [
  {
    id: "meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    description: "Fast & efficient — best for Vercel Hobby plan",
    supportsVision: false,
    badge: "Fast",
  },
  {
    id: "meta/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    description: "Powerful general-purpose model",
    supportsVision: false,
    badge: "Smart",
  },
  {
    id: "mistralai/mistral-7b-instruct-v0.3",
    name: "Mistral 7B",
    description: "Quick & efficient reasoning",
    supportsVision: false,
    badge: "Fast",
  },
  {
    id: "mistralai/mixtral-8x7b-instruct-v0.1",
    name: "Mixtral 8x7B",
    description: "Strong reasoning, Mixture-of-Experts",
    supportsVision: false,
    badge: "Smart",
  },
  {
    id: "google/gemma-3n-e4b-it",
    name: "Gemma 3n E4B",
    description: "Edge model — text, image & audio",
    supportsVision: true,
    badge: "Vision",
  },
  {
    id: "google/gemma-3-27b-it",
    name: "Gemma 3 27B",
    description: "Multimodal, 128K context",
    supportsVision: true,
    badge: "Vision",
  },
  {
    id: "google/gemma-4-31b-it",
    name: "Gemma 4 31B",
    description: "Latest — 256K context, multimodal",
    supportsVision: true,
    badge: "Latest",
  },
  {
    id: "microsoft/phi-3-medium-128k-instruct",
    name: "Phi-3 Medium 128K",
    description: "Long context documents",
    supportsVision: false,
    badge: null,
  },
  {
    id: "nvidia/nemotron-4-340b-instruct",
    name: "Nemotron 4 340B",
    description: "NVIDIA flagship — needs Pro plan",
    supportsVision: false,
    badge: "Pro",
  },
];

export const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";

// Default: Llama 3.1 8B — fastest, best for Hobby plan
export const DEFAULT_SETTINGS = {
  selectedModel:   NVIDIA_MODELS[0].id, // Llama 3.1 8B
  systemPrompt:    "You are Zebra AI, a helpful and intelligent assistant. Be concise, clear, and accurate.",
  temperature:     0.7,
  maxTokens:       2048,
  fontSize:        "medium" as const,
  autoTitle:       true,
  webSearchEnabled: false,
};

export const LS_KEYS = {
  ACTIVE_SESSION: "zebra_active_session",
  SETTINGS:       "zebra_settings",
};

export const MAX_FILE_SIZE        = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const ACCEPTED_DOC_TYPES   = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/javascript",
  "text/typescript",
  "text/html",
  "text/css",
  "application/xml",
  "text/xml",
];

export const KEYBOARD_SHORTCUTS = [
  { keys: ["Ctrl", "Shift", "O"], description: "New chat" },
  { keys: ["Ctrl", "Shift", "S"], description: "Open settings" },
  { keys: ["Ctrl", "Shift", "E"], description: "Export chat" },
  { keys: ["Ctrl", "Shift", "B"], description: "Toggle sidebar" },
  { keys: ["Ctrl", "Shift", "W"], description: "Toggle web search" },
  { keys: ["Enter"],              description: "Send message" },
  { keys: ["Shift", "Enter"],     description: "New line" },
  { keys: ["Esc"],                description: "Stop / close" },
];
