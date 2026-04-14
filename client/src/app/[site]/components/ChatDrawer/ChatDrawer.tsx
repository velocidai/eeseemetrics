"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { PielIcon, PielLoadingIcon } from "@/components/EeseeLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useChatStream } from "@/hooks/useChatStream";

const STARTER_QUESTIONS = [
  "What was my best day last week?",
  "Which pages have the highest bounce rate?",
  "Which campaigns are converting best?",
  "How does this week compare to last week?",
];

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isScale: boolean;
}

export function ChatDrawer({ open, onOpenChange, isScale }: ChatDrawerProps) {
  const { site } = useStore();
  const { messages, isStreaming, sendMessage } = useChatStream(site ? Number(site) : 0);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || isStreaming) return;
    setInput("");
    void sendMessage(q);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[420px] sm:w-[480px] flex flex-col p-0"
      >
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <PielIcon size={20} />
            Ask AI
          </SheetTitle>
        </SheetHeader>

        {!isScale ? (
          // Upgrade prompt for non-Scale users
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <PielIcon size={40} />
            <p className="font-medium">Chat is a Scale feature</p>
            <p className="text-sm text-muted-foreground">
              Upgrade to Scale to ask natural-language questions about your
              analytics data and get instant answers.
            </p>
          </div>
        ) : (
          <>
            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <PielIcon size={16} />
                    <p className="text-xs text-muted-foreground">Hi! Try asking:</p>
                  </div>
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => void sendMessage(q)}
                      className="w-full text-left text-sm px-3 py-2 rounded-md border border-border hover:bg-accent transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={
                      msg.role === "user" ? "flex justify-end" : "flex justify-start items-start gap-2"
                    }
                  >
                    {msg.role === "assistant" && (
                      <div className="shrink-0 mt-1">
                        {!msg.content && isStreaming ? (
                          <PielLoadingIcon size={18} />
                        ) : (
                          <PielIcon size={18} />
                        )}
                      </div>
                    )}
                    <div
                      className={
                        msg.role === "user"
                          ? "max-w-[80%] rounded-2xl rounded-tr-sm px-3 py-2 text-sm bg-primary text-primary-foreground"
                          : "max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-2 text-sm bg-muted"
                      }
                    >
                      {msg.content || <PielLoadingIcon size={14} />}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="px-4 py-3 border-t shrink-0 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question about your analytics…"
                disabled={isStreaming}
                className="flex-1 h-9 text-sm"
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
              >
                {isStreaming ? <PielLoadingIcon size={16} /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
