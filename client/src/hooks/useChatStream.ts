"use client";

import { useCallback, useRef, useState } from "react";
import { BACKEND_URL } from "@/lib/const";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UseChatStreamReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (question: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChatStream(siteId: number): UseChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Refs allow sendMessage to read current values without stale closures.
  const isStreamingRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  isStreamingRef.current = isStreaming;
  messagesRef.current = messages;

  const sendMessage = useCallback(
    async (question: string) => {
      if (isStreamingRef.current) return;

      // Snapshot history before adding new messages (for the request body)
      const historyForRequest = messagesRef.current.slice(-20);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: "" },
      ]);
      setIsStreaming(true);

      let assembledText = "";

      try {
        const response = await fetch(`${BACKEND_URL}/sites/${siteId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            messages: historyForRequest,
            question,
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: "Request failed" }));
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: (err as any).error ?? "An error occurred.",
            };
            return updated;
          });
          return;
        }

        if (!response.body) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "No response received.",
            };
            return updated;
          });
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamDone = false;

        try {
          while (!streamDone) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (!raw) continue;

              try {
                const event = JSON.parse(raw) as
                  | { type: "chunk"; text: string }
                  | { type: "done" }
                  | { type: "error"; message: string };

                if (event.type === "chunk") {
                  assembledText += event.text;
                  const snapshot = assembledText;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: snapshot,
                    };
                    return updated;
                  });
                } else if (event.type === "done") {
                  streamDone = true;
                  break;
                } else if (event.type === "error") {
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: event.message,
                    };
                    return updated;
                  });
                  streamDone = true;
                  break;
                }
              } catch {
                // Ignore malformed SSE lines
              }
            }
          }
        } finally {
          reader.cancel().catch(() => {});
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Network error. Please try again.",
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [siteId]
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isStreaming, sendMessage, clearMessages };
}
