export interface CreditCategory {
  id: string;
  name: string;
  description: string;
  priority: number;
  suggested?: boolean;
}

export interface CreditKeyword {
  id: string;
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
  { id: "credit-repair", name: "Credit Repair", priority: 1, description: "Missing page opportunities for fixing inaccurate reporting, escalating disputes, rebuilding credit, and choosing repair help." },
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
Identity Theft Recovery|credit repair after tax identity theft|4|green|Medium|Medium
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

export const creditRepairKeywords: CreditKeyword[] = keywordSource.trim().split("\n").map((line, index) => {
  const [subcategory, keyword, rank, tier, demand, difficulty] = line.split("|");
  return {
    id: `credit-repair-${String(index + 1).padStart(3, "0")}`,
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
