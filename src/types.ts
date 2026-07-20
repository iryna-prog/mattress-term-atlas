export type TermStatus = "approved" | "disapproved";
export type ProposalStatus = "proposed" | "approved" | "rejected" | "merged";

export interface TermRecord {
  id: string;
  term: string;
  normalizedTerm: string;
  primaryTerm: string;
  parentCategory: string;
  category: string;
  subcategory: string;
  termClass: string;
  intent: string;
  funnel: string;
  pageType: string;
  audience: string;
  reviewRisk: string;
  specialistReview: boolean;
  technicalDepth: number;
  businessFit: number;
  demandProxy: number;
  sourceId: string;
  sourceUrl: string;
  rationale: string;
  leadConnection: string;
  bodyPositions: string[];
  isBrand: boolean;
  status: TermStatus;
  decisionSource: string;
  confidence: number;
  duplicateCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  suggestedSlug: string;
  sourceType: string;
  saatvaDestination: string;
}

export interface CategoryNode {
  id: string;
  parentCategory: string;
  category: string;
  subcategory: string;
  count: number;
  specialistReviewCount: number;
  technicalCount: number;
}

export interface TermOverride {
  status: TermStatus;
  note: string;
  parentCategory: string;
  category: string;
  subcategory: string;
  locked: true;
  updatedAt: string;
}

export interface ReviewDecision {
  status: TermStatus;
  confidence: number;
  rationale: string;
  leadConnection: string;
  specialistReview: boolean;
}

export interface DiscoveryCandidate {
  term: string;
  parentCategory: string;
  category: string;
  subcategory: string;
  termClass: string;
  intent: string;
  evidence: string;
  sourceUrl: string;
  bodyPositions?: string[];
  isBrand?: boolean;
  specialistReview?: boolean;
  technicalDepth?: number;
}

export interface DiscoveryRun {
  id: string;
  label: string;
  startedAt: string;
  completedAt: string;
  discoveredCount: number;
  approvedCount: number;
  disapprovedCount: number;
  duplicateCount: number;
  proposedCategoryCount: number;
  status: "completed";
  simulated: true;
}

export interface CategoryProposal {
  id: string;
  parentCategory: string;
  category: string;
  subcategory: string;
  rationale: string;
  termCount: number;
  status: ProposalStatus;
  mergeTarget?: string;
  createdAt: string;
}

export interface MockState {
  generatedTerms: TermRecord[];
  overrides: Record<string, TermOverride>;
  duplicateSightings: Record<string, number>;
  runs: DiscoveryRun[];
  categoryProposals: CategoryProposal[];
  nextRunAt: string;
}

export interface ResolvedTerm extends TermRecord {
  effectiveStatus: TermStatus;
  effectiveParentCategory: string;
  effectiveCategory: string;
  effectiveSubcategory: string;
  userOverride?: TermOverride;
  totalSightings: number;
}
