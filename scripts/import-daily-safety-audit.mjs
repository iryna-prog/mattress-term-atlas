import fs from "node:fs/promises";

const dailyPath = new URL("../data/daily-keyword-additions.json", import.meta.url);
const runId = "2026-07-24-safety-certifications-audit-01";
const sources = {
  cpscRules: "https://www.cpsc.gov/FAQ/Mattresses-Mattress-Pads-Mattress-Sets",
  cpscRecalls: "https://www.cpsc.gov/Recalls",
  certipur: "https://certipur.us/about-the-certification/frequently-asked-questions/",
  greenguard: "https://www.ul.com/services/ul-greenguard-certification",
  oekoTex: "https://www.oeko-tex.com/en/our-standards/oeko-tex-standard-100",
  gots: "https://global-standard.org/images/resource-library/documents/standard-and-manual/Manual_for_the_Implementation_of_GOTS_V_7.0.pdf",
  ftc: "https://www.ftc.gov/business-guidance/blog/2017/09/ftc-says-company-didnt-have-support-organic-mattress-claims",
};

const topics = [
  ["how to check if a mattress has been recalled", ["mattress recall lookup", "mattress recall search"], "Mattress recalls", "Guide", 5, [sources.cpscRecalls]],
  ["what to do if your mattress is recalled", ["recalled mattress what to do", "mattress recall next steps"], "Mattress recalls", "Guide", 5, [sources.cpscRecalls]],
  ["16 cfr 1632 vs 1633 mattress standards", ["difference between 16 cfr 1632 and 1633", "cigarette ignition vs open flame mattress testing"], "Federal flammability standards", "Comparison", 4, [sources.cpscRules]],
  ["do imported mattresses follow u.s. flammability standards", ["u.s. safety standards for imported mattresses"], "Federal flammability standards", "FAQ", 4, [sources.cpscRules]],
  ["are futon mattresses covered by federal flammability standards", ["futon mattress flammability requirements"], "Federal flammability standards", "FAQ", 3, [sources.cpscRules]],
  ["are air mattresses covered by federal flammability standards", ["air mattress flammability requirements"], "Federal flammability standards", "FAQ", 3, [sources.cpscRules]],
  ["how to verify certipur-us foam in a mattress", ["certipur-us directory mattress lookup", "certipur mattress verification"], "Certification verification", "Guide", 5, [sources.certipur]],
  ["certipur-us vs greenguard gold mattress certification", ["greenguard gold vs certipur-us mattress certification"], "Certification comparisons", "Comparison", 5, [sources.certipur, sources.greenguard]],
  ["certipur-us vs oeko-tex mattress certification", ["oeko-tex vs certipur-us mattress certification"], "Certification comparisons", "Comparison", 4, [sources.certipur, sources.oekoTex]],
  ["certipur-us vs gots mattress certification", ["gots vs certipur-us mattress certification"], "Certification comparisons", "Comparison", 4, [sources.certipur, sources.gots]],
  ["does certipur-us mean a mattress is flame retardant free", ["certipur-us flame retardant requirements"], "Certification limits", "FAQ", 4, [sources.certipur]],
  ["greenguard vs greenguard gold mattress", ["greenguard gold difference for mattresses"], "Certification comparisons", "Comparison", 4, [sources.greenguard]],
  ["what does greenguard test in a mattress", ["greenguard mattress testing explained"], "Certification scope", "Guide", 4, [sources.greenguard]],
  ["how to verify a greenguard certified mattress", ["greenguard mattress certification lookup"], "Certification verification", "Guide", 5, [sources.greenguard]],
  ["does greenguard gold mean a mattress is voc free", ["greenguard gold mattress voc free claim"], "Certification limits", "FAQ", 4, [sources.greenguard]],
  ["greenguard gold vs oeko-tex mattress certification", ["oeko-tex vs greenguard gold mattress certification"], "Certification comparisons", "Comparison", 4, [sources.greenguard, sources.oekoTex]],
  ["how to verify an oeko-tex mattress certificate", ["oeko-tex mattress lookup", "check oeko-tex mattress certificate number"], "Certification verification", "Guide", 5, [sources.oekoTex]],
  ["oeko-tex vs gots mattress certification", ["gots vs oeko-tex mattress certification"], "Certification comparisons", "Comparison", 4, [sources.oekoTex, sources.gots]],
  ["how to verify a gots certified mattress", ["gots mattress lookup", "check gots mattress certification"], "Certification verification", "Guide", 5, [sources.gots]],
  ["gots organic vs made with organic mattress label", ["gots organic label vs made with organic label mattress"], "Organic certification labels", "Comparison", 4, [sources.gots]],
  ["does gots certify a whole mattress or only the fabric", ["gots certified mattress vs gots certified components"], "Certification scope", "FAQ", 5, [sources.gots]],
  ["how to evaluate organic mattress claims", ["how to verify organic mattress claims"], "Mattress marketing claims", "Guide", 5, [sources.ftc]],
  ["what does plant-based foam mean in a mattress", ["plant based mattress foam claims explained"], "Mattress marketing claims", "Guide", 4, [sources.ftc]],
  ["voc-free vs low-voc mattress claims", ["low-voc vs zero-voc mattress", "no-voc vs low-voc mattress"], "Emissions claims", "Comparison", 5, [sources.ftc, sources.greenguard]],
  ["how to evaluate chemical-free mattress claims", ["how to verify chemical-free mattress claims"], "Mattress marketing claims", "Guide", 4, [sources.ftc]],
  ["how to tell if a mattress certification is independent", ["independent vs self-awarded mattress certification"], "Certification verification", "Guide", 5, [sources.ftc]],
];

