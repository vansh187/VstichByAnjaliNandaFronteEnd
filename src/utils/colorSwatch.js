// Maps backend color names to a swatch hex. Covers the common Indian
// fashion palette; anything unrecognized falls through to the raw name
// (works for standard CSS color keywords too) and finally a neutral grey
// so a swatch is never left invisible.
const COLOR_MAP = {
  black: "#1c1815",
  white: "#faf6ef",
  ivory: "#f2ead9",
  cream: "#f0e6d2",
  beige: "#e3d5b8",
  red: "#b3261e",
  maroon: "#6e1423",
  wine: "#5c1a2e",
  pink: "#e8a3b9",
  "rani pink": "#c2185b",
  magenta: "#b3175f",
  purple: "#5a2f6b",
  lavender: "#b9a6d9",
  blue: "#1c4d8f",
  navy: "#0f2340",
  teal: "#146b6b",
  turquoise: "#2fa39a",
  green: "#2f6b3a",
  olive: "#5c5a2e",
  mint: "#a6d9c2",
  yellow: "#e2c14a",
  mustard: "#c9a227",
  golden: "#caa54d",
  gold: "#c9a15a",
  orange: "#d4712b",
  peach: "#f0b98d",
  coral: "#e07a5f",
  brown: "#5a3d17",
  bronze: "#8c6a3f",
  copper: "#a15c32",
  grey: "#8a8378",
  gray: "#8a8378",
  silver: "#c4c0b8",
};

const FALLBACK = "#c9c2b8";

export function colorToHex(name = "") {
  const key = name.trim().toLowerCase();
  return COLOR_MAP[key] ?? key ?? FALLBACK;
}
