export const inputClass = (hasError) =>
  `w-full border bg-cream px-4 py-3 text-sm text-ink placeholder:text-charcoal/40 focus:outline-none ${
    hasError ? "border-red-400 focus:border-red-500" : "border-sand-dark focus:border-gold"
  }`;
