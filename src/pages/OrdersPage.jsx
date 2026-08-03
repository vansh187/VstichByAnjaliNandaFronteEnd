import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../lib/apiConfig";
import { getOrders, getOrderTracking } from "../lib/catalogApi";
import { getStatusMeta, extractTrackingDetails } from "../utils/tracking";
import ReturnReplaceModal from "../components/ReturnReplaceModal";

const PAGE_SIZE = 10;
// Re-poll live tracking for visible, non-terminal orders at this cadence
// while the page stays open — a card's status can change without a reload.
const TRACKING_POLL_INTERVAL_MS = 45000;

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";

  const amount = Number(value);
  if (Number.isNaN(amount)) return value;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// The backend returns naive timestamps with no timezone designator (e.g.
// "2026-07-18T11:48:05.605785") that are actually UTC. Without an explicit
// "Z"/offset, JS Date parses that string as local time instead of UTC,
// silently shifting the displayed time by the viewer's UTC offset. Treat it
// as UTC explicitly, then always render in IST regardless of the viewer's
// own timezone.
function parseServerDate(value) {
  if (!value) return null;
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(value);
  const date = new Date(hasTimezone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseServerDate(value);
  if (!date) return value || "—";

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

// Purely informational (e.g. "Return available from 25 Jul") - the backend's
// can_return/can_replace booleans are always the actual source of truth for
// whether the buttons show, per the integration guide's own guidance.
function getEligibleDate(deliveredDate) {
  const date = parseServerDate(deliveredDate);
  if (!date) return null;
  // Add exactly 7*24h in absolute time (not local setDate/getDate, which
  // would add 7 *local-timezone* calendar days and can land on a different
  // day than 7 IST days for viewers outside IST) - the result is then
  // always rendered in Asia/Kolkata below, matching every other date in
  // this file and the backend's own IST-based 7-day rule.
  return new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
}

function getCreatedAt(order) {
  return (
    order?.created_at ||
    order?.createdAt ||
    order?.created_on ||
    order?.created_date ||
    order?.ordered_at ||
    order?.placed_at ||
    order?.date ||
    null
  );
}

function resolveImageUrl(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return `${API_BASE_URL}/${trimmed.replace(/^\.\//, "")}`;
}

function getOrderImages(order) {
  const lineItems =
    order?.items ||
    order?.products ||
    order?.order_items ||
    order?.line_items ||
    [];

  const images = [];

  const pushCandidate = (candidate) => {
    const resolved = resolveImageUrl(candidate);
    if (resolved && !images.includes(resolved)) {
      images.push(resolved);
    }
  };

  lineItems.forEach((item) => {
    pushCandidate(item?.image_url);
    pushCandidate(item?.imageUrl);
    pushCandidate(item?.image);
    pushCandidate(item?.thumbnail_url);
    pushCandidate(item?.thumbnailUrl);
    pushCandidate(item?.thumbnail);
    pushCandidate(item?.thumb);
    pushCandidate(item?.product_image);
    pushCandidate(item?.product_image_url);
    pushCandidate(item?.product?.image_url);
    pushCandidate(item?.product?.imageUrl);
    pushCandidate(item?.product?.image);
    pushCandidate(item?.product?.thumbnail_url);
    pushCandidate(item?.product?.thumbnailUrl);
    pushCandidate(item?.product?.thumbnail);
    pushCandidate(item?.product?.thumb);
    pushCandidate(item?.images?.[0]);
    pushCandidate(item?.product?.images?.[0]);
  });

  pushCandidate(order?.image_url);
  pushCandidate(order?.imageUrl);
  pushCandidate(order?.thumbnail_url);
  pushCandidate(order?.thumbnailUrl);
  pushCandidate(order?.image);
  pushCandidate(order?.thumbnail);

  return images.slice(0, 3);
}

function normalizeOrders(payload) {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.orders)
      ? payload.orders
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.results)
          ? payload.results
          : [];

  return source
    .map((order, index) => {
      const awbCode = order?.awb_code ?? order?.awbCode ?? null;
      let statusMeta = getStatusMeta(order?.status ?? order?.order_status);
      // A DB status of "Placed" with an AWB already assigned is further
      // along than a plain placed order (no shipment yet) — surface that
      // distinction even before any live tracking data comes back.
      if (statusMeta.rank === 1 && awbCode) {
        statusMeta = { label: "Shipment Created", rank: 1.5, tone: "bg-sky-100 text-sky-800" };
      }
      const createdAt = getCreatedAt(order);

      const lineItems =
        order?.items ||
        order?.products ||
        order?.order_items ||
        order?.line_items ||
        [];

      const itemSummary =
        order?.item_summary ||
        order?.summary ||
        lineItems
          .map((item) => item?.name || item?.product_name || item?.product?.name || "Item")
          .filter(Boolean)
          .slice(0, 3)
          .join(", ");

      return {
        id: order?.vstitch_order_id ?? order?.id ?? order?.order_id ?? order?.orderNumber ?? `order-${index + 1}`,
        orderNumber:
          order?.order_number ??
          order?.orderNumber ??
          order?.vstitch_order_id ??
          order?.id ??
          `#${index + 1}`,
        status: order?.status ?? order?.order_status ?? "Placed",
        statusMeta,
        awbCode,
        createdAt,
        total: order?.total ?? order?.total_amount ?? order?.amount ?? order?.grand_total ?? null,
        itemSummary: itemSummary || "Products available",
        itemCount: lineItems.length || order?.item_count || order?.items_count || 0,
        images: getOrderImages(order),
        // Return/replace eligibility - always trust these booleans over any
        // client-side date math, per the backend's own guidance (it
        // re-validates everything server-side regardless).
        deliveredDate: order?.delivered_date ?? null,
        canReturn: Boolean(order?.can_return),
        canReplace: Boolean(order?.can_replace),
        items: lineItems.map((item) => ({
          id: item?.vstitch_order_item_id ?? null,
          name: item?.product_name ?? item?.name ?? "Item",
          size: item?.size ?? null,
          color: item?.color ?? null,
          quantity: item?.quantity ?? 1,
        })),
      };
    })
    .sort((a, b) => {
      const rankDiff = a.statusMeta.rank - b.statusMeta.rank;
      if (rankDiff !== 0) return rankDiff;

      const left = new Date(a.createdAt || 0).getTime();
      const right = new Date(b.createdAt || 0).getTime();
      return right - left;
    });
}

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [trackingByOrderId, setTrackingByOrderId] = useState({});
  const trackingInFlightRef = useRef(new Set());
  const [activeRequest, setActiveRequest] = useState(null); // { mode: "return" | "replace", order }
  // Orders with a request just submitted this session - hidden immediately
  // rather than waiting on a refetch, since the backend won't allow a
  // second open return/replace on the same order anyway.
  const [justRequestedOrderIds, setJustRequestedOrderIds] = useState(() => new Set());

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!token) {
        setOrders([]);
        setLoading(false);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getOrders(token);
        if (!active) return;
        setOrders(normalizeOrders(response));
        setVisibleCount(PAGE_SIZE);
      } catch (err) {
        if (!active) return;
        setOrders([]);
        setError(err?.message || "We could not load your orders right now.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [token]);

  const visibleOrders = useMemo(() => orders.slice(0, visibleCount), [orders, visibleCount]);
  const hasMore = orders.length > visibleCount;

  // Live per-card tracking overlay: the list call above only reflects the
  // DB's stored status (updated by Shiprocket's webhook), so poll the
  // tracking endpoint for whatever's on screen and merge in a more granular
  // status when Shiprocket has one. Orders not yet shipped return 409 —
  // that's expected, not an error, so we just keep the DB label for them.
  useEffect(() => {
    if (!token) return undefined;

    const trackableIds = visibleOrders
      .filter((order) => order.statusMeta.rank < 4)
      .map((order) => order.id);

    if (trackableIds.length === 0) return undefined;

    let active = true;

    async function fetchTracking(orderId) {
      if (trackingInFlightRef.current.has(orderId)) return;
      trackingInFlightRef.current.add(orderId);

      try {
        const response = await getOrderTracking(orderId, token);
        if (!active) return;
        const liveStatus = extractTrackingDetails(response).currentStatus;
        // A shipment/AWB exists on essentially every order right after
        // placement (auto-created server-side), so a 200 response by itself
        // isn't a meaningful signal — only a real scan (non-empty
        // current_status) means the order actually moved.
        setTrackingByOrderId((prev) => ({
          ...prev,
          [orderId]: liveStatus ? { statusMeta: getStatusMeta(liveStatus) } : prev[orderId] ?? null,
        }));
      } catch (err) {
        // 409 = not shipped yet, anything else = transient upstream issue.
        // Either way, fall back silently to the DB status already shown.
        if (!active) return;
        if (err?.status !== 409) {
          setTrackingByOrderId((prev) => ({ ...prev, [orderId]: prev[orderId] ?? null }));
        }
      } finally {
        trackingInFlightRef.current.delete(orderId);
      }
    }

    trackableIds.forEach(fetchTracking);
    const interval = setInterval(() => {
      trackableIds.forEach(fetchTracking);
    }, TRACKING_POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [visibleOrders, token]);

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <AnnouncementBar />
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-sand-dark/80 bg-white/80 p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Your account</p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">My Orders</h1>
            <p className="mt-2 max-w-2xl text-sm text-charcoal/70 sm:text-base">
              Track every order in one place. Your recent purchases are grouped by status from placed to delivered.
            </p>
          </div>
          <Link
            to="/home"
            className="inline-flex items-center justify-center rounded-full border border-sand-dark px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-sand/60"
          >
            Continue shopping
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[1.5rem] border border-sand-dark/70 bg-white p-6 text-sm text-charcoal/70 shadow-sm">
            Loading your orders...
          </div>
        ) : error ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[1.5rem] border border-sand-dark/70 bg-white p-8 text-center shadow-sm">
            <p className="font-display text-2xl text-ink">No orders yet</p>
            <p className="mt-2 text-sm text-charcoal/70">
              Once you place an order, it will appear here with clear tracking progress.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleOrders.map((order) => {
              const liveStatusMeta = trackingByOrderId[order.id]?.statusMeta;
              const displayStatusMeta = liveStatusMeta ?? order.statusMeta;

              return (
              <article
                key={order.id}
                className="rounded-[1.5rem] border border-sand-dark/70 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-1 gap-3">
                    {order.images.length > 0 && (
                      <div className="flex shrink-0 gap-2">
                        {order.images.map((image, index) => (
                          <img
                            key={`${order.id}-${index}`}
                            src={image}
                            alt={`${order.orderNumber} item ${index + 1}`}
                            className="h-14 w-14 rounded-xl border border-sand-dark/70 object-cover"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='18' fill='%23f5ebdc'/%3E%3Cpath d='M32 88l18-24 14 16 10-13 14 19H32z' fill='%23b8892c'/%3E%3Ccircle cx='44' cy='46' r='10' fill='%23b8892c'/%3E%3C/svg%3E";
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-display text-xl text-ink">{order.orderNumber}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${displayStatusMeta.tone}`}>
                          {displayStatusMeta.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-charcoal/70">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                      <p className="mt-3 text-sm text-charcoal/70">
                        {order.itemSummary}
                        {order.itemCount > 0 ? ` • ${order.itemCount} item${order.itemCount > 1 ? "s" : ""}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm uppercase tracking-[0.2em] text-charcoal/50">Total</p>
                    <p className="mt-1 text-lg font-semibold text-ink">{formatCurrency(order.total)}</p>
                  </div>
                </div>

                {(() => {
                  const requestOpen = justRequestedOrderIds.has(order.id);
                  if (requestOpen) {
                    return (
                      <p className="mt-4 border-t border-sand-dark/60 pt-4 text-sm text-charcoal/70">
                        A return/replace request is already in progress for this order.
                      </p>
                    );
                  }

                  if (order.canReturn || order.canReplace) {
                    return (
                      <div className="mt-4 flex flex-wrap gap-3 border-t border-sand-dark/60 pt-4">
                        {order.canReturn && (
                          <button
                            type="button"
                            onClick={() => setActiveRequest({ mode: "return", order })}
                            className="rounded-full border border-sand-dark px-4 py-2 text-xs font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:bg-sand/60"
                          >
                            Return
                          </button>
                        )}
                        {order.canReplace && (
                          <button
                            type="button"
                            onClick={() => setActiveRequest({ mode: "replace", order })}
                            className="rounded-full border border-sand-dark px-4 py-2 text-xs font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:bg-sand/60"
                          >
                            Replace
                          </button>
                        )}
                      </div>
                    );
                  }

                  const eligibleDate = order.deliveredDate ? getEligibleDate(order.deliveredDate) : null;
                  if (eligibleDate) {
                    return (
                      <p className="mt-4 border-t border-sand-dark/60 pt-4 text-sm text-charcoal/60">
                        Return &amp; replace will be available from{" "}
                        {eligibleDate.toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        (7 days after delivery).
                      </p>
                    );
                  }

                  return null;
                })()}
              </article>
              );
            })}

            {hasMore && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="rounded-full border border-sand-dark px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-sand/60"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />

      {activeRequest && (
        <ReturnReplaceModal
          mode={activeRequest.mode}
          order={activeRequest.order}
          token={token}
          onClose={() => setActiveRequest(null)}
          onSuccess={() => {
            setJustRequestedOrderIds((prev) => new Set(prev).add(activeRequest.order.id));
          }}
        />
      )}
    </div>
  );
}
