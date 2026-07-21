import fs from "node:fs/promises";

const dailyPath = new URL("../data/daily-keyword-additions.json", import.meta.url);
const runId = "2026-07-21-cooling-saturation-audit-01";
const sourceUrls = [
  "https://www.sleepfoundation.org/best-mattress/best-cooling-mattress",
  "https://www.tomsguide.com/wellness/sleep/how-does-a-cooling-mattress-work",
  "https://www.tomsguide.com/wellness/mattresses/temperature-regulation",
  "https://www.tomsguide.com/wellness/mattresses/gel-foam-mattresses",
  "https://www.tomsguide.com/wellness/mattresses/5-signs-that-you-need-a-cooling-mattress",
];

const topics = [
  ["how do cooling mattresses work", ["how does a cooling mattress work", "cooling mattress technology explained"], "Cooling technology", "FAQ", 5],
  ["are cooling mattresses worth it", ["is a cooling mattress worth the money", "do cooling mattresses really work"], "Cooling shopping decisions", "FAQ", 5],
  ["cooling mattress materials compared", ["best cooling materials in a mattress", "mattress cooling technologies compared"], "Cooling materials", "Comparison", 5],
  ["active vs passive cooling mattress technology", ["active cooling mattress vs passive cooling", "powered vs material-based mattress cooling"], "Cooling technology", "Comparison", 4],
  ["cooling mattress vs temperature-controlled smart bed", ["cooling mattress or smart temperature control bed", "passive cooling mattress vs active smart bed"], "Cooling comparisons", "Comparison", 4],
  ["cool-to-touch mattress cover vs all-night cooling", ["cool to touch vs stays cool mattress", "does a cooling cover stay cool all night"], "Cooling claims", "Comparison", 5],
  ["how are cooling mattresses tested", ["mattress temperature regulation test", "thermal imaging test for cooling mattresses"], "Cooling testing", "Guide", 4],
  ["how to verify cooling mattress claims", ["are cooling mattress claims real", "how to compare mattress cooling claims"], "Cooling claims", "Guide", 5],
  ["how long does a cooling mattress stay cool", ["does a cooling mattress work all night", "how long does mattress cooling technology last each night"], "Cooling ownership FAQs", "FAQ", 4],
  ["best cooling mattress by sleep position", ["cooling mattress for side sleepers", "cooling mattress for back sleepers", "cooling mattress for stomach sleepers"], "Cooling shopper fit", "Roundup", 5],
  ["best cooling mattress by body weight", ["cooling mattress for heavy sleepers", "cooling mattress for lightweight sleepers", "cooling mattress for average weight sleepers"], "Cooling shopper fit", "Roundup", 5],
  ["cooling mattress for couples with different temperature preferences", ["mattress for one hot sleeper and one cold sleeper", "dual-temperature mattress for couples"], "Cooling shopper fit", "Guide", 5],
  ["cooling mattress for hot flashes and menopause", ["mattress for menopausal hot flashes", "cooling bed for menopause night sweats"], "Cooling health-adjacent FAQs", "Guide", 4, true],
  ["cooling mattress for hot bedrooms and humid climates", ["cooling mattress for a room without air conditioning", "mattress for humid weather", "cooling mattress for hot climate"], "Cooling environments", "Guide", 4],
  ["should you use a cooling mattress year round", ["cooling mattress in winter", "is a cooling mattress only for summer"], "Cooling ownership FAQs", "FAQ", 3],
  ["cooling mattress vs cooling mattress topper", ["buy a cooling mattress or topper", "cooling topper vs new cooling mattress"], "Cooling comparisons", "Comparison", 5],
  ["cooling mattress vs cooling mattress pad", ["cooling mattress pad or cooling mattress", "cooling pad vs temperature-regulating mattress"], "Cooling comparisons", "Comparison", 4],
  ["can a mattress protector block cooling technology", ["does a mattress protector make a cooling mattress hotter", "best protector for a cooling mattress"], "Cooling troubleshooting", "FAQ", 5],
  ["do sheets affect cooling mattress performance", ["can hot sheets cancel mattress cooling", "best sheets for a cooling mattress"], "Cooling troubleshooting", "FAQ", 4],
  ["does a bed frame affect mattress airflow and cooling", ["foundation airflow for a cooling mattress", "can a platform bed make a mattress sleep hot"], "Cooling foundations", "FAQ", 4],
  ["why did my cooling mattress stop feeling cool", ["cooling mattress no longer works", "why does my cooling mattress sleep hot now"], "Cooling troubleshooting", "FAQ", 5],
  ["how to clean a cooling mattress after night sweats", ["clean sweat from a cooling mattress", "protect cooling mattress from night sweat stains"], "Cooling care", "Guide", 3, true],
  ["how long should you test a cooling mattress", ["cooling mattress trial period for hot sleepers", "how many nights to test mattress temperature regulation"], "Cooling trials", "FAQ", 4],
  ["should you return a cooling mattress if you still sleep hot", ["cooling mattress return because it sleeps hot", "exchange mattress that traps heat"], "Cooling trials", "FAQ", 4],
  ["does mattress firmness affect cooling", ["soft vs firm mattress for hot sleepers", "does a softer mattress trap more heat"], "Cooling construction", "FAQ", 4],
  ["does mattress thickness affect heat retention", ["thick vs thin mattress for hot sleepers", "does mattress height affect cooling"], "Cooling construction", "FAQ", 3],
  ["budget vs premium cooling mattress technology", ["cheap vs expensive cooling mattress", "is premium mattress cooling worth it"], "Cooling shopping decisions", "Comparison", 4],
  ["gel foam vs phase change material mattress cooling", ["cooling gel vs pcm mattress", "phase change cover vs gel memory foam"], "Cooling materials", "Comparison", 4],
  ["hybrid vs innerspring mattress for hot sleepers", ["is hybrid or innerspring cooler", "best spring mattress type for hot sleepers"], "Cooling comparisons", "Comparison", 4],
];

