import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_ROOT = resolve(dirname(SCRIPT_PATH), "..");

export function buildPages(root = DEFAULT_ROOT, output = resolve(root, "_site")) {
  rmSync(output, { recursive: true, force: true });
  mkdirSync(resolve(output, "src"), { recursive: true });

  copy(root, output, "web/styles.css", "styles.css");
  const moduleNames = ["calculate.js", "presets.js", "state.js"];
  const moduleSources = moduleNames.map((name) => [name, readFileSync(resolve(root, "src", name), "utf8")]);
  const appSource = readFileSync(resolve(root, "web/app.js"), "utf8");
  const fingerprint = createHash("sha256")
    .update(appSource)
    .update(moduleSources.map(([, source]) => source).join(""))
    .digest("hex")
    .slice(0, 12);

  for (const [name, source] of moduleSources) {
    writeFileSync(resolve(output, "src", name), source);
  }

  const app = appSource
    .replaceAll('from "../src/', 'from "./src/')
    .replace(/from "(\.\/src\/[^"]+)"/g, `from "$1?v=${fingerprint}"`);
  const index = readFileSync(resolve(root, "web/index.html"), "utf8")
    .replace('src="app.js"', `src="app.js?v=${fingerprint}"`);
  writeFileSync(resolve(output, "index.html"), index);
  writeFileSync(resolve(output, "app.js"), app);
  writeFileSync(resolve(output, ".nojekyll"), "");
  validateLocalImports(output, app);
  return output;
}

function copy(root, output, source, destination) {
  copyFileSync(resolve(root, source), resolve(output, destination));
}

function validateLocalImports(output, source) {
  const imports = [...source.matchAll(/from\s+["'](\.\/[^"']+)["']/g)].map((match) => match[1]);
  if (imports.length === 0) throw new Error("Deployed app has no local module imports to validate");
  for (const modulePath of imports) {
    const [filePath] = modulePath.split("?");
    if (!existsSync(resolve(output, filePath))) throw new Error(`Missing deployed module: ${modulePath}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  buildPages();
}
