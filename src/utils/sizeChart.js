// Standard body-measurement size chart (inches), shared across all products
// since the backend doesn't return per-product measurements. "popular"
// marks the sizes ordered most often, mirroring the trending-size badges
// customers expect from this kind of chart.
export const SIZE_CHART_IN = [
  { size: "XS", bust: 32, waist: 26, hips: 35 },
  { size: "S", bust: 34, waist: 28, hips: 37 },
  { size: "M", bust: 36, waist: 30, hips: 39, popular: true },
  { size: "L", bust: 38, waist: 32, hips: 41, popular: true },
  { size: "XL", bust: 40, waist: 34, hips: 43, popular: true },
  { size: "2XL", bust: 42, waist: 36, hips: 45 },
  { size: "3XL", bust: 44, waist: 38, hips: 47 },
  { size: "4XL", bust: 46, waist: 40, hips: 49 },
  { size: "5XL", bust: 48, waist: 42, hips: 51 },
];

export function inchesToCm(inches) {
  return Math.round(inches * 2.54);
}
