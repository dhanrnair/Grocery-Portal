import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MAX_QTY } from '../../shared/rules';

const CartContext = createContext(null);
const KEY = 'grocery-cart';

// The cart keeps display data for the UI; the server re-prices everything at checkout.
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) ?? []; } catch { return []; }
  });
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);

  const value = useMemo(() => ({
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
    addItem(p, qty = 1) {
      setItems((cur) => {
        const found = cur.find((i) => i.id === p.id);
        const cap = Math.min(MAX_QTY, p.stock);
        if (found) return cur.map((i) => (i.id === p.id ? { ...i, qty: Math.min(cap, i.qty + qty) } : i));
        return [...cur, { id: p.id, name: p.name, unit: p.unit, image: p.image, price: p.price, stock: p.stock, qty: Math.min(cap, qty) }];
      });
    },
    setQty(id, qty) {
      setItems((cur) => cur.flatMap((i) => {
        if (i.id !== id) return [i];
        const q = Math.min(qty, MAX_QTY, i.stock);
        return q < 1 ? [] : [{ ...i, qty: q }];
      }));
    },
    removeItem: (id) => setItems((cur) => cur.filter((i) => i.id !== id)),
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
