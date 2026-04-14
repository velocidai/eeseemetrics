import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { resolveMcpToken, checkRateLimit } from "./auth.js";
import { registerTools } from "./tools/index.js";
import { createServiceLogger } from "../../lib/logger/logger.js";

const logger = createServiceLogger("mcp");

/**
 * Registers the MCP endpoint at POST /api/mcp.
 *
 * Protocol: MCP Streamable HTTP transport (spec 2024-11-05).
 * Each request is stateless — a new McpServer + transport is created per request.
 *
 * Auth: Authorization: Bearer <mcp-token>
 *   Token must be created via the MCP token UI (apikey table, metadata.type = "mcp").
 *   Token is scoped to a single site.
 */
export async function mcpRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/mcp",
    { config: { rawBody: true } },
    async (req: FastifyRequest, reply: FastifyReply) => {
      // -- Auth --
      const authHeader = req.headers["authorization"];
      const token =
        typeof authHeader === "string" && authHeader.startsWith("Bearer ")
          ? authHeader.slice(7)
          : null;

      if (!token) {
        return reply.status(401).send({ error: "Missing Authorization: Bearer <token>" });
      }

      const ctx = await resolveMcpToken(token);
      if (!ctx) {
        return reply.status(401).send({ error: "Invalid or revoked MCP token" });
      }

      // -- Rate limit --
      if (!checkRateLimit(ctx.userId, ctx.tier)) {
        return reply.status(429).send({ error: "Rate limit exceeded. Please slow down." });
      }

      // -- MCP handling --
      const server = new McpServer({
        name: "analytics",
        version: "1.0.0",
      });

      registerTools(server, ctx);

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // stateless — no session persistence
      });

      try {
        await server.connect(transport);
        await transport.handleRequest(req.raw, reply.raw, req.body);
      } catch (err) {
        logger.error({ err, siteId: ctx.siteId }, "MCP request error");
        if (!reply.sent) {
          reply.status(500).send({ error: "Internal server error" });
        }
      }
    }
  );

  // GET /api/mcp — returns connection instructions (not an MCP endpoint, just helpful)
  fastify.get("/mcp", async (_req, reply) => {
    reply.send({
      name: "Analytics MCP Server",
      protocol: "MCP Streamable HTTP",
      endpoint: "POST /api/mcp",
      auth: "Authorization: Bearer <your-mcp-token>",
      docs: "Generate a token in Account Settings → API & MCP Tokens.",
    });
  });
}
