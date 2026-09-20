# Prompt Cache Lab

**Know when your LLM prompt cache actually pays off.**

[Open the calculator](https://forgesaroj.github.io/prompt-cache-lab/) · [Report a calculation issue](https://github.com/Forgesaroj/prompt-cache-lab/issues)

Prompt Cache Lab is a privacy-friendly, provider-neutral calculator for comparing cached and uncached LLM workloads. It models reusable context, dynamic input, output, cache creation/refreshes, cache reads, savings, and break-even reuse—entirely in your browser.

## Why this calculator is different

- **Transparent inputs:** every token count and rate stays editable.
- **Source-dated presets:** included Claude and OpenAI rates link to official documentation and record when they were verified.
- **Expiry-aware:** multiple cache writes can model refreshes or cache expiry.
- **Shareable:** scenario URLs contain only numbers and preset IDs—never prompts, keys, or account data.
- **No backend or tracking:** calculation and state serialization run locally.
- **Honest boundaries:** provider-specific costs that the engine cannot model are excluded rather than approximated invisibly.

Gemini presets are intentionally deferred because Gemini context caching includes a separate token-per-hour storage charge. The current four-rate model cannot represent that cost honestly yet.

## Library use

```js
import { calculateScenario } from "@tsrjl/prompt-cache-lab";
import { getPreset } from "@tsrjl/prompt-cache-lab/presets";

const preset = getPreset("claude-sonnet-5-5m");
const result = calculateScenario({
  requests: 100,
  reusableTokens: 50_000,
  dynamicInputTokens: 1_000,
  outputTokens: 1_500,
  cacheWrites: 1,
  rates: preset.rates
});
```

Rates are USD per million tokens. Presets were verified on **2026-09-20** against the official [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing) and [OpenAI pricing](https://developers.openai.com/api/docs/pricing) pages. Always recheck pricing before budgeting.

## Run locally

```bash
npm test
npm run check
python -m http.server 8000
# open http://localhost:8000/web/
```

## Calculation boundary

The estimate excludes taxes, provider rounding, minimum cacheable lengths, eligibility rules, service tiers, time-based storage charges, data-residency uplifts, batch discounts, and other provider-specific modifiers unless explicitly represented by the chosen rates.

Core arithmetic changes require tests. Pricing changes require an official source and verification date. See [CONTRIBUTING.md](CONTRIBUTING.md).

MIT licensed. Not affiliated with or endorsed by Anthropic, OpenAI, or Google.
