import type { Metadata } from "next";
import "./globals.css";
// KaTeX CSS — untuk render formula matematika ($O(n \log n)$ dll)
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Zebra AI",
  description: "Zebra AI — powered by NVIDIA NIM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-[100dvh]">{children}</body>
    </html>
  );
}
