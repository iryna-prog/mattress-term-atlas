export interface CreditCategory {
  id: string;
  name: string;
  description: string;
  priority: number;
  suggested?: boolean;
}

export interface CreditKeyword {
  id: string;
  categoryId: string;
  keyword: string;
  subcategory: string;
  rank: 1 | 2 | 3 | 4 | 5;
  tier: "green" | "yellow" | "red";
  demand: "High" | "Medium" | "Low";
  difficulty: "High" | "Medium" | "Low";
  specialistReview: boolean;
  sourceUrls: string[];
}

export const creditCategories: CreditCategory[] = [
  { id: "credit-repair-exact", name: "Credit Repair Keywords", priority: 1, description: "Every keyword containing both “credit” and a repair word—repair, repairs, repairing, or repaired—regardless of word order." },
  { id: "credit-repair", name: "Credit Repair Related", priority: 1, description: "Closely related fixing, dispute, rebuilding, and repair-help pages that do not contain the exact phrase “credit repair.”" },
  { id: "specialty-consumer-reports", name: "Specialty Consumer Reports", priority: 1, suggested: true, description: "A high-fit expansion for fixing ChexSystems, Innovis, LexisNexis, SageStream, NCTUE, tenant-screening, employment, and insurance report errors." },
  { id: "credit-reports-bureaus", name: "Credit Reports & Bureaus", priority: 2, description: "Experian, Equifax, TransUnion, Innovis, reports, freezes, alerts, and bureau procedures." },
  { id: "credit-scores", name: "Credit Scores", priority: 2, description: "Score ranges, scoring factors, score changes, FICO models, and score improvement." },
  { id: "debt-collections", name: "Debt & Collections", priority: 2, description: "Collection accounts, debt collectors, validation, settlement, lawsuits, and consumer rights." },
  { id: "bankruptcy", name: "Bankruptcy", priority: 3, description: "Chapters 7, 11, and 13, filing decisions, reporting, discharge, and post-bankruptcy recovery." },
  { id: "loans-financing", name: "Loans & Financing", priority: 3, description: "Mortgages, auto loans, personal loans, student loans, approvals, denials, and refinancing." },
  { id: "housing-evictions", name: "Housing & Evictions", priority: 3, description: "Rental applications, tenant screening, evictions, housing debt, and homebuying." },
  { id: "identity-theft", name: "Identity Theft & Fraud", priority: 2, description: "Fraudulent accounts, identity reports, credit freezes, alerts, and recovery." },
  { id: "consumer-credit-law", name: "Consumer Credit Laws", priority: 3, description: "FCRA, FDCPA, CROA, ECOA, reporting duties, complaints, and enforcement." },
  { id: "credit-cards-building", name: "Credit Cards & Building Credit", priority: 3, description: "Secured cards, utilization, authorized users, credit builders, and thin files." },
  { id: "life-event-recovery", name: "Life Events & Financial Recovery", priority: 2, suggested: true, description: "A suggested expansion for recovery after illness, job loss, divorce, abuse, disaster, or other financial shocks." },
  { id: "denials-adverse-action", name: "Credit Denials & Adverse Action", priority: 2, suggested: true, description: "A suggested high-intent expansion using denial notices to diagnose and fix credit before reapplying." },
];

const sources = {
  official: [
    "https://www.consumerfinance.gov/ask-cfpb/category-credit-reporting/",
    "https://consumer.ftc.gov/articles/fixing-your-credit-faqs",
  ],
  identity: ["https://www.identitytheft.gov/", "https://www.consumerfinance.gov/ask-cfpb/category-credit-reporting/"],
  comparison: ["https://credit.com/sitemap.xml", "https://www.thecreditpeople.com/sitemap.xml"],
  cfpb2025: ["https://files.consumerfinance.gov/f/documents/cfpb_2025-cr-annual-report_2026-03.pdf"],
  ftcFixing: ["https://consumer.ftc.gov/articles/fixing-your-credit-faqs"],
  ftcDisputes: ["https://consumer.ftc.gov/articles/disputing-errors-your-credit-reports"],
  transUnionDisputes: ["https://www.transunion.com/credit-disputes/credit-disputes-faq"],
  experianRepair: ["https://www.experian.com/blogs/ask-experian/how-to-repair-credit/"],
};

