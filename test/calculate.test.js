import test from "node:test";
import assert from "node:assert/strict";
import { breakEvenRequests, calculateScenario } from "../src/calculate.js";

const rates = { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 };

test("calculates cache writes, reads, and savings", () => {
  const result = calculateScenario({
    requests: 10,
    reusableTokens: 100_000,
    dynamicInputTokens: 1_000,
    outputTokens: 2_000,
    rates
  });
  assert.equal(result.cacheWrites, 1);
  assert.equal(result.cacheReads, 9);
  assert.ok(Math.abs(result.withoutCache - 3.33) < 1e-10);
  assert.ok(Math.abs(result.withCache - 0.975) < 1e-10);
  assert.ok(result.savingsPercent > 70);
});

test("allows multiple writes caused by cache expiry", () => {
  const oneWrite = calculateScenario({ requests: 10, reusableTokens: 10_000, dynamicInputTokens: 0, outputTokens: 0, rates });
  const threeWrites = calculateScenario({ requests: 10, cacheWrites: 3, reusableTokens: 10_000, dynamicInputTokens: 0, outputTokens: 0, rates });
  assert.ok(threeWrites.withCache > oneWrite.withCache);
});

test("finds the first request count that breaks even", () => {
  assert.equal(breakEvenRequests({ reusableTokens: 100_000, rates }), 2);
});

test("rejects invalid numeric input", () => {
  assert.throws(() => calculateScenario({ requests: 0, reusableTokens: 1, dynamicInputTokens: 0, outputTokens: 0, rates }));
  assert.throws(() => calculateScenario({ requests: 2, cacheWrites: 3, reusableTokens: 1, dynamicInputTokens: 0, outputTokens: 0, rates }));
  assert.throws(() => breakEvenRequests({ reusableTokens: -1, rates }));
});
