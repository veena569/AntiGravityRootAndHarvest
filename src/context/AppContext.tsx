"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { Product, INITIAL_PRODUCTS } from "../data/products";
// Added CartItem, ShippingAddress, Order, Subscription types back to AppContext since they are closely tied to state. Wait, they weren't in products.ts. Let me restore them.
export interface CartItem {
  product: Product;
  size: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: ShippingAddress;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "failed";
  orderStatus: "placed" | "processing" | "shipped" | "delivered";
}

export interface Subscription {
  id: string;
  product: Product;
  size: string;
  frequency: "monthly" | "bi-monthly" | "quarterly";
  nextDelivery: string;
  price: number;
  status: "active" | "paused" | "cancelled";
}

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  addresses: ShippingAddress[];
  orders: Order[];
  subscriptions: Subscription[];
  promoCode: string | null;
  discountAmount: number;
  shippingCost: number;
  addToCart: (product: Product, size: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  addAddress: (address: Omit<ShippingAddress, "id">) => void;
  removeAddress: (id: string) => void;
  placeOrder: (address: ShippingAddress, paymentMethod: string, paymentStatus?: "paid" | "pending") => Order;
  addSubscription: (product: Product, size: string, frequency: "monthly" | "bi-monthly" | "quarterly") => void;
  updateSubscriptionStatus: (id: string, status: "active" | "paused" | "cancelled") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const shippingCost = 0; // Free shipping for premium brand signals luxury

  // Load state from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("rh_cart");
    const savedWishlist = localStorage.getItem("rh_wishlist");
    const savedAddresses = localStorage.getItem("rh_addresses");
    const savedOrders = localStorage.getItem("rh_orders");
    const savedSubs = localStorage.getItem("rh_subscriptions");

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    } else {
      // Seed default mock address
      const seedAddress: ShippingAddress = {
        id: "addr-1",
        name: "Abhinav Patel",
        phone: "+91 98765 43210",
        addressLine1: "Flat 402, Oakwood Residency",
        addressLine2: "12th Main Road, Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560038",
        isDefault: true
      };
      setAddresses([seedAddress]);
      localStorage.setItem("rh_addresses", JSON.stringify([seedAddress]));
    }
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedSubs) setSubscriptions(JSON.parse(savedSubs));
  }, []);

  // Save states to localStorage when they change
  useEffect(() => {
    localStorage.setItem("rh_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("rh_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("rh_addresses", JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem("rh_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("rh_subscriptions", JSON.stringify(subscriptions));
  }, [subscriptions]);

  const addToCart = (product: Product, size: string, quantity: number) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id && item.size === size);
      const price = product.sizePrices[size] || Object.values(product.sizePrices)[0];
      if (existingIdx > -1) {
        const nextCart = [...prev];
        nextCart[existingIdx] = {
          ...nextCart[existingIdx],
          quantity: nextCart[existingIdx].quantity + quantity
        };
        return nextCart;
      }
      return [...prev, { product, size, price, quantity }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size)));
  };

  const updateCartQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) => {
      const nextCart = [...prev];
      const idx = nextCart.findIndex((item) => item.product.id === productId && item.size === size);
      if (idx > -1) {
        nextCart[idx] = { ...nextCart[idx], quantity };
      }
      return nextCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode(null);
    setDiscountAmount(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const applyPromoCode = (code: string) => {
    const formattedCode = code.toUpperCase().trim();
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (formattedCode === "HONEST10") {
      setPromoCode("HONEST10");
      setDiscountAmount(Math.round(subtotal * 0.1));
      return true;
    }
    if (formattedCode === "FOUNDER20") {
      setPromoCode("FOUNDER20");
      setDiscountAmount(Math.round(subtotal * 0.2));
      return true;
    }
    return false;
  };

  const removePromoCode = () => {
    setPromoCode(null);
    setDiscountAmount(0);
  };

  const addAddress = (addressInput: Omit<ShippingAddress, "id">) => {
    const newAddr: ShippingAddress = {
      ...addressInput,
      id: `addr-${Date.now()}`
    };
    if (newAddr.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
      );
    } else {
      setAddresses((prev) => [...prev, newAddr]);
    }
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const placeOrder = (address: ShippingAddress, paymentMethod: string, paymentStatus: "paid" | "pending" | "failed" = "paid") => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal - discountAmount + shippingCost;
    const date = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: `RH-${100000 + Math.floor(Math.random() * 900000)}`,
      date,
      items: [...cart],
      subtotal,
      discount: discountAmount,
      shipping: shippingCost,
      total,
      address,
      paymentMethod,
      paymentStatus,
      orderStatus: "placed"
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const addSubscription = (product: Product, size: string, frequency: "monthly" | "bi-monthly" | "quarterly") => {
    const nextDel = new Date();
    nextDel.setMonth(nextDel.getMonth() + (frequency === "monthly" ? 1 : frequency === "bi-monthly" ? 2 : 3));
    
    const price = Math.round(product.sizePrices[size] * 0.9); // 10% off for subscribing
    
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      product,
      size,
      frequency,
      nextDelivery: nextDel.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
      price,
      status: "active"
    };

    setSubscriptions((prev) => [...prev, newSub]);
  };

  const updateSubscriptionStatus = (id: string, status: "active" | "paused" | "cancelled") => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status } : sub))
    );
  };

  return (
    <AppContext.Provider
      value={{
        products: INITIAL_PRODUCTS,
        cart,
        wishlist,
        addresses,
        orders,
        subscriptions,
        promoCode,
        discountAmount,
        shippingCost,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        applyPromoCode,
        removePromoCode,
        addAddress,
        removeAddress,
        placeOrder,
        addSubscription,
        updateSubscriptionStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
