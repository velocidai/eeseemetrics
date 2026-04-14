const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// ── Types ──────────────────────────────────────────────────────────────────

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: ToolCall[];
    };
    finish_reason: string;
  }>;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, { type: string; description?: string; enum?: string[] }>;
      required: string[];
    };
  };
}

/** Message shape accepted by both tool-calling and streaming calls. */
export type ChatMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "assistant"; content: null; tool_calls: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

type ToolCallResult =
  | { type: "answer"; content: string }
  | { type: "tool_calls"; toolCalls: ToolCall[] };

// ── Shared header builder ──────────────────────────────────────────────────

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.APP_URL ?? "https://eeseemetrics.com",
    "X-Title": process.env.APP_NAME ?? "Eesee Metrics",
  };
}

// ── Original simple call (unchanged behaviour) ────────────────────────────

export async function callOpenRouter(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = options?.model ?? process.env.OPENROUTER_MODEL ?? "moonshotai/kimi-k2.5";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as OpenRouterResponse;

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from OpenRouter");
  }

  return data.choices[0].message.content ?? "";
}

// ── Tool-calling call (non-streaming) ─────────────────────────────────────

/**
 * Sends messages + tool definitions to the LLM. Returns either tool calls
 * (LLM wants to call a function) or a plain answer (LLM is done).
 */
export async function callOpenRouterWithTools(
  messages: ChatMessage[],
  tools: ToolDefinition[],
  options?: { model?: string }
): Promise<ToolCallResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = options?.model ?? process.env.OPENROUTER_MODEL ?? "moonshotai/kimi-k2.5";

  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const choice = data.choices?.[0];
  if (!choice) throw new Error("No response from OpenRouter");

  if (choice.finish_reason === "tool_calls" && choice.message.tool_calls?.length) {
    return { type: "tool_calls", toolCalls: choice.message.tool_calls };
  }

  return { type: "answer", content: choice.message.content ?? "" };
}

// ── Streaming call ────────────────────────────────────────────────────────

/**
 * Streams a final answer from the LLM (no tool calling). Calls onChunk for
 * each text token as it arrives.
 */
export async function streamOpenRouterAnswer(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options?: { model?: string }
): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = options?.model ?? process.env.OPENROUTER_MODEL ?? "moonshotai/kimi-k2.5";

  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data) as {
            choices: Array<{ delta: { content?: string | null } }>;
          };
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {
          // Ignore malformed SSE lines (comments, heartbeats, etc.)
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}
