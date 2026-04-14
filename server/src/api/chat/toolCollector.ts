import { z } from "zod";
import type { McpTokenContext } from "../mcp/auth.js";
import { registerTools } from "../mcp/tools/index.js";
import type { ToolDefinition } from "../../lib/openrouter.js";

type ToolHandler = (
  args: Record<string, unknown>
) => Promise<{ content: Array<{ type: string; text: string }> }>;

export interface CollectedTool {
  definition: ToolDefinition;
  handler: ToolHandler;
}

/**
 * Converts a Zod shape object (as used in MCP tool schemas) to a JSON Schema
 * parameters object suitable for the OpenRouter tools API.
 *
 * Handles z.string(), z.number(), z.enum([...]) with .optional() and .describe().
 */
function zodShapeToParameters(
  shape: Record<string, z.ZodTypeAny>
): ToolDefinition["function"]["parameters"] {
  const properties: Record<string, { type: string; description?: string; enum?: string[] }> = {};
  const required: string[] = [];

  for (const [key, schema] of Object.entries(shape)) {
    let inner = schema;
    let isOptional = false;

    // Collect description from the outer schema before unwrapping
    const outerDesc = schema.description;

    // Unwrap ZodOptional
    if (inner._def.typeName === "ZodOptional") {
      isOptional = true;
      inner = (inner as z.ZodOptional<z.ZodTypeAny>).unwrap();
    }

    const prop: { type: string; description?: string; enum?: string[] } = { type: "string" };

    const desc = outerDesc ?? inner.description;
    if (desc) prop.description = desc;

    if (inner._def.typeName === "ZodString") {
      prop.type = "string";
    } else if (inner._def.typeName === "ZodNumber") {
      prop.type = "number";
    } else if (inner._def.typeName === "ZodEnum") {
      prop.type = "string";
      prop.enum = ((inner._def as { values: unknown[] }).values).filter(
        (v): v is string => typeof v === "string"
      );
    }
    // Other types fall back to "string"

    properties[key] = prop;
    if (!isOptional) required.push(key);
  }

  return { type: "object", properties, required };
}

class ToolCollector {
  private readonly _tools: CollectedTool[] = [];

  /** Same signature as McpServer.tool() — called by registerXTool functions. */
  tool(
    name: string,
    description: string,
    shape: Record<string, z.ZodTypeAny>,
    handler: ToolHandler
  ): void {
    this._tools.push({
      definition: {
        type: "function",
        function: {
          name,
          description,
          parameters: zodShapeToParameters(shape),
        },
      },
      handler,
    });
  }

  getTools(): CollectedTool[] {
    return this._tools;
  }
}

/**
 * Returns all MCP tools the user's tier is entitled to, with both their
 * OpenRouter ToolDefinition and the async handler that executes them.
 */
export function getChatTools(ctx: McpTokenContext): CollectedTool[] {
  const collector = new ToolCollector();
  // registerTools expects McpServer; ToolCollector implements the same .tool() interface.
  registerTools(collector as any, ctx);
  return collector.getTools();
}
