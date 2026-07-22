import fs from "node:fs/promises";

const dailyPath = new URL("../data/daily-keyword-additions.json", import.meta.url);
const runId = "2026-07-22-couples-motion-isolation-audit-01";
const sourceUrls = [
  "https://www.sleepfoundation.org/best-mattress/best-mattress-for-couples",
  "https://www.sleepfoundation.org/research-methodology/motion-isolation",
  "https://www.aarp.org/health/healthy-living/best-mattresses-for-couples/",
  "https://www.rtings.com/mattress/learn/how-to-choose-the-right-mattress",
  "https://www.consumerreports.org/home-garden/mattresses/best-mattresses-for-couples-a2024289600/",
  "https://www.saatva.com/blog/common-couples-sleep-problems/",
];

const topics = [
  ["best mattress for couples with different sleep schedules", ["best mattress for couples on different schedules", "mattress for couples with different sleep schedules", "mattress for partners who go to bed at different times"], "Different sleep schedules", "Roundup", 5],
];

const keywords = topics.map(([keyword, aliases, subcategory, contentType, opportunityScore]) => ({
  keyword,
  categoryId: "couples",
  subcategory,
  contentType,
  intent: contentType === "Comparison" || contentType === "Roundup" ? "Commercial Investigation" : "Informational",
  specialistReview: false,
  rationale: opportunityScore === 5
    ? "Distinct, evidence-backed couple mattress decision or troubleshooting intent with a strong replacement or comparison path."
    : "Useful standalone couple mattress FAQ supported by current motion-isolation guidance.",
  aliases,
  aliasesAreExact: true,
  sourceUrls,
  rankingOverride: {
    opportunityScore,
    priorityTier: opportunityScore === 5 ? "green" : "yellow",
    demandEstimate: opportunityScore === 5 ? "Medium" : "Low",
    difficultyEstimate: opportunityScore === 5 ? "Medium" : "Low",
    priorityReason: opportunityScore === 5
      ? "Strong couple-specific mattress shopping, comparison, or replacement path."
      : "Distinct supporting FAQ with directional demand retained honestly as low.",
  },
}));

const aliasesMerged = keywords.reduce((total, keyword) => total + keyword.aliases.length, 0) + 5;
const rejected = [
  ["best mattress for a restless partner", "Overlaps the existing motion-isolation, light-sleeper, and partner-disturbance pages."],
  ["how to test mattress motion isolation at home", "Testing method belongs within the existing motion-isolation explainer."],
  ["motion isolation vs responsiveness in a mattress", "Useful tradeoff section, but not sufficiently distinct from existing motion-isolation pages."],
  ["motion isolation vs motion transfer in a mattress", "Terminology section within the existing motion-transfer explainer."],
  ["memory foam vs hybrid mattress for motion isolation", "Covered by existing type-specific motion-isolation pages and broader comparisons."],
  ["latex vs memory foam mattress for motion isolation", "Covered by existing type-specific motion-isolation pages and broader comparisons."],
  ["innerspring vs hybrid mattress for motion isolation", "Covered by existing type-specific motion-isolation pages and broader comparisons."],
  ["can a mattress topper improve motion isolation", "Supporting remedy within motion-transfer troubleshooting, not a durable standalone page."],
  ["does a split king mattress eliminate motion transfer", "Covered by existing split-king and motion-isolation pages."],
  ["why can I feel my partner moving on the mattress", "Overlaps the existing mattress motion-transfer page."],
  ["is the mattress or bed frame causing motion transfer", "Diagnostic section within motion-transfer troubleshooting."],
  ["does a mattress foundation affect motion isolation", "Supporting section within motion-transfer troubleshooting."],
  ["when should you replace a mattress because of motion transfer", "Replacement section within the existing mattress motion-transfer page."],
  ["mattress for couples with different pressure relief needs", "Umbrella intent covered by existing firmness, position, weight, and pain pages."],
  ["how much motion transfer is normal on a mattress", "Section within the existing motion-isolation explainer."],
  ["can a mattress be too bouncy for couples", "Covered by motion isolation versus responsiveness."],
  ["pocket coils vs connected coils for motion isolation", "Covered by the existing connected-coils versus pocket-coils page."],
  ["best mattress for couples with different weights", "Existing canonical page."],
  ["best mattress size for couples", "Existing king-versus-queen and size pages cover the decision."],
  ["mattress for couples who sleep hot", "Existing different-temperature couple pages cover the intent."],
  ["does mattress thickness affect motion isolation", "Insufficient evidence for a separate page rather than a testing section."],
  ["can a mattress protector affect motion isolation", "Too weak and better handled inside troubleshooting content."],
];

const dailyResearch = JSON.parse(await fs.readFile(dailyPath, "utf8"));
for (const run of dailyResearch.runs ?? []) {
  for (const entry of run.keywords ?? []) {
    if (entry.keyword === "mattress for couples with different body temperatures" || entry.keyword === "split king vs dual comfort mattress for couples") {
      entry.aliasesAreExact = true;
    }
  }
}
dailyResearch.runs = (dailyResearch.runs ?? []).filter((run) => run.id !== runId);
dailyResearch.runs.push({
  id: runId,
  date: "2026-07-22",
  sequence: 1,
  summary: `Dedicated Couples & Motion Isolation audit checked six current U.S. sources and accepted ${keywords.length} distinct canonical pages. It merged ${aliasesMerged} exact query aliases, rejected ${rejected.length} covered or section-level ideas, and corrected five previously split exact aliases. Brands remained frozen. The category is practically saturated under current evidence and should reopen only when new SERP, product, or Search Console evidence appears.`,
  categoriesAdded: [],
  keywords,
  audit: {
    category: "Couples & Motion Isolation",
    sourcesChecked: sourceUrls,
    aliasesMerged,
    rejected: rejected.map(([keyword, reason]) => ({ keyword, reason })),
    saturationStatement: "Practically saturated for distinct couple and motion-isolation page intent under current evidence; reopen only for genuinely new products, SERPs, or first-party query data.",
  },
});

await fs.writeFile(dailyPath, `${JSON.stringify(dailyResearch, null, 2)}\n`);
console.log(JSON.stringify({ category: "Couples & Motion Isolation", accepted: keywords.length, aliasesMerged, rejected: rejected.length, sourcesChecked: sourceUrls.length }, null, 2));