const keywordSource = `
Planning & Audits|credit repair audit checklist|5|green|Medium|Medium
Planning & Audits|what to fix first on your credit report|5|green|Medium|Medium
Planning & Audits|credit repair order of operations|4|green|Medium|Low
Planning & Audits|how to prioritize negative items on your credit report|5|green|Medium|Medium
Planning & Audits|how to make a personalized credit repair plan|4|green|Medium|Medium
Planning & Audits|credit repair without opening new accounts|4|green|Medium|Low
Planning & Audits|can you repair credit without paying all your debt|5|green|High|High
Planning & Audits|credit repair when you are unemployed|4|green|Medium|Medium
Planning & Audits|how to repair credit with no extra money|5|green|High|High
Planning & Audits|how often should you review your credit repair progress|3|yellow|Low|Low
Planning & Audits|how to track credit disputes and results|4|green|Medium|Low
Planning & Audits|credit repair mistakes that restart the process|4|green|Medium|Medium
Planning & Audits|what not to do while repairing your credit|4|green|Medium|Medium
Planning & Audits|how many credit items should you dispute at once|5|green|Medium|Medium
Planning & Audits|should you dispute everything on your credit report|5|green|Medium|Medium
Planning & Audits|can too many credit disputes hurt your case|4|green|Medium|Medium
Planning & Audits|credit repair goals for 30 60 and 90 days|3|yellow|Low|Low
Dispute Escalation|credit dispute denied what to do next|5|green|High|Medium
Dispute Escalation|credit bureau verified inaccurate information what now|5|green|High|Medium
Dispute Escalation|deleted credit report item reappeared what to do|5|green|High|Medium
Dispute Escalation|credit report error came back after deletion|5|green|Medium|Medium
Dispute Escalation|how to dispute a reinserted account on your credit report|5|green|Medium|Medium
Dispute Escalation|credit bureau did not respond within 30 days|5|green|Medium|Medium
Dispute Escalation|credit bureau says dispute is frivolous what now|5|green|Medium|Medium
Dispute Escalation|how to submit a supplemental credit dispute with new evidence|4|green|Medium|Medium
Dispute Escalation|credit dispute by mail vs online which is better|5|green|High|High
Dispute Escalation|documents to include with a credit report dispute|5|green|High|Medium
Dispute Escalation|should you send credit disputes by certified mail|4|green|Medium|Medium
Dispute Escalation|how to organize evidence for a credit dispute|4|green|Medium|Low
Dispute Escalation|how to read credit bureau dispute results|5|green|Medium|Medium
Dispute Escalation|what do credit dispute response codes mean|4|green|Low|Low
Dispute Escalation|how to request the method of verification after a dispute|5|green|Medium|Medium
Dispute Escalation|what if a creditor ignores your direct dispute|5|green|Medium|Medium
Dispute Escalation|how to dispute directly with a data furnisher|5|green|Medium|Medium
Dispute Escalation|what is a section 623 credit dispute|4|green|Medium|Medium
Dispute Escalation|what is a section 611 credit dispute|4|green|Medium|Medium
Dispute Escalation|when to file a CFPB complaint after a credit dispute|5|green|Medium|Medium
Dispute Escalation|how to file an FTC complaint about credit reporting errors|4|green|Low|Medium
Dispute Escalation|can you dispute the same credit report item twice|5|green|Medium|Medium
Dispute Escalation|how long should you wait before disputing again|4|green|Medium|Medium
Dispute Escalation|credit bureau dispute investigation timeline explained|4|green|Medium|High
Dispute Escalation|why credit disputes get rejected|5|green|High|Medium
Reporting Errors|how to fix a mixed credit file|5|green|High|Medium
Reporting Errors|how to fix a split credit file|5|green|Medium|Medium
Reporting Errors|someone else's account is on my credit report|5|green|High|Medium
Reporting Errors|duplicate account on credit report how to remove it|5|green|High|Medium
Reporting Errors|wrong balance on credit report how to fix it|5|green|High|Medium
Reporting Errors|wrong payment history on credit report|5|green|High|Medium
Reporting Errors|wrong account status on credit report|5|green|Medium|Medium
Reporting Errors|wrong date opened on credit report|4|green|Medium|Low
Reporting Errors|wrong date of first delinquency on credit report|5|green|Medium|Medium
Reporting Errors|outdated negative information on credit report|5|green|High|High
Reporting Errors|closed account reported as open on credit report|5|green|High|Medium
Reporting Errors|paid account reported as unpaid on credit report|5|green|High|Medium
Reporting Errors|settled account still shows a balance on credit report|5|green|Medium|Medium
Reporting Errors|current account reported delinquent by mistake|5|green|Medium|Medium
Reporting Errors|credit report shows a loan I never opened|5|green|High|Medium
Reporting Errors|credit report has the wrong social security number|5|green|Medium|Medium
Reporting Errors|credit report has the wrong phone number|3|yellow|Low|Low
Reporting Errors|credit report has the wrong employer|3|yellow|Low|Low
Reporting Errors|credit report has duplicate personal information|4|green|Medium|Low
Reporting Errors|credit report merged with family member|5|green|Medium|Medium
Reporting Errors|credit report mixed with someone who has a similar name|5|green|Medium|Medium
Reporting Errors|creditor reporting different information to each bureau|5|green|High|Medium
Reporting Errors|account missing from one credit bureau|5|green|High|Medium
Reporting Errors|payment update missing from credit report|5|green|High|Medium
Reporting Errors|credit limit reported incorrectly|5|green|High|Medium
Reporting Errors|authorized user account reported as primary|4|green|Medium|Medium
Reporting Errors|joint account reported as individual|4|green|Low|Medium
Reporting Errors|discharged debt still shows a balance|5|green|High|Medium
Reporting Errors|debt included in bankruptcy still reporting late|5|green|High|Medium
Reporting Errors|account re-aged on credit report how to fix it|5|green|High|Medium
Late Payments|late payment caused by autopay error credit repair steps|5|green|High|Medium
Late Payments|late payment reported during approved forbearance|5|green|High|Medium
Late Payments|deferred student loan reported late by mistake|5|green|High|Medium
Late Payments|mortgage forbearance reported late how to fix it|5|green|High|Medium
Late Payments|credit card hardship plan reported late|4|green|Medium|Medium
Late Payments|wrong 60 day late payment on credit report|4|green|Medium|Medium
Late Payments|wrong 90 day late payment on credit report|4|green|Medium|Medium
Late Payments|goodwill letter denied what to do next|5|green|High|Medium
Late Payments|should you dispute a late payment or send a goodwill letter|5|green|High|High
Late Payments|late payment after creditor changed due date|4|green|Medium|Low
Late Payments|returned payment caused a late mark what can you do|4|green|Medium|Low
Specialty Collections|medical collection under 500 dollars still on credit report|5|green|High|High
Specialty Collections|medical collection caused by insurance billing error|5|green|High|Medium
Specialty Collections|collection account belongs to someone else|5|green|High|Medium
Specialty Collections|collection balance is wrong on credit report|5|green|High|Medium
Specialty Collections|same debt reported by two collection agencies|5|green|High|Medium
Specialty Collections|original creditor and collection both show a balance|5|green|High|Medium
Specialty Collections|old collection reappeared on credit report|5|green|High|Medium
Specialty Collections|collection account re-aged by debt collector|5|green|High|Medium
Specialty Collections|collection from identity theft how to remove it|5|green|Medium|Medium
Specialty Collections|utility collection credit repair steps|4|green|Medium|Medium
Specialty Collections|cell phone collection credit repair steps|4|green|Medium|Medium
Specialty Collections|apartment collection credit repair steps|4|green|Medium|Medium
Specialty Collections|broken lease collection credit repair steps|4|green|Medium|Medium
Specialty Collections|gym membership collection credit repair steps|3|yellow|Low|Low
Specialty Collections|toll collection credit repair steps|3|yellow|Low|Low
Specialty Collections|parking collection credit repair steps|3|yellow|Low|Low
Specialty Collections|HOA collection credit repair steps|4|green|Medium|Medium
Specialty Collections|childcare collection credit repair steps|3|yellow|Low|Low
Specialty Collections|tuition collection credit repair steps|4|green|Medium|Medium
Specialty Collections|buy now pay later collection on credit report|5|green|High|Medium
Specialty Collections|payday loan collection credit repair steps|4|green|Medium|Medium
Specialty Collections|insurance collection credit repair steps|3|yellow|Low|Low
Repossession & Foreclosure|voluntary surrender reported incorrectly on credit report|5|green|High|Medium
Repossession & Foreclosure|repossession balance is wrong on credit report|5|green|High|Medium
Repossession & Foreclosure|repossession after bankruptcy still reporting a balance|5|green|Medium|Medium
Repossession & Foreclosure|foreclosure reported with the wrong date|5|green|Medium|Medium
Repossession & Foreclosure|foreclosure still reporting after seven years|5|green|High|Medium
Repossession & Foreclosure|short sale reported as foreclosure how to fix it|5|green|High|Medium
Repossession & Foreclosure|deed in lieu reported incorrectly on credit report|4|green|Medium|Medium
Repossession & Foreclosure|eviction collection belongs to someone else|4|green|Medium|Medium
Inquiries & Permissions|unauthorized hard inquiry on credit report|5|green|High|High
Inquiries & Permissions|hard inquiry from identity theft how to remove it|5|green|High|Medium
Inquiries & Permissions|credit inquiry without permissible purpose|5|green|Medium|Medium
Inquiries & Permissions|multiple auto loan inquiries reported separately|4|green|Medium|Medium
Inquiries & Permissions|multiple mortgage inquiries reported separately|4|green|Medium|Medium
Inquiries & Permissions|soft inquiry reported as hard inquiry|4|green|Medium|Low
Inquiries & Permissions|how to dispute an inquiry with the creditor directly|5|green|Medium|Medium
Inquiries & Permissions|credit bureau removed inquiry then it came back|4|green|Low|Medium
Identity Theft Recovery|fraud alert vs credit freeze after identity theft|5|green|High|High
Identity Theft Recovery|how to place an extended fraud alert|5|green|High|High
Identity Theft Recovery|how to place an active duty fraud alert|4|green|Medium|Medium
Identity Theft Recovery|how to block fraudulent accounts under FCRA section 605B|5|green|Medium|Medium
Identity Theft Recovery|identity theft report not accepted by credit bureau|5|green|Medium|Medium
Identity Theft Recovery|synthetic identity theft on credit report|5|green|High|High
Identity Theft Recovery|child identity theft credit repair checklist|5|green|High|High
Identity Theft Recovery|elder identity theft credit repair steps|4|green|Medium|Medium
Identity Theft Recovery|financial abuse ruined my credit what can I do|5|green|Medium|Medium
Identity Theft Recovery|domestic violence survivor credit repair resources|5|green|Medium|Medium
Identity Theft Recovery|credit repair after account takeover fraud|4|green|Medium|Medium
Rebuilding Strategy|how to rebuild credit after negative items are removed|5|green|High|High
Rebuilding Strategy|why credit score did not increase after deletion|5|green|High|Medium
Rebuilding Strategy|why credit score dropped after a successful dispute|5|green|High|Medium
Rebuilding Strategy|how to rebuild credit without a credit card|5|green|High|High
Rebuilding Strategy|how to rebuild credit with rent reporting|4|green|Medium|High
Rebuilding Strategy|how to rebuild credit with utility reporting|4|green|Medium|High
Rebuilding Strategy|secured credit card graduation and credit rebuilding|4|green|Medium|Medium
Rebuilding Strategy|should you pay off a credit builder loan early|5|green|High|High
Rebuilding Strategy|authorized user strategy for rebuilding credit|4|green|Medium|High
Rebuilding Strategy|how to avoid tradeline scams while repairing credit|5|green|Medium|Medium
Rebuilding Strategy|statement date vs due date for credit utilization|5|green|High|High
Rebuilding Strategy|when to pay credit card balance to improve utilization|5|green|High|High
Rebuilding Strategy|all zero except one method for credit rebuilding|4|green|Medium|Medium
Rebuilding Strategy|how many secured cards do you need to rebuild credit|4|green|Medium|Medium
Rebuilding Strategy|credit repair with a thin credit file|4|green|Medium|Medium
Major Applications|credit repair before applying for an apartment|5|green|High|High
Major Applications|credit repair before applying for an auto loan|5|green|High|High
Major Applications|credit repair before applying for a job|4|green|Medium|Medium
Major Applications|credit repair before refinancing your mortgage|4|green|Medium|Medium
Major Applications|what to fix after a mortgage denial|5|green|High|Medium
Major Applications|what to fix after an auto loan denial|5|green|High|Medium
Major Applications|what to fix after a credit card denial|5|green|High|Medium
Major Applications|how to use an adverse action notice to repair credit|5|green|High|Medium
Major Applications|remove credit dispute comments before mortgage approval|5|green|High|Medium
Major Applications|open credit disputes during mortgage underwriting|5|green|High|High
Major Applications|rapid rescore vs credit repair|5|green|High|High
Major Applications|mortgage credit score optimization before applying|5|green|High|High
Major Applications|credit repair before a security clearance|4|green|Medium|Medium
Life Events|credit repair after losing a job|4|green|Medium|Medium
Life Events|credit repair after a serious illness|4|green|Medium|Medium
Life Events|credit repair after medical leave|3|yellow|Low|Low
Life Events|credit repair after incarceration|4|green|Medium|Medium
Life Events|credit repair after homelessness|4|green|Medium|Medium
Life Events|credit repair after financial abuse|5|green|Medium|Medium
Life Events|credit repair after cosigner default|4|green|Medium|Medium
Life Events|credit repair after a failed business|4|green|Medium|Medium
Life Events|credit repair after moving to the United States|4|green|Medium|Medium
Life Events|credit repair for seniors on a fixed income|4|green|Medium|Medium
Life Events|credit repair for young adults starting over|4|green|Medium|Medium
Life Events|credit repair for married couples|3|yellow|Low|Medium
Life Events|credit repair after a spouse dies|4|green|Medium|Medium
Life Events|credit repair after military deployment|4|green|Medium|Medium
Services & Decisions|when should you hire a credit repair company|5|green|High|High
Services & Decisions|what credit repair companies cannot legally do|5|green|High|High
Services & Decisions|questions to ask a credit repair company|5|green|High|High
Services & Decisions|what should be in a credit repair contract|5|green|Medium|Medium
Services & Decisions|three day right to cancel credit repair contract|5|green|Medium|Medium
Services & Decisions|credit repair guarantee red flags|5|green|High|Medium
Services & Decisions|are upfront credit repair fees legal|5|green|High|High
Services & Decisions|monthly credit repair vs pay per deletion|4|green|Medium|Medium
Services & Decisions|what happens during a credit repair consultation|4|green|Medium|Medium
Services & Decisions|how to measure credit repair company results|4|green|Medium|Medium
Services & Decisions|how to switch credit repair companies|4|green|Medium|Medium
Services & Decisions|credit repair company not responding what to do|5|green|Medium|Medium
Services & Decisions|how to request a credit repair refund|4|green|Medium|Medium
Services & Decisions|DIY credit repair vs hiring a company|5|green|High|High
Services & Decisions|credit repair vs credit counseling|5|green|High|High
Services & Decisions|credit repair vs credit monitoring|5|green|High|High
Services & Decisions|credit repair vs debt management plan|5|green|High|High
Services & Decisions|credit repair company vs consumer law attorney|4|green|Medium|High
Services & Decisions|can credit repair help after credit denial|4|green|Medium|Medium
Rights & Compliance|credit reporting time limit vs statute of limitations|5|green|High|High
Rights & Compliance|date of first delinquency and the seven year rule|5|green|High|High
Rights & Compliance|how credit report obsolescence works|4|green|Medium|Medium
Rights & Compliance|data furnisher duties under the FCRA|5|green|Medium|High
Rights & Compliance|what is e-OSCAR in credit disputes|4|green|Medium|Medium
Rights & Compliance|what is Metro 2 credit reporting|4|green|Medium|Medium
Rights & Compliance|reasonable investigation standard for credit disputes|4|green|Low|High
Rights & Compliance|can you sue for inaccurate credit reporting|5|green|High|High
Rights & Compliance|FCRA damages for credit report errors|5|green|Medium|High
Rights & Compliance|how long must credit bureaus keep dispute records|3|yellow|Low|Medium
Rights & Compliance|credit report reinsertion notice requirements|4|green|Medium|Medium
Rights & Compliance|credit repair records you should keep|4|green|Medium|Low
`;

