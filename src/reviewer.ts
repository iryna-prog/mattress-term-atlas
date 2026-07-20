import type { DiscoveryCandidate, ReviewDecision } from "./types";

const directSignals = /mattress|bed\b|bedding|latex|memory foam|polyfoam|innerspring|coil|spring|sleep surface|pillow top|euro top|box spring|bed frame|adjustable base|crib|futon|topper/i;
const shopperSignals = /best|review|versus|\bvs\b|price|cost|sale|coupon|warranty|trial|return|delivery|replace|replacement|sag|firm|soft|cooling|hot sleeper|side sleeper|back sleeper|stomach sleeper|body pain|allergy|organic|non-toxic|fiberglass/i;
const adjacentSignals = /sleep|bedroom|moving|stairs|doorway|apartment|hotel|rv|truck|boat|pregnancy|menopause|arthritis|back pain|shoulder pain|hip pain|temperature|humidity|pet|couple|senior|college|guest room/i;
const trustedParents = new Set([
  "Mattress Products",
  "Materials & Construction",
  "Shopper Fit",
  "Brands & Retailers",
  "Purchase Intent",
  "Ownership",
  "Specialty Environments",
  "Safety & Trust",
]);

export function reviewDiscoveredTerm(candidate: DiscoveryCandidate): ReviewDecision {
  const searchable = `${candidate.term} ${candidate.category} ${candidate.subcategory} ${candidate.evidence}`;
  let score = 0;
  if (directSignals.test(searchable)) score += 5;
  if (shopperSignals.test(searchable)) score += 3;
  if (adjacentSignals.test(searchable)) score += 2;
  if (trustedParents.has(candidate.parentCategory)) score += 3;
  if (/commercial|transactional|navigational/i.test(candidate.intent)) score += 2;

  const approved = score >= 2;
  if (!approved) {
    return {
      status: "disapproved",
      confidence: Math.max(76, 96 - score * 4),
      rationale: "The independent reviewer could not identify an honest mattress-shopping bridge without forcing the topic.",
      leadConnection: "No credible path from this search intent to mattress consideration was found.",
      specialistReview: false,
    };
  }

  const direct = directSignals.test(searchable);
  return {
    status: "approved",
    confidence: Math.min(98, 74 + score * 3),
    rationale: direct
      ? "The term directly informs mattress selection, comparison, ownership, materials, fit, or replacement."
      : "The topic is adjacent, but a useful page can naturally connect the user's need to mattress selection or replacement.",
    leadConnection: direct
      ? "Answer the query and guide the visitor toward an appropriate mattress type, feature, comparison, or replacement decision."
      : "Address the adjacent need first, then present mattress considerations only where they genuinely affect the outcome.",
    specialistReview: Boolean(candidate.specialistReview),
  };
}
