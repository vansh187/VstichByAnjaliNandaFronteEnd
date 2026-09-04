import { useCallback, useEffect, useMemo, useState } from "react";
import { WishlistContext } from "./wishlistContextObject";

const STORAGE_KEY = "vstitch_wishlist_collections";
const DEFAULT_COLLECTION_ID = "default-wishlist";
const DEFAULT_COLLECTION_NAME = "Wishlist";

function createDefaultCollection() {
  return {
    id: DEFAULT_COLLECTION_ID,
    name: DEFAULT_COLLECTION_NAME,
    createdAt: new Date().toISOString(),
    items: [],
  };
}

function normalizeProduct(product) {
  if (!product) return null;
  const id = product.vstitch_product_id ?? product.productId ?? product.id;
  if (!id) return null;

  return {
    id: String(id),
    productId: Number(id),
    name: product.product_name ?? product.name ?? "Untitled Product",
    categoryName: product.category_name ?? product.categoryName ?? "",
    categoryId: product.category_id ?? product.categoryId ?? null,
    image: product.primary_image_url ?? product.image ?? null,
    price: product.min_price ?? product.price ?? null,
    priceLabel: product.priceLabel ?? null,
    inStock: product.in_stock ?? product.inStock ?? true,
    savedAt: new Date().toISOString(),
  };
}

function sanitizeCollections(value) {
  if (!Array.isArray(value)) return [createDefaultCollection()];

  const seen = new Set();
  const collections = value
    .map((collection) => {
      const id = collection?.id ? String(collection.id) : "";
      const name = typeof collection?.name === "string" ? collection.name.trim() : "";
      if (!id || !name || seen.has(id)) return null;
      seen.add(id);

      const productSeen = new Set();
      const items = Array.isArray(collection.items)
        ? collection.items
            .map(normalizeProduct)
            .filter(Boolean)
            .filter((item) => {
              if (productSeen.has(item.id)) return false;
              productSeen.add(item.id);
              return true;
            })
        : [];

      return {
        id,
        name,
        createdAt: collection.createdAt || new Date().toISOString(),
        items,
      };
    })
    .filter(Boolean);

  if (!collections.some((collection) => collection.id === DEFAULT_COLLECTION_ID)) {
    collections.unshift(createDefaultCollection());
  }

  return collections.length > 0 ? collections : [createDefaultCollection()];
}

function readStoredCollections() {
  if (typeof window === "undefined") return [createDefaultCollection()];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeCollections(JSON.parse(raw)) : [createDefaultCollection()];
  } catch {
    return [createDefaultCollection()];
  }
}

function getInitialStorageError() {
  if (typeof window === "undefined") return null;
  try {
    const testKey = `${STORAGE_KEY}_test`;
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return null;
  } catch {
    return "Wishlist changes are saved for this session, but browser storage is unavailable.";
  }
}

function namesMatch(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function WishlistProvider({ children }) {
  const [collections, setCollections] = useState(readStoredCollections);
  const [storageError] = useState(getInitialStorageError);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch {
      // Keep the in-memory wishlist usable even when browser storage rejects writes.
    }
  }, [collections]);

  const createCollection = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { ok: false, error: "Collection name is required." };
    }
    if (trimmed.length > 40) {
      return { ok: false, error: "Collection name must be 40 characters or less." };
    }
    if (collections.some((collection) => namesMatch(collection.name, trimmed))) {
      return { ok: false, error: "A collection with this name already exists." };
    }

    const nextCollection = {
      id: `collection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      createdAt: new Date().toISOString(),
      items: [],
    };
    setCollections((prev) => [...prev, nextCollection]);
    return { ok: true, collection: nextCollection };
  }, [collections]);

  const renameCollection = useCallback((collectionId, name) => {
    const trimmed = name.trim();
    if (collectionId === DEFAULT_COLLECTION_ID) {
      return { ok: false, error: "The default wishlist cannot be renamed." };
    }
    if (!trimmed) {
      return { ok: false, error: "Collection name is required." };
    }
    if (trimmed.length > 40) {
      return { ok: false, error: "Collection name must be 40 characters or less." };
    }

    if (collections.some((collection) => collection.id !== collectionId && namesMatch(collection.name, trimmed))) {
      return { ok: false, error: "A collection with this name already exists." };
    }
    if (!collections.some((collection) => collection.id === collectionId)) {
      return { ok: false, error: "Collection not found." };
    }
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId ? { ...collection, name: trimmed } : collection,
      ),
    );
    return { ok: true };
  }, [collections]);

  const deleteCollection = useCallback((collectionId) => {
    if (collectionId === DEFAULT_COLLECTION_ID) {
      return { ok: false, error: "The default wishlist cannot be deleted." };
    }
    if (!collections.some((collection) => collection.id === collectionId)) {
      return { ok: false, error: "Collection not found." };
    }
    setCollections((prev) => prev.filter((collection) => collection.id !== collectionId));
    return { ok: true };
  }, [collections]);

  const addProductToCollection = useCallback((collectionId, product) => {
    const normalized = normalizeProduct(product);
    if (!normalized) {
      return { ok: false, error: "Product could not be saved." };
    }

    if (!collections.some((collection) => collection.id === collectionId)) {
      return { ok: false, error: "Collection not found." };
    }

    setCollections((prev) =>
      prev.map((collection) => {
        if (collection.id !== collectionId) return collection;
        const exists = collection.items.some((item) => item.id === normalized.id);
        if (exists) {
          return {
            ...collection,
            items: collection.items.map((item) =>
              item.id === normalized.id ? { ...item, ...normalized, savedAt: item.savedAt } : item,
            ),
          };
        }
        return { ...collection, items: [normalized, ...collection.items] };
      }),
    );
    return { ok: true };
  }, [collections]);

  const removeProductFromCollection = useCallback((collectionId, productId) => {
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? { ...collection, items: collection.items.filter((item) => item.id !== String(productId)) }
          : collection,
      ),
    );
  }, []);

  const removeProductEverywhere = useCallback((productId) => {
    setCollections((prev) =>
      prev.map((collection) => ({
        ...collection,
        items: collection.items.filter((item) => item.id !== String(productId)),
      })),
    );
  }, []);

  const isProductSaved = useCallback(
    (productId) =>
      collections.some((collection) =>
        collection.items.some((item) => item.id === String(productId)),
      ),
    [collections],
  );

  const getCollectionsForProduct = useCallback(
    (productId) =>
      collections.filter((collection) =>
        collection.items.some((item) => item.id === String(productId)),
      ),
    [collections],
  );

  const totalSaved = useMemo(() => {
    const ids = new Set();
    collections.forEach((collection) => {
      collection.items.forEach((item) => ids.add(item.id));
    });
    return ids.size;
  }, [collections]);

  const value = useMemo(
    () => ({
      collections,
      defaultCollectionId: DEFAULT_COLLECTION_ID,
      storageError,
      totalSaved,
      createCollection,
      renameCollection,
      deleteCollection,
      addProductToCollection,
      removeProductFromCollection,
      removeProductEverywhere,
      isProductSaved,
      getCollectionsForProduct,
    }),
    [
      collections,
      storageError,
      totalSaved,
      createCollection,
      renameCollection,
      deleteCollection,
      addProductToCollection,
      removeProductFromCollection,
      removeProductEverywhere,
      isProductSaved,
      getCollectionsForProduct,
    ],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
