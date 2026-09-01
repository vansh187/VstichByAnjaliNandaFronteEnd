// Category hero media, served from /public/static so the build copies them
// to the deployed site's root untouched (same relative URL in dev and every
// deployment, no bundler asset-hashing to keep in sync). Matched against the
// category's real name, never a hardcoded category id, so this keeps working
// if categories are renamed/reordered on the backend. A category with no
// matching entry falls back to its image/gradient instead of breaking.
//
// `poster` and `mobileSrc` point at files that don't exist in the repo yet —
// wire them up as soon as the real assets (a static first-frame JPG per clip,
// and a lower-resolution encode for mobile networks) are delivered. Until
// then <video poster> simply has nothing to show before the first frame
// decodes, and mobile plays the same encode as desktop.
const CATEGORY_MEDIA = [
  {
    keywords: ["dress"],
    src: "/static/dresses/dresses-hero.mp4",
    mobileSrc: null,
    poster: null,
    tagline: "Draped in light, made to be remembered.",
  },
  {
    keywords: ["summer luxe", "summer-luxe"],
    src: "/static/dresses/dresses-hero.mp4",
    mobileSrc: null,
    poster: null,
    tagline: "Lightweight luxury for the warm months.",
  },
  {
    keywords: ["co-ord skirt", "coord skirt", "skirt set"],
    src: "/static/cord-skirt-set/cord-skirt-set-hero.mp4",
    mobileSrc: null,
    poster: null,
    tagline: "Structured ease, styled as one.",
  },
  {
    keywords: ["cord set", "co-ord", "coord"],
    src: "/static/cord-set/cord-set-hero.mp4",
    mobileSrc: null,
    poster: null,
    tagline: "Effortless pairing, made for movement.",
  },
  {
    keywords: ["shirt"],
    src: "/static/shirts/shirts-hero.mp4",
    mobileSrc: null,
    poster: null,
    tagline: "Crisp lines, quietly confident.",
  },
  {
    keywords: ["cape"],
    src: "/static/capes/capes-hero.mp4",
    mobileSrc: null,
    poster: null,
    tagline: "Flowing silhouettes for every season.",
  },
  {
    keywords: ["suit"],
    src: "/static/suits/suits-hero.mp4",
    mobileSrc: null,
    poster: null,
    tagline: "Tailored precision, unmistakably yours.",
  },
  {
    // Backend category name is spelled "Lehnga" (see catalog data), but
    // matching both spellings keeps this working if that's ever corrected.
    keywords: ["lehnga", "lehenga"],
    src: "/static/lehenga/lehenga-hero.mp4",
    mobileSrc: null,
    poster: null,
    tagline: "Grandeur in every pleat, made to twirl.",
  },
];

function resolveMediaForCategory(categoryName = "") {
  const name = categoryName.toLowerCase();
  return CATEGORY_MEDIA.find((entry) => entry.keywords.some((keyword) => name.includes(keyword))) ?? null;
}

export function resolveVideoForCategory(categoryName = "") {
  return resolveMediaForCategory(categoryName)?.src ?? null;
}

export function resolveCategoryMedia(categoryName = "") {
  const entry = resolveMediaForCategory(categoryName);
  return {
    src: entry?.src ?? null,
    mobileSrc: entry?.mobileSrc ?? null,
    poster: entry?.poster ?? null,
    tagline: entry?.tagline ?? null,
  };
}

// "VStitch Shirts", "VStitch Suits" etc. — the backend has a mix of plain
// names ("Shirts") and names that already carry a wrongly-cased prefix
// ("Vstitch Suits"), so any existing "vstitch" prefix is stripped before
// reapplying the correctly-cased one rather than trusting what's stored.
export function withBrandPrefix(categoryName = "") {
  const stripped = categoryName.replace(/^vstitch\s+/i, "");
  return `VStitch ${stripped}`;
}
