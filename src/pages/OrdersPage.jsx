import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../lib/apiConfig";
import { getOrders } from "../lib/catalogApi";

const PAGE_SIZE = 10;

function getStatusMeta(status) {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");

  if (normalized.includes("deliv") || normalized === "completed") {
    return { label: "Delivered", rank: 4, tone: "bg-emerald-100 text-emerald-800" };
  }

  if (normalized.includes("out") || normalized.includes("delivery")) {
    return { label: "Out for Delivery", rank: 3, tone: "bg-sky-100 text-sky-800" };
  }

  if (normalized.includes("ship")) {
    return { label: "Shipped", rank: 2, tone: "bg-violet-100 text-violet-800" };
  }

  if (normalized.includes("fail") || normalized.includes("cancel")) {
    return { label: "Failed", rank: 5, tone: "bg-rose-100 text-rose-800" };
  }

  if (normalized.includes("pend") || normalized.includes("process") || normalized.includes("confirm")) {
    return { label: "Placed", rank: 1, tone: "bg-amber-100 text-amber-800" };
  }

  return { label: "Placed", rank: 1, tone: "bg-amber-100 text-amber-800" };
}

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

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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
      const statusMeta = getStatusMeta(order?.status ?? order?.order_status);
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
        id: order?.id ?? order?.order_id ?? order?.orderNumber ?? `order-${index + 1}`,
        orderNumber: order?.order_number ?? order?.orderNumber ?? order?.id ?? `#${index + 1}`,
        status: order?.status ?? order?.order_status ?? "Placed",
        statusMeta,
        createdAt,
        total: order?.total ?? order?.total_amount ?? order?.amount ?? order?.grand_total ?? null,
        itemSummary: itemSummary || "Products available",
        itemCount: lineItems.length || order?.item_count || order?.items_count || 0,
        images: getOrderImages(order),
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
            {visibleOrders.map((order) => (
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
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.statusMeta.tone}`}>
                          {order.statusMeta.label}
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
              </article>
            ))}

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
    </div>
  );
}
