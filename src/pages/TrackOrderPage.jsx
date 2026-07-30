import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../hooks/useAuth";
import { getOrderTracking } from "../lib/catalogApi";
import { extractTrackingDetails } from "../utils/tracking";

// The backend returns naive UTC timestamps with no timezone designator —
// same handling as OrdersPage, so a tracking event's date always reads in
// IST regardless of the viewer's own timezone.
function formatDate(value) {
  if (!value) return null;
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(value);
  const date = new Date(hasTimezone ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TrackOrderPage() {
  const { token } = useAuth();
  const [orderIdInput, setOrderIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notShipped, setNotShipped] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedId = orderIdInput.trim();

    setError("");
    setNotShipped(false);
    setResult(null);

    if (!/^\d+$/.test(trimmedId)) {
      setError("Enter a valid numeric Order ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await getOrderTracking(trimmedId, token);
      setResult(extractTrackingDetails(response));
    } catch (err) {
      if (err?.status === 409) {
        // Not an error — the order simply hasn't shipped yet. The backend's
        // own message is already customer-friendly, so it's shown as-is.
        setNotShipped(true);
        setError(err.message || "This order hasn't shipped yet.");
      } else if (err?.status === 404) {
        setError(err.message || "We couldn't find that order. Please check the Order ID and try again.");
      } else {
        setError(err.message || "Something went wrong while fetching tracking info. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <AnnouncementBar />
      <Navbar />
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-sand-dark/80 bg-white/80 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Order Tracking</p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Track Your Order</h1>
          <p className="mt-2 max-w-xl text-sm text-charcoal/70 sm:text-base">
            Enter your Order ID to see its latest live shipment status. You can find the Order ID
            on your{" "}
            <Link to="/orders" className="link-underline font-medium text-ink">
              My Orders
            </Link>{" "}
            page.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              inputMode="numeric"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="e.g. 27"
              aria-label="Order ID"
              className="flex-1 rounded-full border border-sand-dark bg-cream px-5 py-3 text-sm text-ink outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium tracking-[0.1em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Tracking…" : "Track Order"}
            </button>
          </form>
        </div>

        {error && (
          <div
            className={`rounded-[1.5rem] border p-6 text-sm shadow-sm ${
              notShipped
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-[1.5rem] border border-sand-dark/70 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-xl text-ink">Order #{orderIdInput.trim()}</h2>
              {result.statusMeta && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${result.statusMeta.tone}`}>
                  {result.statusMeta.label}
                </span>
              )}
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              {result.courierName && (
                <div>
                  <dt className="uppercase tracking-[0.16em] text-charcoal/50">Courier</dt>
                  <dd className="mt-1 text-ink">{result.courierName}</dd>
                </div>
              )}
              {result.awbCode && (
                <div>
                  <dt className="uppercase tracking-[0.16em] text-charcoal/50">AWB Number</dt>
                  <dd className="mt-1 text-ink">{result.awbCode}</dd>
                </div>
              )}
              {result.estimatedDelivery && (
                <div>
                  <dt className="uppercase tracking-[0.16em] text-charcoal/50">Estimated Delivery</dt>
                  <dd className="mt-1 text-ink">{formatDate(result.estimatedDelivery) || result.estimatedDelivery}</dd>
                </div>
              )}
            </dl>

            {result.activities.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/60">
                  Shipment History
                </h3>
                <ul className="mt-3 space-y-4 border-l border-sand-dark pl-5">
                  {result.activities.map((activity, index) => (
                    <li key={index} className="relative">
                      <span className="absolute -left-[1.45rem] top-1.5 h-2 w-2 rounded-full bg-gold" />
                      <p className="text-sm font-medium text-ink">
                        {activity.status || activity.activityText}
                      </p>
                      {activity.activityText && activity.activityText !== activity.status && (
                        <p className="text-sm text-charcoal/70">{activity.activityText}</p>
                      )}
                      <p className="mt-0.5 text-xs text-charcoal/50">
                        {[formatDate(activity.date), activity.location].filter(Boolean).join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              !result.currentStatus && (
                <p className="mt-4 text-sm text-charcoal/70">
                  Your shipment has been created and is awaiting its first courier scan.
                </p>
              )
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
