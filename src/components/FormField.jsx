// Shared labeled-input wrapper used by AuthCard and Checkout.
export default function FormField({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] text-charcoal/70 uppercase">
        {label}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-700">{error}</span>}
    </label>
  );
}
