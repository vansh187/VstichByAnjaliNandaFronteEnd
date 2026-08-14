// Shared between generate-sitemap.js and prerender.js so both agree on
// exactly one definition of "which routes are public" - a route added here
// automatically gets a sitemap entry and a prerendered HTML snapshot.
export const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "https://vstichbyanjalinandapythonbackend.onrender.com";
export const FRONTEND_BASE_URL =
  process.env.VITE_FRONTEND_BASE_URL || "https://www.vstitchbyanjalinanda.com";

export const STATIC_PAGES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/summer-luxe", changefreq: "weekly", priority: "0.8" },
  { path: "/collections", changefreq: "weekly", priority: "0.8" },
  { path: "/our-story", changefreq: "monthly", priority: "0.5" },
  { path: "/faqs", changefreq: "monthly", priority: "0.5" },
];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

export function fetchAllCategories() {
  return fetchJson(`${API_BASE_URL}/categories`);
}

export async function fetchAllProducts() {
  const products = [];
  let afterId;
  // The backend has no "fetch everything" mode, only after_id cursor
  // pagination (see useProducts.js), and caps limit at 50 (its FastAPI
  // validator rejects anything higher with a 422).
  const limit = 50;
  for (;;) {
    const query = new URLSearchParams({ limit: String(limit) });
    if (afterId) query.set("after_id", afterId);
    const data = await fetchJson(`${API_BASE_URL}/products?${query}`);
    products.push(...(data.items ?? []));
    if (!data.has_more || !data.next_cursor) break;
    afterId = data.next_cursor;
  }
  return products;
}

// Resolves to every public route that should get a sitemap entry and a
// prerendered snapshot. Fails soft (static routes only) if the API is
// unreachable, same reasoning as generate-sitemap.js - a flaky backend
// shouldn't be able to fail the whole deploy.
export async function fetchAllRoutes() {
  let categories = [];
  let products = [];
  try {
    [categories, products] = await Promise.all([fetchAllCategories(), fetchAllProducts()]);
  } catch (err) {
    console.warn(`[catalog] Skipping catalog routes - couldn't reach the API (${err.message}).`);
  }

  return {
    categories,
    products,
    routes: [
      ...STATIC_PAGES.map((p) => p.path),
      ...categories.map((c) => `/collections/${c.vstitch_category_id}`),
      ...products.map((p) => `/product/${p.vstitch_product_id}`),
    ],
  };
}
