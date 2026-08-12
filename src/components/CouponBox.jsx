import { useEffect, useState } from "react";
import { getCoupons, applyCoupon } from "../lib/catalogApi";
import { formatINR } from "../utils/format";
import { LIMITS, PATTERNS, isTooLong } from "../utils/validation";

function formatDiscount(coupon) {
  return coupon.discount_type === "percentage"
    ? `${coupon.discount_value}% OFF`
    : `${formatINR(coupon.discount_value)} OFF`;
}

// Sits in the checkout Order Summary, between the item list and the Total
// row. `applied` (the last successful /coupons/apply response, or null) is
// owned by CheckoutPage since it also needs discount_amount/final_amount
// to compute the total shown at the bottom and sent with the order.
export default function CouponBox({ orderAmount, token, applied, onApplied, onRemoved, disabled = false }) {
  const [available, setAvailable] = useState([]);
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  // Refetches the eligible-coupon list whenever the cart subtotal changes,
  // and — if a coupon is already applied — silently re-validates it against
  // the new total, since a discount that was valid a moment ago isn't
  // guaranteed to still be (e.g. dropping below min_order_amount after
  // removing an item). `applied` is intentionally left out of the
  // dependency array: this should only re-run when the total itself
  // changes, not every time a fresh apply updates `applied` at the same
  // total — the closure still captures whatever `applied` was as of the
  // render where orderAmount changed.
  //
  // Coupons are prepaid-only — while `disabled` (COD selected), the parent
  // has already cleared `applied`, so skip fetching/re-validating entirely.
  useEffect(() => {
    if (disabled) return undefined;
    let active = true;

    getCoupons(orderAmount)
      .then((data) => {
        if (active) setAvailable(data?.items ?? []);
      })
      .catch(() => {
        if (active) setAvailable([]);
      });

    if (applied) {
      applyCoupon({ coupon_code: applied.coupon_code, order_amount: orderAmount }, token)
        .then((result) => {
          if (active) onApplied(result);
        })
        .catch((err) => {
          if (!active) return;
          if (err.status === 404 || err.status === 409) {
            onRemoved();
            setError("Your coupon no longer applies to this order and was removed.");
          }
          // Transient failures (network drop, 429, 500) are left alone -
          // the coupon stays applied and will be re-validated again on the
          // next subtotal change or at final submit.
        });
    }

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderAmount, disabled]);

  const handleApply = async (rawCode) => {
    const trimmed = rawCode.trim();
    if (!trimmed) return;

    setApplying(true);
    setError("");
    try {
      const result = await applyCoupon({ coupon_code: trimmed, order_amount: orderAmount }, token);
      onApplied(result);
      setCode("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  // Format/length checks only apply to what the user typed in by hand —
  // the eligible-coupon buttons below call handleApply directly with a
  // server-provided code, which should always reach the API even if it
  // doesn't match this client-side pattern.
  const handleManualApply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    if (isTooLong(trimmed, LIMITS.COUPON_CODE_MAX)) {
      setError(`Coupon code must be under ${LIMITS.COUPON_CODE_MAX} characters.`);
      return;
    }
    if (!PATTERNS.COUPON_CODE.test(trimmed)) {
      setError("Coupon code can only contain letters, numbers, hyphens and underscores.");
      return;
    }

    handleApply(trimmed);
  };

  if (disabled) {
    return (
      <div className="mt-6 border-t border-sand-dark pt-6">
        <p className="text-sm font-medium text-ink">Have a coupon?</p>
        <p className="mt-2 text-xs text-charcoal/60">
          Coupons apply to prepaid orders only — switch to Pay Online to use one.
        </p>
      </div>
    );
  }

  if (applied) {
    return (
      <div className="mt-6 border border-gold-light bg-sand/60 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">{applied.coupon_code} applied</p>
            <p className="text-xs text-charcoal/70">You saved {formatINR(applied.discount_amount)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onRemoved();
              setError("");
            }}
            className="shrink-0 text-xs font-medium tracking-[0.1em] text-charcoal/60 uppercase underline hover:text-ink"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-sand-dark pt-6">
      <p className="text-sm font-medium text-ink">Have a coupon?</p>

      {available.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {available.map((coupon) => (
            <button
              key={coupon.coupon_code}
              type="button"
              onClick={() => handleApply(coupon.coupon_code)}
              disabled={applying}
              className="flex items-center justify-between gap-3 border border-sand-dark bg-cream px-3 py-2.5 text-left text-sm transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                <span className="font-medium text-ink">{coupon.coupon_code}</span>
                <span className="block text-xs text-charcoal/60">{coupon.coupon_description}</span>
              </span>
              <span className="shrink-0 text-xs font-medium tracking-[0.08em] text-gold uppercase">
                {formatDiscount(coupon)}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          maxLength={LIMITS.COUPON_CODE_MAX}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border border-sand-dark bg-cream px-4 py-2.5 text-sm text-ink placeholder:text-charcoal/40 focus:border-gold focus:outline-none"
        />
        <button
          type="button"
          onClick={handleManualApply}
          disabled={applying || !code.trim()}
          className="shrink-0 border border-ink px-5 py-2.5 text-xs font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {applying ? "Applying…" : "Apply"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
