import fs from "node:fs/promises";

const library = JSON.parse(await fs.readFile(new URL("../public/data/keyword-library.json", import.meta.url)));
const updates = JSON.parse(await fs.readFile(new URL("../public/data/update-log.json", import.meta.url)));
const errors = [];
const canonicalByCategory = new Map();

function normalize(value) {
  return value.toLowerCase().replace(/[–—]/g, "-").replace(/\ban euro\b/g, "a euro").replace(/\s+/g, " ").trim();
}

function withArticle(base) {
  if (/^(a|an|the)\s/.test(base)) return base;
  if (/^euro\b/.test(base)) return `a ${base}`;
  return /^[aeiou]|^rv\b/.test(base) ? `an ${base}` : `a ${base}`;
}

function canonicalize(value) {
  if (/^how much does .+ cost$/.test(value) || value.includes(" vs ")) return value;
  const pluralGoodFor = value.match(/^are (.+?) mattresses (good for .+)$/);
  if (pluralGoodFor) return `is ${withArticle(`${pluralGoodFor[1]} mattress`)} ${pluralGoodFor[2]}`;
  const pluralQuestion = value.match(/^do (.+?) mattresses (sag|sleep hot)$/);
  if (pluralQuestion) return `does ${withArticle(`${pluralQuestion[1]} mattress`)} ${pluralQuestion[2]}`;
  const weightLimit = value.match(/^what is the weight limit for (?:a|an) (.+)$/);
  if (weightLimit) return `${weightLimit[1]} weight limit`;
  const bestQuestion = value.match(/^what mattress is best for (.+)$/);
  if (bestQuestion) return `best mattress for ${bestQuestion[1]}`;
  const pluralBest = value.match(/^best mattresses (.+)$/);
  if (pluralBest) return `best mattress ${pluralBest[1]}`;
  const rules = [
    [/^(.+?) (?:price|cost|pricing)$/, (match) => `how much does ${withArticle(match[1])} cost`],
    [/^(.+?) (?:lifespan|longevity)$/, (match) => `how long does ${withArticle(match[1])} last`],
    [/^(.+?) review$/, (match) => `${match[1]} reviews`],
  ];
  for (const [pattern, replace] of rules) {
    const match = value.match(pattern);
    if (match) return replace(match);
  }
  return value;
}

function equivalentKey(value) {
  const normalized = canonicalize(normalize(value));
  const comparison = normalized.match(/^(.+?) vs (.+)$/);
  if (comparison) return comparison.slice(1).map((side) => side.trim()).sort().join(" vs ");
  return normalized;
}

if (library.totalKeywords !== library.keywords.length) errors.push("Total keyword count does not match records");

for (const record of library.keywords) {
  const key = `${record.categoryId}|${record.keyword}`;
  if (canonicalByCategory.has(key)) errors.push(`Duplicate canonical page: ${record.keyword}`);
  canonicalByCategory.set(key, record);
  if (![1, 2, 3, 4, 5].includes(record.opportunityScore)) errors.push(`Invalid score: ${record.keyword}`);
  if (!["green", "yellow", "red"].includes(record.priorityTier)) errors.push(`Invalid tier: ${record.keyword}`);
  if (!record.priorityReason) errors.push(`Missing ranking rationale: ${record.keyword}`);
}

for (const record of library.keywords) {
  for (const alias of record.aliases ?? []) {
    const collision = canonicalByCategory.get(`${record.categoryId}|${alias.toLowerCase().trim()}`);
    if (collision && collision.id !== record.id) errors.push(`Alias cannibalizes canonical page: ${alias}`);
    if (equivalentKey(alias) !== equivalentKey(record.keyword)) errors.push(`Broad alias should be a separate keyword: ${alias} -> ${record.keyword}`);
  }
}

const priorityOne = library.categories.filter((category) => category.priority === 1);
if (priorityOne.length !== 10) errors.push(`Expected 10 P1 categories, found ${priorityOne.length}`);
if (priorityOne.some((category) => category.count === 0)) errors.push("A P1 category is empty");
if (library.categories.find((category) => category.id === "brands")?.count !== 1068) errors.push("Frozen brand inventory changed");
if (library.keywords.some((record) => /how much does a how much|test method|\bacetate\b/.test(record.keyword))) errors.push("A forbidden or malformed page topic remains");
if (library.keywords.some((record) => /\b(price|pricing|cost)$/.test(record.keyword) && !/^how much does/.test(record.keyword) && !record.keyword.includes(" vs "))) errors.push("Raw price/cost variants remain unclustered");
if (!updates.runs.every((run) => run.keywords.every((record) => record.opportunityScore && record.priorityTier))) errors.push("An update topic lacks ranking data");

for (const requiredKeyword of ["memory foam vs latex euro top", "fiberfill vs foam euro top", "what is inside a euro top"]) {
  if (!library.keywords.some((record) => record.categoryId === "euro-top" && record.keyword === requiredKeyword)) {
    errors.push(`Missing separate Euro Top keyword: ${requiredKeyword}`);
  }
}

if (errors.length) throw new Error(errors.join("\n"));

console.log(JSON.stringify({
  totalPages: library.totalKeywords,
  categories: library.categories.length,
  priorityOneCategories: priorityOne.length,
  aliases: library.keywords.reduce((total, record) => total + (record.aliases?.length ?? 0), 0),
  latestPagesAdded: updates.runs[0]?.keywordsAdded ?? 0,
  brandsFrozen: 1068,
}, null, 2));
