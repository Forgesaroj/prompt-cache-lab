import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { buildPages } from "../scripts/build-pages.js";

test("stages Pages with resolvable root-relative module imports", () => {
  const output = mkdtempSync(join(tmpdir(), "prompt-cache-pages-"));
  try {
    buildPages(resolve(import.meta.dirname, ".."), output);
    const app = readFileSync(resolve(output, "app.js"), "utf8");
    assert.match(app, /from "\.\/src\/calculate\.js"/);
    assert.doesNotMatch(app, /from "\.\.\/src\//);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
