import test from "node:test";
import assert from "node:assert/strict";
import { getPreset, PRICING_PRESETS, PRICING_VERIFIED_AT } from "../src/presets.js";

test("presets have unique IDs, source dates, and valid rates", () => {
  assert.equal(new Set(PRICING_PRESETS.map((item) => item.id)).size, PRICING_PRESETS.length);
  assert.match(PRICING_VERIFIED_AT, /^\d{4}-\d{2}-\d{2}$/);
  for (const item of PRICING_PRESETS) {
    assert.match(item.source, /^https:\/\//);
    assert.equal(item.verifiedAt, PRICING_VERIFIED_AT);
    for (const rate of Object.values(item.rates)) assert.ok(rate >= 0);
  }
});

test("looks up a preset without inventing a fallback", () => {
  assert.equal(getPreset("claude-sonnet-5-5m")?.rates.cacheRead, 0.2);
  assert.equal(getPreset("missing"), undefined);
});
