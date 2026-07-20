import fs from "node:fs/promises";

const reviewedPaths = [
  new URL("../work/p1-reviewed-bcd.json", import.meta.url),
  new URL("../work/p1-reviewed-lmh.json", import.meta.url),
];
const dailyPath = new URL("../data/daily-keyword-additions.json", import.meta.url);
const runId = "2026-07-20-p1-independent-research-03";
const mattressContext = /mattress|bed|box spring|foundation|pillow top|euro top|tight top|innerspring|memory foam|latex|hybrid/i;
const estimateValues = new Set(["High", "Medium", "Low"]);

function normalizeContentType(value = "Guide") {
  const normalized = value.toLowerCase();
  if (normalized.includes("faq") || normalized.includes("question")) return "FAQ";
  if (normalized.includes("comparison")) return "Comparison";
  if (normalized.includes("roundup") || normalized.includes("best")) return "Roundup";
  if (normalized.includes("review")) return "Review";
  if (normalized.includes("shopping") || normalized.includes("commercial")) return "Shopping";
  return "Guide";
}

function qualifyTopic(topic) {
  if (mattressContext.test(topic.canonicalTopic)) return topic.canonicalTopic;
  const qualifications = {
    "Cotton vs polypropylene pocket coil fabric": "cotton vs polypropylene pocket coil fabric in mattresses",
    "How pocket coil units are made": "how pocket coil units are made for mattresses",
    "Inline vs nested pocket coil layouts": "inline vs nested pocket coil layouts in mattresses",
    "Can body impressions cause back pain even without visible sagging?": "can mattress body impressions cause back pain even without visible sagging",
    "Lumbar support vs pressure relief for back pain": "mattress lumbar support vs pressure relief for back pain",
    "Comfort layer thickness for side sleepers": "mattress comfort layer thickness for side sleepers",
    "Waist gap and lumbar support for side sleepers": "mattress support for side sleeper waist gaps and lumbar alignment",
  };
  const qualified = qualifications[topic.canonicalTopic];
  if (!qualified) throw new Error(`Reviewed topic lacks mattress context: ${topic.canonicalTopic}`);
  return qualified;
}

const reviewedFiles = await Promise.all(reviewedPaths.map(async (path) => JSON.parse(await fs.readFile(path, "utf8"))));
const topics = reviewedFiles.flatMap((file) => file.topics ?? []);
const rejectedCount = reviewedFiles.reduce((total, file) => total + (file.rejected?.length ?? 0), 0);
const seen = new Set();

const keywords = topics.map((topic) => {
  const keyword = qualifyTopic(topic).toLowerCase().trim();
  const opportunityScore = Math.max(1, Math.min(5, Number(topic.opportunityScore) || 3));
  const priorityTier = ["green", "yellow", "red"].includes(topic.priorityTier)
    ? topic.priorityTier
    : opportunityScore >= 4 ? "green" : opportunityScore === 3 ? "yellow" : "red";
  const difficultyEstimate = estimateValues.has(topic.difficultyEstimate) ? topic.difficultyEstimate : "Medium";
  const demandEstimate = estimateValues.has(topic.demandEstimate) ? topic.demandEstimate : "Medium";
  const priorityReason = topic.priorityReason
    || (!estimateValues.has(topic.difficultyEstimate) ? topic.difficultyEstimate : null)
    || "Distinct mattress page opportunity supported by independent research and editorial review.";
  if (seen.has(keyword)) throw new Error(`Duplicate reviewed topic: ${keyword}`);
  seen.add(keyword);
  return {
    keyword,
    categoryId: topic.categoryId,
    subcategory: topic.subcategory,
    contentType: normalizeContentType(topic.contentType),
    intent: topic.intent,
    specialistReview: Boolean(topic.specialistReview),
    rationale: priorityReason,
    aliases: topic.aliases ?? [],
    sourceUrls: topic.sourceUrls ?? [],
    rankingOverride: {
      opportunityScore,
      priorityTier,
      demandEstimate,
      difficultyEstimate,
      priorityReason,
    },
  };
});

const dailyResearch = JSON.parse(await fs.readFile(dailyPath, "utf8"));
dailyResearch.runs = (dailyResearch.runs ?? []).filter((run) => run.id !== runId);
dailyResearch.runs.push({
  id: runId,
  date: "2026-07-20",
  sequence: 3,
  summary: `Independent P1 agents approved ${keywords.length} canonical proposals for import after merging synonyms and setting aside ${rejectedCount} weak, repetitive, or already-covered topics. Brands remained frozen.`,
  categoriesAdded: [],
  keywords,
});

await fs.writeFile(dailyPath, `${JSON.stringify(dailyResearch, null, 2)}\n`);
console.log(JSON.stringify({ imported: keywords.length, rejected: rejectedCount }, null, 2));
