// Decorative theming for categories coming from the backend, which only
// supplies id/name/parent — no imagery or marketing copy. Tone is picked
// deterministically from the category id (stable across reloads); the
// quote is matched by keyword against the category name with a graceful
// generic fallback for names we don't recognize.

const TONE_PALETTE = [
  "from-[#e2d5b8] to-[#c9a15a]",
  "from-[#d8b876] to-[#b1873f]",
  "from-[#c98f7b] to-[#8f4a3a]",
  "from-[#3a332c] to-[#1c1815]",
  "from-[#9a2b2b] to-[#3a0d0d]",
  "from-[#1c3a52] to-[#08151f]",
  "from-[#5a2f6b] to-[#1f0f2b]",
  "from-[#4a5d52] to-[#141d18]",
];

export function getCategoryTone(categoryId) {
  const n = Math.abs(Number(categoryId)) || 0;
  return TONE_PALETTE[n % TONE_PALETTE.length];
}

const QUOTE_RULES = [
  {
    test: /saree/i,
    quote: "Six yards, a lifetime of grace — draped for the woman who owns every room she enters.",
  },
  {
    test: /lehenga/i,
    quote: "Some dreams are stitched, not bought — wear the one woven for your forever day.",
  },
  {
    test: /salwar|suit/i,
    quote: "Effortless by design, unforgettable in every fold — for days that ask a little more of you.",
  },
  {
    test: /kurt/i,
    quote: "Everyday elegance, tailored for a woman who never dresses down her ambition.",
  },
  {
    test: /dupatta/i,
    quote: "The finishing drape — because every story deserves a beautiful last line.",
  },
  {
    test: /gown/i,
    quote: "Step into the room like you were the reason it was lit.",
  },
  {
    test: /indo.?western/i,
    quote: "Where heritage meets your edge — tradition, tailored for a woman who writes her own rules.",
  },
];

const DEFAULT_QUOTE = "Crafted with care, worn with confidence — a collection made for you.";

export function getCategoryQuote(categoryName = "") {
  return QUOTE_RULES.find((rule) => rule.test.test(categoryName))?.quote ?? DEFAULT_QUOTE;
}
