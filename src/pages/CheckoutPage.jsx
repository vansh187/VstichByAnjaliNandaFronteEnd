import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { createOrder, createRazorpayOrder, getOrders } from "../lib/catalogApi";
import { formatINR } from "../utils/format";
import { generateInvoicePdf } from "../utils/generateInvoicePdf";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FormField from "../components/FormField";
import { inputClass } from "../utils/inputClass";
import { CheckCircleIcon } from "../components/Icons";

const emptyShipping = {
  shipping_recipient_name: "",
  shipping_address_line1: "",
  shipping_address_line2: "",
  shipping_city: "",
  shipping_state: "",
  shipping_postal_code: "",
  shipping_country: "India",
  shipping_phone_number: "",
};

function validate(fields) {
  const errors = {};
  if (!fields.shipping_recipient_name.trim()) errors.shipping_recipient_name = "Required.";
  if (!fields.shipping_address_line1.trim()) errors.shipping_address_line1 = "Required.";
  if (!fields.shipping_city.trim()) errors.shipping_city = "Required.";
  if (!fields.shipping_state.trim()) errors.shipping_state = "Required.";
  if (!fields.shipping_postal_code.trim()) errors.shipping_postal_code = "Required.";
  if (!fields.shipping_country.trim()) errors.shipping_country = "Required.";
  if (fields.shipping_phone_number.trim().length < 7) {
    errors.shipping_phone_number = "Enter a valid phone number.";
  }
  return errors;
}

// The webhook (server-to-server) is the real source of truth for payment
// status, so after Razorpay's own success callback fires we poll our own
// backend until it reflects that - see docs/api-payments-razorpay.md.
function normalizeOrderStatus(raw) {
  const status = String(raw ?? "").toLowerCase();
  if (status.includes("fail")) return "failed";
  if (status.includes("pend")) return "pending";
  return "placed";
}

function findOrderById(payload, orderId) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.orders)
      ? payload.orders
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.results)
          ? payload.results
          : [];

  return list.find((candidate) => {
    const id = candidate?.vstitch_order_id ?? candidate?.id ?? candidate?.order_id;
    return String(id) === String(orderId);
  });
}

