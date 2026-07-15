// Editorial placeholder art standing in for real product photography.
// Swap the <img> markup in here for real assets at integration time.
import { useId } from "react";

export default function Swatch({ tone, className = "", monogram = "VN", children }) {
  const patternId = `weave-${useId()}`;
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${tone} ${className}`}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.15] mix-blend-overlay"
        preserveAspectRatio="none"
        viewBox="0 0 200 200"
      >
        <defs>
          <pattern id={patternId} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 14L14 0M-3.5 3.5L3.5 -3.5M10.5 17.5L17.5 10.5" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill={`url(#${patternId})`} />
      </svg>
      <span
        aria-hidden="true"
        className="absolute -bottom-6 -right-3 font-display text-8xl italic text-white/10 select-none"
      >
        {monogram}
      </span>
      {children}
    </div>
  );
}