const keywords = topics.map(([keyword, aliases, subcategory, contentType, opportunityScore, sourceUrls]) => {
  const priorityReason = opportunityScore === 5
    ? "Strong safety or certification decision with a direct mattress verification, comparison, or replacement path."
    : opportunityScore === 4
      ? "Distinct certification or claims question that helps shoppers assess mattress evidence before buying."
      : "Narrow but defensible federal-safety question retained after source and cannibalization review.";
  return {
    keyword,
    categoryId: "safety",
    subcategory,
    contentType,
    intent: contentType === "Comparison" ? "Commercial Investigation" : "Informational",
    specialistReview: true,
    rationale: priorityReason,
    aliases,
    aliasesAreExact: true,
    sourceUrls,
    rankingOverride: {
      opportunityScore,
      priorityTier: opportunityScore >= 4 ? "green" : "yellow",
      demandEstimate: opportunityScore === 5 ? "Medium" : "Low",
      difficultyEstimate: opportunityScore >= 4 ? "Medium" : "Low",
      priorityReason,
    },
  };
});

const aliasMerges = [
  ["how to check if a mattress meets federal flammability standards", "mattress flammability standard"],
  ["what does certipur-us certification cover in a mattress", "certipur-us certified mattress"],
  ["what does oeko-tex standard 100 cover in a mattress", "oeko-tex certified mattress"],
  ["natural vs organic mattress claims", "organic mattress vs natural mattress"],
  ["cigarette ignition vs open flame mattress testing", "16 cfr 1632 vs 1633 mattress standards"],
];

const rejected = [
  ["can you resell or donate a recalled mattress", "Narrow disposal subsection whose legal remedy varies by recall."],
  ["are mattress toppers covered by federal flammability standards", "Accessory-specific exclusion is a section, not a durable mattress-shopping page."],
  ["are mattress pads covered by federal flammability standards", "Accessory-specific regulatory FAQ has weak mattress purchase intent."],
  ["can a mattress contain both certified and uncertified foam", "Useful verification caveat, but better handled within the CertiPUR-US verification page."],
  ["does certipur-us certify latex foam", "Single-answer scope question belongs within the CertiPUR-US guide."],
  ["does certipur-us test mattress durability", "Misframes foam testing as whole-mattress durability and is section-level."],
  ["which oeko-tex product class applies to mattresses", "Depends on certified component and intended contact; belongs in the verification guide."],
  ["what does non-toxic mattress mean", "Cannibalizes existing non-toxic and chemical-free mattress pages."],
  ["how to spot misleading mattress certification seals", "Covered by the independent-certification verification page."],
];

const dailyResearch = JSON.parse(await fs.readFile(dailyPath, "utf8"));
const organicRun = dailyResearch.runs.find((run) => run.id === "2026-07-21-p2-p5-independent-audit-02");
const organicKeyword = organicRun?.keywords.find((entry) => entry.keyword === "organic mattress vs natural mattress");
if (organicKeyword) {
  organicKeyword.aliasesAreExact = true;
  organicKeyword.aliases = [...new Set([...(organicKeyword.aliases ?? []), "natural vs organic mattress claims"])];
}

dailyResearch.runs = (dailyResearch.runs ?? []).filter((run) => run.id !== runId);
dailyResearch.runs.push({
  id: runId,
  date: "2026-07-24",
  sequence: 1,
  summary: "Dedicated Mattress Safety & Certifications audit checked six authoritative source families across seven official pages and accepted 26 distinct canonical pages. It merged 5 exact intents, rejected 9 covered or section-level ideas, kept brands and retailers frozen, and flagged every accepted page for specialist review. The category is practically saturated under current evidence.",
  categoriesAdded: [],
  keywords,
  audit: {
    category: "Mattress Safety & Certifications",
    sourcesChecked: Object.values(sources),
    sourceFamiliesChecked: 6,
    aliasesMerged: aliasMerges.length,
    aliasMerges: aliasMerges.map(([alias, canonical]) => ({ alias, canonical })),
    rejected: rejected.map(([keyword, reason]) => ({ keyword, reason })),
    saturationStatement: "Practically saturated for distinct mattress safety and certification page intent under current evidence; reopen only for a new regulation, recall pattern, certification scheme, affected mattress type, SERP, or Search Console query.",
  },
});

await fs.writeFile(dailyPath, `${JSON.stringify(dailyResearch, null, 2)}\n`);
console.log(JSON.stringify({
  category: "Mattress Safety & Certifications",
  acceptedPages: keywords.length,
  aliasesMerged: aliasMerges.length,
  rejected: rejected.length,
  sourceFamiliesChecked: 6,
}, null, 2));