async function pollPaymentStatus(orderId, token, { intervalMs = 1500, timeoutMs = 20000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const payload = await getOrders(token);
      const match = findOrderById(payload, orderId);
      if (match) {
        const status = normalizeOrderStatus(match.order_status ?? match.status);
        if (status !== "pending") return status;
      }
    } catch {
      // Transient network hiccup while polling - keep trying until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return "timeout";
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState(emptyShipping);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const update = (field) => (e) => setFields((f) => ({ ...f, [field]: e.target.value }));

  const buildOrderPayload = () => ({
    ...fields,
    shipping_address_line2: fields.shipping_address_line2.trim() || undefined,
    items: items.map((item) => ({
      vstitch_product_variant_id: item.id,
      quantity: item.qty,
    })),
  });

  const cartItemsToInvoiceItems = () =>
    items.map((item) => ({
      vstitch_product_variant_id: item.id,
      product_name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.qty,
      line_total: item.price * item.qty,
    }));

  const handleOrderError = (err) => {
    if (err.status === 401) {
      logout();
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    setFormError(err.message || "Something went wrong. Please try again.");
    if (err.fieldErrors) setFieldErrors(err.fieldErrors);
  };

  const finalizeOrder = (orderData) => {
    const orderWithShipping = { ...orderData, shipping: fields };
    setOrder(orderWithShipping);
    clearCart();
    // Best-effort bill download - generateInvoicePdf never throws, it
    // swallows and logs its own errors so a PDF issue can't break checkout.
    generateInvoicePdf(orderWithShipping);
  };

  const handleCodOrder = async () => {
    setLoading(true);
    try {
      const result = await createOrder(buildOrderPayload(), token);
      finalizeOrder(result);
    } catch (err) {
      handleOrderError(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmOnlinePayment = async (orderId) => {
    setConfirming(true);
    try {
      const status = await pollPaymentStatus(orderId, token);
      if (status === "placed") {
        finalizeOrder({
          vstitch_order_id: orderId,
          order_status: "placed",
          payment_method: "razorpay",
          items: cartItemsToInvoiceItems(),
          total_amount: subtotal,
        });
      } else if (status === "failed") {
        setFormError(
          "Payment failed. Your stock has been released, so it's safe to try again.",
        );
      } else {
        setFormError(
          "We're still confirming your payment with Razorpay. Please check My Orders in a minute before retrying.",
        );
      }
    } finally {
      setConfirming(false);
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (typeof window === "undefined" || typeof window.Razorpay !== "function") {
      setFormError(
        "Online payment couldn't load. Please check your connection, refresh, and try again, or choose Cash on Delivery.",
      );
      return;
    }

    setLoading(true);
    try {
      const payment = await createRazorpayOrder(buildOrderPayload(), token);

      const options = {
        key: payment.razorpay_key_id,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.razorpay_order_id,
        name: "VStitch by Anjali Nanda",
        description: `Order #${payment.vstitch_order_id}`,
        prefill: {
          name: fields.shipping_recipient_name,
          contact: fields.shipping_phone_number,
        },
        theme: { color: "#1a1a1a" },
        handler: () => {
          confirmOnlinePayment(payment.vstitch_order_id);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setFormError("Payment was not completed. You can retry payment or choose Cash on Delivery.");
          },
        },
      };

      const razorpayCheckout = new window.Razorpay(options);
      razorpayCheckout.on("payment.failed", () => {
        setLoading(false);
        setFormError("Payment failed. Please try again or choose Cash on Delivery.");
      });
      razorpayCheckout.open();
    } catch (err) {
      setLoading(false);
      handleOrderError(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(fields);
    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) return;

    if (paymentMethod === "online") {
      await handleOnlinePayment();
    } else {
      await handleCodOrder();
    }
  };

  return (
    <div>
      <AnnouncementBar />
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        {order ? (
          <OrderConfirmation order={order} />
        ) : confirming ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
            <h1 className="font-display text-2xl text-ink">Confirming your payment…</h1>
            <p className="max-w-sm text-sm text-charcoal/70">
              Please don&apos;t close or refresh this page. This usually takes just a few seconds.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <h1 className="font-display text-3xl text-ink">Your bag is empty</h1>
            <p className="text-charcoal/70">Add something beautiful before you check out.</p>
            <Link
              to="/"
              className="mt-2 border border-ink px-8 py-3 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h1 className="font-display text-3xl text-ink sm:text-4xl">Checkout</h1>
              <p className="mt-2 text-sm text-charcoal/70">
                {paymentMethod === "online"
                  ? "Pay securely online via Razorpay — cards, UPI and netbanking supported."
                  : "Cash on delivery — pay when your order arrives."}
              </p>

              {formError && (
                <p className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
                <FormField label="Recipient Name" error={fieldErrors.shipping_recipient_name}>
                  <input
                    type="text"
                    value={fields.shipping_recipient_name}
                    onChange={update("shipping_recipient_name")}
                    className={inputClass(fieldErrors.shipping_recipient_name)}
                  />
                </FormField>

                <FormField label="Address Line 1" error={fieldErrors.shipping_address_line1}>
                  <input
                    type="text"
                    value={fields.shipping_address_line1}
                    onChange={update("shipping_address_line1")}
                    className={inputClass(fieldErrors.shipping_address_line1)}
                  />
                </FormField>

                <FormField
                  label="Address Line 2 (optional)"
                  error={fieldErrors.shipping_address_line2}
                >
                  <input
                    type="text"
                    value={fields.shipping_address_line2}
                    onChange={update("shipping_address_line2")}
                    className={inputClass(fieldErrors.shipping_address_line2)}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="City" error={fieldErrors.shipping_city}>
                    <input
                      type="text"
                      value={fields.shipping_city}
                      onChange={update("shipping_city")}
                      className={inputClass(fieldErrors.shipping_city)}
                    />
                  </FormField>
                  <FormField label="State" error={fieldErrors.shipping_state}>
                    <input
                      type="text"
                      value={fields.shipping_state}
                      onChange={update("shipping_state")}
                      className={inputClass(fieldErrors.shipping_state)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Postal Code" error={fieldErrors.shipping_postal_code}>
                    <input
                      type="text"
                      value={fields.shipping_postal_code}
                      onChange={update("shipping_postal_code")}
                      className={inputClass(fieldErrors.shipping_postal_code)}
                    />
                  </FormField>
                  <FormField label="Country" error={fieldErrors.shipping_country}>
                    <input
                      type="text"
                      value={fields.shipping_country}
                      onChange={update("shipping_country")}
                      className={inputClass(fieldErrors.shipping_country)}
                    />
                  </FormField>
                </div>

                <FormField label="Phone Number" error={fieldErrors.shipping_phone_number}>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={fields.shipping_phone_number}
                    onChange={update("shipping_phone_number")}
                    className={inputClass(fieldErrors.shipping_phone_number)}
                  />
                </FormField>

                <fieldset className="mt-2 flex flex-col gap-3">
                  <legend className="text-sm font-medium text-ink">Payment Method</legend>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label
                      className={`flex flex-1 cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors ${
                        paymentMethod === "cod"
                          ? "border-ink bg-sand/40"
                          : "border-sand-dark text-charcoal/70"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-ink"
                      />
                      Cash on Delivery
                    </label>
                    <label
                      className={`flex flex-1 cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors ${
                        paymentMethod === "online"
                          ? "border-ink bg-sand/40"
                          : "border-sand-dark text-charcoal/70"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={() => setPaymentMethod("online")}
                        className="accent-ink"
                      />
                      Pay Online (Card / UPI / Netbanking)
                    </label>
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-ink py-3.5 text-sm font-medium tracking-[0.16em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? paymentMethod === "online"
                      ? "Redirecting to Payment…"
                      : "Placing Order…"
                    : paymentMethod === "online"
                      ? `Proceed to Pay · ${formatINR(subtotal)}`
                      : `Place Order · ${formatINR(subtotal)}`}
                </button>
              </form>
            </div>

            <div className="h-fit border border-sand-dark bg-sand/40 p-6">
              <h2 className="font-display text-xl text-ink">Order Summary</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 text-sm">
                    <div>
                      <p className="text-ink">{item.name}</p>
                      <p className="text-xs uppercase tracking-wide text-charcoal/60">
                        {[item.size && `Size ${item.size}`, item.color, `Qty ${item.qty}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span className="shrink-0 font-medium text-ink">
                      {formatINR(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between border-t border-sand-dark pt-4 font-display text-lg text-ink">
                <span>Total</span>
                <span>{formatINR(subtotal)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function OrderConfirmation({ order }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateInvoicePdf(order);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16 text-center">
      <CheckCircleIcon width="40" height="40" className="text-gold" />
      <h1 className="font-display text-3xl text-ink">Order Placed</h1>
      <p className="text-charcoal/70">
        {order.message || "Your bill has been downloaded automatically for your records."}
      </p>
      <div className="mt-4 w-full border border-sand-dark bg-sand/40 p-6 text-left">
        <div className="flex justify-between text-sm text-charcoal/70">
          <span>Order ID</span>
          <span className="text-ink">#{order.vstitch_order_id}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-charcoal/70">
          <span>Status</span>
          <span className="text-ink uppercase">{order.order_status}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-charcoal/70">
          <span>Payment</span>
          <span className="text-ink uppercase">{order.payment_method}</span>
        </div>
        <ul className="mt-5 flex flex-col gap-3 border-t border-sand-dark pt-4">
          {order.items.map((item) => (
            <li key={item.vstitch_product_variant_id} className="flex justify-between text-sm">
              <span className="text-ink">
                {item.product_name}
                <span className="text-charcoal/60"> ({item.size}/{item.color}) × {item.quantity}</span>
              </span>
              <span className="text-ink">{formatINR(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-sand-dark pt-4 font-display text-lg text-ink">
          <span>Total</span>
          <span>{formatINR(order.total_amount)}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="border border-ink px-8 py-3 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? "Preparing Bill…" : "Download Bill (PDF)"}
        </button>
        <Link
          to="/"
          className="border border-ink px-8 py-3 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
