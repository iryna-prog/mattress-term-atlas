import fs from "node:fs/promises";

const library = JSON.parse(await fs.readFile(new URL("../public/data/keyword-library.json", import.meta.url)));
const updates = JSON.parse(await fs.readFile(new URL("../public/data/update-log.json", import.meta.url)));
const errors = [];
const canonicalByCategory = new Map();

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
  }
}

const priorityOne = library.categories.filter((category) => category.priority === 1);
if (priorityOne.length !== 10) errors.push(`Expected 10 P1 categories, found ${priorityOne.length}`);
if (priorityOne.some((category) => category.count === 0)) errors.push("A P1 category is empty");
if (library.categories.find((category) => category.id === "brands")?.count !== 1068) errors.push("Frozen brand inventory changed");
if (library.keywords.some((record) => /how much does a how much|test method|\bacetate\b/.test(record.keyword))) errors.push("A forbidden or malformed page topic remains");
if (library.keywords.some((record) => /\b(price|pricing|cost)$/.test(record.keyword) && !/^how much does/.test(record.keyword))) errors.push("Raw price/cost variants remain unclustered");
if (!updates.runs.every((run) => run.keywords.every((record) => record.opportunityScore && record.priorityTier))) errors.push("An update topic lacks ranking data");

if (errors.length) throw new Error(errors.join("\n"));

console.log(JSON.stringify({
  totalPages: library.totalKeywords,
  categories: library.categories.length,
  priorityOneCategories: priorityOne.length,
  aliases: library.keywords.reduce((total, record) => total + (record.aliases?.length ?? 0), 0),
  latestPagesAdded: updates.runs[0]?.keywordsAdded ?? 0,
  brandsFrozen: 1068,
}, null, 2));
