import fs from "node:fs/promises";

const auditPath = new URL("../work/saturation-audit-b.json", import.meta.url);
const dailyPath = new URL("../data/daily-keyword-additions.json", import.meta.url);
const runId = "2026-07-20-p1-saturation-audit-04";
const acceptedTopics = new Set([
  "innerspring mattress vs box spring",
  "tempered steel mattress coils explained",
  "can you replace a pillow top mattress layer",
]);

const audit = JSON.parse(await fs.readFile(auditPath, "utf8"));
const dailyResearch = JSON.parse(await fs.readFile(dailyPath, "utf8"));

const keywords = audit.candidates
  .filter((candidate) => acceptedTopics.has(candidate.canonicalTopic))
  .map((candidate) => ({
    keyword: candidate.canonicalTopic,
    categoryId: candidate.categoryId,
    subcategory: "P1 saturation audit",
    contentType: candidate.canonicalTopic.includes(" vs ") ? "Comparison" : candidate.canonicalTopic.startsWith("can ") ? "FAQ" : "Guide",
    intent: candidate.canonicalTopic.includes(" vs ") ? "Commercial" : "Informational",
    specialistReview: false,
    rationale: candidate.rationale,
    aliases: candidate.aliases,
    sourceUrls: candidate.sourceUrls,
    rankingOverride: {
      opportunityScore: candidate.score,
      priorityTier: candidate.tier,
      demandEstimate: candidate.demand,
      difficultyEstimate: candidate.difficulty,
      priorityReason: candidate.rationale,
    },
  }));

keywords.push({
  keyword: "types of mattress coils",
  categoryId: "innerspring",
  subcategory: "Coil and spring FAQs",
  contentType: "Guide",
  intent: "Commercial",
  specialistReview: false,
  rationale: "Existing coil-type pillar expanded with decision-language aliases rather than creating a competing page.",
  aliases: ["how to choose the right innerspring coil type", "which mattress coil type is best", "how to choose bonnell pocket offset or continuous coils"],
  sourceUrls: [
    "https://www.sleepfoundation.org/mattress-construction/mattress-coil-types",
    "https://www.sleepfoundation.org/mattress-construction/mattress-support-core",
  ],
});

if (keywords.length !== 4) throw new Error(`Expected four reviewed audit records, found ${keywords.length}`);

dailyResearch.runs = (dailyResearch.runs ?? []).filter((run) => run.id !== runId);
dailyResearch.runs.push({
  id: runId,
  date: "2026-07-20",
  sequence: 4,
  summary: "Final bounded P1 saturation audit found three defensible standalone page gaps. Five other suggestions were rejected as cannibalizing, repetitive, or better handled as sections, and one coil-selection phrase was merged into an existing page. The P1 set is practically saturated under current evidence, not permanently complete.",
  categoriesAdded: [],
  keywords,
});

await fs.writeFile(dailyPath, `${JSON.stringify(dailyResearch, null, 2)}\n`);
console.log(JSON.stringify({ newPages: 3, existingPagesEnriched: 1, rejectedSuggestions: 5 }, null, 2));
