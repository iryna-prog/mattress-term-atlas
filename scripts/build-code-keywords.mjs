import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const workerA = readJson("work/code-research-a.json");
const workerB = readJson("work/code-research-b.json").records;
const workerCCategories = readJson("work/code-research-c.json").categories;
const workerC = Object.values(workerCCategories).flat();
let input = [...workerA, ...workerB, ...workerC];
const categoryOrder = ["ai-coding-tools", "vibe-coding", "prompting-code", "code-generation", "debugging-errors", "agents-automation"];
const metricValues = new Set(["High", "Medium", "Low"]);
const forcedMerges = [
  ["how to give an ai coding agent context", "how to give AI context for coding"],
  ["how to provide repository context to an AI coding assistant", "how to give an ai agent repository context"],
  ["how to review ai-generated code", "how to evaluate AI generated code"],
  ["how does vibe coding work", "what is vibe coding"],
];
const categoryCorrections = new Map([
  ["how to keep an ai coding agent on scope", "agents-automation"],
  ["how to understand ai-generated code", "ai-coding-tools"],
]);

for (const record of input) {
  const correctedCategory = categoryCorrections.get(record.keyword.toLowerCase());
  if (correctedCategory) record.categoryId = correctedCategory;
}
for (const [loserKeyword, winnerKeyword] of forcedMerges) {
  const loser = input.find((record) => record.keyword.toLowerCase() === loserKeyword.toLowerCase());
  const winner = input.find((record) => record.keyword.toLowerCase() === winnerKeyword.toLowerCase());
  if (!loser || !winner) throw new Error(`Missing forced merge: ${loserKeyword} -> ${winnerKeyword}`);
  winner.aliases = [...new Set([...(winner.aliases ?? []), loser.keyword, ...(loser.aliases ?? [])])];
  winner.sources = [...new Set([...(winner.sources ?? []), ...(loser.sources ?? [])])];
  input = input.filter((record) => record !== loser);
}

