// Force dynamic rendering — jangan prerender saat build
// karena Firebase butuh env vars yang hanya ada di runtime
export const dynamic = "force-dynamic";

import { ChatApp } from "@/components/ChatApp";

export default function Home() {
  return <ChatApp />;
}
