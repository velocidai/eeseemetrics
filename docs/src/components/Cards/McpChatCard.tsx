"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { MessageSquare } from "lucide-react";

interface Bubble {
  role: "user" | "assistant";
  text: string;
}

const EXCHANGE_1: Bubble[] = [
  { role: "user", text: "What were my top pages last week?" },
  {
    role: "assistant",
    text: "Your top 3 pages last week:\n1. /pricing — 342 sessions\n2. /blog/seo-guide — 289 sessions\n3. / — 201 sessions\n\nTraffic to /pricing was up 28% vs the week before.",
  },
];

const EXCHANGE_2: Bubble[] = [
  { role: "user", text: "Why did sessions drop on Tuesday?" },
  {
    role: "assistant",
    text: "Sessions dropped 38% on Tuesday (March 18). Bounce rate on /pricing spiked to 71% — up from 45%. No referrer changes detected, so this looks like an on-page issue.",
  },
];

function ChatBubble({ bubble, visible }: { bubble: Bubble; visible: boolean }) {
  const isUser = bubble.role === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 400ms ease-out, transform 400ms ease-out",
      }}
    >
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-[#2FC7B8]/20 text-[#2FC7B8] border border-[#2FC7B8]/25"
            : "bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-200 border border-neutral-300/50 dark:border-neutral-700/50"
        }`}
      >
        {bubble.text}
      </div>
    </div>
  );
}

export function McpChatCard({ bare }: { bare?: boolean } = {}) {
  const [shown, setShown] = useState<boolean[]>([false, false, false, false]);

  useEffect(() => {
    const t0 = setTimeout(() => setShown((s) => [true, s[1], s[2], s[3]]), 100);
    const t1 = setTimeout(() => setShown((s) => [s[0], true, s[2], s[3]]), 600);
    const t2 = setTimeout(() => setShown((s) => [s[0], s[1], true, s[3]]), 3000);
    const t3 = setTimeout(() => setShown((s) => [s[0], s[1], s[2], true]), 3500);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <Card
      bare={bare}
      title="Ask anything, get real answers"
      description="Connect your favourite AI to your analytics via MCP and ask questions in plain English — no dashboards needed."
      icon={MessageSquare}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-100/80 dark:bg-neutral-900/60">
          <div className="h-5 px-1.5 rounded bg-[#2FC7B8]/15 border border-[#2FC7B8]/35 flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] font-bold text-[#2FC7B8] leading-none tracking-tight">MCP</span>
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            MCP — connected to analytics
          </span>
          <div className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2FC7B8]"></span>
            <span className="text-[10px] text-[#2FC7B8]">live</span>
          </div>
        </div>

        {/* Chat bubbles */}
        <div className="p-3 flex flex-col gap-2.5">
          <ChatBubble bubble={EXCHANGE_1[0]} visible={shown[0]} />
          <ChatBubble bubble={EXCHANGE_1[1]} visible={shown[1]} />
          <ChatBubble bubble={EXCHANGE_2[0]} visible={shown[2]} />
          <ChatBubble bubble={EXCHANGE_2[1]} visible={shown[3]} />
        </div>

        {/* Footer */}
        <div className="px-3 pb-2.5 text-[10px] text-neutral-400 dark:text-neutral-500 text-center">
          Works with Claude, ChatGPT, Cursor, Windsurf + any MCP client
        </div>
      </div>
    </Card>
  );
}
