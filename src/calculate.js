const TOKEN_SCALE = 1_000_000;

export function calculateScenario(input) {
  const requests = positive(input.requests, "requests");
  const reusableTokens = nonNegative(input.reusableTokens, "reusableTokens");
  const dynamicInputTokens = nonNegative(input.dynamicInputTokens, "dynamicInputTokens");
  const outputTokens = nonNegative(input.outputTokens, "outputTokens");
  const rates = normalizeRates(input.rates);

  const withoutCache = requests * (
    ((reusableTokens + dynamicInputTokens) / TOKEN_SCALE) * rates.input +
    (outputTokens / TOKEN_SCALE) * rates.output
  );
  const writes = input.cacheWrites == null ? 1 : nonNegative(input.cacheWrites, "cacheWrites");
  if (writes > requests) throw new TypeError("cacheWrites cannot exceed requests");
  const reads = Math.max(0, requests - writes);
  const withCache =
    (writes * reusableTokens / TOKEN_SCALE) * rates.cacheWrite +
    (reads * reusableTokens / TOKEN_SCALE) * rates.cacheRead +
    (requests * dynamicInputTokens / TOKEN_SCALE) * rates.input +
    (requests * outputTokens / TOKEN_SCALE) * rates.output;
  const savings = withoutCache - withCache;

  return {
    withoutCache,
    withCache,
    savings,
    savingsPercent: withoutCache === 0 ? 0 : (savings / withoutCache) * 100,
    cacheWrites: writes,
    cacheReads: reads
  };
}

export function breakEvenRequests(input) {
  const reusableTokens = positive(input.reusableTokens, "reusableTokens");
  const rates = normalizeRates(input.rates);
  const uncached = reusableTokens / TOKEN_SCALE * rates.input;
  const write = reusableTokens / TOKEN_SCALE * rates.cacheWrite;
  const read = reusableTokens / TOKEN_SCALE * rates.cacheRead;
  if (uncached <= read) return Infinity;
  return Math.max(1, Math.ceil((write - read) / (uncached - read)));
}

function normalizeRates(value = {}) {
  return {
    input: nonNegative(value.input, "rates.input"),
    output: nonNegative(value.output, "rates.output"),
    cacheWrite: nonNegative(value.cacheWrite, "rates.cacheWrite"),
    cacheRead: nonNegative(value.cacheRead, "rates.cacheRead")
  };
}

function nonNegative(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new TypeError(`${name} must be a non-negative number`);
  return number;
}

function positive(value, name) {
  const number = nonNegative(value, name);
  if (number === 0) throw new TypeError(`${name} must be greater than zero`);
  return number;
}