const keywords = topics.map(([keyword, aliases, subcategory, contentType, opportunityScore, specialistReview = false]) => ({
  keyword,
  categoryId: "cooling",
  subcategory,
  contentType,
  intent: contentType === "Comparison" || contentType === "Roundup" ? "Commercial" : "Informational",
  specialistReview,
  rationale: opportunityScore === 5
    ? "Distinct high-value mattress decision or troubleshooting page supported by current cooling-mattress coverage."
    : opportunityScore === 4
      ? "Useful standalone cooling-mattress page with clear shopper or ownership intent."
      : "Relevant lower-demand supporting page retained as a distinct editorial opportunity.",
  aliases,
  sourceUrls,
  rankingOverride: {
    opportunityScore,
    priorityTier: opportunityScore >= 4 ? "green" : "yellow",
    demandEstimate: opportunityScore >= 4 ? "Medium" : "Low",
    difficultyEstimate: opportunityScore === 5 ? "Medium" : "Low",
    priorityReason: opportunityScore === 5
      ? "Distinct high-value mattress decision or troubleshooting page supported by current cooling-mattress coverage."
      : opportunityScore === 4
        ? "Useful standalone cooling-mattress page with clear shopper or ownership intent."
        : "Relevant lower-demand supporting page retained as a distinct editorial opportunity.",
  },
}));

const dailyResearch = JSON.parse(await fs.readFile(dailyPath, "utf8"));
dailyResearch.runs = (dailyResearch.runs ?? []).filter((run) => run.id !== runId);
dailyResearch.runs.push({
  id: runId,
  date: "2026-07-21",
  sequence: 1,
  summary: "Bounded Cooling & Hot Sleepers audit reviewed five current U.S. sources and added 29 distinct canonical pages. Wording variants were retained as aliases, medical-adjacent topics were flagged, and brands and retailers remained frozen. The category is substantially deeper but not yet declared saturated.",
  categoriesAdded: [],
  keywords,
});

await fs.writeFile(dailyPath, `${JSON.stringify(dailyResearch, null, 2)}\n`);
console.log(JSON.stringify({ category: "Cooling & Hot Sleepers", newPages: keywords.length, sourcesChecked: sourceUrls.length }, null, 2));
