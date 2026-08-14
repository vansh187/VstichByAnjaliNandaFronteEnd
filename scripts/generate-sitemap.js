// Runs before every build (see "prebuild" in package.json) so sitemap.xml
// is regenerated from the live catalog on each deploy, rather than going
// stale the moment a product is added or removed. There's no server here
// to generate it on-demand per request - this is the freshest we can get
// on a static Vite/Vercel frontend without standing up a serverless
// function, and it's cheap since deploys already happen on every change.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { FRONTEND_BASE_URL, STATIC_PAGES, fetchAllRoutes } from "./catalog.js";

function urlEntry(loc, { changefreq, priority } = {}) {
  const lines = [`  <url>`, `    <loc>${loc}</loc>`];
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) lines.push(`    <priority>${priority}</priority>`);
  lines.push(`  </url>`);
  return lines.join("\n");
}

async function main() {
  const { categories, products } = await fetchAllRoutes();

  const entries = [
    ...STATIC_PAGES.map((p) => urlEntry(`${FRONTEND_BASE_URL}${p.path}`, p)),
    ...categories.map((c) =>
      urlEntry(`${FRONTEND_BASE_URL}/collections/${c.vstitch_category_id}`, {
        changefreq: "weekly",
        priority: "0.7",
      }),
    ),
    ...products.map((p) =>
      urlEntry(`${FRONTEND_BASE_URL}/product/${p.vstitch_product_id}`, {
        changefreq: "weekly",
        priority: "0.7",
      }),
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

  const outDir = path.resolve(process.cwd(), "public");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "sitemap.xml"), xml, "utf8");
  console.log(
    `[sitemap] Wrote ${entries.length} URLs (${categories.length} collections, ${products.length} products) to public/sitemap.xml`,
  );
}

main();
