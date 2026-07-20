import fs from "node:fs/promises";

const dailyResearchPath = new URL("../data/daily-keyword-additions.json", import.meta.url);
let dailyResearch = { runs: [] };

try {
  dailyResearch = JSON.parse(await fs.readFile(dailyResearchPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (!Array.isArray(dailyResearch.runs)) throw new Error("Daily research must contain a runs array");

const categoryDefinitions = [
  ["latex", "Latex Mattresses", "Natural, organic, Dunlop, Talalay, blended and latex-hybrid mattress topics."],
  ["memory-foam", "Memory Foam Mattresses", "Memory foam types, feel, density, cooling, durability and shopper-fit questions."],
  ["hybrid", "Hybrid Mattresses", "Foam-and-coil, latex-hybrid and specialty hybrid mattress searches."],
  ["innerspring", "Innerspring Mattresses", "Traditional spring systems, pocket coils, coil gauge, support and comparisons."],
  ["tight-top", "Tight Top Mattresses", "Tight top construction, feel, use cases and comparisons with pillow and Euro tops."],
  ["pillow-euro-top", "Pillow Top & Euro Top Mattresses", "Pillow top, Euro top, plush top and cushioning-layer searches."],
  ["organic-natural", "Organic & Natural Mattresses", "Organic materials, natural construction, vegan options and certifications."],
  ["other-types", "Other Mattress Types", "Airbeds, futons, folding, floor, flippable and other real mattress formats."],
  ["adjustable-smart", "Adjustable & Smart Beds", "Adjustable bases, adjustable air mattresses, smart beds and sleep technology."],
  ["sizes", "Mattress Sizes", "U.S. mattress dimensions, uncommon sizes, room fit and size comparisons."],
  ["firmness-feel", "Firmness & Feel", "Soft through extra-firm mattresses, comfort language and firmness selection."],
  ["sleep-position", "Sleeping Position", "Mattress searches for side, back, stomach and combination sleepers."],
  ["body-weight", "Body Type & Weight", "Mattress support for lightweight, average, heavy, tall and plus-size sleepers."],
  ["pain-health", "Pain & Health Needs", "Mattress-shopping questions connected to pain, pressure, mobility and sleep needs."],
  ["cooling", "Cooling & Hot Sleepers", "Cooling mattresses, airflow, night sweats and temperature-related shopping."],
  ["couples", "Couples & Motion Isolation", "Motion isolation, edge support, split firmness and partner compatibility."],
  ["kids-crib", "Kids, Teens & Crib Mattresses", "Crib, toddler, bunk, teen and child mattress selection and safety."],
  ["rv-specialty", "RV & Specialty Mattresses", "RV, truck, boat, sofa bed, hospital, hospitality and custom mattresses."],
  ["materials", "Mattress Materials & Construction", "Only mattress-qualified materials, layers, covers, foams, coils and construction terms."],
  ["bases", "Foundations, Bases & Bed Frames", "Box springs, platforms, slats, adjustable bases and compatibility questions."],
  ["brands", "Mattress Brands", "U.S. mattress brand reviews, pricing, policies, complaints and comparisons."],
  ["retailers", "Mattress Stores & Retailers", "Retailer-specific mattress searches, return policies, sales and store comparisons."],
  ["shopping", "Best Mattresses & Shopping", "Best-of pages, buying guides, local intent and decision-stage searches."],
  ["price", "Price, Sales & Financing", "Mattress cost, budgets, sale timing, coupons, financing and value questions."],
  ["delivery-policies", "Delivery, Trials, Returns & Warranties", "Purchase policies, setup logistics, sleep trials and warranty questions."],
  ["care", "Mattress Care, Problems & Replacement", "Cleaning, rotation, sagging, odors, damage, disposal and replacement triggers."],
  ["safety", "Mattress Safety & Certifications", "Fiberglass, fire barriers, emissions, chemicals, regulations and mattress certifications."],
  ["comparisons", "Mattress Comparisons", "Direct type, material, size, brand and construction comparisons."],
  ["faqs", "General Mattress FAQs", "Foundational mattress questions that support guides, explainers and FAQ hubs."],
].map(([id, name, description], order) => ({ id, name, description, order }));

for (const run of dailyResearch.runs) {
  for (const category of run.categoriesAdded ?? []) {
    if (!category?.id || !category?.name || !category?.description) throw new Error(`Invalid category in daily run ${run.id}`);
    if (category.id === "brands") throw new Error("Daily research cannot modify the frozen brands category");
    if (!categoryDefinitions.some((existing) => existing.id === category.id)) {
      categoryDefinitions.push({ ...category, order: categoryDefinitions.length });
    }
  }
}

const categoryById = new Map(categoryDefinitions.map((category) => [category.id, category]));
const records = [];
const seen = new Set();

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function inferType(keyword) {
  if (/\bvs\b|\bor\b/.test(keyword)) return ["Comparison", "Commercial"];
  if (keyword.startsWith("best ")) return ["Roundup", "Commercial"];
  if (/ reviews?$/.test(keyword)) return ["Review", "Commercial"];
  if (/near me|where to buy|sale|coupon|discount|financing|price$|cost$/.test(keyword)) return ["Shopping", "Transactional"];
  if (/^(what|why|how|does|do|can|is|are|when|which|should)\b/.test(keyword)) return ["FAQ", "Informational"];
  return ["Guide", "Informational"];
}

function add(keyword, categoryId, subcategory, source = "Curated expansion", metadata = {}) {
  const normalized = normalize(keyword);
  if (!categoryById.has(categoryId)) throw new Error(`Unknown category: ${categoryId}`);
  if (!normalized || seen.has(normalized)) return false;
  if (/test method|how is .* measured|vs alternatives|near me near me|mattress mattress|\bacetate\b/.test(normalized)) return false;
  const [contentType, intent] = inferType(normalized);
  seen.add(normalized);
  records.push({
    id: `keyword-${String(records.length + 1).padStart(5, "0")}`,
    keyword: normalized,
    categoryId,
    category: categoryById.get(categoryId).name,
    subcategory,
    contentType: metadata.contentType ?? contentType,
    intent: metadata.intent ?? intent,
    source,
    dailyRunId: metadata.dailyRunId,
    specialistReview: Boolean(metadata.specialistReview),
    rationale: metadata.rationale,
  });
  return true;
}

function addAll(categoryId, subcategory, keywords, source) {
  keywords.forEach((keyword) => add(keyword, categoryId, subcategory, source));
}

function articleFor(base) {
  return /^[aeiou]|^rv\b/.test(base) ? `an ${base}` : `a ${base}`;
}

function addProductFamily(categoryId, subcategory, bases, comparisons = []) {
  for (const base of bases) {
    const article = articleFor(base);
    addAll(categoryId, subcategory, [
      base,
      `best ${base}`,
      `${base} reviews`,
      `${base} price`,
      `${base} cost`,
      `${base} pros and cons`,
      `${base} benefits`,
      `${base} disadvantages`,
      `is ${article} worth it`,
      `how long does ${article} last`,
      `how to choose ${article}`,
      `who should buy ${article}`,
      `${base} firmness guide`,
      `${base} for side sleepers`,
      `${base} for back sleepers`,
      `${base} for stomach sleepers`,
      `${base} for hot sleepers`,
      `${base} for heavy people`,
      `${base} for couples`,
      `${base} for back pain`,
      `does ${article} need a box spring`,
      `can ${article} go on an adjustable base`,
      `how to clean ${article}`,
      `how to rotate ${article}`,
    ]);
    comparisons.forEach((comparison) => add(`${base} vs ${comparison}`, categoryId, subcategory));
  }
}

function addFormatFamily(categoryId, subcategory, bases, { includeWorth = true } = {}) {
  for (const base of bases) {
    const article = articleFor(base);
    const keywords = [
      base,
      `best ${base}`,
      `${base} reviews`,
      `${base} price`,
      `${base} cost`,
      `${base} pros and cons`,
      `how long does ${article} last`,
      `how to choose ${article}`,
      `${base} firmness guide`,
      `${base} size guide`,
      `${base} thickness guide`,
      `how to clean ${article}`,
    ];
    if (includeWorth) keywords.push(`is ${article} worth it`);
    addAll(categoryId, subcategory, keywords);
  }
}

function addBedTechnologyFamily(categoryId, subcategory, bases) {
  for (const base of bases) {
    const article = articleFor(base);
    addAll(categoryId, subcategory, [
      base,
      `best ${base}`,
      `${base} reviews`,
      `${base} price`,
      `${base} cost`,
      `${base} pros and cons`,
      `is ${article} worth it`,
      `how to choose ${article}`,
      `how long does ${article} last`,
      `${base} dimensions`,
      `${base} features`,
      `${base} weight limit`,
      `${base} mattress compatibility`,
      `${base} warranty`,
    ]);
  }
}

function addSupportFamily(categoryId, subcategory, bases) {
  for (const base of bases) {
    const article = articleFor(base);
    const needsMattressQualifier = !base.startsWith("mattress ");
    const qualifier = needsMattressQualifier ? " for a mattress" : "";
    addAll(categoryId, subcategory, [
      base,
      ...(needsMattressQualifier ? [`${base} for a mattress`] : []),
      `best ${base}${qualifier}`,
      `${base} reviews`,
      `${base} price`,
      `${base} pros and cons`,
      `is ${article} worth it${qualifier}`,
      `how to choose ${article}${qualifier}`,
      `how long does ${article} last`,
      `${base} mattress compatibility`,
      `${base} weight capacity${qualifier}`,
      `latex mattress on ${article}`,
      `memory foam mattress on ${article}`,
      `hybrid mattress on ${article}`,
      `innerspring mattress on ${article}`,
    ]);
  }
}

addProductFamily("latex", "Latex mattress guides", [
  "latex mattress",
  "natural latex mattress",
  "organic latex mattress",
  "dunlop latex mattress",
  "talalay latex mattress",
  "synthetic latex mattress",
  "blended latex mattress",
  "all-latex mattress",
  "latex hybrid mattress",
  "zoned latex mattress",
  "flippable latex mattress",
], ["memory foam mattress", "hybrid mattress", "innerspring mattress"]);
addAll("latex", "Latex mattress FAQs", [
  "what is a latex mattress",
  "what is a latex mattress made of",
  "how are latex mattresses made",
  "dunlop vs talalay latex mattress",
  "natural vs synthetic latex mattress",
  "organic latex vs natural latex mattress",
  "latex mattress ild explained",
  "latex mattress density explained",
  "latex mattress layer thickness guide",
  "does a latex mattress sleep hot",
  "does a latex mattress smell",
  "do latex mattresses sag",
  "are latex mattresses good for allergies",
  "can you sleep on a latex mattress with a latex allergy",
  "are latex mattresses good for back pain",
  "are latex mattresses good for side sleepers",
  "are latex mattresses good for heavy people",
  "are latex mattresses good for couples",
  "are latex mattresses bouncy",
  "latex mattress motion isolation",
  "latex mattress edge support",
  "latex mattress pressure relief",
  "latex mattress off-gassing",
  "latex mattress weight",
  "latex mattress lifespan",
  "latex mattress warranty guide",
  "latex mattress foundation requirements",
  "latex mattress on slats",
  "latex mattress on the floor",
  "latex mattress with wool fire barrier",
  "gols certified latex mattress",
  "gots certified latex mattress",
  "oeko-tex latex mattress",
  "latex mattress without polyurethane foam",
  "latex mattress without fiberglass",
  "latex mattress comfort layer",
  "latex mattress support core",
  "soft latex mattress",
  "medium latex mattress",
  "firm latex mattress",
  "split firmness latex mattress",
  "customizable latex mattress",
  "diy latex mattress layers",
  "how to assemble a diy latex mattress",
  "how to move a latex mattress",
  "how to store a latex mattress",
  "how to soften a firm latex mattress",
  "how to make a latex mattress firmer",
  "latex mattress topper vs latex mattress",
]);

addProductFamily("memory-foam", "Memory foam mattress guides", [
  "memory foam mattress",
  "gel memory foam mattress",
  "open-cell memory foam mattress",
  "high-density memory foam mattress",
  "low-density memory foam mattress",
  "plant-based memory foam mattress",
  "copper-infused memory foam mattress",
  "graphite-infused memory foam mattress",
  "cooling memory foam mattress",
  "all-foam mattress",
], ["latex mattress", "hybrid mattress", "innerspring mattress"]);
addAll("memory-foam", "Memory foam FAQs", [
  "what is memory foam in a mattress",
  "how does a memory foam mattress work",
  "memory foam mattress density guide",
  "memory foam mattress indentation load deflection",
  "does memory foam sleep hot",
  "why does memory foam trap heat",
  "how to cool down a memory foam mattress",
  "how long does a memory foam mattress take to expand",
  "can you sleep on memory foam before 24 hours",
  "memory foam mattress off-gassing",
  "how long does memory foam smell last",
  "does memory foam contain fiberglass",
  "memory foam mattress sagging",
  "memory foam mattress body impressions",
  "memory foam mattress motion isolation",
  "memory foam mattress edge support",
  "memory foam mattress pressure relief",
  "memory foam mattress weight limit",
  "memory foam mattress lifespan",
  "memory foam mattress on slats",
  "memory foam mattress on box spring",
  "memory foam mattress on adjustable base",
  "how to make a memory foam mattress firmer",
  "how to soften a memory foam mattress",
  "how to move a memory foam mattress",
  "how to store a memory foam mattress",
]);

addProductFamily("hybrid", "Hybrid mattress guides", [
  "hybrid mattress",
  "memory foam hybrid mattress",
  "latex hybrid mattress",
  "pocket coil hybrid mattress",
  "microcoil hybrid mattress",
  "pillow top hybrid mattress",
  "cooling hybrid mattress",
  "flippable hybrid mattress",
], ["memory foam mattress", "latex mattress", "innerspring mattress"]);
addAll("hybrid", "Hybrid mattress FAQs", [
  "what is a hybrid mattress",
  "how is a hybrid mattress constructed",
  "how many layers should a hybrid mattress have",
  "do hybrid mattresses sag",
  "do hybrid mattresses sleep hot",
  "are hybrid mattresses good for side sleepers",
  "are hybrid mattresses good for heavy people",
  "are hybrid mattresses good for couples",
  "hybrid mattress coil count",
  "hybrid mattress coil gauge",
  "hybrid mattress edge support",
  "hybrid mattress motion isolation",
  "hybrid mattress pressure relief",
  "hybrid mattress weight",
  "hybrid mattress lifespan",
  "hybrid mattress foundation requirements",
  "can you fold a hybrid mattress",
  "how to move a hybrid mattress",
]);

addProductFamily("innerspring", "Innerspring mattress guides", [
  "innerspring mattress",
  "pocket spring mattress",
  "pocket coil mattress",
  "bonnell coil mattress",
  "offset coil mattress",
  "continuous coil mattress",
  "coil-on-coil mattress",
  "microcoil mattress",
  "encased coil mattress",
], ["hybrid mattress", "memory foam mattress", "latex mattress"]);
addAll("innerspring", "Coil and spring FAQs", [
  "what is an innerspring mattress",
  "how does an innerspring mattress work",
  "types of mattress coils",
  "mattress coil gauge explained",
  "mattress coil count explained",
  "does mattress coil count matter",
  "pocket coils vs bonnell coils",
  "pocket coils vs offset coils",
  "individually wrapped coils in a mattress",
  "zoned coils in a mattress",
  "reinforced perimeter coils in a mattress",
  "innerspring mattress edge support",
  "innerspring mattress motion isolation",
  "innerspring mattress pressure relief",
  "do innerspring mattresses sleep cool",
  "do innerspring mattresses sag",
  "why do mattress springs squeak",
  "how to fix a squeaky innerspring mattress",
  "innerspring mattress lifespan",
  "can you flip an innerspring mattress",
  "innerspring mattress foundation requirements",
]);

addProductFamily("tight-top", "Tight top mattress guides", [
  "tight top mattress",
  "firm tight top mattress",
  "plush tight top mattress",
], ["pillow top mattress", "euro top mattress", "hybrid mattress"]);
addAll("tight-top", "Tight top mattress FAQs", [
  "what is a tight top mattress",
  "what does tight top mean on a mattress",
  "how does a tight top mattress feel",
  "is a tight top mattress firm",
  "is a tight top mattress good for back sleepers",
  "is a tight top mattress good for stomach sleepers",
  "is a tight top mattress good for side sleepers",
  "tight top mattress construction",
  "tight top mattress comfort layer",
  "tight top mattress lifespan",
  "tight top mattress edge support",
  "tight top vs euro top mattress",
  "tight top vs pillow top mattress",
  "tight top vs plush top mattress",
  "can you add a topper to a tight top mattress",
  "how to soften a tight top mattress",
]);

addProductFamily("pillow-euro-top", "Pillow and Euro top guides", [
  "pillow top mattress",
  "euro top mattress",
  "plush top mattress",
  "double pillow top mattress",
], ["tight top mattress", "hybrid mattress"]);
addAll("pillow-euro-top", "Top construction FAQs", [
  "what is a pillow top mattress",
  "what is a euro top mattress",
  "pillow top vs euro top mattress",
  "pillow top vs tight top mattress",
  "euro top vs tight top mattress",
  "do pillow top mattresses sag",
  "can you flip a pillow top mattress",
  "can you rotate a pillow top mattress",
  "how long does a pillow top mattress last",
  "how long does a euro top mattress last",
  "pillow top mattress for side sleepers",
  "pillow top mattress for back pain",
  "euro top mattress for heavy people",
]);

addProductFamily("organic-natural", "Organic and natural mattress guides", [
  "organic mattress",
  "natural mattress",
  "non-toxic mattress",
  "chemical-free mattress",
  "vegan mattress",
  "organic latex mattress",
  "organic hybrid mattress",
  "wool mattress",
  "cotton mattress",
], ["conventional mattress", "memory foam mattress"]);
addAll("organic-natural", "Organic mattress FAQs", [
  "what makes a mattress organic",
  "organic mattress certifications explained",
  "gots certified organic mattress",
  "gols certified organic latex mattress",
  "organic mattress without wool",
  "organic mattress without latex",
  "organic mattress without fiberglass",
  "natural mattress fire barrier",
  "organic cotton mattress cover",
  "organic wool mattress batting",
  "natural latex mattress layers",
  "is an organic mattress worth it",
  "how much does an organic mattress cost",
  "organic mattress for babies",
  "organic mattress for allergies",
]);

addFormatFamily("other-types", "Alternative mattress formats", [
  "air mattress",
  "adjustable air mattress",
  "waterbed mattress",
  "futon mattress",
  "folding mattress",
  "floor mattress",
  "rollaway mattress",
  "flippable mattress",
  "two-sided mattress",
  "shikibuton mattress",
  "japanese futon mattress",
  "foam mattress",
]);
addAll("other-types", "Alternative mattress FAQs", [
  "best air mattress for everyday use",
  "can you sleep on an air mattress every night",
  "air mattress for long-term use",
  "air mattress vs traditional mattress",
  "waterbed mattress vs traditional mattress",
  "futon mattress vs traditional mattress",
  "folding mattress vs air mattress",
  "floor mattress vs traditional mattress",
  "flippable mattress vs one-sided mattress",
  "shikibuton vs western mattress",
]);

addBedTechnologyFamily("adjustable-smart", "Adjustable bed guides", [
  "adjustable bed",
  "adjustable bed base",
  "split king adjustable bed",
]);
addFormatFamily("adjustable-smart", "Smart mattress guides", [
  "adjustable air mattress",
  "smart mattress",
  "temperature-controlled mattress",
]);
addAll("adjustable-smart", "Adjustable bed FAQs", [
  "what mattresses work with adjustable beds",
  "best mattress type for an adjustable base",
  "can an innerspring mattress go on an adjustable base",
  "can a hybrid mattress go on an adjustable base",
  "can a latex mattress go on an adjustable base",
  "can a memory foam mattress go on an adjustable base",
  "adjustable bed mattress thickness",
  "adjustable bed weight limit",
  "split king mattress gap solutions",
  "adjustable base headboard compatibility",
  "zero gravity adjustable bed position",
  "anti-snore adjustable bed position",
]);

const sizes = [
  "twin mattress", "twin xl mattress", "full mattress", "full xl mattress",
  "queen mattress", "olympic queen mattress", "split queen mattress",
  "king mattress", "split king mattress", "california king mattress",
  "split california king mattress", "wyoming king mattress", "texas king mattress",
  "alaskan king mattress", "custom size mattress",
];
for (const size of sizes) {
  const sizeKeywords = [
    size,
    `${size} dimensions`,
    `${size} size in inches`,
    `${size} width and length`,
    `${size} room size guide`,
    `best ${size}`,
    `${size} price`,
    `${size} weight`,
    `${size} for couples`,
  ];
  if (size !== "queen mattress") sizeKeywords.push(`${size} vs queen mattress`);
  if (size !== "king mattress") sizeKeywords.push(`${size} vs king mattress`);
  addAll("sizes", size.replace(" mattress", ""), sizeKeywords);
}

const firmnessLevels = ["extra soft", "soft", "medium soft", "medium", "medium firm", "firm", "extra firm", "plush", "luxury firm", "ultra firm"];
for (const firmness of firmnessLevels) {
  addAll("firmness-feel", `${firmness} mattresses`, [
    `${firmness} mattress`,
    `best ${firmness} mattress`,
    `${firmness} mattress reviews`,
    `${firmness} mattress for side sleepers`,
    `${firmness} mattress for back sleepers`,
    `${firmness} mattress for stomach sleepers`,
    `${firmness} mattress for heavy people`,
    `${firmness} mattress for back pain`,
    `who should buy a ${firmness} mattress`,
  ]);
}
addAll("firmness-feel", "Firmness FAQs", [
  "mattress firmness scale explained",
  "how to choose mattress firmness",
  "mattress firmness vs support",
  "mattress firmness vs comfort",
  "why does my mattress feel too firm",
  "why does my mattress feel too soft",
  "how to make a mattress firmer",
  "how to make a mattress softer",
  "does mattress firmness change over time",
  "what mattress firmness do hotels use",
]);

const positions = ["side sleepers", "back sleepers", "stomach sleepers", "combination sleepers", "fetal position sleepers", "starfish sleepers"];
for (const position of positions) {
  addAll("sleep-position", position, [
    `mattress for ${position}`,
    `best mattress for ${position}`,
    `mattress firmness for ${position}`,
    `latex mattress for ${position}`,
    `memory foam mattress for ${position}`,
    `hybrid mattress for ${position}`,
    `innerspring mattress for ${position}`,
    `mattress pressure relief for ${position}`,
    `how to choose a mattress for ${position}`,
  ]);
}

const bodyTypes = ["lightweight sleepers", "average weight sleepers", "heavy sleepers", "plus-size sleepers", "tall people", "short people", "broad-shouldered sleepers", "curvy sleepers", "seniors", "athletes"];
for (const bodyType of bodyTypes) {
  addAll("body-weight", bodyType, [
    `mattress for ${bodyType}`,
    `best mattress for ${bodyType}`,
    `mattress firmness for ${bodyType}`,
    `mattress support for ${bodyType}`,
    `hybrid mattress for ${bodyType}`,
    `latex mattress for ${bodyType}`,
    `mattress weight limit for ${bodyType}`,
    `how to choose a mattress for ${bodyType}`,
  ]);
}

const healthNeeds = [
  "back pain", "lower back pain", "upper back pain", "hip pain", "shoulder pain",
  "neck pain", "joint pain", "arthritis", "sciatica", "fibromyalgia",
  "pressure sores", "limited mobility", "acid reflux", "sleep apnea", "allergies",
];
for (const need of healthNeeds) {
  addAll("pain-health", need, [
    `mattress for ${need}`,
    `best mattress for ${need}`,
    `mattress firmness for ${need}`,
    `mattress type for ${need}`,
    `latex mattress for ${need}`,
    `memory foam mattress for ${need}`,
    `hybrid mattress for ${need}`,
    `how to choose a mattress for ${need}`,
  ]);
}

addAll("cooling", "Cooling mattress guides", [
  "cooling mattress", "best cooling mattress", "cooling mattress reviews",
  "mattress for hot sleepers", "best mattress for hot sleepers",
  "mattress for night sweats", "best mattress for night sweats",
  "breathable mattress", "temperature-neutral mattress", "airflow mattress",
  "cooling memory foam mattress", "cooling hybrid mattress", "cooling latex mattress",
  "phase change material mattress", "gel foam cooling mattress",
  "graphite-infused cooling mattress", "copper-infused cooling mattress",
  "mattress cover for hot sleepers", "wool mattress temperature regulation",
  "does latex sleep cooler than memory foam",
  "does an innerspring mattress sleep cool",
  "why does my mattress make me hot",
  "how to make a mattress sleep cooler",
]);

addAll("couples", "Couples mattress guides", [
  "mattress for couples", "best mattress for couples", "mattress for light sleepers sharing a bed",
  "mattress for couples with different weights", "mattress for couples with different firmness preferences",
  "split firmness mattress for couples", "dual firmness mattress for couples",
  "motion isolation mattress", "best mattress for motion isolation",
  "mattress edge support for couples", "mattress for sex and sleeping",
  "quiet mattress for couples", "king vs queen mattress for couples",
  "split king mattress for couples", "adjustable bed for couples",
  "latex mattress for couples", "memory foam mattress for couples", "hybrid mattress for couples",
  "how to choose a mattress as a couple", "how to reduce partner disturbance in bed",
]);

addFormatFamily("kids-crib", "Kids and crib mattress guides", [
  "crib mattress", "mini crib mattress", "toddler mattress", "kids mattress",
  "teen mattress", "bunk bed mattress", "trundle mattress", "floor bed mattress for kids",
], { includeWorth: false });
addAll("kids-crib", "Kids mattress FAQs", [
  "crib mattress size", "crib mattress firmness", "crib mattress safety standards",
  "how to choose a crib mattress", "when to replace a crib mattress",
  "when to move from crib mattress to toddler mattress", "mattress firmness for children",
  "mattress thickness for bunk beds", "organic crib mattress", "crib mattress without fiberglass",
  "waterproof crib mattress", "two-stage crib mattress",
]);

addFormatFamily("rv-specialty", "Vehicle and specialty mattress guides", [
  "rv mattress", "rv short queen mattress", "rv king mattress", "truck sleeper mattress",
  "semi truck mattress", "boat mattress", "sofa bed mattress", "hospital bed mattress",
  "medical mattress", "hotel mattress", "airbnb mattress", "dorm mattress",
  "camping mattress", "custom boat mattress",
]);

addAll("materials", "Mattress layers", [
  "mattress comfort layer", "mattress transition layer", "mattress support core",
  "mattress base layer", "mattress quilting layer", "mattress euro top layer",
  "mattress pillow top layer", "mattress edge support system", "mattress zoning system",
  "mattress layer thickness guide", "mattress layer order explained",
]);
addAll("materials", "Mattress foams", [
  "polyurethane foam in mattresses", "polyfoam mattress layer", "memory foam mattress layer",
  "latex foam mattress layer", "high-resilience foam in mattresses", "high-density foam in mattresses",
  "mattress foam density explained", "mattress foam ild explained", "mattress foam ifd explained",
  "open-cell foam in mattresses", "gel-infused foam in mattresses", "copper-infused foam in mattresses",
  "graphite-infused foam in mattresses", "convoluted foam mattress layer",
]);
addAll("materials", "Coils and reinforcement", [
  "pocket coils in mattresses", "bonnell coils in mattresses", "offset coils in mattresses",
  "continuous coils in mattresses", "microcoils in mattresses", "mattress coil gauge explained",
  "mattress coil count explained", "zoned mattress coils", "reinforced mattress perimeter coils",
  "foam encasement mattress edge support", "steel border rod in mattresses",
]);
addAll("materials", "Covers, fibers and fire barriers", [
  "mattress cover fabric", "organic cotton mattress cover", "wool mattress batting",
  "rayon mattress fire barrier", "silica mattress fire barrier", "fiberglass mattress fire barrier",
  "3d spacer fabric in mattress covers", "benefits of 3d spacer fabric in mattress covers",
  "tencel mattress cover", "bamboo viscose mattress cover", "polyester mattress cover",
  "cashmere mattress cover", "horsehair in luxury mattresses", "mattress tufting",
  "hand-tufted mattress construction", "mattress tape edge construction", "zippered mattress cover",
  "removable washable mattress cover", "phase change material in mattress covers",
  "mattress adhesive", "water-based mattress adhesive", "glueless mattress construction",
]);

addSupportFamily("bases", "Mattress support systems", [
  "mattress foundation", "box spring", "platform bed", "slatted bed frame",
  "adjustable base", "bunkie board", "metal bed frame", "solid wood bed frame",
]);
addAll("bases", "Foundation compatibility FAQs", [
  "does a mattress need a box spring", "mattress foundation vs box spring",
  "box spring vs platform bed for a mattress", "how far apart should bed slats be for a mattress",
  "can a mattress go directly on slats", "can a mattress go on the floor",
  "best foundation for a latex mattress", "best foundation for a memory foam mattress",
  "best foundation for a hybrid mattress", "best foundation for an innerspring mattress",
  "can you use an old box spring with a new mattress", "when to replace a box spring",
  "mattress warranty foundation requirements", "center support requirements for king mattress",
]);

const brands = [
  "Tempur-Pedic", "Sealy", "Serta", "Beautyrest", "Stearns & Foster", "Purple",
  "Casper", "Nectar", "DreamCloud", "Saatva", "Helix", "Brooklyn Bedding", "Leesa",
  "Tuft & Needle", "Avocado", "Birch", "Bear", "Nolah", "WinkBed", "Amerisleep",
  "Layla", "Puffy", "GhostBed", "Cocoon by Sealy", "Sleep Number", "Eight Sleep",
  "Hästens", "Vispring", "Aireloom", "Kingsdown", "King Koil", "Naturepedic",
  "My Green Mattress", "PlushBeds", "Latex for Less", "Spindle", "SleepEZ", "Awara",
  "Zinus", "Linenspa", "Allswell", "Novaform", "Charles P. Rogers", "DLX Mattress",
  "Engineered Sleep", "Shifman", "Royal-Pedic", "Essentia", "Brentwood Home", "Happsy",
  "Savvy Rest", "FloBeds", "OMI", "PranaSleep", "Jamison", "Corsicana", "Spring Air",
  "Symbol Mattress", "Therapedic", "Ashley Sleep", "Sleep On Latex", "Eco Terra",
  "Arizona Premium Mattress", "Latex Mattress Factory", "Boring Mattress Co", "Big Fig",
  "Titan Plus", "Plank Firm", "Nest Bedding", "Molecule", "MLILY", "Diamond Mattress",
  "Restonic", "Englander", "Southerland", "Gold Bond", "Paramount Sleep", "Chattam & Wells",
  "Verlo", "Comfort Option", "Luuf", "Turmerry", "Harvest Green Mattress", "Foam Sweet Foam",
  "Nature's Rest", "Wolf Mattress", "Serenia Sleep", "Eastman House", "BedInABox",
];
for (const brand of brands) {
  const lower = normalize(brand);
  const base = lower.includes("mattress") ? lower : `${lower} mattress`;
  addAll("brands", brand, [
    base,
    `${base} reviews`,
    `${base} price`,
    `${base} sale`,
    `${base} coupon`,
    `${base} trial period`,
    `${base} warranty`,
    `${base} return policy`,
    `${base} complaints`,
    `where are ${base.replace(/ mattress$/, "")} mattresses made`,
    `does ${base} contain fiberglass`,
    `${base} vs saatva mattress`,
  ], "Mattress brand research");
}

const retailers = [
  "Costco", "Walmart", "Amazon", "IKEA", "Mattress Firm", "Original Mattress Factory",
  "Denver Mattress", "Rooms To Go", "Wayfair", "Bob's Discount Furniture", "Macy's",
  "Ashley Furniture", "Sam's Club", "BJ's Wholesale Club", "Raymour & Flanigan",
];
for (const retailer of retailers) {
  const lower = normalize(retailer);
  addAll("retailers", retailer, [
    `${lower} mattress`, `best mattress at ${lower}`, `${lower} mattress reviews`,
    `${lower} mattress sale`, `${lower} mattress prices`, `${lower} mattress return policy`,
    `${lower} mattress warranty`, `${lower} mattress delivery`, `${lower} mattress financing`,
    `${lower} mattress complaints`, `buying a mattress from ${lower}`,
  ]);
}

addAll("shopping", "Core mattress shopping", [
  "best mattress", "best mattress reviews", "best mattress in the usa", "best online mattress",
  "best mattress in a box", "best affordable mattress", "best luxury mattress",
  "best value mattress", "best mattress under $500", "best mattress under $1000",
  "best mattress under $1500", "best mattress under $2000", "best mattress for a guest room",
  "best hotel-style mattress", "best mattress made in usa", "best mattress without fiberglass",
  "best mattress with free returns", "best mattress with long sleep trial",
  "mattress buying guide", "how to choose a mattress", "what mattress should i buy",
  "where to buy a mattress", "buy mattress online", "mattress store near me",
  "mattress showroom near me", "mattress outlet near me", "same day mattress delivery near me",
  "online mattress vs mattress store", "bed in a box vs store mattress",
  "questions to ask when buying a mattress", "how to test a mattress in a store",
  "how long should you try a mattress before deciding", "what to look for in a quality mattress",
]);

addAll("price", "Mattress price and value", [
  "how much does a mattress cost", "average mattress price", "queen mattress price",
  "king mattress price", "latex mattress price", "memory foam mattress price",
  "hybrid mattress price", "innerspring mattress price", "organic mattress price",
  "mattress price by size", "mattress price by type", "cheap mattress vs expensive mattress",
  "is an expensive mattress worth it", "how much should i spend on a mattress",
  "mattress cost per year", "best time to buy a mattress", "mattress sale calendar",
  "presidents day mattress sale", "memorial day mattress sale", "fourth of july mattress sale",
  "labor day mattress sale", "black friday mattress sale", "cyber monday mattress sale",
  "mattress coupon", "mattress promo code", "mattress financing", "mattress payment plan",
  "mattress buy now pay later", "mattress financing with bad credit", "mattress price match policy",
]);

addAll("delivery-policies", "Delivery and setup", [
  "mattress delivery", "free mattress delivery", "white glove mattress delivery",
  "same day mattress delivery", "mattress delivery and setup", "mattress removal with delivery",
  "how is a mattress delivered", "how long does mattress delivery take",
  "bed in a box delivery", "mattress shipping damage", "what to do if a mattress arrives damaged",
  "how long does a mattress take to expand", "when can you sleep on a new mattress",
]);
addAll("delivery-policies", "Trials, returns and warranties", [
  "mattress sleep trial", "best mattress sleep trial", "mattress return policy",
  "how to return a mattress", "mattress return pickup", "mattress return fee",
  "what happens to returned mattresses", "mattress exchange policy", "mattress comfort exchange",
  "mattress warranty", "mattress warranty explained", "what does a mattress warranty cover",
  "mattress warranty sagging depth", "mattress warranty claim", "mattress warranty denied",
  "lifetime mattress warranty", "prorated vs non-prorated mattress warranty",
  "does a mattress warranty require a foundation", "mattress warranty stain rules",
]);

addAll("care", "Cleaning and maintenance", [
  "how to clean a mattress", "how to deep clean a mattress", "how to vacuum a mattress",
  "how to deodorize a mattress", "how to remove mattress stains", "how to remove urine from a mattress",
  "how to remove blood from a mattress", "how to remove sweat stains from a mattress",
  "how to get rid of mattress odor", "how to rotate a mattress", "how often to rotate a mattress",
  "can you flip a mattress", "how to protect a mattress", "does a mattress need a protector",
  "how to move a mattress", "how to store a mattress", "how to dispose of a mattress",
  "mattress recycling near me", "mattress donation near me", "mattress pickup near me",
]);
addAll("care", "Mattress problems and replacement", [
  "mattress sagging", "how to fix a sagging mattress", "mattress body impressions",
  "mattress dipping in the middle", "mattress edge collapse", "mattress squeaking",
  "mattress smells musty", "mold on mattress", "bed bugs in mattress", "dust mites in mattress",
  "mattress too firm", "mattress too soft", "mattress causing back pain",
  "new mattress causing back pain", "mattress sleeps too hot", "mattress motion transfer",
  "mattress sliding on bed frame", "mattress gap from headboard", "mattress not expanding evenly",
  "how long should a mattress last", "when to replace a mattress", "signs you need a new mattress",
  "can an old mattress cause back pain", "mattress lifespan by type", "how to break in a new mattress",
]);

addAll("safety", "Fiberglass and fire barriers", [
  "fiberglass in mattresses", "why do mattresses contain fiberglass", "how to tell if a mattress has fiberglass",
  "mattress fiberglass warning label", "mattress fiberglass contamination", "what to do if mattress fiberglass escapes",
  "mattress without fiberglass", "best mattress without fiberglass", "fiberglass-free memory foam mattress",
  "fiberglass-free hybrid mattress", "natural mattress fire barrier", "wool mattress fire barrier",
  "rayon mattress fire barrier", "silica mattress fire barrier", "chemical flame retardants in mattresses",
  "mattress flammability standard", "16 cfr 1632 mattress standard", "16 cfr 1633 mattress standard",
]);
addAll("safety", "Mattress certifications and chemicals", [
  "certipur-us certified mattress", "greenguard gold certified mattress", "gots certified mattress",
  "gols certified latex mattress", "oeko-tex certified mattress", "eco-institut certified mattress",
  "made safe certified mattress", "organic content standard mattress", "mattress certification guide",
  "mattress voc emissions", "low-voc mattress", "mattress off-gassing", "formaldehyde in mattresses",
  "phthalates in mattresses", "pfas in mattress covers", "antimicrobial chemicals in mattresses",
  "is polyurethane foam in mattresses safe", "mattress proposition 65 warning",
]);

const comparisons = [
  "latex mattress vs memory foam mattress", "latex mattress vs hybrid mattress",
  "latex mattress vs innerspring mattress", "dunlop vs talalay latex mattress",
  "natural vs synthetic latex mattress", "memory foam mattress vs hybrid mattress",
  "memory foam mattress vs innerspring mattress", "hybrid mattress vs innerspring mattress",
  "pocket spring mattress vs innerspring mattress", "tight top vs pillow top mattress",
  "tight top vs euro top mattress", "pillow top vs euro top mattress",
  "soft vs firm mattress", "medium vs medium-firm mattress", "plush vs firm mattress",
  "queen vs king mattress", "king vs california king mattress", "twin vs twin xl mattress",
  "full vs queen mattress", "split king vs king mattress", "box spring vs platform bed for mattress",
  "mattress foundation vs box spring", "online mattress vs store mattress",
  "bed in a box vs traditional mattress", "organic mattress vs conventional mattress",
  "one-sided vs two-sided mattress", "flippable vs non-flippable mattress",
  "zoned support vs uniform support mattress", "foam edge support vs reinforced coils",
  "mattress topper vs new mattress", "adjustable air mattress vs memory foam mattress",
];
addAll("comparisons", "Mattress type and construction comparisons", comparisons);

addAll("faqs", "Choosing a mattress", [
  "what is the best mattress type", "what mattress firmness should i choose",
  "what mattress is best for my sleeping position", "what mattress is best for my body weight",
  "how thick should a mattress be", "what is a good mattress height", "how many mattress layers are best",
  "what makes a mattress supportive", "what makes a mattress comfortable", "what makes a mattress durable",
  "how do i know if a mattress is good quality", "what mattress do hotels use",
  "what mattress do chiropractors recommend", "should i buy a firm or soft mattress",
  "should i buy a latex memory foam hybrid or innerspring mattress",
]);
addAll("faqs", "Owning a mattress", [
  "how long does a mattress last", "how often should you replace a mattress",
  "how long does it take to adjust to a new mattress", "why does a new mattress hurt my back",
  "how long does a mattress take to break in", "does a mattress get softer over time",
  "how often should you rotate a mattress", "should you flip a mattress",
  "can you put a new mattress on an old box spring", "can you put a mattress directly on the floor",
  "does a mattress need a protector", "does a mattress need a foundation",
  "how to measure mattress sagging", "how to measure a mattress",
  "how to tell which side of a mattress is the top", "how to tell if a mattress contains fiberglass",
]);

const dailyRunResults = [];
const mattressContextPattern = /mattress|bed|box spring|foundation|adjustable base|pillow top|euro top|tight top|innerspring|memory foam|latex|hybrid/i;

for (const run of dailyResearch.runs) {
  if (!run?.id || !run?.date || !Array.isArray(run.keywords)) throw new Error("Every daily research run needs an id, date, and keywords array");
  const addedKeywords = [];
  const categoryCounts = new Map();

  for (const entry of run.keywords) {
    const normalizedKeyword = normalize(entry.keyword ?? "");
    if (entry.categoryId === "brands") throw new Error(`Daily run ${run.id} attempted to add a brand keyword`);
    if (!mattressContextPattern.test(normalizedKeyword)) throw new Error(`Daily keyword lacks mattress context: ${normalizedKeyword}`);
    const accepted = add(
      normalizedKeyword,
      entry.categoryId,
      entry.subcategory,
      `Daily FAQ research · ${run.date}`,
      {
        dailyRunId: run.id,
        specialistReview: Boolean(entry.specialistReview),
        rationale: entry.rationale ?? "Mattress-specific FAQ or shopping topic.",
        contentType: entry.contentType,
        intent: entry.intent,
      },
    );
    if (!accepted) continue;
    const category = categoryById.get(entry.categoryId);
    addedKeywords.push({
      keyword: normalizedKeyword,
      categoryId: entry.categoryId,
      category: category.name,
      subcategory: entry.subcategory,
      specialistReview: Boolean(entry.specialistReview),
    });
    categoryCounts.set(category.name, (categoryCounts.get(category.name) ?? 0) + 1);
  }

  dailyRunResults.push({
    id: run.id,
    date: run.date,
    summary: run.summary ?? "Expanded mattress FAQs and shopper questions.",
    keywordsAdded: addedKeywords.length,
    categoriesAdded: run.categoriesAdded ?? [],
    categoryCounts: [...categoryCounts.entries()].map(([category, count]) => ({ category, count })),
    keywords: addedKeywords,
  });
}

records.sort((left, right) => {
  const categoryOrder = categoryById.get(left.categoryId).order - categoryById.get(right.categoryId).order;
  if (categoryOrder) return categoryOrder;
  const subcategoryOrder = left.subcategory.localeCompare(right.subcategory);
  if (subcategoryOrder) return subcategoryOrder;
  return left.keyword.localeCompare(right.keyword);
});

records.forEach((record, index) => {
  record.id = `keyword-${String(index + 1).padStart(5, "0")}`;
});

const categories = categoryDefinitions.map((category) => ({
  ...category,
  count: records.filter((record) => record.categoryId === category.id).length,
  subcategoryCount: new Set(records.filter((record) => record.categoryId === category.id).map((record) => record.subcategory)).size,
}));

const output = {
  generatedAt: new Date().toISOString(),
  market: "United States · English",
  criteria: "Every term must be usable as a mattress page, comparison, roundup, brand page, or FAQ. Ambiguous technical vocabulary is qualified with mattress context; irrelevant test-method and generic material terms are excluded.",
  totalKeywords: records.length,
  categories,
  keywords: records,
};

await fs.mkdir("public/data", { recursive: true });
await fs.writeFile("public/data/keyword-library.json", JSON.stringify(output));
await fs.writeFile("public/data/update-log.json", JSON.stringify({
  generatedAt: output.generatedAt,
  runs: dailyRunResults.sort((left, right) => right.date.localeCompare(left.date)),
}));

const invalid = records.filter((record) => /test method|how is .* measured|vs alternatives|near me near me|mattress mattress|\bacetate\b/.test(record.keyword));
if (invalid.length) throw new Error(`Invalid keywords escaped filtering: ${invalid.length}`);
if (categories.some((category) => category.count === 0)) throw new Error("A category has no keywords");

console.log(JSON.stringify({
  totalKeywords: records.length,
  categories: categories.length,
  brands: brands.length,
  dailyRuns: dailyRunResults.length,
  dailyKeywords: dailyRunResults.reduce((total, run) => total + run.keywordsAdded, 0),
  invalid: invalid.length,
}, null, 2));
