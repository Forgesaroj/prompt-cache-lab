import test from "node:test";
import assert from "node:assert/strict";
import { decodeScenario, encodeScenario } from "../src/state.js";

const defaults = { preset: "custom", requests: 100, reusableTokens: 50_000, dynamicInputTokens: 1_000, outputTokens: 1_500, cacheWrites: 1, input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 };

test("round-trips every supported scenario field", () => {
  const scenario = { ...defaults, preset: "claude-sonnet-5-1h", requests: 321, cacheWrites: 4 };
  assert.deepEqual(decodeScenario(encodeScenario(scenario), defaults), scenario);
});

test("ignores unknown fields and unsafe numeric values", () => {
  const result = decodeScenario("?v=1&requests=20&input=NaN&unknown=<script>", defaults);
  assert.equal(result.requests, 20);
  assert.equal(result.input, defaults.input);
  assert.equal("unknown" in result, false);
});

test("falls back when writes exceed requests", () => {
  assert.deepEqual(decodeScenario("?v=1&requests=2&cacheWrites=3", defaults), defaults);
});
