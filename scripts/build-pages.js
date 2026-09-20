import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_ROOT = resolve(dirname(SCRIPT_PATH), "..");

export function buildPages(root = DEFAULT_ROOT, output = resolve(root, "_site")) {
  rmSync(output, { recursive: true, force: true });
  mkdirSync(resolve(output, "src"), { recursive: true });

  copy(root, output, "web/index.html", "index.html");
  copy(root, output, "web/styles.css", "styles.css");
  for (const name of ["calculate.js", "presets.js", "state.js"]) {
    copy(root, output, `src/${name}`, `src/${name}`);
  }

  const app = readFileSync(resolve(root, "web/app.js"), "utf8")
    .replaceAll('from "../src/', 'from "./src/');
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
    if (!existsSync(resolve(output, modulePath))) throw new Error(`Missing deployed module: ${modulePath}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  buildPages();
}
