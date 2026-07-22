"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

interface KeywordCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  count: number;
  subcategoryCount: number;
  priority: number;
  priorityReason: string;
  greenCount: number;
  yellowCount: number;
  redCount: number;
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
  categoryPriority: number;
  opportunityScore: number;
  priorityTier: "green" | "yellow" | "red";
  demandEstimate: "High" | "Medium" | "Low";
  difficultyEstimate: "High" | "Medium" | "Low";
  priorityReason: string;
  aliases?: string[];
  sourceUrls?: string[];
}

interface KeywordLibrary {
  generatedAt: string;
  market: string;
  criteria: string;
  rankingMethod: string;
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
  opportunityScore: number;
  priorityTier: "green" | "yellow" | "red";
  demandEstimate: "High" | "Medium" | "Low";
  difficultyEstimate: "High" | "Medium" | "Low";
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

interface CodeCategory {
  id: string;
  name: string;
  description: string;
  priority: number;
  subcategories: string[];
}

const PAGE_SIZE = 120;
const typeOrder = ["All", "Guide", "FAQ", "Comparison", "Roundup", "Review", "Shopping"];
const priorityFilters = [
  { id: "All", label: "All opportunities" },
  { id: "green", label: "Green · target first" },
  { id: "yellow", label: "Yellow · supporting" },
  { id: "red", label: "Red · keep, low priority" },
];

const codeCategories: CodeCategory[] = [
  { id: "ai-coding-tools", name: "AI Coding Tools", priority: 1, description: "AI code assistants, copilots, editors, builders, model capabilities, pricing, reviews, and comparisons.", subcategories: ["AI coding assistants", "AI IDEs and editors", "App builders", "Tool comparisons", "Pricing and plans", "Reviews and alternatives"] },
  { id: "vibe-coding", name: "Vibe Coding", priority: 1, description: "Natural-language software creation, workflows, limitations, best practices, and real-world projects.", subcategories: ["Vibe coding basics", "Workflows", "Project ideas", "Best tools", "Safety and limitations", "Production readiness"] },
  { id: "prompting-code", name: "Prompting for Code", priority: 1, description: "Prompts and context strategies that help AI generate, explain, refactor, test, and repair code.", subcategories: ["Code generation prompts", "Debugging prompts", "Refactoring prompts", "Testing prompts", "Context engineering", "Prompt patterns"] },
  { id: "code-generation", name: "AI Code Generation", priority: 1, description: "Generating applications, features, functions, scripts, components, APIs, and infrastructure with AI.", subcategories: ["Generate apps", "Generate functions", "Generate APIs", "Generate UI", "Generate scripts", "Generate infrastructure"] },
  { id: "debugging-errors", name: "Debugging & Error Fixes", priority: 1, description: "Search-led solutions for programming errors, stack traces, broken builds, runtime failures, and AI debugging.", subcategories: ["Error messages", "Runtime errors", "Build errors", "Dependency errors", "Browser errors", "AI-assisted debugging"] },
  { id: "agents-automation", name: "Coding Agents & Automation", priority: 1, description: "Autonomous coding agents, task planning, tool use, repositories, guardrails, and multi-agent workflows.", subcategories: ["Coding agents", "Agent workflows", "Multi-agent coding", "Tool use", "Repository agents", "Guardrails and approvals"] },
  { id: "frontend", name: "Frontend Development", priority: 2, description: "Web interfaces, components, styling, accessibility, browser behavior, and AI-assisted frontend work.", subcategories: ["HTML and CSS", "JavaScript UI", "Components", "Responsive design", "Accessibility", "Browser APIs"] },
  { id: "backend-apis", name: "Backend & APIs", priority: 2, description: "Servers, REST, GraphQL, authentication, background jobs, architecture, and AI-generated backend code.", subcategories: ["REST APIs", "GraphQL", "Authentication", "Server architecture", "Background jobs", "Webhooks"] },
  { id: "languages", name: "Programming Languages", priority: 2, description: "Language-specific coding, migration, syntax, tooling, AI workflows, and comparisons.", subcategories: ["Python", "JavaScript and TypeScript", "Java and Kotlin", "C and C++", "C# and .NET", "Go, Rust, Ruby and PHP"] },
  { id: "frameworks", name: "Frameworks & Libraries", priority: 2, description: "Framework tutorials, implementation questions, migrations, comparisons, and AI-assisted development.", subcategories: ["React and Next.js", "Vue and Nuxt", "Angular", "Node frameworks", "Python frameworks", "Mobile frameworks"] },
  { id: "testing", name: "Testing & QA", priority: 2, description: "Unit, integration, end-to-end, visual, performance, and AI-generated software testing.", subcategories: ["Unit testing", "Integration testing", "E2E testing", "Test generation", "Mocking", "QA automation"] },
  { id: "code-review", name: "Code Review & Refactoring", priority: 2, description: "Code quality, maintainability, technical debt, review automation, and safe refactoring.", subcategories: ["AI code review", "Refactoring", "Code smells", "Technical debt", "Clean code", "Pull request review"] },
  { id: "databases", name: "Databases & Data Modeling", priority: 2, description: "SQL, NoSQL, schemas, queries, migrations, ORMs, vector databases, and database debugging.", subcategories: ["SQL", "NoSQL", "Data modeling", "ORMs", "Migrations", "Vector databases"] },
  { id: "devops", name: "DevOps & CI/CD", priority: 2, description: "Build pipelines, containers, automation, observability, releases, and infrastructure workflows.", subcategories: ["CI/CD", "Docker", "Kubernetes", "Infrastructure as code", "Monitoring", "Release automation"] },
  { id: "git", name: "Git, GitHub & Collaboration", priority: 2, description: "Version control, repositories, branching, pull requests, merge conflicts, and AI collaboration.", subcategories: ["Git commands", "GitHub workflows", "Branches", "Merge conflicts", "Pull requests", "Repository setup"] },
  { id: "deployment", name: "Deployment & Hosting", priority: 2, description: "Deploying websites, applications, APIs, databases, containers, and AI-generated projects.", subcategories: ["Frontend deployment", "Server deployment", "Serverless", "Domains and DNS", "Environment variables", "Deployment errors"] },
  { id: "security", name: "Application Security", priority: 3, description: "Secure coding, vulnerability prevention, authentication, secrets, dependencies, and AI code safety.", subcategories: ["Secure coding", "OWASP", "Authentication security", "Secrets management", "Dependency security", "AI security review"] },
  { id: "performance", name: "Performance & Optimization", priority: 3, description: "Speed, memory, bundles, databases, networks, profiling, and AI-assisted optimization.", subcategories: ["Web performance", "Backend performance", "Database performance", "Profiling", "Bundle optimization", "Caching"] },
  { id: "cloud", name: "Cloud Development", priority: 3, description: "Building and deploying software across major cloud platforms and managed services.", subcategories: ["AWS", "Google Cloud", "Azure", "Cloud functions", "Cloud databases", "Cloud architecture"] },
  { id: "mobile", name: "Mobile App Development", priority: 3, description: "iOS, Android, cross-platform apps, mobile UI, APIs, deployment, and AI app builders.", subcategories: ["iOS", "Android", "React Native", "Flutter", "Mobile UI", "App store deployment"] },
  { id: "data-ai", name: "Data, ML & AI Development", priority: 3, description: "Data pipelines, machine learning, LLM applications, RAG, embeddings, and AI APIs.", subcategories: ["Data engineering", "Machine learning", "LLM apps", "RAG", "Embeddings", "AI APIs"] },
  { id: "ide-tooling", name: "IDEs, Editors & Developer Tools", priority: 3, description: "Editors, extensions, terminals, package managers, linters, formatters, and local environments.", subcategories: ["Code editors", "IDE extensions", "Terminals", "Package managers", "Linters and formatters", "Local setup"] },
  { id: "architecture", name: "Software Architecture", priority: 3, description: "System design, patterns, monoliths, microservices, scalability, and AI architecture planning.", subcategories: ["System design", "Design patterns", "Microservices", "Monoliths", "Scalability", "Architecture diagrams"] },
  { id: "learning", name: "Learn to Code with AI", priority: 3, description: "Beginner journeys, project-based learning, explanations, tutoring, and career-oriented coding paths.", subcategories: ["Coding for beginners", "AI coding tutor", "Project learning", "Language roadmaps", "Interview preparation", "Career paths"] },
  { id: "projects", name: "Coding Projects & Templates", priority: 3, description: "Buildable project ideas, starter templates, clones, portfolios, SaaS, automations, and utilities.", subcategories: ["Beginner projects", "Portfolio projects", "SaaS projects", "App clones", "Automation projects", "Starter templates"] },
  { id: "low-code", name: "Low-Code, No-Code & AI Builders", priority: 3, description: "Visual builders, AI app platforms, integrations, limitations, migrations, and comparisons.", subcategories: ["AI app builders", "No-code platforms", "Low-code tools", "Automations", "Platform comparisons", "Move to custom code"] },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function Penguin({ className = "" }: { className?: string }) {
  return (
    <span className={`penguin ${className}`} aria-hidden="true">
      <i className="penguin-wing left" />
      <i className="penguin-wing right" />
      <i className="penguin-body"><b className="penguin-face"><em /><em /></b><b className="penguin-belly" /><b className="penguin-beak" /></i>
      <i className="penguin-foot left" />
      <i className="penguin-foot right" />
    </span>
  );
}

type LibraryId = "mattress" | "code" | "credit";

function LibrarySwitch({ active, onChange }: { active: LibraryId; onChange: (library: LibraryId) => void }) {
  return (
    <nav className="library-switch" aria-label="Keyword libraries">
      <button className={active === "mattress" ? "active mattress" : "mattress"} onClick={() => onChange("mattress")}><i>🐧</i><span>Mattress Keyword Library</span></button>
      <button className={active === "code" ? "active code" : "code"} onClick={() => onChange("code")}><i>⌘</i><span>Code Keyword Library</span></button>
      <button className={active === "credit" ? "active credit" : "credit"} onClick={() => onChange("credit")}><i>☘</i><span>Credit Repair Keyword Library</span></button>
    </nav>
  );
}

function CodeLibrary({ onSwitch }: { onSwitch: (library: LibraryId) => void }) {
  const [activeCodeCategory, setActiveCodeCategory] = useState(codeCategories[0].id);
  const [codeSearch, setCodeSearch] = useState("");
  const [codeSort, setCodeSort] = useState<"priority" | "name">("priority");
  const selectedCodeCategory = codeCategories.find((category) => category.id === activeCodeCategory) ?? codeCategories[0];
  const visibleCodeCategories = [...codeCategories]
    .filter((category) => `${category.name} ${category.description} ${category.subcategories.join(" ")}`.toLowerCase().includes(codeSearch.trim().toLowerCase()))
    .sort((left, right) => codeSort === "name" ? left.name.localeCompare(right.name) : left.priority - right.priority || left.name.localeCompare(right.name));

  return (
    <div className="site-shell code-shell">
      <div className="code-atmosphere" aria-hidden="true"><i /><i /><i /><div className="code-rain">01001010 · function() · &lt;/&gt; · AI · 101101 · npm run build · {"{}"}</div></div>
      <header className="site-header code-header">
        <button className="wordmark" onClick={() => { setActiveCodeCategory(codeCategories[0].id); setCodeSearch(""); }}>
          <span className="wordmark-icon code-cat-mark" />
          <span><strong>Code Keyword Library</strong><small>Живчиха’s AI coding lab</small></span>
        </button>
        <LibrarySwitch active="code" onChange={onSwitch} />
        <div className="header-actions"><div className="code-status"><i />Живчиха is supervising</div></div>
      </header>

      <main>
        <section className="code-hero">
          <span className="cat-paw-overlay" aria-hidden="true" />
          <div className="code-hero-copy">
            <span className="eyebrow"><i /> Бібліотека Живчихи</span>
            <h1>Map the queries.<br /><span>Build the future.</span></h1>
            <p>A category-first SEO foundation for a website that helps people create real software with AI. Keyword research intentionally begins after you approve this structure.</p>
            <div className="code-hero-pills"><span>AI coding</span><span>Developer tools</span><span>FAQs</span><span>Commercial intent</span></div>
          </div>
          <div className="code-cat-presence" aria-label="Живчиха supervising the futuristic coding workspace">
            <div className="cat-library-stamp"><i /><span>ЖИВЧИХА.OS</span><strong>Her library. Her rules.</strong></div>
          </div>
          <div className="code-hero-stats">
            <div><strong>{codeCategories.length}</strong><span>category clusters mapped</span></div>
            <div><strong>{codeCategories.filter((category) => category.priority === 1).length}</strong><span>priority-one foundations</span></div>
            <div><strong>0</strong><span>keywords added by design</span></div>
          </div>
        </section>

        <section className="search-section code-search" aria-label="Search code categories">
          <span className="search-icon">⌕<i /></span>
          <input value={codeSearch} onChange={(event) => setCodeSearch(event.target.value)} placeholder="Search AI coding tools, debugging, Python, deployment, agents…" aria-label="Search code categories" />
          {codeSearch && <button onClick={() => setCodeSearch("")} aria-label="Clear code category search">Clear</button>}
        </section>

        <div className="code-foundation-note"><span>Foundation mode</span><p><strong>Categories and research lanes only.</strong> No code keywords have been generated yet, so you can approve the architecture before the full SEO expansion begins.</p></div>

        <div className="library-layout code-layout">
          <aside className="category-panel code-category-panel" aria-label="Code keyword categories">
            <div className="category-panel-heading"><span>Code categories <small>{visibleCodeCategories.length}</small></span><label><span className="sr-only">Sort code categories</span><select value={codeSort} onChange={(event) => setCodeSort(event.target.value as "priority" | "name")}><option value="priority">Priority</option><option value="name">Name</option></select></label></div>
            <div className="category-list">
              {visibleCodeCategories.map((category) => <button key={category.id} className={category.id === activeCodeCategory ? "active" : ""} onClick={() => { setActiveCodeCategory(category.id); setCodeSearch(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><span className="category-name">{category.name}<em>P{category.priority}</em></span><small>{category.subcategories.length}</small></button>)}
            </div>
          </aside>

          <section className="keyword-panel code-panel">
            <div className="keyword-panel-heading">
              <div><div className="heading-meta"><span className="eyebrow">Selected code category</span><span className={`category-priority p${selectedCodeCategory.priority}`}>Priority {selectedCodeCategory.priority}</span></div><h2>{selectedCodeCategory.name}</h2><p>{selectedCodeCategory.description}</p></div>
              <div className="result-count"><strong>{selectedCodeCategory.subcategories.length}</strong><span>research lanes</span></div>
            </div>
            <div className="code-lane-grid">
              {selectedCodeCategory.subcategories.map((subcategory, index) => <article key={subcategory} style={{ "--lane-index": index } as CSSProperties}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{subcategory}</strong><small>Keyword research not started</small></div><i>→</i></article>)}
            </div>
            <div className="code-empty-state"><span className="code-prompt">_</span><div><strong>Ready for category approval</strong><p>Once this structure feels right, each lane can expand into distinct FAQ, comparison, tool, tutorial, and commercial keyword opportunities.</p></div></div>
          </section>
        </div>
      </main>
      <footer><span>Бібліотека Живчихи · Code Keyword Library</span><span>Category architecture only · Keyword discovery paused</span></footer>
    </div>
  );
}

function CreditRepairLibrary({ onSwitch }: { onSwitch: (library: LibraryId) => void }) {
  return (
    <div className="site-shell credit-shell">
      <div className="credit-atmosphere" aria-hidden="true"><i /><i /><i /><span className="bird bird-one">⌁</span><span className="bird bird-two">⌁</span></div>
      <header className="site-header credit-header">
        <button className="wordmark">
          <span className="wordmark-icon credit-cat-mark">С</span>
          <span><strong>Credit Repair Keyword Library</strong><small>Сніжок’s outdoor research garden</small></span>
        </button>
        <LibrarySwitch active="credit" onChange={onSwitch} />
        <div className="header-actions"><div className="credit-status"><i />Сніжок is birdwatching</div></div>
      </header>

      <main>
        <section className="credit-hero">
          <div className="credit-hero-copy">
            <span className="eyebrow"><i /> Сад Сніжка</span>
            <h1>Grow a smarter<br /><span>credit strategy.</span></h1>
            <p>A calm foundation for a future credit repair SEO library. Categories and keywords will be planted only after you choose the direction.</p>
            <div className="credit-hero-pills"><span>Credit education</span><span>Consumer FAQs</span><span>Actionable guides</span><span>Research paused</span></div>
          </div>
          <div className="credit-cat-presence" role="img" aria-label="Сніжок outdoors in a green meadow watching birds" />
        </section>

        <section className="credit-summary" aria-label="Credit repair library summary">
          <div><strong>0</strong><span>category clusters mapped</span></div>
          <div><strong>0</strong><span>priority foundations</span></div>
          <div><strong>0</strong><span>keywords added by design</span></div>
        </section>

        <section className="search-section credit-search" aria-label="Future credit repair search">
          <span className="search-icon">⌕<i /></span>
          <input disabled placeholder="Category planning starts after your direction…" aria-label="Credit repair keyword search is not available yet" />
          <span className="credit-search-state">Not started</span>
        </section>

        <div className="credit-foundation-note"><span>Garden blueprint</span><p><strong>No categories or keywords have been invented.</strong> This library is ready for your brief, then each approved category can grow into distinct, non-repetitive SEO pages.</p></div>

        <div className="library-layout credit-layout">
          <aside className="category-panel credit-category-panel" aria-label="Credit repair keyword categories">
            <div className="category-panel-heading"><span>Credit categories <small>0</small></span></div>
            <div className="credit-empty-list"><i>☘</i><strong>No categories yet</strong><p>Your approved category map will appear here.</p></div>
          </aside>

          <section className="keyword-panel credit-panel">
            <div className="keyword-panel-heading">
              <div><div className="heading-meta"><span className="eyebrow">Future research workspace</span></div><h2>Waiting for your category brief</h2><p>Nothing has been pre-filled, so the next research phase can follow your exact credit repair strategy.</p></div>
              <div className="result-count"><strong>0</strong><span>keywords</span></div>
            </div>
            <div className="credit-workspace-empty"><span>✦</span><div><strong>Ready when you are</strong><p>Сніжок is guarding a clean slate—no leash, no filler, and no duplicate page ideas.</p></div></div>
          </section>
        </div>
      </main>
      <footer><span>Сад Сніжка · Credit Repair Keyword Library</span><span>Category direction pending · Keyword discovery paused</span></footer>
    </div>
  );
}

export default function App() {
  const [activeLibrary, setActiveLibrary] = useState<LibraryId>("mattress");
  const [library, setLibrary] = useState<KeywordLibrary | null>(null);
  const [activeCategory, setActiveCategory] = useState("latex");
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [activePriority, setActivePriority] = useState("All");
  const [categorySort, setCategorySort] = useState<"priority" | "name" | "count">("priority");
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
  }, [activeCategory, activePriority, activeType, search]);

  const selectedCategory = library?.categories.find((category) => category.id === activeCategory) ?? null;
  const normalizedSearch = search.trim().toLowerCase();
  const sortedCategories = useMemo(() => {
    if (!library) return [];
    return [...library.categories].sort((left, right) => {
      if (categorySort === "name") return left.name.localeCompare(right.name);
      if (categorySort === "count") return right.count - left.count || left.name.localeCompare(right.name);
      return left.priority - right.priority || left.name.localeCompare(right.name);
    });
  }, [categorySort, library]);

  const filteredKeywords = useMemo(() => {
    if (!library) return [];
    return library.keywords.filter((record) => {
      if (!normalizedSearch && record.categoryId !== activeCategory) return false;
      if (normalizedSearch && !`${record.keyword} ${record.category} ${record.subcategory}`.includes(normalizedSearch)) return false;
      if (activeType !== "All" && record.contentType !== activeType) return false;
      if (activePriority !== "All" && record.priorityTier !== activePriority) return false;
      return true;
    });
  }, [activeCategory, activePriority, activeType, library, normalizedSearch]);

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

  const exportCategoryCsv = () => {
    if (!library || !selectedCategory) return;
    const records = library.keywords.filter((record) => record.categoryId === selectedCategory.id);
    const rows = [
      ["Keyword", "Category", "Merged exact variants"],
      ...records.map((record) => [
        record.keyword,
        record.category,
        (record.aliases ?? []).join(" | "),
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedCategory.id}-mattress-keywords.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chooseCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearch("");
    setActiveType("All");
    setActivePriority("All");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (activeLibrary === "code") return <CodeLibrary onSwitch={setActiveLibrary} />;
  if (activeLibrary === "credit") return <CreditRepairLibrary onSwitch={setActiveLibrary} />;

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
  const greenKeywordCount = library.keywords.filter((record) => record.priorityTier === "green").length;
  const priorityOneCategoryCount = library.categories.filter((category) => category.priority === 1).length;

  return (
    <div className="site-shell">
      <div className="polar-atmosphere" aria-hidden="true">
        <i className="aurora aurora-one" /><i className="aurora aurora-two" /><i className="aurora aurora-three" />
        <div className="snowfall">{Array.from({ length: 24 }, (_, index) => <i key={index} />)}</div>
      </div>
      <header className="site-header">
        <button className="wordmark" onClick={() => chooseCategory("latex")}>
          <span className="wordmark-icon"><i /><b /></span>
          <span><strong>Mattress Keyword Library</strong><small>Antarctic research station</small></span>
        </button>
        <LibrarySwitch active="mattress" onChange={setActiveLibrary} />
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
            <span className="eyebrow"><i /> Antarctic keyword intelligence</span>
            <h1>Explore the<br /><span>keyword ice shelf.</span></h1>
            <p>No bare materials, unrelated test methods, or vague technical phrases. Every entry is written as a mattress page, comparison, brand page, roundup, or FAQ.</p>
          </div>
          <div className="polar-scene" aria-hidden="true">
            <i className="polar-moon" />
            <div className="mountain mountain-one" /><div className="mountain mountain-two" /><div className="mountain mountain-three" />
            <i className="ice-shine shine-one" /><i className="ice-shine shine-two" />
            <Penguin className="penguin-captain" />
            <Penguin className="penguin-scout" />
            <div className="penguin-message"><span>Research station online</span><strong>{formatNumber(library.totalKeywords)} ideas mapped</strong></div>
          </div>
          <div className="hero-stats" aria-label="Library summary">
            <div><i>❄</i><strong>{formatNumber(library.totalKeywords)}</strong><span>distinct keywords</span></div>
            <div><i>◈</i><strong>{priorityOneCategoryCount}</strong><span>priority-one categories</span></div>
            <div><i>✦</i><strong>{formatNumber(greenKeywordCount)}</strong><span>green opportunities</span></div>
          </div>
        </section>

        <section className="search-section" aria-label="Search mattress keywords">
          <span className="search-icon">⌕<i /></span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search latex, tight top, innerspring, side sleeper, Saatva…"
            aria-label="Search all mattress keywords"
          />
          {search && <button onClick={() => setSearch("")} aria-label="Clear search">Clear</button>}
        </section>

        <div className="research-notes">
          <div className="quality-note">
            <span>Quality rule</span>
            <p><strong>“3D spacer fabric test method” is excluded.</strong> The qualified topic <strong>“3D spacer fabric in mattress covers”</strong> is included because a mattress shopper can understand and use it.</p>
          </div>
          <div className="ranking-note">
            <div className="ranking-legend"><span className="green">Green</span><span className="yellow">Yellow</span><span className="red">Red</span></div>
            <p><strong>Green means target first.</strong> Yellow supports the cluster. Red stays in the library but is likely low-demand, highly competitive, paused, or weakly evidenced. Scores are directional—not fabricated paid-tool volume.</p>
          </div>
        </div>

        <div className="mobile-category-select">
          <div>
            <label htmlFor="category-select">Category</label>
            <select id="category-select" value={activeCategory} onChange={(event) => chooseCategory(event.target.value)}>
              {sortedCategories.map((category) => <option key={category.id} value={category.id}>P{category.priority} · {category.name} ({formatNumber(category.count)})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="mobile-category-sort">Sort</label>
            <select id="mobile-category-sort" value={categorySort} onChange={(event) => setCategorySort(event.target.value as "priority" | "name" | "count")}>
              <option value="priority">Priority</option>
              <option value="name">Name</option>
              <option value="count">Most keywords</option>
            </select>
          </div>
        </div>

        <div className="library-layout">
          <aside className="category-panel" aria-label="Mattress keyword categories">
            <div className="category-panel-heading">
              <span>Categories <small>{library.categories.length}</small></span>
              <label>
                <span className="sr-only">Sort categories</span>
                <select value={categorySort} onChange={(event) => setCategorySort(event.target.value as "priority" | "name" | "count")} aria-label="Sort categories">
                  <option value="priority">Priority</option>
                  <option value="name">Name</option>
                  <option value="count">Most keywords</option>
                </select>
              </label>
            </div>
            <div className="category-list">
              {sortedCategories.map((category) => (
                <button
                  key={category.id}
                  className={activeCategory === category.id && !normalizedSearch ? "active" : ""}
                  onClick={() => chooseCategory(category.id)}
                >
                  <span className="category-name">{category.name}<em>P{category.priority}</em></span>
                  <small>{formatNumber(category.count)}</small>
                </button>
              ))}
            </div>
          </aside>

          <section className="keyword-panel">
            <div className="keyword-panel-heading">
              <div>
                <div className="heading-meta">
                  <span className="eyebrow">{normalizedSearch ? "Search results" : "Selected category"}</span>
                  {!normalizedSearch && selectedCategory && <span className={`category-priority p${selectedCategory.priority}`}>Priority {selectedCategory.priority}</span>}
                </div>
                <h2>{heading}</h2>
                <p>{description}</p>
              </div>
              <div className="keyword-heading-actions">
                {!normalizedSearch && selectedCategory && <button className="export-button" onClick={exportCategoryCsv}>Export this category CSV</button>}
                <div className="result-count"><strong>{formatNumber(filteredKeywords.length)}</strong><span>distinct keywords</span></div>
              </div>
            </div>

            <div className="type-filters" aria-label="Filter by page type">
              {availableTypes.map((type) => (
                <button key={type} className={activeType === type ? "active" : ""} onClick={() => setActiveType(type)}>{type}</button>
              ))}
            </div>

            <div className="priority-filters" aria-label="Filter by SEO opportunity">
              {priorityFilters.map((filter) => (
                <button key={filter.id} className={`${filter.id.toLowerCase()} ${activePriority === filter.id ? "active" : ""}`} onClick={() => setActivePriority(filter.id)}>
                  {filter.id !== "All" && <i />}{filter.label}
                </button>
              ))}
            </div>

            {groupedKeywords.length > 0 ? (
              <div className="keyword-groups">
                {groupedKeywords.map(([group, keywords]) => (
                  <section className="keyword-group" key={group}>
                    <div className="keyword-group-heading">
                      <h3>{group}</h3>
                      <span>{formatNumber(keywords.length)} keywords shown</span>
                    </div>
                    <div className="keyword-list">
                      {keywords.map((record) => (
                        <article className="keyword-row" key={record.id}>
                          <div className="keyword-text">
                            <strong>{record.keyword}</strong>
                            <span>{normalizedSearch ? `${record.subcategory} · ` : ""}Demand {record.demandEstimate} · Difficulty {record.difficultyEstimate}{record.aliases?.length ? ` · ${record.aliases.length} merged exact variants` : ""}</span>
                          </div>
                          <div className="keyword-actions">
                            <span className={`priority-badge ${record.priorityTier}`} title={record.priorityReason}><i />{record.opportunityScore}/5</span>
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
              <div className="empty-state"><span>⌕</span><h3>No mattress keywords found</h3><p>Try a broader mattress phrase or select another filter.</p><button onClick={() => { setSearch(""); setActiveType("All"); setActivePriority("All"); }}>Reset filters</button></div>
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
                              <span>{record.subcategory} · Demand {record.demandEstimate} · Difficulty {record.difficultyEstimate}{record.specialistReview ? " · specialist review" : ""}</span>
                            </div>
                            <div className="update-keyword-actions">
                              <span className={`priority-badge ${record.priorityTier}`}><i />{record.opportunityScore}/5</span>
                              <button onClick={() => { chooseCategory(record.categoryId); setShowUpdates(false); }}>{record.category}</button>
                            </div>
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
