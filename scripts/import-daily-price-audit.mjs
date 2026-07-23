import fs from "node:fs/promises";

const dailyPath = new URL("../data/daily-keyword-additions.json", import.meta.url);
const runId = "2026-07-23-price-sales-financing-audit-01";
const financeSources = [
  "https://www.consumerfinance.gov/ask-cfpb/what-is-a-buy-now-pay-later-bnpl-loan-en-2119/",
  "https://www.consumerfinance.gov/ask-cfpb/will-a-buy-now-pay-later-bnpl-loan-impact-my-credit-scores-en-2117/",
  "https://www.consumerfinance.gov/ask-cfpb/i-got-a-credit-card-promising-no-interest-for-a-purchase-if-i-pay-in-full-within-12-months-how-does-this-work-en-40/",
];
const salesSources = [
  "https://www.sleepfoundation.org/mattress-sales",
  "https://www.consumerreports.org/home-garden/mattresses/haggling-for-a-mattress-could-help-you-save-a2352446856/",
  "https://www.goodbed.com/guides/mattress-prices/",
];
const allSources = [...financeSources, ...salesSources];

const topics = [
  ["mattress financing hard vs soft credit check", ["does mattress financing use a hard credit check", "does mattress financing use a soft credit check"], "Financing applications", "Comparison", 4, true, financeSources],
  ["does mattress financing affect your credit score", ["can financing a mattress hurt your credit", "does buying a mattress on payments affect credit"], "Financing and credit", "FAQ", 5, true, financeSources],
  ["what happens if you miss a mattress financing payment", ["missed mattress payment consequences", "late mattress financing payment"], "Financing problems", "FAQ", 5, true, financeSources],
  ["how much should you pay monthly to avoid deferred interest on mattress financing", ["mattress financing minimum payment vs payoff amount", "monthly payment to pay off mattress before deferred interest ends"], "Deferred interest", "Guide", 5, true, financeSources],
  ["can you pay off mattress financing early", ["early payoff mattress financing", "does mattress financing have a prepayment penalty"], "Financing repayment", "FAQ", 4, true, financeSources],
  ["how mattress financing refunds work after a return", ["returning a financed mattress", "what happens to mattress financing after a refund"], "Financed returns", "Guide", 5, true, financeSources],
  ["mattress financing vs credit card", ["credit card or mattress financing", "store financing vs credit card for a mattress"], "Financing comparisons", "Comparison", 4, true, financeSources],
  ["mattress financing vs buy now pay later", ["bnpl vs store financing for a mattress", "buy now pay later or mattress payment plan"], "Financing comparisons", "Comparison", 4, true, financeSources],
  ["mattress financing vs personal loan", ["personal loan or mattress financing", "best way to borrow money for a mattress"], "Financing comparisons", "Comparison", 3, true, financeSources],
  ["mattress financing application denied what next", ["denied mattress financing options", "what to do after mattress financing denial"], "Financing applications", "Guide", 4, true, financeSources],
  ["does mattress financing require a down payment", ["down payment for mattress financing", "can you finance a mattress with no money down"], "Financing applications", "FAQ", 4, true, financeSources],
  ["no credit check mattress financing risks", ["is no credit check mattress financing safe", "no credit check mattress payment plan explained"], "Financing risks", "Guide", 4, true, financeSources],
  ["how to tell if a mattress sale is real", ["fake mattress sale signs", "is this mattress discount a real deal"], "Sale verification", "Guide", 5, false, salesSources],
  ["can you negotiate mattress price", ["how to negotiate mattress price", "do mattress stores negotiate prices"], "Price negotiation", "Guide", 5, false, salesSources],
  ["mattress msrp vs actual selling price", ["mattress list price vs sale price", "why mattress msrp is higher than the real price"], "Mattress pricing", "Comparison", 4, false, salesSources],
  ["is a floor model mattress worth the discount", ["how much discount should a floor model mattress have", "floor sample mattress discount worth it"], "Clearance and floor models", "FAQ", 4, false, salesSources],
  ["prime day mattress sale", ["amazon prime day mattress deals", "best mattress deals on prime day"], "Seasonal sales", "Guide", 4, false, salesSources],
  ["veterans day mattress sale", ["veterans day mattress deals", "best mattress sales for veterans day"], "Seasonal sales", "Guide", 3, false, salesSources],
  ["can mattress discounts be combined", ["can you stack mattress coupons and sales", "mattress coupon plus sale price"], "Discount rules", "FAQ", 4, false, salesSources],
  ["mattress sale freebies vs cash discount", ["free bedding bundle or lower mattress price", "mattress accessories bundle vs price discount"], "Discount comparisons", "Comparison", 3, false, salesSources],
  ["mattress price adjustment after purchase", ["mattress went on sale after I bought it", "can you get a mattress sale price refunded after purchase"], "Post-purchase pricing", "Guide", 4, false, salesSources],
];

