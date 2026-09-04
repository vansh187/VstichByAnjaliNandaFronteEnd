import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import ModalShell from "./ModalShell";
import { CheckCircleIcon, FolderIcon, PlusIcon, TrashIcon } from "./Icons";

export default function WishlistModal({ product, onClose }) {
  const {
    collections,
    createCollection,
    deleteCollection,
    addProductToCollection,
    removeProductFromCollection,
    getCollectionsForProduct,
    defaultCollectionId,
    storageError,
  } = useWishlist();
  const [newName, setNewName] = useState("");
  const [selectedId, setSelectedId] = useState(collections[0]?.id ?? "");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const productId = product.id ?? product.vstitch_product_id ?? product.productId;

  const savedCollectionIds = useMemo(
    () => new Set(getCollectionsForProduct(productId).map((c) => c.id)),
    [getCollectionsForProduct, productId],
  );

  const handleCreate = (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const result = createCollection(newName);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNewName("");
    setSelectedId(result.collection.id);
    const addResult = addProductToCollection(result.collection.id, product);
    if (!addResult.ok) {
      setError(addResult.error);
      return;
    }
    setMessage(`Saved to ${result.collection.name}.`);
  };

  const handleSave = () => {
    setError(null);
    setMessage(null);
    if (!selectedId) {
      setError("Choose a collection first.");
      return;
    }
    const collection = collections.find((item) => item.id === selectedId);
    const result = addProductToCollection(selectedId, product);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`Saved to ${collection?.name ?? "collection"}.`);
  };

  const handleToggleCollection = (collection) => {
    setSelectedId(collection.id);
    setError(null);

    if (savedCollectionIds.has(collection.id)) {
      removeProductFromCollection(collection.id, productId);
      setMessage(`Removed from ${collection.name}.`);
      return;
    }

    const result = addProductToCollection(collection.id, product);
    if (!result.ok) {
      setMessage(null);
      setError(result.error);
      return;
    }
    setMessage(`Saved to ${collection.name}.`);
  };

  const handleDeleteCollection = (collection) => {
    const result = deleteCollection(collection.id);
    if (!result.ok) {
      setMessage(null);
      setError(result.error);
      return;
    }
    setSelectedId(collections.find((item) => item.id !== collection.id)?.id ?? defaultCollectionId);
    setError(null);
    setMessage(`${collection.name} deleted.`);
  };

  return (
    <ModalShell
      title="Save to Wishlist"
      onClose={onClose}
      panelClassName="max-w-[92vw] sm:max-w-lg"
      contentClassName="px-4 py-4 sm:px-5 sm:py-5"
    >
      <div className="space-y-3.5">
        <div className="border border-sand-dark bg-sand/25 p-2">
          <div className="grid grid-cols-[56px_1fr] gap-3">
          {product.image || product.primary_image_url ? (
            <img
              src={product.image ?? product.primary_image_url}
              alt={product.name ?? product.product_name}
              className="h-16 w-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-full items-center justify-center bg-cream font-display text-sm text-charcoal/50">
              VN
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-[0.16em] text-charcoal/60 uppercase">
              {product.categoryName ?? product.category_name ?? "VStitch"}
            </p>
            <h3 className="mt-1 line-clamp-2 font-display text-lg leading-tight text-ink">
              {product.name ?? product.product_name}
            </h3>
          </div>
          </div>
        </div>

        {storageError && (
          <p className="border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-charcoal">
            {storageError}
          </p>
        )}

        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-charcoal/60 uppercase">
            Select Collection
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {collections.map((collection) => (
              <label
                key={collection.id}
                onClick={() => handleToggleCollection(collection)}
                className={`group relative cursor-pointer border p-3 transition-colors ${
                  savedCollectionIds.has(collection.id)
                    ? "border-ink bg-ink text-cream"
                    : "border-sand-dark bg-cream hover:border-gold"
                }`}
              >
                <span className="flex items-start justify-between gap-2 pr-6">
                  <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="radio"
                    name="wishlist-collection"
                    value={collection.id}
                    checked={savedCollectionIds.has(collection.id)}
                    onChange={() => {}}
                    className="pointer-events-none mt-1 shrink-0 accent-gold"
                  />
                    <FolderIcon width="17" height="17" className="mt-0.5 shrink-0 text-gold" />
                    <span className="min-w-0">
                      <span className={`block truncate font-display text-lg leading-none ${
                        savedCollectionIds.has(collection.id) ? "text-cream" : "text-ink"
                      }`}>
                        {collection.name}
                      </span>
                      <span className={`mt-2 block text-[10px] font-medium tracking-[0.16em] uppercase ${
                        savedCollectionIds.has(collection.id) ? "text-cream/70" : "text-charcoal/55"
                      }`}>
                        {collection.items.length} {collection.items.length === 1 ? "piece" : "pieces"}
                      </span>
                    </span>
                  </span>
                  {savedCollectionIds.has(collection.id) && (
                    <CheckCircleIcon width="16" height="16" className="shrink-0 text-gold" />
                  )}
                </span>
                {collection.id !== defaultCollectionId && (
                  <button
                    type="button"
                    aria-label={`Delete ${collection.name}`}
                    title="Delete collection"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteCollection(collection);
                    }}
                    className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center transition-colors ${
                      savedCollectionIds.has(collection.id)
                        ? "text-cream/70 hover:text-gold"
                        : "text-charcoal/45 hover:text-rose"
                    }`}
                  >
                    <TrashIcon width="14" height="14" />
                  </button>
                )}
              </label>
            ))}
          </div>
        </div>

        <form onSubmit={handleCreate} className="border border-sand-dark bg-sand/20 p-3">
          <label className="text-[11px] font-semibold tracking-[0.22em] text-charcoal/60 uppercase">
            Create New Collection
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={40}
              placeholder="Festive looks, wedding picks..."
              className="min-w-0 flex-1 border border-sand-dark bg-cream px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 border border-ink px-4 py-2 text-xs font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
            >
              <PlusIcon />
              Create
            </button>
          </div>
        </form>

        {error && <p className="text-sm text-rose">{error}</p>}
        {message && (
          <p className="flex items-center gap-2 border border-gold/40 bg-gold/10 px-3 py-2.5 text-sm font-medium text-ink">
            <CheckCircleIcon width="16" height="16" className="text-gold" />
            {message}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-ink py-2.5 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal"
          >
            Save Here
          </button>
          <Link
            to="/wishlist"
            onClick={onClose}
            className="flex-1 border border-ink py-2.5 text-center text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
          >
            View Wishlist
          </Link>
        </div>
      </div>
    </ModalShell>
  );
}
