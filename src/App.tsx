"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { discoveryPool } from "./mockDiscovery";
import { reviewDiscoveredTerm } from "./reviewer";
import type {
  CategoryNode,
  CategoryProposal,
  DiscoveryCandidate,
  DiscoveryRun,
  MockState,
  ResolvedTerm,
  TermOverride,
  TermRecord,
  TermStatus,
} from "./types";

const STORAGE_KEY = "mattress-term-atlas-state-v1";
const PAGE_SIZE = 50;
const RUN_INTERVAL_MS = 30 * 60 * 1000;

const tabs = [
  ["overview", "Overview"],
  ["master", "Master Terms"],
  ["approved", "Approved"],
  ["disapproved", "Disapproved"],
  ["categories", "Categories"],
  ["criteria", "Criteria"],
  ["runs", "Runs"],
] as const;

type TabId = (typeof tabs)[number][0];
type SortKey = "term" | "category" | "technicalDepth" | "lastSeenAt" | "confidence";

interface Filters {
  search: string;
  parentCategory: string;
  category: string;
  subcategory: string;
  intent: string;
  sourceType: string;
  technicalDepth: string;
  bodyPosition: string;
  brandOnly: boolean;
  reviewFlag: boolean;
}

const emptyFilters: Filters = {
  search: "",
  parentCategory: "",
  category: "",
  subcategory: "",
  intent: "",
  sourceType: "",
  technicalDepth: "",
  bodyPosition: "",
  brandOnly: false,
  reviewFlag: false,
};

