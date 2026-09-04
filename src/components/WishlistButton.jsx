import { useState } from "react";
import { createPortal } from "react-dom";
import { useWishlist } from "../hooks/useWishlist";
import { HeartIcon } from "./Icons";
import WishlistModal from "./WishlistModal";

export default function WishlistButton({ product, className = "", label = "Save" }) {
  const [open, setOpen] = useState(false);
  const { isProductSaved, removeProductEverywhere } = useWishlist();
  const productId = product?.vstitch_product_id ?? product?.productId ?? product?.id;
  const saved = productId ? isProductSaved(productId) : false;

  if (!productId) return null;

  return (
    <>
      <button
        type="button"
        aria-label={saved ? "Saved to wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (saved) {
            removeProductEverywhere(productId);
            setOpen(false);
            return;
          }
          setOpen(true);
        }}
        className={className}
      >
        <HeartIcon filled={saved} width="18" height="18" />
        {label && <span>{saved ? "Saved" : label}</span>}
      </button>
      {open &&
        createPortal(
          <WishlistModal product={product} onClose={() => setOpen(false)} />,
          document.body,
        )}
    </>
  );
}