const legalSubcategories = new Set(["Dispute Escalation", "Identity Theft Recovery", "Rights & Compliance"]);

const creditRepairCoreKeywords: CreditKeyword[] = keywordSource.trim().split("\n").map((line, index) => {
  const [subcategory, keyword, rank, tier, demand, difficulty] = line.split("|");
  return {
    id: `credit-repair-${String(index + 1).padStart(3, "0")}`,
    categoryId: "credit-repair",
    keyword,
    subcategory,
    rank: Number(rank) as CreditKeyword["rank"],
    tier: tier as CreditKeyword["tier"],
    demand: demand as CreditKeyword["demand"],
    difficulty: difficulty as CreditKeyword["difficulty"],
    specialistReview: legalSubcategories.has(subcategory),
    sourceUrls: subcategory === "Identity Theft Recovery" ? sources.identity : subcategory === "Services & Decisions" ? sources.comparison : sources.official,
  };
});

type KeywordSeed = Omit<CreditKeyword, "id">;

function buildKeywords(prefix: string, seeds: KeywordSeed[]): CreditKeyword[] {
  return seeds.map((seed, index) => ({ ...seed, id: `${prefix}-${String(index + 1).padStart(4, "0")}` }));
}

function routeExactCreditRepairPhrase(record: CreditKeyword): CreditKeyword {
  const hasCredit = /\bcredit\b/i.test(record.keyword);
  const hasRepair = /\brepair(?:s|ing|ed)?\b/i.test(record.keyword);
  return hasCredit && hasRepair ? { ...record, categoryId: "credit-repair-exact" } : record;
}