function normalizeTerm(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

function number(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function clock(value: number) {
  const totalSeconds = Math.max(0, Math.floor(value / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function createEmptyState(): MockState {
  return {
    generatedTerms: [],
    overrides: {},
    duplicateSightings: {},
    runs: [],
    categoryProposals: [],
    nextRunAt: new Date(Date.now() + RUN_INTERVAL_MS).toISOString(),
  };
}

function buildGeneratedTerm(candidate: DiscoveryCandidate, index: number, timestamp: string): TermRecord {
  const decision = reviewDiscoveredTerm(candidate);
  const normalized = normalizeTerm(candidate.term);
  return {
    id: `generated-${Date.parse(timestamp)}-${index}`,
    term: candidate.term,
    normalizedTerm: normalized,
    primaryTerm: candidate.term,
    parentCategory: candidate.parentCategory,
    category: candidate.category,
    subcategory: candidate.subcategory,
    termClass: candidate.termClass,
    intent: candidate.intent,
    funnel: candidate.intent === "Transactional" ? "Decision" : candidate.intent === "Commercial" ? "Consideration" : "Awareness",
    pageType: decision.status === "approved" ? "Research opportunity" : "Do not target",
    audience: "U.S. English searchers",
    reviewRisk: candidate.specialistReview ? "Specialist review" : "No special review",
    specialistReview: decision.specialistReview,
    technicalDepth: candidate.technicalDepth ?? 2,
    businessFit: decision.status === "approved" ? 4 : 1,
    demandProxy: 2,
    sourceId: "SIM",
    sourceUrl: candidate.sourceUrl,
    rationale: decision.rationale,
    leadConnection: decision.leadConnection,
    bodyPositions: candidate.bodyPositions ?? [],
    isBrand: Boolean(candidate.isBrand),
    status: decision.status,
    decisionSource: "Independent reviewer simulation",
    confidence: decision.confidence,
    duplicateCount: 1,
    firstSeenAt: timestamp,
    lastSeenAt: timestamp,
    suggestedSlug: `/${slugify(candidate.term)}/`,
    sourceType: "Simulated discovery",
    saatvaDestination: "https://www.saatva.com/",
  };
}

function simulateRun(baseTerms: TermRecord[], knownCategoryNames: Set<string>, state: MockState, label: string): MockState {
  const startedAt = new Date().toISOString();
  const allTerms = [...baseTerms, ...state.generatedTerms];
  const byNormalized = new Map(allTerms.map((term) => [term.normalizedTerm, term]));
  const start = (state.runs.length * 12) % discoveryPool.length;
  const candidates = Array.from({ length: 12 }, (_, index) => discoveryPool[(start + index) % discoveryPool.length]);
  const generatedTerms = [...state.generatedTerms];
  const duplicateSightings = { ...state.duplicateSightings };
  const proposals = [...state.categoryProposals];
  let approvedCount = 0;
  let disapprovedCount = 0;
  let duplicateCount = 0;
  let proposedCategoryCount = 0;

  candidates.forEach((candidate, index) => {
    const normalized = normalizeTerm(candidate.term);
    const existing = byNormalized.get(normalized);
    if (existing) {
      duplicateSightings[existing.id] = (duplicateSightings[existing.id] ?? 0) + 1;
      duplicateCount += 1;
      return;
    }

    const term = buildGeneratedTerm(candidate, index, startedAt);
    generatedTerms.push(term);
    byNormalized.set(normalized, term);
    if (term.status === "approved") approvedCount += 1;
    else disapprovedCount += 1;

    if (!knownCategoryNames.has(candidate.category)) {
      const proposalId = `proposal-${slugify(`${candidate.parentCategory}-${candidate.category}`)}`;
      const existingProposalIndex = proposals.findIndex((proposal) => proposal.id === proposalId);
      if (existingProposalIndex >= 0) {
        proposals[existingProposalIndex] = {
          ...proposals[existingProposalIndex],
          termCount: proposals[existingProposalIndex].termCount + 1,
        };
      } else {
        proposals.push({
          id: proposalId,
          parentCategory: candidate.parentCategory,
          category: candidate.category,
          subcategory: candidate.subcategory,
          rationale: `Discovery found a recurring search angle that does not fit the active ${candidate.parentCategory} branches cleanly.`,
          termCount: 1,
          status: "proposed",
          createdAt: startedAt,
        });
        proposedCategoryCount += 1;
      }
    }
  });

  const run: DiscoveryRun = {
    id: `run-${Date.parse(startedAt)}`,
    label,
    startedAt,
    completedAt: new Date().toISOString(),
    discoveredCount: approvedCount + disapprovedCount,
    approvedCount,
    disapprovedCount,
    duplicateCount,
    proposedCategoryCount,
    status: "completed",
    simulated: true,
  };

  return {
    ...state,
    generatedTerms,
    duplicateSightings,
    categoryProposals: proposals,
    runs: [run, ...state.runs].slice(0, 50),
    nextRunAt: new Date(Date.now() + RUN_INTERVAL_MS).toISOString(),
  };
}

function resolveTerm(term: TermRecord, state: MockState): ResolvedTerm {
  const override = state.overrides[term.id];
  return {
    ...term,
    effectiveStatus: override?.status ?? term.status,
    effectiveParentCategory: override?.parentCategory || term.parentCategory,
    effectiveCategory: override?.category || term.category,
    effectiveSubcategory: override?.subcategory || term.subcategory,
    userOverride: override,
    totalSightings: term.duplicateCount + (state.duplicateSightings[term.id] ?? 0),
  };
}

function StatusPill({ status, locked = false }: { status: TermStatus; locked?: boolean }) {
  return (
    <span className={`status-pill ${status}`}>
      <span className="status-dot" />
      {status === "approved" ? "Approved" : "Disapproved"}
      {locked && <span aria-label="Locked by user"> · Locked</span>}
    </span>
  );
}

function KpiCard({ label, value, note, tone = "neutral" }: { label: string; value: string; note: string; tone?: string }) {
  return (
    <article className={`kpi-card ${tone}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-note">{note}</div>
    </article>
  );
}

export default function App() {
  const [seedTerms, setSeedTerms] = useState<TermRecord[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryNode[]>([]);
  const [mockState, setMockState] = useState<MockState | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("term");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set(["Mattress Products", "Materials & Construction"]));
  const [proposalMergeTargets, setProposalMergeTargets] = useState<Record<string, string>>({});
  const initializedRef = useRef(false);
  const scheduledRunRef = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch("/data/terms.json").then((response) => response.json()),
      fetch("/data/categories.json").then((response) => response.json()),
    ])
      .then(([terms, categories]: [TermRecord[], CategoryNode[]]) => {
        setSeedTerms(terms);
        setCategoryData(categories);
      })
      .catch(() => setError("The seed dataset could not be loaded."));
  }, []);

  useEffect(() => {
    if (!seedTerms.length || !categoryData.length || initializedRef.current) return;
    initializedRef.current = true;
    const knownCategories = new Set(categoryData.map((row) => row.category));
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMockState(JSON.parse(stored) as MockState);
        return;
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setMockState(simulateRun(seedTerms, knownCategories, createEmptyState(), "Baseline simulation"));
  }, [seedTerms, categoryData]);

  useEffect(() => {
    if (!mockState) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
  }, [mockState]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const knownCategoryNames = useMemo(() => new Set(categoryData.map((row) => row.category)), [categoryData]);

  const runDiscovery = useCallback((label: string) => {
    if (!mockState || running) return;
    setRunning(true);
    window.setTimeout(() => {
      setMockState((current) => current ? simulateRun(seedTerms, knownCategoryNames, current, label) : current);
      setRunning(false);
      scheduledRunRef.current = false;
    }, 900);
  }, [knownCategoryNames, mockState, running, seedTerms]);

  useEffect(() => {
    if (!mockState || running || scheduledRunRef.current) return;
    if (now >= new Date(mockState.nextRunAt).getTime()) {
      scheduledRunRef.current = true;
      runDiscovery("Scheduled 30-minute simulation");
    }
  }, [mockState, now, runDiscovery, running]);

  const allTerms = useMemo(() => mockState ? [...seedTerms, ...mockState.generatedTerms].map((term) => resolveTerm(term, mockState)) : [], [seedTerms, mockState]);
  const termById = useMemo(() => new Map(allTerms.map((term) => [term.id, term])), [allTerms]);
  const selectedTerm = selectedId ? termById.get(selectedId) ?? null : null;

  const counts = useMemo(() => {
    let approved = 0;
    let disapproved = 0;
    let specialist = 0;
    let locked = 0;
    allTerms.forEach((term) => {
      if (term.effectiveStatus === "approved") approved += 1;
      else disapproved += 1;
      if (term.specialistReview) specialist += 1;
      if (term.userOverride) locked += 1;
    });
    return { approved, disapproved, specialist, locked };
  }, [allTerms]);

  const latestRun = mockState?.runs[0];
  const proposedCount = mockState?.categoryProposals.filter((proposal) => proposal.status === "proposed").length ?? 0;
  const nextRunMs = mockState ? new Date(mockState.nextRunAt).getTime() - now : RUN_INTERVAL_MS;

  const optionSets = useMemo(() => ({
    parents: [...new Set(allTerms.map((term) => term.effectiveParentCategory))].sort(),
    categories: [...new Set(allTerms.filter((term) => !filters.parentCategory || term.effectiveParentCategory === filters.parentCategory).map((term) => term.effectiveCategory))].sort(),
    subcategories: [...new Set(allTerms.filter((term) => !filters.category || term.effectiveCategory === filters.category).map((term) => term.effectiveSubcategory))].sort(),
    intents: [...new Set(allTerms.map((term) => term.intent))].sort(),
    sources: [...new Set(allTerms.map((term) => term.sourceType))].sort(),
  }), [allTerms, filters.category, filters.parentCategory]);

  const filteredTerms = useMemo(() => {
    const query = normalizeTerm(filters.search);
    const statusFilter = activeTab === "approved" ? "approved" : activeTab === "disapproved" ? "disapproved" : "";
    const filtered = allTerms.filter((term) => {
      if (statusFilter && term.effectiveStatus !== statusFilter) return false;
      if (query && !`${term.term} ${term.primaryTerm} ${term.effectiveCategory} ${term.effectiveSubcategory} ${term.rationale}`.toLowerCase().includes(query)) return false;
      if (filters.parentCategory && term.effectiveParentCategory !== filters.parentCategory) return false;
      if (filters.category && term.effectiveCategory !== filters.category) return false;
      if (filters.subcategory && term.effectiveSubcategory !== filters.subcategory) return false;
      if (filters.intent && term.intent !== filters.intent) return false;
      if (filters.sourceType && term.sourceType !== filters.sourceType) return false;
      if (filters.technicalDepth && term.technicalDepth !== Number(filters.technicalDepth)) return false;
      if (filters.bodyPosition && !term.bodyPositions.includes(filters.bodyPosition)) return false;
      if (filters.brandOnly && !term.isBrand) return false;
      if (filters.reviewFlag && !term.specialistReview) return false;
      return true;
    });

    return filtered.sort((left, right) => {
      let comparison = 0;
      if (sortKey === "term") comparison = left.term.localeCompare(right.term);
      if (sortKey === "category") comparison = left.effectiveCategory.localeCompare(right.effectiveCategory);
      if (sortKey === "technicalDepth") comparison = left.technicalDepth - right.technicalDepth;
      if (sortKey === "lastSeenAt") comparison = new Date(left.lastSeenAt).getTime() - new Date(right.lastSeenAt).getTime();
      if (sortKey === "confidence") comparison = left.confidence - right.confidence;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [activeTab, allTerms, filters, sortDirection, sortKey]);

  useEffect(() => setPage(1), [activeTab, filters, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredTerms.length / PAGE_SIZE));
  const visibleTerms = filteredTerms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const parentCoverage = useMemo(() => {
    const groups = new Map<string, { count: number; categoryCount: Set<string>; specialist: number }>();
    allTerms.forEach((term) => {
      const current = groups.get(term.effectiveParentCategory) ?? { count: 0, categoryCount: new Set<string>(), specialist: 0 };
      current.count += 1;
      current.categoryCount.add(term.effectiveCategory);
      if (term.specialistReview) current.specialist += 1;
      groups.set(term.effectiveParentCategory, current);
    });
    return [...groups.entries()].map(([name, values]) => ({ name, count: values.count, categories: values.categoryCount.size, specialist: values.specialist })).sort((left, right) => right.count - left.count);
  }, [allTerms]);

  const categoryTree = useMemo(() => {
    const parents = new Map<string, Map<string, CategoryNode[]>>();
    categoryData.forEach((node) => {
      if (!parents.has(node.parentCategory)) parents.set(node.parentCategory, new Map());
      const categories = parents.get(node.parentCategory)!;
      if (!categories.has(node.category)) categories.set(node.category, []);
      categories.get(node.category)!.push(node);
    });
    return [...parents.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [categoryData]);

  const changeSort = (key: SortKey) => {
    if (sortKey === key) setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const saveOverride = (term: ResolvedTerm, status: TermStatus, note: string, parentCategory: string, category: string, subcategory: string) => {
    const override: TermOverride = {
      status,
      note,
      parentCategory,
      category,
      subcategory,
      locked: true,
      updatedAt: new Date().toISOString(),
    };
    setMockState((current) => current ? { ...current, overrides: { ...current.overrides, [term.id]: override } } : current);
  };

  const resetOverride = (termId: string) => {
    setMockState((current) => {
      if (!current) return current;
      const overrides = { ...current.overrides };
      delete overrides[termId];
      return { ...current, overrides };
    });
  };

  const updateProposal = (proposalId: string, status: CategoryProposal["status"]) => {
    setMockState((current) => current ? {
      ...current,
      categoryProposals: current.categoryProposals.map((proposal) => proposal.id === proposalId ? {
        ...proposal,
        status,
        mergeTarget: status === "merged" ? proposalMergeTargets[proposalId] : undefined,
      } : proposal),
    } : current);
  };

  const resetSimulation = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setMockState(simulateRun(seedTerms, knownCategoryNames, createEmptyState(), "Baseline simulation"));
    setSelectedId(null);
    setFilters(emptyFilters);
  };

  if (error) {
    return <main className="loading-screen"><div className="error-card"><strong>Unable to open the Atlas</strong><p>{error}</p></div></main>;
  }

  if (!mockState || !seedTerms.length) {
    return <main className="loading-screen" aria-live="polite"><div className="loader" /><p>Indexing 11,339 mattress terms…</p></main>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setActiveTab("overview")} aria-label="Open overview">
          <span className="brand-mark">M</span>
          <span><strong>Mattress Term Atlas</strong><small>Private research workspace</small></span>
        </button>
        <div className="topbar-actions">
          <span className="private-badge"><span />Owner only</span>
          <a className="affiliate-badge" href="https://www.saatva.com/" target="_blank" rel="noreferrer" title="Display-only affiliate destination">Saatva.com <span>↗</span></a>
          <button className="primary-button compact" onClick={() => runDiscovery("Manual simulation")} disabled={running}>
            {running ? <><span className="button-spinner" /> Reviewing…</> : "+ Run Discovery"}
          </button>
        </div>
      </header>

      <nav className="tabbar" aria-label="Primary navigation">
        {tabs.map(([id, label]) => (
          <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>
            {label}
            {id === "disapproved" && counts.disapproved > 0 && <span className="nav-count">{counts.disapproved}</span>}
            {id === "categories" && proposedCount > 0 && <span className="nav-count accent">{proposedCount}</span>}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === "overview" && (
          <section className="overview-page">
            <div className="hero-grid">
              <div className="hero-copy">
                <span className="eyebrow">High-recall mattress intelligence</span>
                <h1>Every mattress term.<br />Continuously challenged.</h1>
                <p>The Atlas expands the market from every angle, then routes each term through a separate reviewer before it reaches your target list.</p>
                <div className="hero-actions">
                  <button className="primary-button" onClick={() => setActiveTab("master")}>Explore master list</button>
                  <button className="secondary-button" onClick={() => setActiveTab("criteria")}>Review criteria</button>
                </div>
              </div>
              <aside className="automation-card">
                <div className="automation-header">
                  <div><span className="live-indicator" />Simulation active</div>
                  <span className="simulation-chip">Mock agents</span>
                </div>
                <div className="countdown-label">Next discovery cycle</div>
                <div className="countdown">{clock(nextRunMs)}</div>
                <div className="agent-pipeline" aria-label="Simulated agent pipeline">
                  <div><span>1</span><strong>Discovery</strong><small>Find every angle</small></div>
                  <i>→</i>
                  <div><span>2</span><strong>Normalize</strong><small>Merge sightings</small></div>
                  <i>→</i>
                  <div><span>3</span><strong>Reviewer</strong><small>Independent decision</small></div>
                </div>
                <button className="automation-run" onClick={() => runDiscovery("Manual simulation")} disabled={running}>
                  {running ? "Agents are reviewing a batch…" : "Run this cycle now"}
                </button>
                <p>Runs only while this mockup is open. No live automation is enabled.</p>
              </aside>
            </div>

            <div className="kpi-grid">
              <KpiCard label="Master terms" value={number(allTerms.length)} note={`${number(seedTerms.length)} imported from workbook`} />
              <KpiCard label="Approved" value={number(counts.approved)} note="Natural mattress connection" tone="positive" />
              <KpiCard label="Disapproved" value={number(counts.disapproved)} note="No credible shopping bridge" tone="negative" />
              <KpiCard label="New this run" value={number(latestRun?.discoveredCount ?? 0)} note={`${latestRun?.duplicateCount ?? 0} duplicate sightings merged`} tone="accent" />
              <KpiCard label="Proposed categories" value={number(proposedCount)} note="Awaiting your taxonomy decision" tone="purple" />
              <KpiCard label="Specialist review" value={number(counts.specialist)} note="Medical, legal, safety or claims" tone="warning" />
            </div>

            <div className="overview-panels">
              <section className="panel recent-panel">
                <div className="panel-heading"><div><span className="eyebrow">Latest intelligence</span><h2>Recent discoveries</h2></div><button onClick={() => setActiveTab("master")}>View all</button></div>
                <div className="recent-list">
                  {mockState.generatedTerms.slice(-6).reverse().map((term) => {
                    const resolved = resolveTerm(term, mockState);
                    return (
                      <button className="recent-row" key={term.id} onClick={() => setSelectedId(term.id)}>
                        <div><strong>{term.term}</strong><span>{resolved.effectiveCategory} · {resolved.effectiveSubcategory}</span></div>
                        <StatusPill status={resolved.effectiveStatus} locked={Boolean(resolved.userOverride)} />
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="panel coverage-panel">
                <div className="panel-heading"><div><span className="eyebrow">Taxonomy health</span><h2>Coverage by angle</h2></div><button onClick={() => setActiveTab("categories")}>Open taxonomy</button></div>
                <div className="coverage-list">
                  {parentCoverage.slice(0, 6).map((item) => (
                    <div className="coverage-row" key={item.name}>
                      <div><strong>{item.name}</strong><span>{item.categories} categories</span></div>
                      <div className="coverage-meter"><span style={{ width: `${Math.max(8, item.count / parentCoverage[0].count * 100)}%` }} /></div>
                      <b>{number(item.count)}</b>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>
        )}

        {(activeTab === "master" || activeTab === "approved" || activeTab === "disapproved") && (
          <section className="terms-page">
            <div className="page-heading">
              <div>
                <span className="eyebrow">{activeTab === "master" ? "Complete inventory" : "Independent reviewer output"}</span>
                <h1>{activeTab === "master" ? "Master terms" : activeTab === "approved" ? "Approved terms" : "Disapproved terms"}</h1>
                <p>{activeTab === "master" ? "Every normalized seed and simulated discovery, with duplicates preserved as sightings." : activeTab === "approved" ? "Terms with a direct or adjacent, honest route to mattress consideration." : "Terms where a mattress angle would be absent or forced. You can override any decision."}</p>
              </div>
              <div className="heading-stat"><strong>{number(filteredTerms.length)}</strong><span>matching terms</span></div>
            </div>

            <div className="filter-card">
              <div className="filter-primary-row">
                <label className="search-box"><span>⌕</span><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search terms, categories, rationale…" aria-label="Search terms" /></label>
                <select value={filters.parentCategory} onChange={(event) => setFilters({ ...filters, parentCategory: event.target.value, category: "", subcategory: "" })} aria-label="Filter by parent category">
                  <option value="">All angles</option>{optionSets.parents.map((option) => <option key={option}>{option}</option>)}
                </select>
                <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value, subcategory: "" })} aria-label="Filter by category">
                  <option value="">All categories</option>{optionSets.categories.map((option) => <option key={option}>{option}</option>)}
                </select>
                <button className={`filter-toggle ${showAdvanced ? "active" : ""}`} onClick={() => setShowAdvanced((value) => !value)}>Filters <span>{showAdvanced ? "−" : "+"}</span></button>
                <button className="clear-button" onClick={() => setFilters(emptyFilters)} disabled={JSON.stringify(filters) === JSON.stringify(emptyFilters)}>Clear</button>
              </div>
              {showAdvanced && (
                <div className="advanced-filters">
                  <label><span>Subcategory</span><select value={filters.subcategory} onChange={(event) => setFilters({ ...filters, subcategory: event.target.value })}><option value="">Any subcategory</option>{optionSets.subcategories.map((option) => <option key={option}>{option}</option>)}</select></label>
                  <label><span>Intent</span><select value={filters.intent} onChange={(event) => setFilters({ ...filters, intent: event.target.value })}><option value="">Any intent</option>{optionSets.intents.map((option) => <option key={option}>{option}</option>)}</select></label>
                  <label><span>Source</span><select value={filters.sourceType} onChange={(event) => setFilters({ ...filters, sourceType: event.target.value })}><option value="">Any source</option>{optionSets.sources.map((option) => <option key={option}>{option}</option>)}</select></label>
                  <label><span>Technical depth</span><select value={filters.technicalDepth} onChange={(event) => setFilters({ ...filters, technicalDepth: event.target.value })}><option value="">Any depth</option>{[1,2,3,4,5].map((depth) => <option key={depth} value={depth}>{depth} / 5</option>)}</select></label>
                  <label><span>Body position</span><select value={filters.bodyPosition} onChange={(event) => setFilters({ ...filters, bodyPosition: event.target.value })}><option value="">Any position</option><option value="side">Side</option><option value="back">Back</option><option value="stomach">Stomach</option><option value="combination">Combination</option><option value="fetal">Fetal</option></select></label>
                  <label className="check-filter"><input type="checkbox" checked={filters.brandOnly} onChange={(event) => setFilters({ ...filters, brandOnly: event.target.checked })} /><span><strong>Brand names</strong><small>Only brand or retailer terms</small></span></label>
                  <label className="check-filter"><input type="checkbox" checked={filters.reviewFlag} onChange={(event) => setFilters({ ...filters, reviewFlag: event.target.checked })} /><span><strong>Specialist review</strong><small>Medical, legal, safety or claims</small></span></label>
                </div>
              )}
            </div>

            <div className="table-card">
              <div className="table-scroll">
                <table>
                  <thead><tr>
                    <th><button onClick={() => changeSort("term")}>Term {sortKey === "term" && (sortDirection === "asc" ? "↑" : "↓")}</button></th>
                    <th><button onClick={() => changeSort("category")}>Category {sortKey === "category" && (sortDirection === "asc" ? "↑" : "↓")}</button></th>
                    <th>Intent</th>
                    <th><button onClick={() => changeSort("technicalDepth")}>Depth {sortKey === "technicalDepth" && (sortDirection === "asc" ? "↑" : "↓")}</button></th>
                    <th>Source</th>
                    <th><button onClick={() => changeSort("confidence")}>Decision {sortKey === "confidence" && (sortDirection === "asc" ? "↑" : "↓")}</button></th>
                    <th><span className="sr-only">Open</span></th>
                  </tr></thead>
                  <tbody>
                    {visibleTerms.map((term) => (
                      <tr key={term.id} tabIndex={0} onClick={() => setSelectedId(term.id)} onKeyDown={(event) => { if (event.key === "Enter") setSelectedId(term.id); }}>
                        <td><div className="term-cell"><strong>{term.term}</strong><span>{term.termClass}{term.isBrand ? " · Brand" : ""}{term.totalSightings > 1 ? ` · ${term.totalSightings} sightings` : ""}</span></div></td>
                        <td><div className="category-cell"><strong>{term.effectiveCategory}</strong><span>{term.effectiveSubcategory}</span></div></td>
                        <td><span className="intent-pill">{term.intent}</span></td>
                        <td><div className="depth-dots" aria-label={`Technical depth ${term.technicalDepth} of 5`}>{[1,2,3,4,5].map((dot) => <i key={dot} className={dot <= term.technicalDepth ? "filled" : ""} />)}</div></td>
                        <td><div className="source-cell"><span>{term.sourceType}</span><small>{term.sourceId}</small></div></td>
                        <td><StatusPill status={term.effectiveStatus} locked={Boolean(term.userOverride)} /></td>
                        <td><button className="row-open" onClick={(event) => { event.stopPropagation(); setSelectedId(term.id); }} aria-label={`Review ${term.term}`}>›</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visibleTerms.length && <div className="empty-state"><span>⌕</span><h3>No terms match these filters</h3><p>Clear a filter or broaden your search.</p><button className="secondary-button" onClick={() => setFilters(emptyFilters)}>Reset filters</button></div>}
              </div>
              <div className="pagination">
                <span>Showing {visibleTerms.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredTerms.length)} of {number(filteredTerms.length)}</span>
                <div><button onClick={() => setPage(1)} disabled={page === 1}>«</button><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>‹</button><span>Page {page} of {totalPages}</span><button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>›</button><button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button></div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "categories" && (
          <section className="categories-page">
            <div className="page-heading"><div><span className="eyebrow">Category and subcategory system</span><h1>Taxonomy</h1><p>The workbook hierarchy is preserved, while simulated agents can propose new angles that do not fit cleanly.</p></div><div className="heading-stat"><strong>{categoryData.length + proposedCount}</strong><span>category paths</span></div></div>

            {mockState.categoryProposals.length > 0 && (
              <section className="proposal-section">
                <div className="section-title"><div><span className="eyebrow">Agent proposals</span><h2>New category decisions</h2></div><span>{proposedCount} awaiting review</span></div>
                <div className="proposal-grid">
                  {mockState.categoryProposals.map((proposal) => (
                    <article className={`proposal-card ${proposal.status}`} key={proposal.id}>
                      <div className="proposal-top"><span className={`proposal-status ${proposal.status}`}>{proposal.status}</span><small>{proposal.termCount} term{proposal.termCount === 1 ? "" : "s"}</small></div>
                      <span className="proposal-parent">{proposal.parentCategory}</span>
                      <h3>{proposal.category}</h3>
                      <p>{proposal.rationale}</p>
                      {proposal.status === "proposed" ? (
                        <div className="proposal-actions">
                          <button className="approve-action" onClick={() => updateProposal(proposal.id, "approved")}>Approve</button>
                          <button onClick={() => updateProposal(proposal.id, "rejected")}>Reject</button>
                          <div className="merge-action"><select value={proposalMergeTargets[proposal.id] ?? ""} onChange={(event) => setProposalMergeTargets({ ...proposalMergeTargets, [proposal.id]: event.target.value })}><option value="">Merge into…</option>{[...knownCategoryNames].sort().map((category) => <option key={category}>{category}</option>)}</select><button disabled={!proposalMergeTargets[proposal.id]} onClick={() => updateProposal(proposal.id, "merged")}>Merge</button></div>
                        </div>
                      ) : (
                        <div className="proposal-complete"><span>{proposal.status === "merged" ? `Merged into ${proposal.mergeTarget}` : `Category ${proposal.status}`}</span><button onClick={() => updateProposal(proposal.id, "proposed")}>Reopen</button></div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="taxonomy-section">
              <div className="section-title"><div><span className="eyebrow">Active hierarchy</span><h2>Every angle, nested</h2></div><span>9 parent angles</span></div>
              <div className="taxonomy-list">
                {categoryTree.map(([parent, categoryMap]) => {
                  const nodes = [...categoryMap.values()].flat();
                  const count = nodes.reduce((sum, node) => sum + node.count, 0);
                  const expanded = expandedParents.has(parent);
                  return (
                    <article className="taxonomy-parent" key={parent}>
                      <button className="taxonomy-parent-button" onClick={() => setExpandedParents((current) => { const next = new Set(current); if (next.has(parent)) next.delete(parent); else next.add(parent); return next; })} aria-expanded={expanded}>
                        <span className="taxonomy-icon">{expanded ? "−" : "+"}</span><div><strong>{parent}</strong><span>{categoryMap.size} categories · {number(count)} terms</span></div><b>{number(count)}</b>
                      </button>
                      {expanded && <div className="taxonomy-children">{[...categoryMap.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([category, children]) => <div className="taxonomy-category" key={category}><div className="taxonomy-category-heading"><strong>{category}</strong><span>{number(children.reduce((sum, child) => sum + child.count, 0))}</span></div><div className="subcategory-list">{children.sort((left, right) => right.count - left.count).map((child) => <button key={child.id} onClick={() => { setFilters({ ...emptyFilters, parentCategory: parent, category, subcategory: child.subcategory }); setActiveTab("master"); }}><span>{child.subcategory}</span><small>{number(child.count)}</small></button>)}</div></div>)}</div>}
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        )}

        {activeTab === "criteria" && (
          <section className="criteria-page">
            <div className="criteria-hero"><span className="eyebrow">Independent reviewer specification</span><h1>Keep almost everything.<br />Never force the connection.</h1><p>The reviewer is deliberately high-recall. It approves any term where a genuinely useful page could make someone consider, compare, replace, or buy a mattress.</p></div>
            <div className="criteria-grid">
              <article className="criteria-card approve"><span>01</span><h2>Approve</h2><p>Keep the term when at least one honest mattress-shopping bridge can be stated clearly.</p><ul><li>Products, sizes, materials, construction and brands</li><li>Body position, temperature, couples and lifestyle needs</li><li>Pain, health or accessibility topics with mattress implications</li><li>Care problems, damage and replacement triggers</li><li>Delivery, trials, returns, warranties and disposal</li><li>Adjacent home or travel needs where the mattress matters</li></ul></article>
              <article className="criteria-card reject"><span>02</span><h2>Disapprove</h2><p>Reject only when the mattress angle would be absent, deceptive, or obviously forced.</p><ul><li>No bed, sleep, home, health or buying relationship</li><li>Unrelated products with no mattress use case</li><li>Nonsensical or spam-generated combinations</li><li>A content page could not satisfy the original query honestly</li></ul></article>
              <article className="criteria-card flag"><span>03</span><h2>Approve + flag</h2><p>Risk does not automatically make a term unsuitable. It changes the editorial workflow.</p><ul><li>Medical and pain-related topics</li><li>Safety, chemicals, emissions and fire barriers</li><li>Certification, organic and environmental claims</li><li>Regulation, compliance and warranty interpretation</li></ul></article>
            </div>
            <section className="review-separation">
              <div><span className="step-number">A</span><h3>Discovery agent</h3><p>Searches broadly, challenges gaps, proposes terms and categories, and makes no approval decision.</p></div><i>→</i><div><span className="step-number">B</span><h3>Normalizer</h3><p>Merges exact normalized terms while preserving each source, sighting and timestamp.</p></div><i>→</i><div><span className="step-number">C</span><h3>Independent reviewer</h3><p>Receives the term, evidence and criteria—never the discovery agent’s recommendation or rationale.</p></div><i>→</i><div><span className="step-number">You</span><h3>Final authority</h3><p>Your override locks the decision until you explicitly reset it. Future sightings never erase it.</p></div>
            </section>
            <div className="criteria-note"><strong>Saatva is display-only.</strong><span>The affiliate relationship does not influence approval, confidence, or category placement in this mockup.</span></div>
          </section>
        )}

        {activeTab === "runs" && (
          <section className="runs-page">
            <div className="page-heading"><div><span className="eyebrow">Simulated automation history</span><h1>Discovery runs</h1><p>Each cycle separates discovery from review and publishes only after a binary decision.</p></div><button className="primary-button" onClick={() => runDiscovery("Manual simulation")} disabled={running}>{running ? "Reviewing batch…" : "Run Discovery Now"}</button></div>
            <div className="run-summary-grid"><KpiCard label="Completed runs" value={number(mockState.runs.length)} note="Stored on this device" /><KpiCard label="Generated terms" value={number(mockState.generatedTerms.length)} note="Beyond the seed workbook" tone="accent" /><KpiCard label="Duplicate sightings" value={number(Object.values(mockState.duplicateSightings).reduce((sum, count) => sum + count, 0))} note="Merged, never discarded" tone="purple" /><KpiCard label="User locks" value={number(counts.locked)} note="Always override the agents" tone="warning" /></div>
            <div className="runs-list">
              {mockState.runs.map((run) => (
                <article className="run-card" key={run.id}>
                  <div className="run-top"><div><span className="simulation-chip">Simulated</span><h2>{run.label}</h2><p>{new Date(run.completedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p></div><span className="run-complete">Completed</span></div>
                  <div className="run-metrics"><div><strong>{run.discoveredCount}</strong><span>New terms</span></div><div><strong>{run.approvedCount}</strong><span>Approved</span></div><div><strong>{run.disapprovedCount}</strong><span>Disapproved</span></div><div><strong>{run.duplicateCount}</strong><span>Duplicates</span></div><div><strong>{run.proposedCategoryCount}</strong><span>New categories</span></div></div>
                  <div className="run-pipeline"><span><i>✓</i>Discovery agent</span><b>→</b><span><i>✓</i>Normalizer</span><b>→</b><span><i>✓</i>Independent reviewer</span><b>→</b><span><i>✓</i>Atlas updated</span></div>
                </article>
              ))}
            </div>
            <div className="simulation-reset"><div><strong>Reset this mock workspace</strong><span>Clears simulated terms, run history, category decisions and locked overrides from this browser.</span></div><button onClick={resetSimulation}>Reset simulation</button></div>
          </section>
        )}
      </main>

      <footer><span>Mattress Term Atlas · U.S. English research mockup</span><span>11,339 workbook terms · 30-minute simulation · No live agents</span></footer>

      {selectedTerm && (
        <TermDrawer
          term={selectedTerm}
          parentOptions={optionSets.parents}
          categoryOptions={[...knownCategoryNames].sort()}
          onClose={() => setSelectedId(null)}
          onSave={saveOverride}
          onReset={() => resetOverride(selectedTerm.id)}
        />
      )}
    </div>
  );
}

function TermDrawer({ term, parentOptions, categoryOptions, onClose, onSave, onReset }: {
  term: ResolvedTerm;
  parentOptions: string[];
  categoryOptions: string[];
  onClose: () => void;
  onSave: (term: ResolvedTerm, status: TermStatus, note: string, parentCategory: string, category: string, subcategory: string) => void;
  onReset: () => void;
}) {
  const [status, setStatus] = useState<TermStatus>(term.effectiveStatus);
  const [note, setNote] = useState(term.userOverride?.note ?? "");
  const [parentCategory, setParentCategory] = useState(term.effectiveParentCategory);
  const [category, setCategory] = useState(term.effectiveCategory);
  const [subcategory, setSubcategory] = useState(term.effectiveSubcategory);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="term-drawer" role="dialog" aria-modal="true" aria-labelledby="term-drawer-title">
        <div className="drawer-header"><div><span className="eyebrow">Term record</span><h2 id="term-drawer-title">{term.term}</h2></div><button ref={closeRef} className="drawer-close" onClick={onClose} aria-label="Close term details">×</button></div>
        <div className="drawer-status-line"><StatusPill status={term.effectiveStatus} locked={Boolean(term.userOverride)} /><span>{term.confidence}% reviewer confidence</span>{term.specialistReview && <span className="review-flag">Specialist review</span>}</div>

        <section className="drawer-section"><h3>Why it belongs here</h3><p>{term.rationale}</p><div className="lead-connection"><span>Mattress-shopping connection</span><strong>{term.leadConnection}</strong></div></section>

        <section className="drawer-section metadata-grid"><div><span>Category path</span><strong>{term.effectiveParentCategory}<br />{term.effectiveCategory}<br />{term.effectiveSubcategory}</strong></div><div><span>Search intent</span><strong>{term.intent}<br />{term.funnel}</strong></div><div><span>Term class</span><strong>{term.termClass}</strong></div><div><span>Sightings</span><strong>{term.totalSightings}</strong></div><div><span>First seen</span><strong>{new Date(term.firstSeenAt).toLocaleDateString()}</strong></div><div><span>Last seen</span><strong>{relativeTime(term.lastSeenAt)}</strong></div></section>

        <section className="drawer-section source-box"><div><span>Discovery source</span><strong>{term.sourceType} · {term.sourceId}</strong></div><a href={term.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a></section>

        <section className="drawer-section affiliate-box"><div><span>Display-only affiliate</span><strong>Saatva.com</strong><small>Does not affect approval</small></div><a href={term.saatvaDestination} target="_blank" rel="noreferrer">Open ↗</a></section>

        <section className="drawer-section override-section"><div className="override-heading"><div><h3>Your decision</h3><p>Saving creates a locked override that future runs cannot change.</p></div>{term.userOverride && <span className="locked-chip">Locked by you</span>}</div><div className="decision-buttons"><button className={status === "approved" ? "selected approve" : "approve"} onClick={() => setStatus("approved")}><span>✓</span>Approve</button><button className={status === "disapproved" ? "selected reject" : "reject"} onClick={() => setStatus("disapproved")}><span>×</span>Disapprove</button></div><div className="override-fields"><label><span>Parent angle</span><select value={parentCategory} onChange={(event) => setParentCategory(event.target.value)}>{parentOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categoryOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label><span>Subcategory</span><input value={subcategory} onChange={(event) => setSubcategory(event.target.value)} /></label><label><span>Override note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why are you changing or confirming this decision?" /></label></div><div className="drawer-actions">{term.userOverride && <button className="reset-override" onClick={() => { onReset(); onClose(); }}>Reset to agent decision</button>}<button className="primary-button" onClick={() => { onSave(term, status, note, parentCategory, category, subcategory); onClose(); }}>Save locked override</button></div></section>
      </aside>
    </div>
  );
}
