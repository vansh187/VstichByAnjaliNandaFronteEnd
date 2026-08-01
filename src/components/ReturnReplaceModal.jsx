import { useEffect, useRef, useState } from "react";
import { useOverlay } from "../hooks/useOverlay";
import { returnOrder, replaceOrder } from "../lib/catalogApi";
import { CloseIcon, MinusIcon, PlusIcon, CheckCircleIcon } from "./Icons";

const ISSUE_CATEGORIES = [
  { value: "size_issue", label: "Wrong Size" },
  { value: "defect", label: "Item is Defective" },
];

// Shared by both flows: Return files against the whole order, Replace is
// item-level (size/defect) - same modal shell, different fields/submit call,
// per return-replace-frontend-integration.md.
export default function ReturnReplaceModal({ mode, order, token, onClose, onSuccess }) {
  const isReplace = mode === "replace";

  const [reason, setReason] = useState("");
  const [issueCategory, setIssueCategory] = useState(ISSUE_CATEGORIES[0].value);
  // itemId -> quantity, only present for selected items
  const [selectedQty, setSelectedQty] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reasonFieldError, setReasonFieldError] = useState("");
  const [result, setResult] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Closing mid-submit would let the request resolve after the modal is
  // gone (harmless for a success, but confusing if the visitor thinks
  // they've cancelled) - block it, same as most checkout/payment modals do.
  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  useOverlay(true, handleClose);

  const toggleItem = (item) => {
    setSelectedQty((prev) => {
      const next = { ...prev };
      if (item.id in next) {
        delete next[item.id];
      } else {
        next[item.id] = 1;
      }
      return next;
    });
  };

  const setQty = (item, qty) => {
    setSelectedQty((prev) => ({
      ...prev,
      [item.id]: Math.min(Math.max(qty, 1), item.quantity),
    }));
  };

  const selectedCount = Object.keys(selectedQty).length;
  const reasonValid = reason.trim().length > 0 && reason.trim().length <= 500;
  const canSubmit = isReplace ? reasonValid && selectedCount > 0 : reasonValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    if (!token) {
      // Session expired/cleared while the modal was open (e.g. the
      // background token-expiry check in AuthContext fired) - the request
      // would just come back 401 anyway, so fail fast with a clear reason
      // instead of a generic error after a round trip.
      setError("Your session has expired. Please log in again and retry.");
      return;
    }

    setSubmitting(true);
    setError("");
    setReasonFieldError("");

    try {
      const data = isReplace
        ? await replaceOrder(
            order.id,
            {
              issue_category: issueCategory,
              reason: reason.trim(),
              items: Object.entries(selectedQty).map(([itemId, quantity]) => ({
                vstitch_order_item_id: Number(itemId),
                quantity,
              })),
            },
            token,
          )
        : await returnOrder(order.id, { reason: reason.trim() }, token);

      if (!mountedRef.current) return;
      setResult(data);
      onSuccess?.(data);
    } catch (err) {
      if (!mountedRef.current) return;
      // 409s here are expected, handle-able states (already-open request,
      // outside the window, etc.) with a backend-crafted message that's
      // already safe to show directly - not a bug to swallow or reword.
      // A 422 instead carries per-field messages (see http.js's
      // normalizeError) - surface the reason-specific one inline if present,
      // on top of the generic summary.
      setError(err.message || "Something went wrong. Please try again.");
      if (err.fieldErrors?.reason) setReasonFieldError(err.fieldErrors.reason);
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/55 px-5 py-10 backdrop-blur-sm sm:items-center"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg border border-sand-dark bg-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sand-dark px-6 py-5">
          <h2 className="font-display text-xl text-ink">
            {isReplace ? "Replace Item" : "Return Order"} — {order.orderNumber}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            disabled={submitting}
            className="text-charcoal/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CloseIcon width="20" height="20" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          {result ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircleIcon width="40" height="40" className="text-emerald-600" />
              <p className="font-display text-xl text-ink">
                {isReplace ? "Replacement" : "Return"} request submitted
              </p>
              <p className="text-sm text-charcoal/70">
                Request #{result.vstitch_return_order_id} — our team will follow up with next
                steps.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 bg-ink px-6 py-2.5 text-sm font-medium tracking-[0.12em] text-cream uppercase hover:bg-charcoal"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {isReplace && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">
                    What's the issue?
                  </p>
                  <div className="mt-2 flex gap-2">
                    {ISSUE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        aria-pressed={issueCategory === cat.value}
                        onClick={() => setIssueCategory(cat.value)}
                        disabled={submitting}
                        className={`flex-1 border px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          issueCategory === cat.value
                            ? "border-ink bg-ink text-cream"
                            : "border-sand-dark text-ink hover:border-charcoal"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isReplace && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">
                    Which item(s)?
                  </p>
                  {order.items.length === 0 ? (
                    <p className="mt-2 text-sm text-charcoal/60">
                      We couldn't find the items for this order. Please contact support instead.
                    </p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {order.items.map((item) => {
                        const checked = item.id in selectedQty;
                        return (
                          <div
                            key={item.id ?? item.name}
                            className={`flex items-center justify-between gap-3 border px-3 py-2.5 ${
                              checked ? "border-ink" : "border-sand-dark"
                            }`}
                          >
                            <label className="flex flex-1 items-center gap-3 text-sm text-ink">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleItem(item)}
                                disabled={!item.id || submitting}
                              />
                              <span>
                                {item.name}
                                {item.size ? ` • ${item.size}` : ""}
                                {item.color ? ` • ${item.color}` : ""}
                                <span className="text-charcoal/50"> (ordered {item.quantity})</span>
                                {!item.id && (
                                  <span className="block text-xs text-rose-600">
                                    Unavailable for replacement — missing item reference.
                                  </span>
                                )}
                              </span>
                            </label>
                            {checked && (
                              <div className="flex shrink-0 items-center border border-sand-dark">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  onClick={() => setQty(item, (selectedQty[item.id] ?? 1) - 1)}
                                  disabled={(selectedQty[item.id] ?? 1) <= 1 || submitting}
                                  className="flex h-8 w-8 items-center justify-center text-ink disabled:opacity-40"
                                >
                                  <MinusIcon width="12" height="12" />
                                </button>
                                <span className="w-7 text-center text-xs font-medium">
                                  {selectedQty[item.id] ?? 1}
                                </span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  onClick={() => setQty(item, (selectedQty[item.id] ?? 1) + 1)}
                                  disabled={(selectedQty[item.id] ?? 1) >= item.quantity || submitting}
                                  className="flex h-8 w-8 items-center justify-center text-ink disabled:opacity-40"
                                >
                                  <PlusIcon width="12" height="12" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="rr-reason" className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">
                  Tell us more
                </label>
                <textarea
                  id="rr-reason"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (reasonFieldError) setReasonFieldError("");
                  }}
                  maxLength={500}
                  rows={4}
                  disabled={submitting}
                  placeholder={
                    isReplace
                      ? "What's wrong with the item(s)?"
                      : "Why are you returning this order?"
                  }
                  className={`mt-2 w-full border bg-cream px-3 py-2.5 text-sm text-ink outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                    reasonFieldError ? "border-rose-400" : "border-sand-dark focus:border-ink"
                  }`}
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-rose-600">{reasonFieldError}</span>
                  <span className="text-charcoal/50">{reason.length}/500</span>
                </div>
              </div>

              {error && (
                <p className="border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full bg-ink py-3 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-sand-dark disabled:text-charcoal/40"
              >
                {submitting ? "Submitting…" : isReplace ? "Submit Replacement Request" : "Submit Return"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
