import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "CA$",
  AUD: "A$",
};

// Approximate exchange rates relative to USD
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AUD: 1.53,
};

export interface CartItem {
  id: number;
  name: string;
  category: string;
  priceUSD: number;
  image: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number, size: string) => void;
  updateQuantity: (id: number, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalUSD: number;
  convertPrice: (usd: number) => string;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("bl_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem("bl_currency") as Currency) || "USD";
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("bl_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("bl_currency", currency);
  }, [currency]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === newItem.id && i.size === newItem.size
      );
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id && i.size === newItem.size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: number, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size)));
  }, []);

  const updateQuantity = useCallback(
    (id: number, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id, size);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === id && i.size === size ? { ...i, quantity } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalUSD = items.reduce(
    (sum, i) => sum + i.priceUSD * i.quantity,
    0
  );

  const convertPrice = useCallback(
    (usd: number) => {
      const rate = EXCHANGE_RATES[currency];
      const converted = usd * rate;
      const symbol = CURRENCY_SYMBOLS[currency];
      return `${symbol}${converted.toFixed(2)}`;
    },
    [currency]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        currency,
        setCurrency,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalUSD,
        convertPrice,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
