const NUMERIC_FIELDS = Object.freeze([
  "requests", "reusableTokens", "dynamicInputTokens", "outputTokens", "cacheWrites",
  "input", "output", "cacheWrite", "cacheRead"
]);

export function encodeScenario(scenario) {
  const params = new URLSearchParams({ v: "1" });
  if (scenario.preset) params.set("preset", String(scenario.preset));
  for (const field of NUMERIC_FIELDS) {
    const value = Number(scenario[field]);
    if (Number.isFinite(value) && value >= 0) params.set(field, String(value));
  }
  return params.toString();
}

export function decodeScenario(search, defaults) {
  const params = new URLSearchParams(String(search).replace(/^\?/, ""));
  if (!params.has("v")) return { ...defaults };
  const next = { ...defaults };
  if (params.has("preset")) next.preset = params.get("preset");
  for (const field of NUMERIC_FIELDS) {
    if (!params.has(field)) continue;
    const value = Number(params.get(field));
    if (Number.isFinite(value) && value >= 0) next[field] = value;
  }
  if (!(next.requests > 0) || next.cacheWrites > next.requests) return { ...defaults };
  return next;
}