const keywords = topics.map(([keyword, aliases, subcategory, contentType, opportunityScore, specialistReview, sourceUrls]) => {
  const priorityReason = opportunityScore === 5
    ? "Strong standalone mattress purchase or financing problem with direct decision-stage value."
    : opportunityScore === 4
      ? "Distinct mattress pricing or financing question with a credible shopping and lead path."
      : "Useful lower-demand supporting page retained after current-source and cannibalization review.";
  return {
    keyword,
    categoryId: "price",
    subcategory,
    contentType,
    intent: contentType === "Comparison" ? "Commercial Investigation" : "Informational",
    specialistReview,
    rationale: priorityReason,
    aliases,
    aliasesAreExact: true,
    sourceUrls,
    rankingOverride: {
      opportunityScore,
      priorityTier: opportunityScore >= 4 ? "green" : "yellow",
      demandEstimate: opportunityScore === 5 ? "Medium" : "Low",
      difficultyEstimate: opportunityScore === 5 ? "Medium" : "Low",
      priorityReason,
    },
  };
});

const rejected = [
  ["how much does mattress financing cost", "Covered by mattress financing, APR, and deferred-interest pages."],
  ["best mattress financing", "Provider-style roundup would drift into the frozen retailer strategy."],
  ["mattress financing interest rate", "Section within the existing mattress financing page rather than a separate durable intent."],
  ["interest free mattress financing", "Covered by the existing interest-free versus deferred-interest comparison."],
  ["mattress financing with no interest", "Exact intent duplicate of interest-free mattress financing."],
  ["mattress financing for 12 months", "Term-length modifier, not a distinct editorial problem."],
  ["mattress financing for 24 months", "Term-length modifier, not a distinct editorial problem."],
  ["mattress financing calculator", "Tool intent requires a real calculator rather than a standard editorial page."],
  ["mattress price match exclusions", "Belongs inside the existing mattress price-match policy page."],
  ["mattress sale price history by brand", "Would reopen the frozen brand strategy."],
  ["memorial day vs labor day mattress sale", "Seasonal comparison is sufficiently answered by the existing sale calendar."],
  ["black friday vs cyber monday mattress sale", "Existing separate event pages and sale calendar cover the decision."],
  ["new year mattress sale", "Current U.S. evidence was weaker than established holiday sale intents."],
  ["mattress delivery fee", "Covered by the Delivery, Trials, Returns & Warranties category."],
  ["mattress disposal fee", "Covered by mattress removal and disposal pages."],
];

const dailyResearch = JSON.parse(await fs.readFile(dailyPath, "utf8"));
dailyResearch.runs = (dailyResearch.runs ?? []).filter((run) => run.id !== runId);
dailyResearch.runs.push({
  id: runId,
  date: "2026-07-23",
  sequence: 1,
  summary: "Dedicated Price, Sales & Financing audit checked six current U.S. sources and accepted 21 distinct canonical pages. It retained 42 exact wording variants as aliases, rejected 15 covered or weak ideas, and kept brands and retailers frozen. The category is substantially improved but not yet declared practically saturated.",
  categoriesAdded: [],
  keywords,
  audit: {
    category: "Price, Sales & Financing",
    sourcesChecked: allSources,
    aliasesMerged: keywords.reduce((total, keyword) => total + keyword.aliases.length, 0),
    rejected: rejected.map(([keyword, reason]) => ({ keyword, reason })),
    saturationStatement: "Not yet practically saturated: financing edge cases and sale-verification intent are now well covered, but one later evidence-led follow-up may still find defensible gaps.",
  },
});

await fs.writeFile(dailyPath, `${JSON.stringify(dailyResearch, null, 2)}\n`);
console.log(JSON.stringify({
  category: "Price, Sales & Financing",
  acceptedPages: keywords.length,
  aliasesMerged: keywords.reduce((total, keyword) => total + keyword.aliases.length, 0),
  rejected: rejected.length,
  sourcesChecked: allSources.length,
}, null, 2));