function creditRepairEquivalentKey(keyword: string) {
  return keyword.toLowerCase()
    .replace(/\bfixing credit\b/g, "repairing credit")
    .replace(/\bfix credit\b/g, "repair credit")
    .replace(/\bcredit fixing\b/g, "credit repair")
    .replace(/\bfixed credit\b/g, "repaired credit")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function finalizeCreditKeywords(records: CreditKeyword[]) {
  const unique = new Map<string, CreditKeyword>();
  for (const routedRecord of records.map(routeExactCreditRepairPhrase)) {
    const key = creditRepairEquivalentKey(routedRecord.keyword);
    const existing = unique.get(key);
    const prefersRepair = /\brepair(?:ing|ed)?\b/i.test(routedRecord.keyword) && !/\bfix(?:ing|ed)?\b/i.test(routedRecord.keyword);
    if (!existing || prefersRepair) unique.set(key, routedRecord);
  }
  return [...unique.values()];
}

const accountTypes = [
  ["credit card", "card"], ["retail credit card", "card"], ["secured credit card", "card"], ["authorized user account", "card"],
  ["mortgage", "installment"], ["HELOC", "installment"], ["home equity loan", "installment"], ["auto loan", "installment"],
  ["auto lease", "installment"], ["personal loan", "installment"], ["federal student loan", "installment"], ["private student loan", "installment"],
  ["credit builder loan", "installment"], ["buy now pay later account", "installment"], ["payday loan", "installment"],
  ["utility account", "service"], ["cell phone account", "service"], ["internet service account", "service"], ["medical account", "service"],
  ["apartment debt", "service"], ["business credit card on a personal report", "card"], ["cosigned loan", "installment"],
  ["joint account", "general"], ["collection account", "collection"], ["child support account", "service"], ["tax lien entry", "service"],
] as const;

const reportingProblems = [
  ["wrong balance", ["card", "installment", "service", "collection", "general"]],
  ["wrong credit limit", ["card"]],
  ["reported closed even though it is open", ["card", "installment", "general"]],
  ["reported open even though it is closed", ["card", "installment", "service", "general"]],
  ["reported unpaid after it was paid", ["card", "installment", "service", "collection", "general"]],
  ["reported late by mistake", ["card", "installment", "service", "general"]],
  ["listed twice", ["card", "installment", "service", "collection", "general"]],
  ["reported under the wrong owner", ["card", "installment", "service", "collection", "general"]],
  ["wrong date opened", ["card", "installment", "general"]],
  ["wrong date of first delinquency", ["card", "installment", "service", "collection", "general"]],
  ["wrong account status", ["card", "installment", "service", "collection", "general"]],
  ["missing a recent payment update", ["card", "installment", "service", "general"]],
  ["charged off by mistake", ["card", "installment", "service"]],
  ["still reporting a balance after bankruptcy discharge", ["card", "installment", "service", "collection"]],
  ["reappeared after a successful dispute", ["card", "installment", "service", "collection", "general"]],
] as const;

const accountErrorKeywords = buildKeywords("account-error", accountTypes.flatMap(([accountType, group]) => reportingProblems
  .filter(([, groups]) => groups.includes(group as never))
  .map(([problem]) => ({
    categoryId: "credit-repair",
    keyword: `how to fix a ${accountType} ${problem} on your credit report`,
    subcategory: "Account-Specific Reporting Errors",
    rank: (group === "card" || group === "installment" ? 4 : 3) as CreditKeyword["rank"],
    tier: (group === "service" ? "yellow" : "green") as CreditKeyword["tier"],
    demand: (group === "card" || group === "installment" ? "Medium" : "Low") as CreditKeyword["demand"],
    difficulty: "Medium" as const,
    specialistReview: false,
    sourceUrls: sources.official,
  }))));

const bureauFailures = [
  "did not investigate my dispute", "verified an account that is not mine", "ignored the documents in my dispute", "marked my dispute frivolous",
  "did not respond to my dispute on time", "deleted an item and then reinserted it", "corrected an error that came back", "sent incomplete dispute results",
  "refused to disclose the method of verification", "failed to notify the data furnisher", "keeps reporting a wrong balance", "keeps reporting the wrong payment status",
  "mixed my file with another person", "split my credit file", "failed to block identity theft accounts", "did not add my consumer statement",
  "closed my dispute without a result", "updated only one of several wrong accounts",
];

const bureauKeywords = buildKeywords("bureau-failure", ["Equifax", "Experian", "TransUnion"].flatMap((bureau) => bureauFailures.map((failure) => ({
  categoryId: "credit-reports-bureaus",
  keyword: `what to do when ${bureau} ${failure}`,
  subcategory: "Bureau-Specific Dispute Failures",
  rank: 4 as const,
  tier: "green" as const,
  demand: "Medium" as const,
  difficulty: "Medium" as const,
  specialistReview: true,
  sourceUrls: sources.official,
}))));

const specialtyReports = ["ChexSystems report", "Innovis credit report", "LexisNexis consumer report", "SageStream report", "NCTUE report", "tenant screening report", "employment background report", "insurance consumer report"];
const specialtyProblems = ["an account that is not mine", "the wrong balance", "duplicate information", "outdated negative information", "identity theft information", "a paid account shown as unpaid", "a mixed file", "an error that returned after a dispute"];

const specialtyReportKeywords = buildKeywords("specialty-report", specialtyReports.flatMap((report) => specialtyProblems.map((problem) => ({
  categoryId: "specialty-consumer-reports",
  keyword: `how to dispute ${problem} on a ${report}`,
  subcategory: "Specialty Consumer Report Errors",
  rank: 3 as const,
  tier: "yellow" as const,
  demand: "Low" as const,
  difficulty: "Low" as const,
  specialistReview: true,
  sourceUrls: sources.official,
}))));

const repairSituations = [
  "after a creditor reverses a payment", "after a bank closes your account", "after a loan servicing transfer", "after a mortgage servicing error",
  "after student loan rehabilitation", "after student loan consolidation", "after an auto loan trade-in", "after voluntarily returning a leased car",
  "after a debt cancellation", "after receiving a 1099-C", "after a settlement agreement is completed", "after a pay-for-delete agreement",
  "after a creditor merger", "after a lender changes account numbers", "after an account is sold to another lender", "after a collection agency sells the debt",
  "after a returned payment error", "after a duplicate payment reversal", "after a billing dispute", "after a chargeback",
  "after a military PCS move", "after leaving active duty", "after leaving an abusive household", "after leaving foster care",
  "after a name change", "after changing your Social Security number", "after becoming a permanent resident", "after correcting immigration records",
  "when your address is linked to someone else", "when a deceased relative appears on your report", "when an ex-spouse account is still linked to you", "when a former roommate debt appears",
  "when a landlord reports debt you do not owe", "when an employer credit check finds an error", "when a lender reports during an active dispute", "when a furnisher updates only one bureau",
  "when a payment arrangement is reported incorrectly", "when a hardship plan is reported incorrectly", "when a deferment is reported incorrectly", "when a loan modification is reported incorrectly",
  "when an account is transferred during bankruptcy", "when a reaffirmed debt is reported incorrectly", "when a dismissed bankruptcy is reported as discharged", "when a withdrawn bankruptcy appears on your report",
  "when a creditor cannot provide account records", "when an account number is partially wrong", "when your credit report lists the wrong account type", "when your credit report lists the wrong monthly payment",
  "when your credit report lists the wrong original creditor", "when your credit report lists the wrong collection agency", "when a zero balance account shows utilization", "when a card is missing its credit limit",
];

const situationKeywords = buildKeywords("repair-situation", repairSituations.map((situation) => ({
  categoryId: "credit-repair",
  keyword: `credit repair ${situation}`,
  subcategory: "Specific Credit Repair Situations",
  rank: 3 as const,
  tier: "yellow" as const,
  demand: "Low" as const,
  difficulty: "Low" as const,
  specialistReview: situation.includes("bankruptcy") || situation.includes("abusive"),
  sourceUrls: sources.official,
})));

const lifeEvents = [
  "job loss", "reduced work hours", "a layoff", "long-term unemployment", "starting a new job", "changing careers", "self-employment income loss", "a failed small business",
  "legal separation", "a spouse's death", "becoming a widow or widower", "financial abuse", "domestic violence", "leaving a controlling relationship", "a cosigner default",
  "serious illness", "cancer treatment", "a disability", "medical leave", "unexpected surgery", "mental health leave", "unpaid medical bills", "losing health insurance",
  "incarceration", "release from prison", "homelessness", "leaving a shelter", "aging out of foster care", "returning from military deployment", "leaving military service", "a natural disaster",
  "a house fire", "a flood", "a hurricane", "a wildfire", "account takeover fraud", "a romance scam",
  "moving to the United States", "moving back to the United States", "a legal name change", "marriage", "having a baby", "adoption", "becoming a caregiver", "retirement",
  "the death of a parent", "an inherited debt dispute", "student loan default", "mortgage foreclosure", "vehicle repossession", "eviction", "bankruptcy dismissal", "bankruptcy discharge",
  "a debt settlement program", "leaving credit counseling", "paying off collections", "completing loan rehabilitation",
];

const lifeEventRepairPagesAlreadyCovered = new Set(["financial abuse", "medical leave", "incarceration", "homelessness", "account takeover fraud", "moving to the United States"]);

const lifeEventKeywords = buildKeywords("life-event", lifeEvents.flatMap((lifeEvent) => [
  `credit repair after ${lifeEvent}`,
  `credit report checklist after ${lifeEvent}`,
].map((keyword, index) => ({ keyword, index })).filter(({ index }) => index !== 0 || !lifeEventRepairPagesAlreadyCovered.has(lifeEvent)).map(({ keyword, index }) => ({
  categoryId: "life-event-recovery",
  keyword,
  subcategory: index === 0 ? "Recovery Plans" : "Report Audits",
  rank: (lifeEvent.includes("identity theft") || lifeEvent.includes("divorce") || lifeEvent.includes("bankruptcy") ? 5 : 3) as CreditKeyword["rank"],
  tier: (lifeEvent.includes("identity theft") || lifeEvent.includes("divorce") || lifeEvent.includes("bankruptcy") ? "green" : "yellow") as CreditKeyword["tier"],
  demand: (lifeEvent.includes("identity theft") || lifeEvent.includes("divorce") || lifeEvent.includes("bankruptcy") ? "High" : "Low") as CreditKeyword["demand"],
  difficulty: "Medium" as const,
  specialistReview: ["domestic violence", "financial abuse", "incarceration", "bankruptcy"].some((flag) => lifeEvent.includes(flag)),
  sourceUrls: lifeEvent.includes("identity theft") ? sources.identity : sources.official,
}))));

const deniedProducts = ["mortgage", "apartment", "auto loan", "credit card", "personal loan", "student loan refinance", "HELOC", "home equity loan", "business loan", "cell phone financing", "utility account", "insurance policy", "job", "security clearance"];
const denialReasons = [
  "collections", "late payments", "a charge-off", "high credit utilization", "too many hard inquiries", "a thin credit file", "no credit score", "a mixed credit file",
  "identity theft accounts", "an incorrect balance", "a duplicate account", "an old address", "a repossession", "foreclosure", "student loan default", "medical debt",
  "an account that is not mine", "an open credit dispute", "a low credit score", "insufficient credit history",
];

const denialKeywords = buildKeywords("denial-recovery", deniedProducts.flatMap((product) => denialReasons.map((reason) => ({
  categoryId: "denials-adverse-action",
  keyword: `how to fix your credit after a ${product} denial caused by ${reason}`,
  subcategory: `${product.replace(/\b\w/g, (letter) => letter.toUpperCase())} Denials`,
  rank: (["mortgage", "apartment", "auto loan", "credit card"].includes(product) ? 5 : 3) as CreditKeyword["rank"],
  tier: (["mortgage", "apartment", "auto loan", "credit card"].includes(product) ? "green" : "yellow") as CreditKeyword["tier"],
  demand: (["mortgage", "apartment", "auto loan", "credit card"].includes(product) ? "High" : "Low") as CreditKeyword["demand"],
  difficulty: "Medium" as const,
  specialistReview: product === "job" || product === "security clearance",
  sourceUrls: sources.official,
}))));

const adverseActionSteps = [
  "how to read an adverse action notice", "how to request denial reasons within 60 days", "how to get a free credit report after a denial", "what to do when an adverse action notice names the wrong bureau",
  "what to do when an adverse action notice has no specific reasons", "how to dispute an error found after a credit denial", "how long to wait before reapplying after fixing a credit error",
  "how to compare a denial score with your current credit score", "what to do when a lender used an outdated credit report", "what to do when a lender denies you during an active dispute",
  "how to add a consumer statement after a denial", "how to document credit discrimination after a denial", "how to file a CFPB complaint after an inaccurate credit denial",
  "how to prepare for reconsideration after fixing a credit report", "what credit items to fix first after a denial", "credit repair checklist before reapplying after a denial",
];

const adverseActionKeywords = buildKeywords("adverse-action", adverseActionSteps.map((keyword) => ({
  categoryId: "denials-adverse-action",
  keyword,
  subcategory: "Adverse Action Notices",
  rank: 5 as const,
  tier: "green" as const,
  demand: "Medium" as const,
  difficulty: "Medium" as const,
  specialistReview: true,
  sourceUrls: sources.official,
})));

const scoreRepairEvents = [
  "a negative item was deleted", "a collection was deleted", "a charge-off was deleted", "a late payment was removed", "a hard inquiry was removed",
  "a duplicate account was removed", "an identity theft account was blocked", "a mixed credit file was corrected", "a wrong balance was corrected", "a credit limit was corrected",
  "a paid account updated", "a settled account updated", "a mortgage balance updated", "a student loan balance updated", "an auto loan balance updated",
  "a collection was paid", "a collection was settled", "a charge-off was paid", "a credit card was paid off", "utilization dropped below 30 percent",
  "utilization dropped below 10 percent", "all credit cards reported zero balances", "one credit card reported a small balance", "a credit limit increased", "a credit limit decreased",
  "an old card was closed", "a new secured card was opened", "a credit builder loan was opened", "an authorized user account was added", "an authorized user account was removed",
  "a dispute comment was removed", "an active dispute was completed", "a bankruptcy was discharged", "a foreclosure aged off", "a repossession aged off",
  "student loan rehabilitation was completed", "a defaulted loan returned to current", "a delinquent account became current", "a hardship plan ended", "a forbearance ended",
  "a lender performed a rapid rescore", "a creditor sent an off-cycle update", "a new address was removed", "personal information was corrected", "an old collection aged off",
];

const scoreEventKeywords = buildKeywords("score-event", scoreRepairEvents.flatMap((event) => [
  `why did my credit score not increase after ${event}`,
  `how long until my credit score updates after ${event}`,
].map((keyword, index) => ({
  categoryId: "credit-scores",
  keyword,
  subcategory: index === 0 ? "Unexpected Score Results" : "Score Update Timing",
  rank: 4 as const,
  tier: "green" as const,
  demand: "Medium" as const,
  difficulty: "Medium" as const,
  specialistReview: false,
  sourceUrls: ["https://www.myfico.com/credit-education/faq/affects-of-credit-actions", "https://www.consumerfinance.gov/ask-cfpb/category-credit-reporting/"],
}))));

const scoreMismatchSituations = [
  "my lender score is lower than my credit app score", "my mortgage score is lower than my FICO score", "my auto score is different from my mortgage score",
  "Equifax shows a different score from Experian", "Experian shows a different score from TransUnion", "my FICO score differs from my VantageScore",
  "my credit score changed but my report did not", "my credit report changed but my score did not", "my score dropped with no new negative accounts",
  "my score dropped after paying debt", "my score dropped after closing a card", "my score dropped after a limit decrease", "my score dropped after becoming an authorized user",
  "my score disappeared after an account closed", "I have a credit report but no credit score", "one bureau cannot generate my credit score",
  "my score factors mention high utilization after payoff", "my score factors mention a serious delinquency I cannot find", "my score factors mention too many accounts with balances",
  "my score factors mention a short credit history after a file correction", "my score changed during a credit dispute", "my score changed after a dispute comment was added",
];

const scoreMismatchKeywords = buildKeywords("score-mismatch", scoreMismatchSituations.map((situation) => ({
  categoryId: "credit-scores",
  keyword: `what to do when ${situation}`,
  subcategory: "Score Mismatches & Diagnostics",
  rank: 4 as const,
  tier: "green" as const,
  demand: "Medium" as const,
  difficulty: "Medium" as const,
  specialistReview: false,
  sourceUrls: ["https://www.myfico.com/credit-education/faq/negative-reasons/why-is-my-fico-score-dropping"],
})));

const collectionDebtTypes = [
  "medical bill", "hospital bill", "ambulance bill", "dental bill", "utility bill", "electric bill", "gas bill", "water bill", "cell phone bill", "internet bill",
  "apartment debt", "broken lease debt", "move-out charge", "storage unit debt", "gym membership debt", "toll debt", "parking debt", "HOA debt",
  "tuition debt", "private student loan debt", "payday loan debt", "buy now pay later debt", "insurance debt", "veterinary bill", "childcare bill",
];

const collectionProblems = [
  "belongs to someone else", "has the wrong balance", "was already paid", "was covered by insurance", "was included in bankruptcy", "is listed twice",
  "names the wrong original creditor", "shows the wrong date of first delinquency", "reappeared after deletion", "was sold while under dispute",
];

const collectionTypeKeywords = buildKeywords("collection-type", collectionDebtTypes.flatMap((debtType) => collectionProblems.map((problem) => ({
  categoryId: "debt-collections",
  keyword: `what to do when a ${debtType} collection ${problem}`,
  subcategory: "Debt-Type Collection Problems",
  rank: (["medical bill", "hospital bill", "utility bill", "apartment debt"].includes(debtType) ? 4 : 3) as CreditKeyword["rank"],
  tier: (["medical bill", "hospital bill", "utility bill", "apartment debt"].includes(debtType) ? "green" : "yellow") as CreditKeyword["tier"],
  demand: (["medical bill", "hospital bill", "utility bill", "apartment debt"].includes(debtType) ? "Medium" : "Low") as CreditKeyword["demand"],
  difficulty: "Medium" as const,
  specialistReview: true,
  sourceUrls: ["https://www.consumerfinance.gov/ask-cfpb/what-information-does-a-debt-collector-have-to-give-me-about-the-debt-en-331/"],
}))));

const validationNoticeProblems = [
  "has no current creditor name", "has no original creditor name", "has the wrong account number", "has no itemization date", "has no itemized interest",
  "has unexplained fees", "has the wrong payment credits", "has no current balance", "has the wrong dispute deadline", "arrived after the dispute deadline",
  "was sent to the wrong address", "was sent only by text message", "was sent only by email", "uses a name I do not recognize", "lists more than one creditor",
  "does not identify the debt type", "does not include a response form", "does not say the communication is from a collector", "has a different balance from my credit report",
  "arrived after the collector reported the debt", "was never provided", "does not explain how to request the original creditor", "contains someone else's personal information",
];

const validationKeywords = buildKeywords("validation-notice", validationNoticeProblems.map((problem) => ({
  categoryId: "debt-collections",
  keyword: `what to do when a debt collection validation notice ${problem}`,
  subcategory: "Validation Notice Errors",
  rank: 5 as const,
  tier: "green" as const,
  demand: "Medium" as const,
  difficulty: "Medium" as const,
  specialistReview: true,
  sourceUrls: ["https://www.consumerfinance.gov/ask-cfpb/what-information-does-a-debt-collector-have-to-give-me-about-the-debt-en-331/"],
})));

const collectionEscalations = [
  "a debt collector ignores your validation request", "a debt collector continues collecting before validating", "a collector reports a debt during the validation period",
  "a collector verifies a debt without documents", "a collector refuses to name the original creditor", "a collector changes the balance after a dispute",
  "a collector sells a disputed debt", "a new collector contacts you about the same disputed debt", "two collectors demand payment for the same debt",
  "the original creditor and collector both report balances", "a collector updates only one credit bureau", "a collector deletes an account from only one bureau",
  "a paid collection updates without a zero balance", "a settled collection reports as unpaid", "a collection is re-aged after transfer",
  "a collector contacts your employer about a debt", "a collector contacts family members repeatedly", "a collector calls after a cease communication request",
  "a collector texts after you opt out", "a collector uses social media to contact you", "a collector threatens arrest over consumer debt",
  "a collector sues after the statute of limitations", "a collector sues the wrong person", "a collection lawsuit was never served correctly",
  "a collector freezes funds from an exempt account", "a collector garnishes wages after the debt was paid", "a debt buyer cannot prove account ownership",
];

const collectionEscalationKeywords = buildKeywords("collection-escalation", collectionEscalations.map((situation) => ({
  categoryId: "debt-collections",
  keyword: `what to do when ${situation}`,
  subcategory: "Collection Dispute Escalation",
  rank: 4 as const,
  tier: "green" as const,
  demand: "Medium" as const,
  difficulty: "High" as const,
  specialistReview: true,
  sourceUrls: ["https://www.consumerfinance.gov/ask-cfpb/what-do-i-need-to-know-if-a-debt-collector-contacts-me-en-1695/"],
})));

const identityFraudTypes = [
  "a fraudulent credit card", "a fraudulent store card", "a fraudulent auto loan", "a fraudulent personal loan", "a fraudulent student loan", "a fraudulent mortgage inquiry",
  "a fraudulent buy now pay later account", "a fraudulent payday loan", "a fraudulent utility account", "a fraudulent cell phone account", "a fraudulent internet account",
  "a fraudulent apartment debt", "a fraudulent medical account", "a fraudulent collection account", "a fraudulent business account on your personal report",
  "a synthetic identity file", "child identity theft", "elder identity theft", "deceased identity theft", "tax identity theft", "employment identity theft",
  "account takeover fraud", "SIM swap fraud", "mail theft", "a change-of-address scam", "a data breach", "a stolen Social Security number",
];

const identityFraudKeywords = buildKeywords("identity-fraud", identityFraudTypes.flatMap((fraudType) => [
  `how to remove ${fraudType} from your credit report`,
  `credit report recovery checklist after ${fraudType}`,
  `what evidence do you need to dispute ${fraudType}`,
].map((keyword, index) => ({
  categoryId: "identity-theft",
  keyword,
  subcategory: ["Fraudulent Account Removal", "Recovery Checklists", "Identity Theft Evidence"][index],
  rank: 4 as const,
  tier: "green" as const,
  demand: "Medium" as const,
  difficulty: "Medium" as const,
  specialistReview: true,
  sourceUrls: sources.identity,
}))));

const identityEscalations = [
  "a credit bureau refuses your FTC identity theft report", "a credit bureau will not block fraudulent information", "a bureau reinserts a blocked identity theft account",
  "a creditor keeps reporting an identity theft account", "a collector keeps pursuing identity theft debt", "a furnisher asks for a police report in addition to an FTC report",
  "a lender refuses to send identity theft application records", "a creditor sends only partial identity theft records", "a fraud alert is missing from one bureau",
  "an extended fraud alert is removed early", "a credit freeze fails to stop a new account", "a freeze is missing from one credit bureau",
  "identity theft creates a mixed credit file", "identity theft creates multiple credit files", "a new fraudulent inquiry appears after a freeze",
  "an identity theft account is sold to collections", "a fraudulent account becomes a charge-off", "a fraudulent utility account blocks new service",
  "a fraudulent tenant screening record causes a denial", "a fraudulent employment report causes a job denial", "an identity theft dispute exceeds 30 days",
  "only one bureau removes the fraudulent account", "a credit score stays low after fraud removal", "a victim statement does not appear on your report",
];

const identityEscalationKeywords = buildKeywords("identity-escalation", identityEscalations.map((situation) => ({
  categoryId: "identity-theft",
  keyword: `what to do when ${situation}`,
  subcategory: "Identity Theft Escalation",
  rank: 5 as const,
  tier: "green" as const,
  demand: "Medium" as const,
  difficulty: "High" as const,
  specialistReview: true,
  sourceUrls: sources.identity,
})));

const saturationAuditSource = `
credit-repair|Dispute Escalation|credit bureau dispute marked irrelevant what to do|5|green|Medium|Medium|true|official
credit-repair|Dispute Escalation|how to dispute information reported by a landlord|5|green|Medium|Medium|true|official
credit-repair|Dispute Escalation|how to dispute a credit report error after the 45 day investigation period|4|green|Low|Medium|true|official
credit-repair|Complaints & Evidence|how to document a CFPB credit reporting complaint|5|green|Medium|Medium|true|official
credit-repair|Complaints & Evidence|credit bureau complaint dismissed because a dispute was pending|4|green|Low|High|true|official
credit-repair|Identity & Data Errors|how to stop prescreened credit offers after identity theft|4|green|Medium|Medium|true|identity
credit-repair|Identity & Data Errors|how to dispute an unfamiliar creditor before assuming identity theft|5|green|Medium|Medium|true|identity
credit-repair|Reporting Errors|how to correct a credit report error caused by a data reseller|4|green|Low|High|true|official
specialty-consumer-reports|Access & Freezes|how to request a specialty consumer report|5|green|Medium|Medium|true|official
specialty-consumer-reports|Access & Freezes|how to freeze a specialty consumer report|5|green|Medium|Medium|true|official
specialty-consumer-reports|Employment Screening|how to dispute an employment screening report|5|green|Medium|High|true|official
specialty-consumer-reports|Insurance Reports|how to dispute an insurance consumer report|5|green|Medium|High|true|official
credit-reports-bureaus|Personal Information Errors|credit report shows the wrong address how to fix it|5|green|High|Medium|false|official
credit-reports-bureaus|Investigation Failures|credit bureau says verified but the creditor has no records|5|green|Medium|High|true|official
credit-reports-bureaus|File Access Problems|credit report is locked and cannot be accessed|5|green|Medium|Medium|true|official
credit-reports-bureaus|File Access Problems|how to get your credit report after a bureau denies access|5|green|Medium|Medium|true|official
credit-reports-bureaus|Consumer Statements|how to add a statement of dispute to your credit file|4|green|Medium|Medium|true|official
credit-reports-bureaus|Consumer Statements|how to remove a statement of dispute from your credit file|4|green|Medium|Medium|true|official
credit-scores|Score Model Differences|why do different lenders show different credit scores|5|green|High|Medium|false|official
credit-scores|Utilization Recovery|how long does a credit score take to recover after high utilization|5|green|High|Medium|false|official
debt-collections|Settlement Problems|pay for delete agreement not honored what to do|5|green|Medium|High|true|official
debt-collections|Collection Reporting Errors|collection account closed but still showing a balance|5|green|High|Medium|true|official
identity-theft|Identity Theft Blocking|how to block identity theft accounts without an FTC identity theft report|5|green|Medium|High|true|identity
identity-theft|Child Identity Protection|how to freeze a child's credit report before identity theft|5|green|Medium|Medium|true|identity
identity-theft|Child Identity Protection|child has no credit report after identity theft what to do|5|green|Low|High|true|identity
identity-theft|Medical Identity Theft|how to fix medical identity theft errors on a credit report|5|green|Medium|High|true|identity
identity-theft|Account Takeover|account takeover changed my credit report contact information|5|green|Medium|High|true|identity
life-event-recovery|Natural Disaster Recovery|disaster forbearance caused a late payment on my credit report|5|green|Medium|High|true|official
life-event-recovery|Divorce Recovery|divorce decree does not remove an ex spouse's debt from your credit report|5|green|Medium|High|true|official
life-event-recovery|Natural Disaster Recovery|how to rebuild credit after a natural disaster loan default|4|green|Low|High|true|official
denials-adverse-action|Denial Reason Recovery|denied credit because of insufficient credit history|5|green|High|Medium|true|official
denials-adverse-action|Denial Reason Recovery|denied credit because of too many recent inquiries|5|green|High|Medium|true|official
denials-adverse-action|Denial Reason Recovery|denied credit because of high credit utilization|5|green|High|Medium|true|official
denials-adverse-action|Adverse Action Notice Errors|adverse action notice does not list the credit score used|5|green|Medium|High|true|official
denials-adverse-action|Reconsideration|how to request reconsideration after a credit denial|5|green|High|Medium|true|official
denials-adverse-action|Housing Denials|denied an apartment because of a credit report error|5|green|High|High|true|official
denials-adverse-action|Insurance Denials|denied insurance because of credit report information|5|green|Medium|High|true|official
`;

export const creditSaturationAuditKeywords = buildKeywords("saturation-audit", saturationAuditSource.trim().split("\n").map((line) => {
  const [categoryId, subcategory, keyword, rank, tier, demand, difficulty, specialistReview, sourceKey] = line.split("|");
  return {
    categoryId,
    subcategory,
    keyword,
    rank: Number(rank) as CreditKeyword["rank"],
    tier: tier as CreditKeyword["tier"],
    demand: demand as CreditKeyword["demand"],
    difficulty: difficulty as CreditKeyword["difficulty"],
    specialistReview: specialistReview === "true",
    sourceUrls: sources[sourceKey as keyof typeof sources],
  };
})).map(routeExactCreditRepairPhrase);

const finalDeepAuditSource = `
credit-repair-exact|Scams & Illegal Schemes|credit repair CPN and new-credit-identity scam|5|green|Medium|High|true|ftcFixing
credit-repair-exact|Services & Decisions|how to report a credit repair company to the FTC or state authorities|5|green|Medium|Medium|true|ftcFixing
credit-repair-exact|Complaints & Evidence|credit repair company submitted CFPB complaints without permission|4|green|Low|High|true|cfpb2025
credit-repair|Post-Correction Rights|how to ask a credit bureau to notify past report recipients after a correction|4|green|Low|High|true|ftcDisputes
credit-repair|Dispute Escalation|credit bureau corrected an error but did not provide a free updated report|5|green|Medium|Medium|true|ftcDisputes
credit-repair|Dispute Escalation|credit bureau did not send written dispute results|5|green|Medium|Medium|true|ftcDisputes
credit-repair|Dispute Escalation|credit bureau did not forward all dispute evidence to the furnisher|5|green|Low|High|true|ftcDisputes
credit-repair|Furnisher Dispute Failures|furnisher keeps reporting a disputed account without a dispute notice|5|green|Medium|High|true|ftcDisputes
credit-repair|Complaints & Evidence|company CFPB complaint response is missing supporting documents|4|green|Low|High|true|cfpb2025
credit-repair|Reporting Errors|credit report has the wrong date of birth|4|green|Medium|Medium|false|transUnionDisputes
credit-repair|Inquiries & Permissions|unrecognized soft inquiry on a credit report|4|green|Low|Medium|true|cfpb2025
credit-repair-exact|Rebuilding Strategy|how to repair credit when your credit reports have no errors|5|green|High|High|false|experianRepair
`;

export const creditFinalDeepAuditKeywords = buildKeywords("final-deep-audit", finalDeepAuditSource.trim().split("\n").map((line) => {
  const [categoryId, subcategory, keyword, rank, tier, demand, difficulty, specialistReview, sourceKey] = line.split("|");
  return {
    categoryId,
    subcategory,
    keyword,
    rank: Number(rank) as CreditKeyword["rank"],
    tier: tier as CreditKeyword["tier"],
    demand: demand as CreditKeyword["demand"],
    difficulty: difficulty as CreditKeyword["difficulty"],
    specialistReview: specialistReview === "true",
    sourceUrls: sources[sourceKey as keyof typeof sources],
  };
})).map(routeExactCreditRepairPhrase);

export const creditRepairKeywords = finalizeCreditKeywords([...creditRepairCoreKeywords, ...accountErrorKeywords, ...bureauKeywords, ...specialtyReportKeywords, ...situationKeywords]);
export const creditLatestUpdateKeywords = finalizeCreditKeywords([...accountErrorKeywords, ...bureauKeywords, ...specialtyReportKeywords, ...situationKeywords, ...lifeEventKeywords, ...denialKeywords, ...adverseActionKeywords]);
export const creditPriorityTwoUpdateKeywords = finalizeCreditKeywords([...scoreEventKeywords, ...scoreMismatchKeywords, ...collectionTypeKeywords, ...validationKeywords, ...collectionEscalationKeywords, ...identityFraudKeywords, ...identityEscalationKeywords]);
export const creditKeywords = finalizeCreditKeywords([...creditRepairCoreKeywords, ...accountErrorKeywords, ...bureauKeywords, ...specialtyReportKeywords, ...situationKeywords, ...lifeEventKeywords, ...denialKeywords, ...adverseActionKeywords, ...scoreEventKeywords, ...scoreMismatchKeywords, ...collectionTypeKeywords, ...validationKeywords, ...collectionEscalationKeywords, ...identityFraudKeywords, ...identityEscalationKeywords, ...creditSaturationAuditKeywords, ...creditFinalDeepAuditKeywords]);

export function getCreditKeywords(categoryId: string) {
  return creditKeywords.filter((keyword) => keyword.categoryId === categoryId);
}
