import { breakEvenRequests, calculateScenario } from "../src/calculate.js";

const form = document.querySelector("#calculator");
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 4 });

function update() {
  try {
    const values = Object.fromEntries(new FormData(form).entries());
    const rates = { input: values.input, output: values.output, cacheWrite: values.cacheWrite, cacheRead: values.cacheRead };
    const result = calculateScenario({ ...values, rates });
    const breakEven = breakEvenRequests({ reusableTokens: values.reusableTokens, rates });
    document.querySelector("#without").textContent = money.format(result.withoutCache);
    document.querySelector("#with").textContent = money.format(result.withCache);
    document.querySelector("#savings").textContent = `${money.format(result.savings)} (${result.savingsPercent.toFixed(1)}%)`;
    document.querySelector("#detail").textContent = `Break-even: ${Number.isFinite(breakEven) ? `${breakEven} requests` : "not reached at these rates"}. ${result.cacheWrites} writes and ${result.cacheReads} reads modeled.`;
  } catch (error) {
    document.querySelector("#detail").textContent = error.message;
  }
}

form.addEventListener("input", update);
update();
