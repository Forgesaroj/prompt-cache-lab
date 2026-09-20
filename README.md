# Prompt Cache Lab

A provider-neutral calculator for understanding prompt-cache cost, savings, and break-even reuse.

Most calculators hide their assumptions. This one makes every input editable: reusable prompt tokens, dynamic tokens, output, cache writes, request count, and all four token rates. The core calculation is a tiny tested JavaScript module, and the browser UI is static-host friendly.

## Run locally

```bash
npm test
python -m http.server 8000
# open http://localhost:8000/web/
```

## Library use

```js
import { calculateScenario } from "@forgesaroj/prompt-cache-lab";

const result = calculateScenario({
  requests: 100,
  reusableTokens: 50_000,
  dynamicInputTokens: 1_000,
  outputTokens: 1_500,
  cacheWrites: 1,
  rates: { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 }
});
```

Rates are examples only, in USD per million tokens. Providers change pricing and cache rules; copy current rates from the official pricing documentation. The estimate intentionally excludes TTL constraints, minimum cacheable lengths, rounding, taxes, and provider-specific billing details.

## Contributing

Issues that add provider presets should include a primary-source pricing link and an “as of” date. Core arithmetic changes require tests. MIT licensed.
