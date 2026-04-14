"use client";

import { Bot } from "lucide-react";
import { McpTokenManager } from "@/app/settings/account/components/McpTokenManager";
import { useSetPageTitle } from "@/hooks/useSetPageTitle";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { InsightsGate } from "@/components/InsightsGate";

export default function ChatPage() {
  useSetPageTitle("Ask AI");

  return (
    <InsightsGate>
      <div className="p-2 md:p-4 max-w-[900px] mx-auto space-y-6">
        <SubHeader />

        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-500/10 p-2">
            <Bot className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Ask AI
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Connect Claude, Cursor, or ChatGPT to your analytics via MCP.
            </p>
          </div>
        </div>

        {/* How it works — 3 steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-accent-500">01</span>
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                Create an MCP token
              </p>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Generate a token scoped to your site below.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-accent-500">02</span>
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                Paste the config
              </p>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Copy the generated config snippet into Claude Desktop, Cursor, or ChatGPT.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-accent-500">03</span>
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                Ask anything
              </p>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Your AI assistant can now query your analytics data in real time.
            </p>
          </div>
        </div>

        {/* Example prompts */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
          <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Example questions to ask your AI:
          </p>
          <ul className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <li>"What were my top pages last week?"</li>
            <li>"Did traffic spike or drop recently?"</li>
            <li>"Which countries send the most sessions?"</li>
            <li>"How is my bounce rate trending this month?"</li>
            <li>"Show me sessions from Germany on mobile"</li>
            <li>"What custom events fired most yesterday?"</li>
          </ul>
        </div>

        {/* MCP Token Manager */}
        <McpTokenManager />
      </div>
    </InsightsGate>
  );
}
