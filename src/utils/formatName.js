export function formatDisplayName(username) {
  if (!username) return "there";
  return username
    .replace(/[_.-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
