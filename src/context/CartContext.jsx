import { useMemo, useState, useCallback } from "react";
import { CartContext } from "./cartContextObject";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setNotification({ key: Date.now(), name: product.name });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, qty } : item)),
    );
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const clearCart = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(
    () =>
      items.reduce(
        (acc, item) => ({
          count: acc.count + item.qty,
          subtotal: acc.subtotal + item.qty * item.price,
        }),
        { count: 0, subtotal: 0 },
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      count,
      subtotal,
      notification,
      addItem,
      removeItem,
      updateQty,
      openCart,
      closeCart,
      clearCart,
    }),
    [
      items,
      isOpen,
      count,
      subtotal,
      notification,
      addItem,
      removeItem,
      updateQty,
      openCart,
      closeCart,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
