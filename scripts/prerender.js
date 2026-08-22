// Crawls every public route with a headless browser after `vite build` and
// saves the fully-rendered HTML as a static file, so crawlers/scrapers that
// don't execute JS (or execute it unreliably) still see real content -
// title, price, images, JSON-LD - instead of the empty #root shell.
//
// Wired into Vercel's build command (see vercel.json), NOT the local
// "build" npm script, so everyday `npm run build` / `npm run dev` stays
// fast - this only runs on deploy.
import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { fetchAllRoutes } from "./catalog.js";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const PORT = 4173;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

// Mirrors vercel.json's catch-all rewrite: serve the matching static file
// if one exists (including a route's own already-prerendered index.html
// from earlier in this same run), otherwise fall back to the SPA shell -
// the same resolution order a real deployed request gets.
async function serveDist(req, res) {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let filePath = path.join(DIST_DIR, decodeURIComponent(url.pathname));

    let fileStat = await stat(filePath).catch(() => null);
    if (fileStat?.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      fileStat = await stat(filePath).catch(() => null);
    }
    if (!fileStat) {
      filePath = path.join(DIST_DIR, "index.html");
    }

    const body = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(body);
  } catch (err) {
    res.writeHead(500);
    res.end(String(err));
  }
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      serveDist(req, res);
    });
    server.listen(PORT, () => resolve(server));
  });
}

const BASE_ARGS = [
  // Chrome's own sandbox needs kernel privileges (user namespaces) that
  // CI/build containers - Vercel's included - don't grant to an
  // unprivileged process, so the default launch fails outright there even
  // though it works fine on a normal dev machine. This crawler never
  // renders untrusted content (only our own already-built dist/ output for
  // this one automation task, then it's discarded), so running
  // unsandboxed here carries none of the risk that flag normally implies
  // for a real browsing session.
  "--no-sandbox",
  "--disable-setuid-sandbox",
  // The backend's CORS allowlist only permits the real production origin,
  // but this crawl serves the build from a local port (an arbitrary one -
  // localhost in dev, an ephemeral build-container port on Vercel), so
  // product/category fetches would otherwise be blocked. Safe for the
  // same reason as above: this instance only ever talks to our own build
  // output and our own API.
  "--disable-web-security",
  "--disable-features=IsolateOrigins,site-per-process",
];

// Vercel's build image is missing the desktop-Chrome shared-library stack
// (libnspr4.so and friends) that a normal Puppeteer-bundled Chromium needs,
// so that binary fails to even launch there ("error while loading shared
// libraries"). @sparticuz/chromium ships a build made specifically for
// serverless/CI containers like this one - used only when actually running
// on Vercel (it sets VERCEL=1 during builds); a local dev machine has the
// full library set, so it just reuses the `puppeteer` package's own
// downloaded Chrome instead of needing this at all.
async function resolveLaunchOptions() {
  if (process.env.VERCEL) {
    const { default: chromium } = await import("@sparticuz/chromium");
    return {
      headless: true,
      executablePath: await chromium.executablePath(),
      args: [...chromium.args, ...BASE_ARGS],
    };
  }

  const { default: fullPuppeteer } = await import("puppeteer");
  return { headless: true, executablePath: await fullPuppeteer.executablePath(), args: BASE_ARGS };
}

async function snapshotRoute(browser, route) {
  const page = await browser.newPage();
  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "networkidle0",
      timeout: 45000,
    });
    // Small buffer past network-idle for the final React state
    // update/effect (useSeo's title/meta/JSON-LD writes) to commit.
    await new Promise((resolve) => setTimeout(resolve, 300));
    const html = await page.content();

    const outPath = route === "/" ? path.join(DIST_DIR, "index.html") : path.join(DIST_DIR, route, "index.html");
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, `<!doctype html>\n${html}`, "utf8");
    return true;
  } catch (err) {
    console.warn(`[prerender] Skipped ${route}: ${err.message}`);
    return false;
  } finally {
    await page.close();
  }
}

async function run() {
  const distExists = await stat(DIST_DIR).catch(() => null);
  if (!distExists) throw new Error('dist/ not found - run "vite build" before prerendering.');

  const { routes } = await fetchAllRoutes();
  // Home last: dist/index.html is also what the SPA-fallback serves for
  // every route we DON'T prerender (login, cart, orders, checkout, ...),
  // so those need to crawl/serve against the original blank shell, not an
  // already-overwritten home snapshot.
  const orderedRoutes = [...routes.filter((r) => r !== "/"), "/"];

  const server = await startServer();
  const browser = await puppeteer.launch(await resolveLaunchOptions());

  let succeeded = 0;
  try {
    for (const route of orderedRoutes) {
      const ok = await snapshotRoute(browser, route);
      if (ok) succeeded += 1;
      console.log(`[prerender] ${ok ? "✓" : "✗"} ${route}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`[prerender] Snapshotted ${succeeded}/${orderedRoutes.length} routes.`);
}

// Prerendering is an enhancement on top of an already-functional CSR app,
// not a requirement for it to work - never fail the deploy over it. Any
// error here (including a totally broken run) just ships the plain CSR
// build for this deploy instead, same as before prerendering existed.
run().catch((err) => {
  console.warn(`[prerender] Skipping prerender entirely - ${err.message}`);
  process.exit(0);
});