function normalizeIntent(value) {
  let normalized = value
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/\bversus\b/g, "vs")
    .replace(/\b(pricing|prices|costs|cost)\b/g, "price")
    .replace(/\b(top)\b/g, "best")
    .replace(/\b(alternative)\b/g, "alternatives")
    .replace(/\btools\b/g, "tool")
    .replace(/\bapps\b/g, "app")
    .replace(/\bagents\b/g, "agent")
    .replace(/\bprompts\b/g, "prompt")
    .replace(/\bworkflows\b/g, "workflow")
    .replace(/\bfor beginners\b/g, "beginner")
    .replace(/\bbeginner'?s guide to\b/g, "")
    .replace(/\bwhat is an?\b/g, "")
    .replace(/\bwhat is\b/g, "")
    .replace(/\bexplained\b/g, "")
    .replace(/[^a-z0-9+.#\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const comparison = normalized.match(/^(.+?)\s+vs\s+(.+)$/);
  if (comparison) normalized = comparison.slice(1).map((part) => part.trim()).sort().join(" vs ");
  return normalized;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}

function demandScore(value) {
  return { High: 3, Medium: 2, Low: 1 }[value] ?? 0;
}

for (const [index, record] of input.entries()) {
  if (!record || typeof record.keyword !== "string" || !record.keyword.trim()) throw new Error(`Missing keyword at ${index}`);
  if (!categoryOrder.includes(record.categoryId)) throw new Error(`Unexpected category ${record.categoryId}`);
  if (!Number.isInteger(record.rank) || record.rank < 1 || record.rank > 5) throw new Error(`Invalid rank for ${record.keyword}`);
  for (const field of ["volume", "difficulty", "demand"]) {
    if (!metricValues.has(record[field])) throw new Error(`Invalid ${field} for ${record.keyword}`);
  }
}

const canonicalByKey = new Map();
const mergedGroups = [];

for (const rawRecord of input) {
  const candidate = {
    ...rawRecord,
    keyword: rawRecord.keyword.trim(),
    aliases: [...new Set((rawRecord.aliases ?? []).map((alias) => alias.trim()).filter(Boolean))],
    sources: [...new Set(rawRecord.sources ?? [])],
  };
  const keys = [candidate.keyword, ...candidate.aliases].map(normalizeIntent).filter(Boolean);
  const existing = keys.map((key) => canonicalByKey.get(key)).find(Boolean);
  if (!existing) {
    const record = { ...candidate };
    for (const key of keys) canonicalByKey.set(key, record);
    continue;
  }
  const candidateWins = candidate.rank > existing.rank
    || candidate.rank === existing.rank && demandScore(candidate.demand) > demandScore(existing.demand)
    || candidate.rank === existing.rank && candidate.demand === existing.demand && candidate.keyword.length < existing.keyword.length;
  const winner = candidateWins ? candidate : existing;
  const loser = candidateWins ? existing : candidate;
  winner.aliases = [...new Set([...winner.aliases, loser.keyword, ...loser.aliases].filter((alias) => normalizeIntent(alias) !== normalizeIntent(winner.keyword)))];
  winner.sources = [...new Set([...winner.sources, ...loser.sources])];
  if (candidateWins) {
    for (const [key, record] of canonicalByKey.entries()) if (record === existing) canonicalByKey.set(key, winner);
  }
  for (const key of [...keys, normalizeIntent(loser.keyword), ...loser.aliases.map(normalizeIntent)]) canonicalByKey.set(key, winner);
  mergedGroups.push({ canonical: winner.keyword, merged: loser.keyword });
}

const uniqueRecords = [...new Set(canonicalByKey.values())];
const usedIds = new Set();
const output = uniqueRecords.map((record) => {
  const baseId = `${record.categoryId}-${slugify(record.keyword)}`;
  let id = baseId;
  let suffix = 2;
  while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
  usedIds.add(id);
  return {
    id,
    categoryId: record.categoryId,
    keyword: record.keyword,
    subcategory: record.subcategory,
    rank: record.rank,
    tier: record.rank >= 4 ? "green" : record.rank === 3 ? "yellow" : "red",
    volume: record.volume,
    difficulty: record.difficulty,
    demand: record.demand,
    specialistReview: /\b(security|secure|vulnerability|privacy|compliance|license|legal|sandbox|secret|prompt injection|data leak)\b/i.test(record.keyword),
    aliases: record.aliases,
    rationale: record.rationale,
    sourceUrls: record.sources,
  };
}).sort((left, right) => categoryOrder.indexOf(left.categoryId) - categoryOrder.indexOf(right.categoryId) || right.rank - left.rank || left.keyword.localeCompare(right.keyword));

const canonicalKeys = new Set();
for (const record of output) {
  const key = normalizeIntent(record.keyword);
  if (canonicalKeys.has(key)) throw new Error(`Duplicate canonical intent: ${record.keyword}`);
  canonicalKeys.add(key);
}

const counts = Object.fromEntries(categoryOrder.map((categoryId) => [categoryId, output.filter((record) => record.categoryId === categoryId).length]));
fs.writeFileSync(path.join(root, "public/data/code-keywords.json"), `${JSON.stringify(output, null, 2)}\n`);
fs.writeFileSync(path.join(root, "work/code-keyword-audit.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  inputCount: input.length + forcedMerges.length,
  canonicalCount: output.length,
  aliasesMerged: mergedGroups.length + forcedMerges.length,
  counts,
  mergedGroups: [...forcedMerges.map(([merged, canonical]) => ({ canonical, merged })), ...mergedGroups],
}, null, 2)}\n`);
console.log(JSON.stringify({ input: input.length + forcedMerges.length, canonical: output.length, aliasesMerged: mergedGroups.length + forcedMerges.length, counts }, null, 2));
