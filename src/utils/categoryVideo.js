// Category hero videos, served from /public/static so the build copies them
// to the deployed site's root untouched (same relative URL in dev and every
// deployment, no bundler asset-hashing to keep in sync). Matched against the
// category's real name, never a hardcoded category id, so this keeps working
// if categories are renamed/reordered on the backend. A category with no
// matching video falls back to its image/gradient instead of breaking.
const CATEGORY_VIDEOS = [
  { keywords: ["cord set", "co-ord", "coord"], src: "/static/cord-set/cord-set-hero.mp4" },
  { keywords: ["shirt"], src: "/static/shirts/shirts-hero.mp4" },
  { keywords: ["cape"], src: "/static/capes/capes-hero.mp4" },
];

export function resolveVideoForCategory(categoryName = "") {
  const name = categoryName.toLowerCase();
  return CATEGORY_VIDEOS.find((entry) => entry.keywords.some((keyword) => name.includes(keyword)))
    ?.src ?? null;
}
