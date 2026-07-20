"use client";

import { useEffect, useMemo, useState } from "react";

interface KeywordCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  count: number;
  subcategoryCount: number;
}

interface KeywordRecord {
  id: string;
  keyword: string;
  categoryId: string;
  category: string;
  subcategory: string;
  contentType: string;
  intent: string;
  source: string;
}

interface KeywordLibrary {
  generatedAt: string;
  market: string;
  criteria: string;
  totalKeywords: number;
  categories: KeywordCategory[];
  keywords: KeywordRecord[];
}

interface UpdateKeyword {
  keyword: string;
  categoryId: string;
  category: string;
  subcategory: string;
  specialistReview: boolean;
}

interface UpdateRun {
  id: string;
  date: string;
  summary: string;
  keywordsAdded: number;
  categoriesAdded: Array<{ id: string; name: string; description: string }>;
  categoryCounts: Array<{ category: string; count: number }>;
  keywords: UpdateKeyword[];
}

interface UpdateLog {
  generatedAt: string;
  runs: UpdateRun[];
}

const PAGE_SIZE = 120;
const typeOrder = ["All", "Guide", "FAQ", "Comparison", "Roundup", "Review", "Shopping"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export default function App() {
  const [library, setLibrary] = useState<KeywordLibrary | null>(null);
  const [activeCategory, setActiveCategory] = useState("latex");
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [copiedId, setCopiedId] = useState("");
  const [updates, setUpdates] = useState<UpdateLog>({ generatedAt: "", runs: [] });
  const [showUpdates, setShowUpdates] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/data/keyword-library.json").then((response) => {
        if (!response.ok) throw new Error("Keyword library request failed");
        return response.json() as Promise<KeywordLibrary>;
      }),
      fetch("/data/update-log.json")
        .then((response) => response.ok ? response.json() as Promise<UpdateLog> : { generatedAt: "", runs: [] })
        .catch(() => ({ generatedAt: "", runs: [] })),
    ])
      .then(([libraryData, updateData]) => {
        setLibrary(libraryData);
        setUpdates(updateData);
      })
      .catch(() => setError("The mattress keyword library could not be loaded."));
  }, []);

  useEffect(() => {
    if (!showUpdates) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowUpdates(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [showUpdates]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory, activeType, search]);

  const selectedCategory = library?.categories.find((category) => category.id === activeCategory) ?? null;
  const normalizedSearch = search.trim().toLowerCase();

  const filteredKeywords = useMemo(() => {
    if (!library) return [];
    return library.keywords.filter((record) => {
      if (!normalizedSearch && record.categoryId !== activeCategory) return false;
      if (normalizedSearch && !`${record.keyword} ${record.category} ${record.subcategory}`.includes(normalizedSearch)) return false;
      if (activeType !== "All" && record.contentType !== activeType) return false;
      return true;
    });
  }, [activeCategory, activeType, library, normalizedSearch]);

  const visibleKeywords = filteredKeywords.slice(0, visibleCount);
  const groupedKeywords = useMemo(() => {
    const groups = new Map<string, KeywordRecord[]>();
    visibleKeywords.forEach((record) => {
      const key = normalizedSearch ? record.category : record.subcategory;
      const current = groups.get(key) ?? [];
      current.push(record);
      groups.set(key, current);
    });
    return [...groups.entries()];
  }, [normalizedSearch, visibleKeywords]);

  const availableTypes = useMemo(() => {
    if (!library) return typeOrder;
    const records = normalizedSearch
      ? library.keywords.filter((record) => `${record.keyword} ${record.category} ${record.subcategory}`.includes(normalizedSearch))
      : library.keywords.filter((record) => record.categoryId === activeCategory);
    const present = new Set(records.map((record) => record.contentType));
    return typeOrder.filter((type) => type === "All" || present.has(type));
  }, [activeCategory, library, normalizedSearch]);

  const copyKeyword = async (record: KeywordRecord) => {
    try {
      await navigator.clipboard.writeText(record.keyword);
      setCopiedId(record.id);
      window.setTimeout(() => setCopiedId(""), 1200);
    } catch {
      setCopiedId("");
    }
  };

  const chooseCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearch("");
    setActiveType("All");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return <main className="state-screen"><div><strong>Unable to open the library</strong><p>{error}</p></div></main>;
  }

  if (!library) {
    return <main className="state-screen" aria-live="polite"><span className="loader" /><p>Loading mattress keywords…</p></main>;
  }

  const heading = normalizedSearch ? `Results for “${search.trim()}”` : selectedCategory?.name;
  const description = normalizedSearch
    ? `Mattress-specific matches across all ${library.categories.length} categories.`
    : selectedCategory?.description;
  const latestUpdate = updates.runs[0];

  return (
    <div className="site-shell">
      <header className="site-header">
        <button className="wordmark" onClick={() => chooseCategory("latex")}>
          <span className="wordmark-icon">M</span>
          <span><strong>Mattress Keyword Library</strong><small>U.S. SEO research</small></span>
        </button>
        <div className="header-actions">
          <button className="updates-button" onClick={() => setShowUpdates(true)}>
            <span>Updates</span>
            {latestUpdate && <small>+{formatNumber(latestUpdate.keywordsAdded)}</small>}
          </button>
          <div className="header-context">
            <span>Private workspace</span>
            <a href="https://www.saatva.com/" target="_blank" rel="noreferrer">Saatva affiliate ↗</a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">One library · mattress terms only</span>
            <h1>Choose a category.<br />Use the keywords.</h1>
            <p>No bare materials, unrelated test methods, or vague technical phrases. Every entry is written as a mattress page, comparison, brand page, roundup, or FAQ.</p>
          </div>
          <div className="hero-stats" aria-label="Library summary">
            <div><strong>{formatNumber(library.totalKeywords)}</strong><span>usable keywords</span></div>
            <div><strong>{library.categories.length}</strong><span>clear categories</span></div>
            <div><strong>{formatNumber(latestUpdate?.keywordsAdded ?? 0)}</strong><span>new in latest run</span></div>
          </div>
        </section>

        <section className="search-section" aria-label="Search mattress keywords">
          <span className="search-icon">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search latex, tight top, innerspring, side sleeper, Saatva…"
            aria-label="Search all mattress keywords"
          />
          {search && <button onClick={() => setSearch("")} aria-label="Clear search">Clear</button>}
        </section>

        <div className="quality-note">
          <span>Quality rule</span>
          <p><strong>“3D spacer fabric test method” is excluded.</strong> The qualified topic <strong>“3D spacer fabric in mattress covers”</strong> is included because a mattress shopper can understand and use it.</p>
        </div>

        <div className="mobile-category-select">
          <label htmlFor="category-select">Category</label>
          <select id="category-select" value={activeCategory} onChange={(event) => chooseCategory(event.target.value)}>
            {library.categories.map((category) => <option key={category.id} value={category.id}>{category.name} ({formatNumber(category.count)})</option>)}
          </select>
        </div>

        <div className="library-layout">
          <aside className="category-panel" aria-label="Mattress keyword categories">
            <div className="category-panel-heading"><span>Categories</span><small>{library.categories.length}</small></div>
            <div className="category-list">
              {library.categories.map((category) => (
                <button
                  key={category.id}
                  className={activeCategory === category.id && !normalizedSearch ? "active" : ""}
                  onClick={() => chooseCategory(category.id)}
                >
                  <span>{category.name}</span>
                  <small>{formatNumber(category.count)}</small>
                </button>
              ))}
            </div>
          </aside>

          <section className="keyword-panel">
            <div className="keyword-panel-heading">
              <div>
                <span className="eyebrow">{normalizedSearch ? "Search results" : "Selected category"}</span>
                <h2>{heading}</h2>
                <p>{description}</p>
              </div>
              <div className="result-count"><strong>{formatNumber(filteredKeywords.length)}</strong><span>keywords</span></div>
            </div>

            <div className="type-filters" aria-label="Filter by page type">
              {availableTypes.map((type) => (
                <button key={type} className={activeType === type ? "active" : ""} onClick={() => setActiveType(type)}>{type}</button>
              ))}
            </div>

            {groupedKeywords.length > 0 ? (
              <div className="keyword-groups">
                {groupedKeywords.map(([group, keywords]) => (
                  <section className="keyword-group" key={group}>
                    <div className="keyword-group-heading">
                      <h3>{group}</h3>
                      <span>{formatNumber(keywords.length)} shown</span>
                    </div>
                    <div className="keyword-list">
                      {keywords.map((record) => (
                        <article className="keyword-row" key={record.id}>
                          <div className="keyword-text">
                            <strong>{record.keyword}</strong>
                            {normalizedSearch && <span>{record.subcategory}</span>}
                          </div>
                          <div className="keyword-actions">
                            <span className={`type-badge ${record.contentType.toLowerCase()}`}>{record.contentType}</span>
                            <button onClick={() => copyKeyword(record)} aria-label={`Copy ${record.keyword}`}>
                              {copiedId === record.id ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="empty-state"><span>⌕</span><h3>No mattress keywords found</h3><p>Try a broader mattress phrase or select another page type.</p><button onClick={() => { setSearch(""); setActiveType("All"); }}>Reset filters</button></div>
            )}

            {visibleCount < filteredKeywords.length && (
              <button className="load-more" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Show 120 more keywords
                <span>{formatNumber(filteredKeywords.length - visibleCount)} remaining</span>
              </button>
            )}
          </section>
        </div>
      </main>

      <footer>
        <span>Mattress Keyword Library · U.S. English</span>
        <span>Daily FAQ research · Brands frozen · Saatva does not determine inclusion</span>
      </footer>

      {showUpdates && (
        <div className="updates-scrim">
          <section className="updates-drawer" role="dialog" aria-modal="true" aria-labelledby="updates-title">
            <div className="updates-drawer-header">
              <div>
                <span className="eyebrow">Daily research log</span>
                <h2 id="updates-title">What changed</h2>
                <p>New mattress FAQs and shopper questions are listed here. Brand expansion is paused.</p>
              </div>
              <button className="updates-close" onClick={() => setShowUpdates(false)} aria-label="Close updates">×</button>
            </div>

            {updates.runs.length > 0 ? (
              <div className="updates-runs">
                {updates.runs.map((run, index) => (
                  <details className="update-run" key={run.id} open={index === 0 ? true : undefined}>
                    <summary>
                      <div>
                        <strong>{formatDate(run.date)}</strong>
                        <span>{run.summary}</span>
                      </div>
                      <div className="update-total">
                        <strong>+{formatNumber(run.keywordsAdded)}</strong>
                        <span>{run.categoriesAdded.length > 0 ? `${run.categoriesAdded.length} new categories` : "existing categories"}</span>
                      </div>
                    </summary>
                    <div className="update-run-body">
                      <div className="update-counts">
                        {run.categoryCounts.map((item) => <span key={item.category}>{item.category} <strong>+{item.count}</strong></span>)}
                      </div>
                      {run.categoriesAdded.length > 0 && (
                        <div className="new-categories">
                          <strong>New categories</strong>
                          {run.categoriesAdded.map((category) => <span key={category.id}>{category.name}</span>)}
                        </div>
                      )}
                      <div className="update-keywords">
                        {run.keywords.map((record) => (
                          <article key={`${run.id}-${record.keyword}`}>
                            <div>
                              <strong>{record.keyword}</strong>
                              <span>{record.subcategory}{record.specialistReview ? " · specialist review" : ""}</span>
                            </div>
                            <button onClick={() => { chooseCategory(record.categoryId); setShowUpdates(false); }}>{record.category}</button>
                          </article>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="updates-empty"><strong>No research runs yet</strong><p>The first daily expansion will appear here.</p></div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
