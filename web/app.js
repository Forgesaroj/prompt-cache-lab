import { breakEvenRequests, calculateScenario } from "../src/calculate.js";
import { getPreset, PRICING_PRESETS } from "../src/presets.js";
import { decodeScenario, encodeScenario } from "../src/state.js";

const DEFAULTS = Object.freeze({
  preset: "claude-sonnet-5-5m", requests: 100, reusableTokens: 50_000,
  dynamicInputTokens: 1_000, outputTokens: 1_500, cacheWrites: 1,
  input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2
});
const RATE_FIELDS = new Set(["input", "output", "cacheWrite", "cacheRead"]);
const form = document.querySelector("#calculator");
const presetSelect = document.querySelector("#preset");
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 4 });

populatePresets();
writeForm(decodeScenario(location.search, DEFAULTS));
update();

form.addEventListener("input", (event) => {
  if (RATE_FIELDS.has(event.target.name)) presetSelect.value = "custom";
  update();
});
presetSelect.addEventListener("change", () => {
  const selected = getPreset(presetSelect.value);
  if (selected) writeRates(selected.rates);
  update();
});
document.querySelector("#reset").addEventListener("click", () => {
  writeForm(DEFAULTS);
  history.replaceState(null, "", location.pathname);
  setStatus("Reset to the default Claude Sonnet 5 scenario.");
  update();
});
document.querySelector("#share").addEventListener("click", async () => {
  try {
    const url = new URL(location.href);
    url.search = encodeScenario(readForm());
    await navigator.clipboard.writeText(url.toString());
    history.replaceState(null, "", url);
    setStatus("Share link copied. It contains only calculator numbers—never prompts or keys.");
  } catch {
    setStatus("Clipboard access was blocked. Copy the URL from your browser address bar.");
  }
});

function populatePresets() {
  const groups = new Map();
  for (const item of PRICING_PRESETS) {
    if (!groups.has(item.provider)) groups.set(item.provider, []);
    groups.get(item.provider).push(item);
  }
  for (const [provider, items] of groups) {
    const group = document.createElement("optgroup");
    group.label = provider;
    for (const item of items) group.append(new Option(item.label, item.id));
    presetSelect.append(group);
  }
}
function readForm() {
  const values = Object.fromEntries(new FormData(form).entries());
  return {
    preset: values.preset, requests: Number(values.requests), reusableTokens: Number(values.reusableTokens),
    dynamicInputTokens: Number(values.dynamicInputTokens), outputTokens: Number(values.outputTokens),
    cacheWrites: Number(values.cacheWrites), input: Number(values.input), output: Number(values.output),
    cacheWrite: Number(values.cacheWrite), cacheRead: Number(values.cacheRead)
  };
}
function writeForm(values) {
  for (const [name, value] of Object.entries(values)) {
    const control = form.elements.namedItem(name);
    if (control) control.value = value;
  }
  if (!getPreset(values.preset)) presetSelect.value = "custom";
}
function writeRates(rates) {
  for (const [name, value] of Object.entries(rates)) form.elements.namedItem(name).value = value;
}
function update() {
  const values = readForm();
  renderSource(getPreset(values.preset));
  try {
    const rates = { input: values.input, output: values.output, cacheWrite: values.cacheWrite, cacheRead: values.cacheRead };
    const result = calculateScenario({ ...values, rates });
    const breakEven = values.reusableTokens > 0 ? breakEvenRequests({ reusableTokens: values.reusableTokens, rates }) : Infinity;
    renderResult(result, breakEven);
  } catch (error) {
    document.querySelector("#verdict-copy").textContent = error.message;
    document.querySelector("#verdict").dataset.tone = "error";
  }
}
function renderSource(selected) {
  const note = document.querySelector("#source-note");
  if (!selected) { note.replaceChildren("Custom rates · USD per million tokens"); return; }
  const link = document.createElement("a");
  link.href = selected.source; link.target = "_blank"; link.rel = "noreferrer";
  link.textContent = `Official ${selected.provider} pricing`;
  note.replaceChildren(link, ` · verified ${selected.verifiedAt}`);
}
function renderResult(result, breakEven) {
  const isSaving = result.savings >= 0;
  document.querySelector("#without").textContent = money.format(result.withoutCache);
  document.querySelector("#with").textContent = money.format(result.withCache);
  document.querySelector("#savings").textContent = `${money.format(Math.abs(result.savings))} (${Math.abs(result.savingsPercent).toFixed(1)}%)`;
  document.querySelector("#verdict-copy").textContent = isSaving ? "Caching costs less for this scenario." : "Caching costs more for this scenario.";
  document.querySelector("#verdict").dataset.tone = isSaving ? "saving" : "costlier";
  document.querySelector("#break-even").textContent = Number.isFinite(breakEven) ? `${breakEven} requests` : "Not reached";
  document.querySelector("#reads").textContent = result.cacheReads.toLocaleString();
  document.querySelector("#writes").textContent = result.cacheWrites.toLocaleString();
  const maximum = Math.max(result.withoutCache, result.withCache, Number.EPSILON);
  document.querySelector("#without-bar").style.width = `${(result.withoutCache / maximum) * 100}%`;
  document.querySelector("#with-bar").style.width = `${(result.withCache / maximum) * 100}%`;
}
function setStatus(value) { document.querySelector("#status").textContent = value; }
