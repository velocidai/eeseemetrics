import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { auth } from "../src/lib/auth.js";
import { db } from "../src/db/postgres/postgres.js";
import { user } from "../src/db/postgres/schema.js";

async function main() {
  const users = await db.select({ id: user.id, email: user.email }).from(user).limit(1);
  console.log("Using user:", users[0].email);

  const result = await auth.api.createApiKey({
    body: {
      name: "test-mcp-token",
      userId: users[0].id,
      metadata: { type: "mcp", siteId: 1 },
    },
  });

  console.log("\nMCP Token:", result.key);
}

main().catch((err) => { console.error(err); process.exit(1); });
