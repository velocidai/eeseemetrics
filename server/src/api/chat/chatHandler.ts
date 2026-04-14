import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { sites } from "../../db/postgres/schema.js";
import {
  callOpenRouterWithTools,
  streamOpenRouterAnswer,
  type ChatMessage,
  type ToolCall,
} from "../../lib/openrouter.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";
import type { McpTokenContext } from "../mcp/auth.js";
import { getChatTools } from "./toolCollector.js";

interface UserChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBody {
  messages?: UserChatMessage[];
  question: string;
}

export async function chatHandler(
  req: FastifyRequest<{ Params: { siteId: string }; Body: ChatBody }>,
  reply: FastifyReply
) {
  // authSite middleware populates req.user for session-based auth
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) {
    return reply.status(401).send({ error: "Session required" });
  }

  const siteId = Number(req.params.siteId);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid siteId" });

  // Scale-only feature
  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "scale")) {
    return reply.status(403).send({ error: "Chat requires Scale plan" });
  }

  // Resolve site domain for context
  const siteRows = await db
    .select({ domain: sites.domain })
    .from(sites)
    .where(eq(sites.siteId, siteId))
    .limit(1);
  if (!siteRows[0]) return reply.status(404).send({ error: "Site not found" });

  const ctx: McpTokenContext = {
    userId,
    siteId,
    siteDomain: siteRows[0].domain,
    tier,
  };

  const tools = getChatTools(ctx);
  const toolDefs = tools.map((t) => t.definition);
  const handlerMap = new Map(tools.map((t) => [t.definition.function.name, t.handler]));

  const today = new Date().toISOString().slice(0, 10);
  const systemPrompt = `You are an analytics assistant for ${ctx.siteDomain}. Today is ${today}.
Answer questions concisely using the available tools. Cite specific numbers from tool results.
You only have access to this site's analytics data. Do not discuss other sites or make up data.`;

  // Build message history: last 10 user/assistant turns for multi-turn context
  const history: ChatMessage[] = (req.body.messages ?? [])
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  const baseMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: req.body.question },
  ];

  // ── Set up SSE response ───────────────────────────────────────────────
  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.raw.flushHeaders();

  const sendEvent = (data: object) => {
    reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // ── Tool-calling loop (non-streaming, max 4 rounds) ───────────────
    let currentMessages: ChatMessage[] = [...baseMessages];
    let gotDirectAnswer = false;
    let directAnswer = "";

    for (let round = 0; round < 4; round++) {
      const result = await callOpenRouterWithTools(currentMessages, toolDefs);

      if (result.type === "answer") {
        gotDirectAnswer = true;
        directAnswer = result.content;
        break;
      }

      // Append the assistant's tool-call message
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: null,
        tool_calls: result.toolCalls,
      };
      currentMessages = [...currentMessages, assistantMsg];

      // Execute each tool call and append results
      for (const call of result.toolCalls) {
        const handler = handlerMap.get(call.function.name);
        let toolContent: string;

        if (!handler) {
          toolContent = `Unknown tool: ${call.function.name}`;
        } else {
          let args: Record<string, unknown> = {};
          let parseError = false;
          try {
            args = JSON.parse(call.function.arguments);
          } catch {
            parseError = true;
          }
          if (parseError) {
            toolContent = `Error: failed to parse tool arguments for ${call.function.name}`;
          } else {
            const toolResult = await handler(args);
            toolContent = toolResult.content.map((c) => c.text).join("\n");
          }
        }

        const toolMsg: ChatMessage = {
          role: "tool",
          tool_call_id: call.id,
          content: toolContent,
        };
        currentMessages = [...currentMessages, toolMsg];
      }
    }

    // ── Stream the final answer ───────────────────────────────────────
    if (gotDirectAnswer) {
      // No tool calls were needed — send the pre-fetched answer as one chunk
      sendEvent({ type: "chunk", text: directAnswer });
    } else {
      // Tool results are in currentMessages — stream a fresh answer with full context
      await streamOpenRouterAnswer(currentMessages, (chunk) => {
        sendEvent({ type: "chunk", text: chunk });
      });
    }

    sendEvent({ type: "done" });
  } catch (err) {
    sendEvent({ type: "error", message: "Failed to process request" });
  } finally {
    reply.raw.end();
  }
}
