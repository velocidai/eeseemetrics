import { build } from "esbuild";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

// readdirSync with recursive is available in Node 18.17+ / Node 20
const allFiles = readdirSync("src", { recursive: true });
const entryPoints = allFiles
  .filter((f) => {
    const s = f.toString();
    return (
      (s.endsWith(".ts") || s.endsWith(".tsx")) &&
      !s.endsWith(".test.ts") &&
      !s.endsWith(".spec.ts") &&
      !s.includes("analytics-script")
    );
  })
  .map((f) => join("src", f.toString()));

await build({
  entryPoints,
  outdir: "dist",
  bundle: false,
  platform: "node",
  target: "node20",
  format: "esm",
  sourcemap: false,
  jsx: "transform",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  logLevel: "info",
});

console.log("Build complete.");
