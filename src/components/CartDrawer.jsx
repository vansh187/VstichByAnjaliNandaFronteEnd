import { useCart } from "../hooks/useCart";
import { useOverlay } from "../hooks/useOverlay";
import { formatINR } from "../utils/format";
import { BagIcon, CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "./Icons";
import Swatch from "./Swatch";

export default function CartDrawer() {
  const { items, isOpen, closeCart, count, subtotal, updateQty, removeItem } = useCart();

  useOverlay(isOpen, closeCart);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
    >
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 bg-ink/50"
        onClick={closeCart}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-sand-dark px-6 py-5">
          <h2 className="font-display text-2xl text-ink">Your Bag ({count})</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart" className="text-ink hover:text-gold">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <BagIcon width="40" height="40" className="text-charcoal/40" />
            <p className="text-charcoal/70">Your bag is empty.</p>
            <button
              type="button"
              onClick={closeCart}
              className="border border-ink px-6 py-2.5 text-sm font-medium tracking-widest text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="styled-scroll flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 border-b border-sand-dark/70 py-5 first:pt-0">
                  <Swatch
                    tone={item.tone ?? "from-sand-dark to-sand"}
                    className="h-24 w-20 shrink-0"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-display text-base text-ink">{item.name}</h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 text-charcoal/50 hover:text-gold"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 border border-sand-dark px-2 py-1">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="text-charcoal hover:text-gold"
                        >
                          <MinusIcon />
                        </button>
                        <span className="w-4 text-center text-sm">{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="text-charcoal hover:text-gold"
                        >
                          <PlusIcon />
                        </button>
                      </div>
                      <span className="font-medium text-ink">{formatINR(item.price * item.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-sand-dark px-6 py-6">
              <div className="mb-4 flex items-center justify-between text-sm text-charcoal/70">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="mb-5 flex items-center justify-between font-display text-xl text-ink">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <button
                type="button"
                className="w-full bg-ink py-4 text-sm font-medium tracking-[0.16em] text-cream uppercase transition-colors hover:bg-charcoal"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
