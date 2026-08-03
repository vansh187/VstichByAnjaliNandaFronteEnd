import { useState } from "react";
import { SIZE_CHART_IN, inchesToCm } from "../utils/sizeChart";
import { RulerIcon, SparkleIcon, RefreshIcon, HeadsetIcon } from "./Icons";
import ModalShell from "./ModalShell";

const BENEFITS = [
  { Icon: RulerIcon, label: "Perfect Fit Assured" },
  { Icon: SparkleIcon, label: "Free Alterations" },
  { Icon: RefreshIcon, label: "Easy Returns" },
  { Icon: HeadsetIcon, label: "Quick Support" },
];

// Same standard body-measurement chart on every product page (the backend
// doesn't return per-product measurements) — a generic reference is more
// useful to shoppers here than nothing at all.
export default function SizeGuideModal({ onClose }) {
  const [unit, setUnit] = useState("in");

  const convert = (value) => (unit === "in" ? value : inchesToCm(value));

  return (
    <ModalShell title="Size Guide" onClose={onClose}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">
          Size Chart (Body Measurements)
        </p>
        <div className="flex shrink-0 overflow-hidden rounded-full border border-sand-dark text-xs font-medium uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setUnit("in")}
            aria-pressed={unit === "in"}
            className={`px-3 py-1.5 transition-colors ${
              unit === "in" ? "bg-ink text-cream" : "bg-cream text-charcoal/70"
            }`}
          >
            In
          </button>
          <button
            type="button"
            onClick={() => setUnit("cm")}
            aria-pressed={unit === "cm"}
            className={`px-3 py-1.5 transition-colors ${
              unit === "cm" ? "bg-ink text-cream" : "bg-cream text-charcoal/70"
            }`}
          >
            Cm
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden overflow-x-auto rounded-lg border border-sand-dark">
        <table className="w-full min-w-[380px] border-collapse text-sm">
          <thead>
            <tr className="bg-sand/60 text-xs font-semibold uppercase tracking-wider text-charcoal/70">
              <th className="px-3 py-2.5 text-left">Size</th>
              <th className="px-3 py-2.5 text-center">Bust</th>
              <th className="px-3 py-2.5 text-center">Waist</th>
              <th className="px-3 py-2.5 text-center">Hips</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART_IN.map((row) => (
              <tr key={row.size} className="border-t border-sand-dark/70">
                <td className="px-3 py-2.5 text-left font-medium text-ink">
                  {row.size}
                  {row.popular && <span className="ml-1 text-gold">★</span>}
                </td>
                <td className="px-3 py-2.5 text-center text-charcoal/80">{convert(row.bust)}</td>
                <td className="px-3 py-2.5 text-center text-charcoal/80">{convert(row.waist)}</td>
                <td className="px-3 py-2.5 text-center text-charcoal/80">{convert(row.hips)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">
          How to Measure
        </p>
        <p className="mt-1.5 text-sm text-charcoal/70">
          Take your measurements directly on the body with a measuring tape.
        </p>
        <div className="mt-3 overflow-hidden rounded-lg border border-sand-dark bg-sand/20">
          <img
            src="/static/size-guide/how-to-measure.svg"
            alt="Diagram showing where to measure shoulder, bust, waist, hips, sleeve length, and dress length"
            className="mx-auto w-full max-w-[280px]"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-2 border-t border-sand-dark/70 pt-6 text-center">
        {BENEFITS.map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <Icon width="24" height="24" className="text-gold" />
            <span className="text-[11px] leading-tight text-charcoal/70">{label}</span>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}
