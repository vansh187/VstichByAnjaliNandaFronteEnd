import { get, post } from "./http";

// Categories change rarely and are used across several pages (nav tiles,
// collection headers) — cache the in-flight/resolved promise so we only
// ever hit the network once per session instead of once per consumer.
let categoriesPromise = null;

export function getCategories({ force = false } = {}) {
  if (force || !categoriesPromise) {
    categoriesPromise = get("/categories").catch((err) => {
      categoriesPromise = null; // allow retry on next call
      throw err;
    });
  }
  return categoriesPromise;
}

export function getProducts({ categoryId, search, inStockOnly, afterId, limit = 20 } = {}) {
  return get("/products", {
    category_id: categoryId,
    search,
    in_stock_only: inStockOnly ? "true" : undefined,
    after_id: afterId,
    limit,
  });
}

// Full product detail (variants/images) is fetched per-card on demand;
// cache by id so re-selecting a color or revisiting a card doesn't refetch.
const productDetailCache = new Map();

export function getProductDetail(productId, { force = false } = {}) {
  if (force || !productDetailCache.has(productId)) {
    const promise = get(`/products/${productId}`).catch((err) => {
      productDetailCache.delete(productId);
      throw err;
    });
    productDetailCache.set(productId, promise);
  }
  return productDetailCache.get(productId);
}

export function getBestSellers({ limit = 10 } = {}) {
  return get("/best-sellers", { limit });
}

export function createOrder(payload, token) {
  return post("/orders", payload, token);
}

export function createRazorpayOrder(payload, token) {
  return post("/payments/orders", payload, token);
}

export function getOrders(token) {
  return get("/orders", undefined, token);
}

export function getOrderTracking(orderId, token) {
  return get(`/orders/${orderId}/tracking`, undefined, token);
}

export function returnOrder(orderId, payload, token) {
  return post(`/orders/${orderId}/return`, payload, token);
}

export function replaceOrder(orderId, payload, token) {
  return post(`/orders/${orderId}/replace`, payload, token);
}

// Auth is optional here (the product page itself doesn't require login) -
// http.js only attaches an Authorization header when a token is actually
// passed, so calling this with token=undefined submits anonymously per the
// backend spec.
export function submitCustomizationRequest(productId, variantId, payload, token) {
  return post(`/products/${productId}/variants/${variantId}/customization-requests`, payload, token);
}

// No auth - reachable by any visitor, logged in or not (see
// customization-interest-email-backend-integration.md).
export function submitCustomizationInterest(payload) {
  return post("/customization-interest", payload);
}

// No auth - a guest cart can preview/apply a coupon before login (see
// coupons-frontend-integration.md). Only coupons already usable at
// `orderAmount` are returned, so this needs re-calling whenever the cart
// subtotal changes.
export function getCoupons(orderAmount) {
  return get("/coupons", { order_amount: orderAmount });
}

export function applyCoupon(payload, token) {
  return post("/coupons/apply", payload, token);
}
