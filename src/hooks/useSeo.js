import { useEffect } from "react";
import { FRONTEND_BASE_URL } from "../lib/apiConfig";

const DEFAULT_IMAGE = `${FRONTEND_BASE_URL}/static/brand/logo.jpg`;

// Sets an attribute-selected <meta>, creating it if the page (index.html)
// doesn't already have one. Returns a restore callback so the caller can
// put things back exactly as found when the owning page unmounts - this is
// what lets two pages navigated between in sequence never leak each
// other's tags.
function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  const created = !el;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  const previous = el.getAttribute("content");
  el.setAttribute("content", content);
  return () => {
    if (created) el.remove();
    else if (previous === null) el.removeAttribute("content");
    else el.setAttribute("content", previous);
  };
}

function upsertCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  const created = !el;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  const previous = el.getAttribute("href");
  el.setAttribute("href", href);
  return () => {
    if (created) el.remove();
    else if (previous === null) el.removeAttribute("href");
    else el.setAttribute("href", previous);
  };
}

// Sets document title, meta description, canonical link, OG/Twitter tags,
// and optional JSON-LD structured data for as long as the calling page is
// mounted, restoring whatever was there before on unmount. `path` is the
// route path (e.g. "/product/66") used to build the canonical/og:url - omit
// it on pages that shouldn't be indexed under a canonical URL (auth, cart).
// `jsonLd` accepts one schema.org object or an array of them.
export function useSeo({ title, description, path, image, jsonLd }) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;

    const restores = [];
    if (description) restores.push(upsertMeta("name", "description", description));

    const url = path ? `${FRONTEND_BASE_URL}${path}` : undefined;
    if (url) {
      restores.push(upsertCanonical(url));
      restores.push(upsertMeta("property", "og:url", url));
    }
    if (title) {
      restores.push(upsertMeta("property", "og:title", title));
      restores.push(upsertMeta("name", "twitter:title", title));
    }
    if (description) {
      restores.push(upsertMeta("property", "og:description", description));
      restores.push(upsertMeta("name", "twitter:description", description));
    }
    const ogImage = image || DEFAULT_IMAGE;
    restores.push(upsertMeta("property", "og:image", ogImage));
    restores.push(upsertMeta("name", "twitter:image", ogImage));

    const scripts = (jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []).map((data) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      document.title = previousTitle;
      restores.forEach((restore) => restore());
      scripts.forEach((script) => script.remove());
    };
    // jsonLd is an object/array literal built fresh every render by callers;
    // comparing its serialized form (not identity) avoids tearing the tags
    // down and rebuilding them every render when the actual content hasn't
    // changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, JSON.stringify(jsonLd)]);
}
