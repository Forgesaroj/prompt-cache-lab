export const PRICING_VERIFIED_AT = "2026-09-20";

export const PRICING_PRESETS = Object.freeze([
  preset("claude-sonnet-5-5m", "Anthropic", "Claude Sonnet 5", "5-minute cache", 2, 10, 2.5, 0.2, "https://platform.claude.com/docs/en/about-claude/pricing"),
  preset("claude-sonnet-5-1h", "Anthropic", "Claude Sonnet 5", "1-hour cache", 2, 10, 4, 0.2, "https://platform.claude.com/docs/en/about-claude/pricing"),
  preset("claude-opus-5-5m", "Anthropic", "Claude Opus 5", "5-minute cache", 5, 25, 6.25, 0.5, "https://platform.claude.com/docs/en/about-claude/pricing"),
  preset("claude-haiku-4-5-5m", "Anthropic", "Claude Haiku 4.5", "5-minute cache", 1, 5, 1.25, 0.1, "https://platform.claude.com/docs/en/about-claude/pricing"),
  preset("gpt-6-astra-short", "OpenAI", "GPT-6 Astra", "short context", 5, 25, 6.25, 0.5, "https://developers.openai.com/api/docs/pricing"),
  preset("gpt-5-6-sol-short", "OpenAI", "GPT-5.6 Sol", "short context", 2, 10, 2.5, 0.2, "https://developers.openai.com/api/docs/pricing"),
  preset("gpt-5-6-terra-short", "OpenAI", "GPT-5.6 Terra", "short context", 1, 6, 1.25, 0.1, "https://developers.openai.com/api/docs/pricing")
]);

export function getPreset(id) {
  return PRICING_PRESETS.find((item) => item.id === id);
}

function preset(id, provider, model, variant, input, output, cacheWrite, cacheRead, source) {
  return Object.freeze({
    id,
    provider,
    model,
    variant,
    label: `${model} · ${variant}`,
    rates: Object.freeze({ input, output, cacheWrite, cacheRead }),
    source,
    verifiedAt: PRICING_VERIFIED_AT
  });
}
