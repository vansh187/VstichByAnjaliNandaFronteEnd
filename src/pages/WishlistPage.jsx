import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StateNotice from "../components/StateNotice";
import { CheckCircleIcon, ChevronRightIcon, FolderIcon, PlusIcon, TrashIcon } from "../components/Icons";
import { useWishlist } from "../hooks/useWishlist";
import { useSeo } from "../hooks/useSeo";
import { formatINR } from "../utils/format";

function WishlistProduct({ product, collectionId, onRemove }) {
  const [imgError, setImgError] = useState(false);
  const price = product.priceLabel || (product.price ? formatINR(product.price) : "");

  return (
    <article className="grid grid-cols-[88px_1fr] gap-4 border-b border-sand-dark/70 py-4 last:border-b-0">
      <Link to={`/product/${product.productId}`} className="block h-28 overflow-hidden bg-sand">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-lg text-charcoal/50">
            VN
          </div>
        )}
      </Link>
      <div className="min-w-0">
        <p className="text-[10px] font-medium tracking-[0.16em] text-charcoal/60 uppercase">
          {product.categoryName || "VStitch"}
        </p>
        <Link to={`/product/${product.productId}`}>
          <h3 className="mt-1 font-display text-lg leading-tight text-ink hover:text-gold">
            {product.name}
          </h3>
        </Link>
        {price && <p className="mt-1 text-sm font-medium text-ink">{price}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/product/${product.productId}`}
            className="border border-ink px-4 py-2 text-xs font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
          >
            View Product
          </Link>
          <button
            type="button"
            onClick={() => onRemove(collectionId, product.id)}
            className="flex items-center gap-1.5 border border-sand-dark px-3 py-2 text-xs font-medium tracking-[0.12em] text-charcoal uppercase transition-colors hover:border-rose hover:text-rose"
          >
            <TrashIcon width="14" height="14" />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const {
    collections,
    defaultCollectionId,
    storageError,
    totalSaved,
    createCollection,
    renameCollection,
    deleteCollection,
    removeProductFromCollection,
  } = useWishlist();
  const [activeId, setActiveId] = useState(collections[0]?.id ?? defaultCollectionId);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const activeCollection = useMemo(
    () => collections.find((collection) => collection.id === activeId) ?? collections[0],
    [activeId, collections],
  );

  useSeo({
    title: "Wishlist | VStitch by Anjali Nanda",
    description: "Create named wishlists and save your favourite VStitch pieces for later.",
    path: "/wishlist",
  });

  const showResult = (result, successMessage) => {
    if (!result.ok) {
      setNotice(null);
      setError(result.error);
      return false;
    }
    setError(null);
    setNotice(successMessage);
    return true;
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const result = createCollection(newName);
    if (showResult(result, `${result.collection?.name ?? "Collection"} created.`)) {
      setNewName("");
      setActiveId(result.collection.id);
    }
  };

  const startRename = (collection) => {
    setEditingId(collection.id);
    setEditingName(collection.name);
    setError(null);
    setNotice(null);
  };

  const handleRename = (e) => {
    e.preventDefault();
    const result = renameCollection(editingId, editingName);
    if (showResult(result, "Collection renamed.")) {
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleDelete = (collectionId) => {
    const collection = collections.find((item) => item.id === collectionId);
    if (!collection) return;
    if (collection.items.length > 0) {
      const confirmed = window.confirm(`Delete "${collection.name}" and remove ${collection.items.length} saved item(s)?`);
      if (!confirmed) return;
    }
    const result = deleteCollection(collectionId);
    if (showResult(result, "Collection deleted.")) {
      setActiveId(defaultCollectionId);
    }
  };

  const handleRemove = (collectionId, productId) => {
    removeProductFromCollection(collectionId, productId);
    setError(null);
    setNotice("Item removed from collection.");
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8">
          <nav className="flex items-center gap-1.5 text-xs tracking-widest text-charcoal/60 uppercase">
            <Link to="/" className="link-underline">
              Home
            </Link>
            <ChevronRightIcon width="12" height="12" />
            <span className="text-charcoal">Wishlist</span>
          </nav>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] tracking-[0.24em] text-charcoal/60 uppercase">
                Saved Pieces
              </p>
              <h1 className="mt-1 font-display text-4xl text-ink sm:text-5xl">
                My Wishlist
              </h1>
            </div>
            <p className="text-sm text-charcoal/70">
              {totalSaved} {totalSaved === 1 ? "unique item" : "unique items"} saved
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 pb-16 sm:px-8 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit border border-sand-dark bg-sand/30">
            <div className="border-b border-sand-dark px-5 py-4">
              <h2 className="font-display text-xl text-ink">Collections</h2>
            </div>
            <div className="p-3">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => setActiveId(collection.id)}
                  className={`mb-2 flex w-full items-center justify-between gap-3 border px-3 py-3 text-left transition-colors last:mb-0 ${
                    activeCollection?.id === collection.id
                      ? "border-ink bg-cream"
                      : "border-transparent hover:border-sand-dark hover:bg-cream/70"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FolderIcon width="16" height="16" className="shrink-0 text-gold" />
                    <span className="truncate text-sm font-medium text-ink">{collection.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-charcoal/60">{collection.items.length}</span>
                </button>
              ))}
            </div>
            <form onSubmit={handleCreate} className="border-t border-sand-dark p-4">
              <label className="text-xs font-semibold tracking-[0.16em] text-charcoal/60 uppercase">
                New Collection
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={40}
                  placeholder="Occasion edit"
                  className="min-w-0 flex-1 border border-sand-dark bg-cream px-3 py-2 text-sm text-ink placeholder:text-charcoal/40 focus:border-gold focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Create collection"
                  className="flex h-10 w-10 items-center justify-center bg-ink text-cream transition-colors hover:bg-charcoal"
                >
                  <PlusIcon />
                </button>
              </div>
            </form>
          </aside>

          <div>
            {storageError && (
              <p className="mb-4 border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-charcoal">
                {storageError}
              </p>
            )}
            {error && <p className="mb-4 border border-rose/40 px-4 py-3 text-sm text-rose">{error}</p>}
            {notice && (
              <p className="mb-4 flex items-center gap-2 border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
                <CheckCircleIcon width="16" height="16" className="text-gold" />
                {notice}
              </p>
            )}

            {!activeCollection ? (
              <StateNotice
                title="No wishlist collections yet"
                description="Create your first collection to start saving pieces."
              />
            ) : (
              <section className="border border-sand-dark bg-cream">
                <div className="flex flex-col gap-4 border-b border-sand-dark px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  {editingId === activeCollection.id ? (
                    <form onSubmit={handleRename} className="flex w-full gap-2 sm:max-w-md">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        maxLength={40}
                        autoFocus
                        className="min-w-0 flex-1 border border-sand-dark bg-cream px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-ink px-4 py-2 text-xs font-medium tracking-[0.12em] text-cream uppercase"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="border border-sand-dark px-4 py-2 text-xs font-medium tracking-[0.12em] text-ink uppercase"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div>
                      <h2 className="font-display text-2xl text-ink">{activeCollection.name}</h2>
                      <p className="mt-1 text-sm text-charcoal/60">
                        {activeCollection.items.length} {activeCollection.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  )}

                  {editingId !== activeCollection.id && (
                    <div className="flex gap-2">
                      {activeCollection.id !== defaultCollectionId && (
                        <>
                          <button
                            type="button"
                            onClick={() => startRename(activeCollection)}
                            className="border border-sand-dark px-4 py-2 text-xs font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:border-ink"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(activeCollection.id)}
                            className="border border-sand-dark px-4 py-2 text-xs font-medium tracking-[0.12em] text-charcoal uppercase transition-colors hover:border-rose hover:text-rose"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-5 py-3">
                  {activeCollection.items.length > 0 ? (
                    activeCollection.items.map((product) => (
                      <WishlistProduct
                        key={product.id}
                        product={product}
                        collectionId={activeCollection.id}
                        onRemove={handleRemove}
                      />
                    ))
                  ) : (
                    <div className="py-10">
                      <StateNotice
                        title="This collection is empty"
                        description="Save pieces from product cards or product detail pages."
                        actionLabel="Browse Collections"
                        onAction={() => navigate("/collections")}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
