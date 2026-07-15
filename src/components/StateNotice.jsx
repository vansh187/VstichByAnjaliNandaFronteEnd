// Shared inline notice for empty/error data states across catalog sections.
export default function StateNotice({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center gap-3 border border-sand-dark bg-sand/40 px-6 py-16 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-charcoal/70">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 border border-ink px-6 py-2.5 text-xs font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
