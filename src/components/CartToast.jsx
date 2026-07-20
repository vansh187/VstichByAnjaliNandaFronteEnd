import { useEffect, useRef, useState } from "react";
import { useCart } from "../hooks/useCart";
import { BagIcon, CheckCircleIcon, CloseIcon } from "./Icons";

const AUTO_DISMISS_MS = 3500;

export default function CartToast() {
  const { notification, count, openCart } = useCart();
  const [dismissedKey, setDismissedKey] = useState(null);
  const timerRef = useRef(null);

  const visible = Boolean(notification) && notification.key !== dismissedKey;

  useEffect(() => {
    if (!notification) return undefined;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDismissedKey(notification.key), AUTO_DISMISS_MS);
    return () => clearTimeout(timerRef.current);
  }, [notification]);

  return (
    <div
      role="status"
      aria-live="polite"
      inert={!visible ? true : undefined}
      className={`fixed right-5 top-20 z-50 w-[calc(100%-2.5rem)] max-w-sm border border-sand-dark bg-cream shadow-2xl transition-all duration-300 sm:right-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
          <CheckCircleIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base text-ink">Added to your bag</p>
          <p className="mt-0.5 truncate text-sm text-charcoal/70">{notification?.name}</p>
          <button
            type="button"
            onClick={() => {
              openCart();
              setDismissedKey(notification?.key);
            }}
            className="link-underline mt-3 inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.12em] text-ink uppercase"
          >
            <BagIcon width="14" height="14" /> View Bag ({count})
          </button>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissedKey(notification?.key)}
          className="text-charcoal/50 hover:text-ink"
        >
          <CloseIcon width="16" height="16" />
        </button>
      </div>
    </div>
  );
}
