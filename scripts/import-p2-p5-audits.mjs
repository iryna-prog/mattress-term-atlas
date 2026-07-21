import fs from "node:fs/promises";

const auditPaths = ["a", "b", "c", "d"].map((suffix) => new URL(`../work/p2-p5-audit-${suffix}.json`, import.meta.url));
const libraryPath = new URL("../public/data/keyword-library.json", import.meta.url);
const dailyPath = new URL("../data/daily-keyword-additions.json", import.meta.url);
const previousRunId = "2026-07-21-p2-p5-audit-b";
const runId = "2026-07-21-p2-p5-independent-audit-02";

function normalize(value) {
  return String(value ?? "").toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

function signature(value) {
  return normalize(value)
    .replace(/\b(price|pricing|cost)\b/g, "cost")
    .replace(/\b(lifespan|longevity|durability)\b/g, "last")
    .replace(/\b(benefits|advantages|disadvantages|pros|cons)\b/g, "proscons")
    .replace(/\bmattresses\b/g, "mattress")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(a|an|the|do|does|is|are|what|why|how|should|you|your|of|for|and|to)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .sort()
    .join(" ");
}

function contentTypeFor(candidate) {
  if (["Guide", "FAQ", "Comparison", "Roundup", "Review", "Shopping"].includes(candidate.contentType)) return candidate.contentType;
  const topic = normalize(candidate.canonicalTopic);
  if (topic.includes(" vs ")) return "Comparison";
  if (topic.startsWith("best ")) return "Roundup";
  if (/^(what|why|how|does|do|can|is|are|when|which|should)\b/.test(topic)) return "FAQ";
  return "Guide";
}

function rankingFor(candidate) {
  const score = Math.max(1, Math.min(5, Number(candidate.opportunityScore ?? candidate.score) || 3));
  return {
    opportunityScore: score,
    priorityTier: candidate.priorityTier ?? candidate.tier ?? (score >= 4 ? "green" : score === 3 ? "yellow" : "red"),
    demandEstimate: candidate.demandEstimate ?? candidate.demand ?? "Medium",
    difficultyEstimate: candidate.difficultyEstimate ?? candidate.difficulty ?? "Medium",
    priorityReason: candidate.priorityReason ?? candidate.rationale ?? candidate.reasonNotCovered ?? "Distinct page intent retained after independent research and cannibalization review.",
  };
}

const [audits, library, dailyResearch] = await Promise.all([
  Promise.all(auditPaths.map(async (path) => JSON.parse(await fs.readFile(path, "utf8")))),
  fs.readFile(libraryPath, "utf8").then(JSON.parse),
  fs.readFile(dailyPath, "utf8").then(JSON.parse),
]);

const existingRecords = library.keywords.filter((record) => record.dailyRunId !== previousRunId);
const existingByPhrase = new Map();
for (const record of existingRecords) {
  existingByPhrase.set(`${record.categoryId}|${normalize(record.keyword)}`, record);
  for (const alias of record.aliases ?? []) existingByPhrase.set(`${record.categoryId}|${normalize(alias)}`, record);
}

const acceptedBySignature = new Map();
const aliasMerges = new Map();
let rejectedAsCovered = audits.reduce((total, audit) => total + (audit.rejectedAsCovered?.length ?? 0), 0);

for (const candidate of audits.flatMap((audit) => audit.candidates ?? [])) {
  if (!candidate.categoryId || ["brands", "retailers", "cooling"].includes(candidate.categoryId)) continue;
  const canonicalTopic = normalize(candidate.canonicalTopic ?? candidate.keyword);
  if (!canonicalTopic) continue;
  const aliases = [...new Set((candidate.aliases ?? []).map(normalize).filter(Boolean))];
  const collision = [canonicalTopic, ...aliases]
    .map((phrase) => existingByPhrase.get(`${candidate.categoryId}|${phrase}`))
    .find(Boolean);

  if (collision) {
    const key = `${collision.categoryId}|${collision.keyword}`;
    const current = aliasMerges.get(key) ?? { record: collision, aliases: new Set() };
    current.aliases.add(canonicalTopic);
    aliases.forEach((alias) => current.aliases.add(alias));
    aliasMerges.set(key, current);
    rejectedAsCovered += 1;
    continue;
  }

  const candidateSignature = `${candidate.categoryId}|${signature(canonicalTopic)}`;
  const existingCandidate = acceptedBySignature.get(candidateSignature);
  if (existingCandidate) {
    existingCandidate.aliases.push(canonicalTopic, ...aliases);
    existingCandidate.aliases = [...new Set(existingCandidate.aliases)];
    rejectedAsCovered += 1;
    continue;
  }

  const rankingOverride = rankingFor(candidate);
  acceptedBySignature.set(candidateSignature, {
    keyword: canonicalTopic,
    categoryId: candidate.categoryId,
    subcategory: candidate.subcategory ?? "Independent P2–P5 audit",
    contentType: contentTypeFor(candidate),
    intent: candidate.intent ?? "Informational",
    specialistReview: Boolean(candidate.specialistReview),
    rationale: rankingOverride.priorityReason,
    aliases,
    sourceUrls: candidate.sourceUrls ?? [],
    rankingOverride,
  });
}

const accepted = [...acceptedBySignature.values()];
const mergeEntries = [...aliasMerges.values()].map(({ record, aliases }) => ({
  keyword: record.keyword,
  categoryId: record.categoryId,
  subcategory: record.subcategory,
  contentType: record.contentType,
  intent: record.intent,
  specialistReview: Boolean(record.specialistReview),
  rationale: record.priorityReason,
  aliases: [...aliases].filter((alias) => alias !== record.keyword),
  sourceUrls: record.sourceUrls ?? [],
}));

dailyResearch.runs = (dailyResearch.runs ?? []).filter((run) => ![previousRunId, runId].includes(run.id));
dailyResearch.runs.push({
  id: runId,
  date: "2026-07-21",
  sequence: 2,
  summary: `Four independent bounded audits reviewed P2–P5 categories and approved ${accepted.length} new canonical pages after merging ${mergeEntries.length} proposals into existing pages and rejecting or consolidating ${rejectedAsCovered} repetitive, covered, or section-level ideas. Cooling was handled separately; brands and retailers remained frozen.`,
  categoriesAdded: [],
  keywords: [...accepted, ...mergeEntries],
});

await fs.writeFile(dailyPath, `${JSON.stringify(dailyResearch, null, 2)}\n`);
console.log(JSON.stringify({ proposed: audits.reduce((total, audit) => total + audit.candidates.length, 0), accepted: accepted.length, aliasMerges: mergeEntries.length, rejectedOrCovered: rejectedAsCovered }, null, 2));
