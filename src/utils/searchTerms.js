const STOPWORDS = new Set(["for", "the", "a", "an", "in", "of", "and", "or", "to", "with"]);

// Naive English singular/plural toggle - not linguistically complete, but
// covers the common cases ("shirts" -> "shirt", "dresses" -> "dress",
// "party" -> "parties" isn't needed here since we only go plural -> singular
// and singular -> plural, not full inflection).
function singularPluralVariants(word) {
  const lower = word.toLowerCase();
  const variants = [];

  if (lower.endsWith("ies") && lower.length > 4) {
    variants.push(`${lower.slice(0, -3)}y`);
  } else if (lower.endsWith("es") && lower.length > 3) {
    variants.push(lower.slice(0, -2));
  }

  if (lower.endsWith("s") && !lower.endsWith("ss") && lower.length > 3) {
    variants.push(lower.slice(0, -1));
  } else if (!lower.endsWith("s")) {
    variants.push(`${lower}s`);
  }

  return variants;
}

// The `/products?search=` endpoint does a strict substring match against
// the product name only - so a perfectly reasonable query like "shirts"
// (plural) can return zero results even though a "Shirts" category full of
// products named "... Shirt" (singular) exists, since no product name
// literally contains "shirts". This builds a short, ordered list of
// fallback search terms - the exact query first, then its singular/plural
// counterpart, then each significant word (and its own singular/plural
// counterpart) - so a search doesn't dead-end on English pluralization or
// an overly specific multi-word phrase.
export function buildSearchCandidates(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const seen = new Set();
  const candidates = [];
  const add = (term) => {
    const clean = term.trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(clean);
  };

  add(trimmed);

  const words = trimmed
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word.toLowerCase()));

  if (words.length > 1) {
    // Multi-word query: pluralizing the whole phrase as one unit produces
    // nonsense ("blue dresses" -> "blue dresse"), so only the individual
    // words get singular/plural variants here.
    words.forEach((word) => {
      add(word);
      singularPluralVariants(word).forEach(add);
    });
  } else {
    singularPluralVariants(trimmed).forEach(add);
  }

  // Caps the number of probe requests a single search can trigger.
  return candidates.slice(0, 8);
}
