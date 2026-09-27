const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatINR = (value) => inrFormatter.format(value);

// Fabrics are sold by the metre, so their price needs the unit spelled out.
// Matched on category name (like categoryVideo) rather than a hardcoded id.
const isPricedPerMetre = (categoryName = "") => /fabric/i.test(categoryName);

export const withPriceUnit = (label, categoryName) =>
  label && isPricedPerMetre(categoryName) && !/per metre$/.test(label)
    ? `${label} per metre`
    : label;
