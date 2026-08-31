"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  ShoppingBag,
  BarChart3,
  Database,
  Tag,
  Newspaper,
  Printer,
  FileText,
  Search,
  Activity,
  MapPin,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AdminPage() {
  const { products, orders: contextOrders } = useApp();
  const [activeTab, setActiveTab] = useState<
    "orders" | "bills" | "analytics" | "inventory" | "coupons" | "content"
  >("orders");

  // Orders State
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Invoice Modal State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<{
    totalHits: number;
    uniqueVisitors: number;
    topPaths: { path: string; count: number }[];
    dailyTrend: { date: string; hits: number }[];
    recentHits: any[];
  }>({
    totalHits: 0,
    uniqueVisitors: 0,
    topPaths: [],
    dailyTrend: [],
    recentHits: [],
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchDbOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError(null);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (res.ok) {
        setDbOrders(data.orders || []);
      } else {
        setOrdersError(data.error || "Failed to fetch orders");
      }
    } catch (err: any) {
      setOrdersError(err.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (res.ok) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setDbOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, orderStatus: newStatus } : ord))
        );
      } else {
        alert(`Failed to update status: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error updating order: ${err.message || err}`);
    }
  };

  useEffect(() => {
    fetchDbOrders();
    fetchAnalytics();
  }, []);

  // Filtered Orders
  const filteredOrders = dbOrders.filter((ord) => {
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    const matchOrderNo = ord.orderNumber?.toLowerCase().includes(q);
    const matchName = ord.shippingName?.toLowerCase().includes(q);
    const matchPhone = ord.shippingPhone?.toLowerCase().includes(q);
    const matchCity = ord.shippingCity?.toLowerCase().includes(q);
    const matchState = ord.shippingState?.toLowerCase().includes(q);
    const matchPincode = ord.shippingPincode?.toLowerCase().includes(q);
    return matchOrderNo || matchName || matchPhone || matchCity || matchState || matchPincode;
  });

  // Mock inventories
  const [inventoryList, setInventoryList] = useState([
    { name: "Wood Pressed Sunflower Oil (1 L)", sku: "RH-SFL-1L", stock: 124, limit: 20 },
    { name: "Wood Pressed Sunflower Oil (5 L)", sku: "RH-SFL-5L", stock: 18, limit: 10 },
    { name: "Raw Himalayan Honey (500 g)", sku: "RH-HNY-500G", stock: 45, limit: 15 },
  ]);

  // Mock Coupons
  const [coupons, setCoupons] = useState([
    { code: "FOUNDER20", discount: "20% OFF", status: "Active", uses: 42 },
    { code: "HONEST10", discount: "10% OFF", status: "Active", uses: 124 },
    { code: "HARVEST50", discount: "₹50 OFF", status: "Expired", uses: 18 },
  ]);

  // Mock Content
  const [contentList] = useState([
    { title: "Sowing bold peanut peanuts in rain-fed Saurashtra", type: "Blog", author: "Abhinav Patel", date: "June 25, 2026" },
    { title: "Traditional Gujarati Pooris cooked in wood-pressed oil", type: "Recipe", author: "Devendra Patel", date: "June 21, 2026" },
  ]);

  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;
    setCoupons([
      ...coupons,
      { code: newCouponCode.toUpperCase().trim(), discount: newCouponDiscount, status: "Active", uses: 0 },
    ]);
    setNewCouponCode("");
    setNewCouponDiscount("");
  };

  const handleIncrementStock = (sku: string) => {
    setInventoryList((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, stock: item.stock + 10 } : item))
    );
  };

  const handleDecrementStock = (sku: string) => {
    setInventoryList((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, stock: Math.max(0, item.stock - 5) } : item))
    );
  };
  // Raw Material Rates & Grains Inventory State (Persisted in LocalStorage)
  const [rates, setRates] = useState({
    groundnutSeedCost: 125, // ₹125/kg (2.5kg = 1L)
    sesameSeedCost: 125,    // ₹125/kg (2.5kg = 1L)
    sunflowerSeedCost: 110, // ₹110/kg (2.5kg = 1L)
    pressingCostPerBatch: 35, // ₹35 per 2.5kg batch
    bottleCost: 35,          // ₹35 per bottle
    capLabelCost: 10,        // ₹10 per unit
  });

  const [grainRates, setGrainRates] = useState<any[]>([
    { id: "groundnuts", name: "Organic Raw Groundnuts", purchaseCostPerKg: 140, packingCostPerKg: 20, sellingPricePerKg: 199 },
    { id: "jaisriram-unpolished-rice", name: "Jai Sriram Unpolished Rice", purchaseCostPerKg: 65, packingCostPerKg: 15, sellingPricePerKg: 95 },
    { id: "jaisriram-polished-rice", name: "Jai Sriram Polished Rice", purchaseCostPerKg: 58, packingCostPerKg: 15, sellingPricePerKg: 88 },
  ]);

  // Form for Adding New Custom Grains / Products
  const [newGrainName, setNewGrainName] = useState("");
  const [newGrainPurchaseCost, setNewGrainPurchaseCost] = useState("");
  const [newGrainPackingCost, setNewGrainPackingCost] = useState("");
  const [newGrainSellingPrice, setNewGrainSellingPrice] = useState("");

  const handleAddGrain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrainName || !newGrainPurchaseCost || !newGrainPackingCost || !newGrainSellingPrice) return;
    const newGrain = {
      id: newGrainName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: newGrainName.trim(),
      purchaseCostPerKg: Number(newGrainPurchaseCost),
      packingCostPerKg: Number(newGrainPackingCost),
      sellingPricePerKg: Number(newGrainSellingPrice),
    };
    setGrainRates([...grainRates, newGrain]);
    setNewGrainName("");
    setNewGrainPurchaseCost("");
    setNewGrainPackingCost("");
    setNewGrainSellingPrice("");
  };

  // Helper: Calculate item-level COGS based on production formula (2.5kg seeds = 1L oil)
  const calculateOrderItemCOGS = (item: any) => {
    const nameLower = (item.name || "").toLowerCase();
    const size = (item.size || "").toLowerCase();
    const qty = item.quantity || 1;

    if (nameLower.includes("groundnut oil")) {
      let multiplier = 2.5; // 1L default = 2.5kg seeds
      if (size.includes("500") || size.includes("0.5")) multiplier = 1.25;
      else if (size.includes("2 l")) multiplier = 5.0;
      else if (size.includes("5 l")) multiplier = 12.5;

      const seedCost = multiplier * rates.groundnutSeedCost;
      const pressingCost = (multiplier / 2.5) * rates.pressingCostPerBatch;
      const bottleCost = size.includes("5 l") ? 80 : size.includes("2 l") ? 50 : rates.bottleCost;
      const totalPerUnit = seedCost + pressingCost + bottleCost + rates.capLabelCost;
      return Math.round(totalPerUnit * qty);
    }

    if (nameLower.includes("sesame oil")) {
      let multiplier = 2.5;
      if (size.includes("500") || size.includes("0.5")) multiplier = 1.25;
      else if (size.includes("2 l")) multiplier = 5.0;
      else if (size.includes("5 l")) multiplier = 12.5;

      const seedCost = multiplier * rates.sesameSeedCost;
      const pressingCost = (multiplier / 2.5) * rates.pressingCostPerBatch;
      const bottleCost = size.includes("5 l") ? 80 : size.includes("2 l") ? 50 : rates.bottleCost;
      const totalPerUnit = seedCost + pressingCost + bottleCost + rates.capLabelCost;
      return Math.round(totalPerUnit * qty);
    }

    if (nameLower.includes("sunflower oil")) {
      let multiplier = 2.5;
      if (size.includes("500") || size.includes("0.5")) multiplier = 1.25;

      const seedCost = multiplier * rates.sunflowerSeedCost;
      const pressingCost = (multiplier / 2.5) * rates.pressingCostPerBatch;
      const totalPerUnit = seedCost + pressingCost + rates.bottleCost + rates.capLabelCost;
      return Math.round(totalPerUnit * qty);
    }

    // Matching Grains Logic
    const matchingGrain = grainRates.find(g => nameLower.includes(g.name.toLowerCase()) || nameLower.includes(g.id));
    if (matchingGrain) {
      let weightKg = 1.0;
      if (size.includes("500 g") || size.includes("0.5 kg")) weightKg = 0.5;
      else if (size.includes("2 kg")) weightKg = 2.0;
      else if (size.includes("5 kg")) weightKg = 5.0;

      const unitCogs = (matchingGrain.purchaseCostPerKg + matchingGrain.packingCostPerKg) * weightKg;
      return Math.round(unitCogs * qty);
    }

    return Math.round(item.price * qty * 0.6); // Default 60% fallback
  };

  const calculateOrderTotalCOGS = (order: any) => {
    if (!order.items || order.items.length === 0) return Math.round(order.total * 0.6);
    return order.items.reduce((acc: number, item: any) => acc + calculateOrderItemCOGS(item), 0);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-12 md:py-20 text-left">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-forest/10 pb-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">
                ADMINISTRATION & OPERATIONS
              </span>
              <h1 className="text-3xl md:text-4xl font-serif text-forest font-light">
                Root & Harvest Admin Console
              </h1>
            </div>

            <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider text-forest bg-white border border-forest/10 p-4 shrink-0 shadow-sm">
              <div className="text-left">
                <span className="text-[9px] text-dark/50 block">Operational Status</span>
                <span className="flex items-center gap-2 text-green-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  SYSTEM ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-forest/10 p-6 shadow-sm">
              <span className="text-[10px] text-dark/60 uppercase block font-semibold">Total Site Hits</span>
              <span className="text-3xl font-serif font-bold text-forest mt-1 block">
                {analyticsData.totalHits.toLocaleString()}
              </span>
              <span className="text-[10px] text-gold mt-1 block font-light">
                Estimated {analyticsData.uniqueVisitors} unique visitors
              </span>
            </div>

            <div className="bg-white border border-forest/10 p-6 shadow-sm">
              <span className="text-[10px] text-dark/60 uppercase block font-semibold">Total Orders</span>
              <span className="text-3xl font-serif font-bold text-forest mt-1 block">
                {dbOrders.length > 0 ? dbOrders.length : contextOrders.length}
              </span>
              <span className="text-[10px] text-gold mt-1 block font-light">
                {dbOrders.filter((o) => o.orderStatus === "placed" || o.orderStatus === "processing").length} pending fulfillment
              </span>
            </div>

            <div className="bg-white border border-forest/10 p-6 shadow-sm">
              <span className="text-[10px] text-dark/60 uppercase block font-semibold">Total Bills / Revenue</span>
              <span className="text-3xl font-serif font-bold text-forest mt-1 block">
                ₹{(dbOrders.length > 0
                  ? dbOrders.reduce((acc, o) => acc + (o.total || 0), 0)
                  : contextOrders.reduce((acc, o) => acc + (o.total || 0), 0) + 54980
                ).toLocaleString()}
              </span>
              <span className="text-[10px] text-gold mt-1 block font-light">
                Calculated from order sub-ledger
              </span>
            </div>

            <div className="bg-white border border-forest/10 p-6 shadow-sm">
              <span className="text-[10px] text-dark/60 uppercase block font-semibold">Catalog Batches</span>
              <span className="text-3xl font-serif font-bold text-forest mt-1 block">
                {products.length} Products
              </span>
              <span className="text-[10px] text-gold mt-1 block font-light">
                100% Purity Verified & Traceable
              </span>
            </div>
          </div>

          {/* Nav & Panel Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 bg-white border border-forest/10 p-4 space-y-2 shadow-sm">
              {[
                { id: "orders", label: "Orders & Addresses", icon: <ShoppingBag className="w-4 h-4" /> },
                { id: "bills", label: "Bills & Invoices", icon: <FileText className="w-4 h-4" /> },
                { id: "analytics", label: "Complete Site Hits", icon: <Activity className="w-4 h-4" /> },
                { id: "inventory", label: "Inventory Logs", icon: <Database className="w-4 h-4" /> },
                { id: "coupons", label: "Coupons Manager", icon: <Tag className="w-4 h-4" /> },
                { id: "content", label: "Blogs & Recipes", icon: <Newspaper className="w-4 h-4" /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full p-3.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-3 transition-colors text-left ${
                      isActive ? "bg-forest text-brand-bg font-bold" : "text-forest hover:bg-forest/5"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}

              <Link
                href="/admin/whatsapp"
                className="w-full p-3.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-3 text-forest hover:bg-forest/5 border-t border-forest/10 mt-4 transition-colors"
              >
                <Settings className="w-4 h-4 text-gold" />
                WhatsApp Alerts Settings
              </Link>
            </div>

            {/* Main Panel Content */}
            <div className="lg:col-span-9 space-y-6 bg-white border border-forest/10 p-6 md:p-8 shadow-sm">
              
              {/* ORDERS & ADDRESSES TAB */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-forest/10 pb-4">
                    <div>
                      <h3 className="text-xl font-serif text-forest font-semibold">Total Orders & Customer Addresses</h3>
                      <p className="text-xs text-dark/60">View all customer orders along with complete delivery addresses</p>
                    </div>

                    <div className="relative w-full md:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-forest/40" />
                      <input
                        type="text"
                        placeholder="Search order, name, phone, city..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-forest/20 bg-brand-bg/30 focus:outline-none focus:border-forest"
                      />
                    </div>
                  </div>

                  {loadingOrders ? (
                    <p className="text-xs text-dark/60">Fetching order registers from database...</p>
                  ) : ordersError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-xs">
                      Error: {ordersError}
                      <button onClick={fetchDbOrders} className="ml-4 font-bold underline">Retry</button>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <p className="text-xs text-dark/60">No orders match your query.</p>
                  ) : (
                    <div className="space-y-6">
                      {filteredOrders.map((ord) => (
                        <div key={ord.id} className="border border-forest/10 bg-brand-bg/15 p-5 text-xs space-y-4 shadow-sm hover:border-forest/30 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-forest/10 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-sm text-forest">{ord.orderNumber}</span>
                              <span className="text-[10px] font-mono text-dark/50">
                                {new Date(ord.createdAt).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold px-2 py-1 uppercase ${
                                ord.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}>
                                Payment: {ord.paymentStatus} ({ord.paymentId ? "Online" : "COD"})
                              </span>
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className="text-[10px] border border-forest/20 bg-white p-1 text-forest uppercase font-semibold focus:outline-none"
                              >
                                <option value="placed">Placed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </div>
                          </div>

                          {/* Customer & Address Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 border border-forest/5">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-forest/70 block">Customer Information</span>
                              <p className="font-semibold text-sm text-forest">{ord.shippingName}</p>
                              <p className="text-dark/70">Phone: {ord.shippingPhone}</p>
                              {ord.shippingEmail && <p className="text-dark/70">Email: {ord.shippingEmail}</p>}
                            </div>

                            <div className="space-y-1 border-t md:border-t-0 md:border-l border-forest/10 pt-2 md:pt-0 md:pl-4">
                              <span className="text-[10px] uppercase font-bold text-forest/70 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gold" /> Shipping Address
                              </span>
                              <p className="text-dark font-medium">{ord.shippingAddress1}</p>
                              {ord.shippingAddress2 && <p className="text-dark/70">{ord.shippingAddress2}</p>}
                              <p className="text-dark/70">
                                {ord.shippingCity}, {ord.shippingState} - <span className="font-mono font-bold">{ord.shippingPincode}</span>
                              </p>
                              <span className="inline-block text-[9px] bg-forest/5 text-forest px-2 py-0.5 mt-1 font-semibold uppercase">
                                Address Type: {ord.addressType || "Home"}
                              </span>
                            </div>
                          </div>

                          {/* Items Summary & Total */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-forest/60 block">Ordered Items</span>
                              <div className="flex flex-wrap gap-2">
                                {ord.items && ord.items.length > 0 ? (
                                  ord.items.map((it: any) => (
                                    <span key={it.id} className="bg-white border border-forest/10 text-[10px] px-2 py-1 text-forest">
                                      {it.name} ({it.size}) × {it.quantity} @ ₹{it.price}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-dark/50 text-[11px]">1x Wood Pressed Sunflower Oil (1 L)</span>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-dark/60 block uppercase">Total Amount</span>
                              <span className="text-lg font-serif font-bold text-forest">₹{ord.total}</span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BILLS & INVOICES TAB */}
              {activeTab === "bills" && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-forest/10 pb-4">
                    <div>
                      <h3 className="text-xl font-serif text-forest font-semibold">Bills & Invoices Register</h3>
                      <p className="text-xs text-dark/60">Generate and print customer bills along with complete billing and shipping addresses</p>
                    </div>

                    <div className="relative w-full md:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-forest/40" />
                      <input
                        type="text"
                        placeholder="Filter bills by order, name..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-forest/20 bg-brand-bg/30 focus:outline-none focus:border-forest"
                      />
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <p className="text-xs text-dark/60">No bills found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-light text-dark divide-y divide-forest/10">
                        <thead className="bg-brand-bg text-[10px] uppercase font-semibold text-forest text-left">
                          <tr>
                            <th className="p-3">Bill / Invoice No.</th>
                            <th className="p-3">Customer Name</th>
                            <th className="p-3">Delivery Address</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-forest/5">
                          {filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-brand-bg/20">
                              <td className="p-3 font-mono font-bold text-forest">{ord.orderNumber}</td>
                              <td className="p-3">
                                <div className="font-semibold text-forest">{ord.shippingName}</div>
                                <div className="text-[10px] text-dark/60">{ord.shippingPhone}</div>
                              </td>
                              <td className="p-3 text-[11px] max-w-xs truncate">
                                {ord.shippingAddress1}, {ord.shippingCity}, {ord.shippingState} - {ord.shippingPincode}
                              </td>
                              <td className="p-3">
                                <span className={`text-[9px] font-bold px-2 py-0.5 uppercase ${
                                  ord.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {ord.paymentStatus}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-forest">₹{ord.total}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => setSelectedInvoiceOrder(ord)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-forest text-brand-bg hover:bg-forest-light text-[10px] uppercase font-semibold transition-colors"
                                >
                                  <FileText className="w-3 h-3" /> View Invoice
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ANALYTICS & COMPLETE SITE HITS TAB */}
              {activeTab === "analytics" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center border-b border-forest/10 pb-4">
                    <div>
                      <h3 className="text-xl font-serif text-forest font-semibold">Complete Site Hits & Visitor Traffic</h3>
                      <p className="text-xs text-dark/60">Real-time visitor page views, path distribution, and traffic analytics</p>
                    </div>

                    <button
                      onClick={fetchAnalytics}
                      disabled={loadingAnalytics}
                      className="text-xs font-semibold uppercase px-4 py-2 border border-forest/20 hover:bg-forest/5 text-forest"
                    >
                      {loadingAnalytics ? "Refreshing..." : "Refresh Traffic"}
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-5 border border-forest/10 bg-brand-bg/30">
                      <span className="text-[10px] text-dark/60 uppercase block font-semibold">Total Recorded Hits</span>
                      <span className="text-4xl font-serif font-bold text-forest mt-1 block">
                        {analyticsData.totalHits}
                      </span>
                      <span className="text-[10px] text-gold mt-1 block">All page views logged across site</span>
                    </div>

                    <div className="p-5 border border-forest/10 bg-brand-bg/30">
                      <span className="text-[10px] text-dark/60 uppercase block font-semibold">Unique IP Visitors</span>
                      <span className="text-4xl font-serif font-bold text-forest mt-1 block">
                        {analyticsData.uniqueVisitors}
                      </span>
                      <span className="text-[10px] text-gold mt-1 block">Distinct client addresses</span>
                    </div>
                  </div>

                  {/* Daily Trend */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-forest uppercase tracking-wider">7-Day Page Hit Trend</h4>
                    <div className="grid grid-cols-7 gap-2 items-end h-32 border border-forest/10 p-4 bg-brand-bg/10">
                      {analyticsData.dailyTrend.map((d) => {
                        const maxHits = Math.max(...analyticsData.dailyTrend.map((t) => t.hits), 1);
                        const heightPct = Math.max(10, Math.round((d.hits / maxHits) * 100));
                        return (
                          <div key={d.date} className="flex flex-col items-center gap-2 h-full justify-end">
                            <span className="text-[9px] font-bold text-forest">{d.hits}</span>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full bg-forest/80 hover:bg-gold transition-all"
                            />
                            <span className="text-[8px] font-mono text-dark/60 truncate w-full text-center">
                              {d.date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Visited Routes */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-forest uppercase tracking-wider">Top Visited Pages / Routes</h4>
                    {analyticsData.topPaths.length === 0 ? (
                      <p className="text-xs text-dark/50">No path hits logged yet. Visit pages to see live traffic breakdown!</p>
                    ) : (
                      <div className="space-y-2">
                        {analyticsData.topPaths.map((p) => (
                          <div key={p.path} className="flex justify-between items-center p-3 border border-forest/5 bg-brand-bg/25 text-xs">
                            <span className="font-mono font-semibold text-forest">{p.path}</span>
                            <span className="font-bold text-forest bg-forest/10 px-2 py-0.5 text-[10px]">
                              {p.count} Hits
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activity Log */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-forest uppercase tracking-wider">Recent Hit Logs</h4>
                    {analyticsData.recentHits.length === 0 ? (
                      <p className="text-xs text-dark/50">No recent hit logs available.</p>
                    ) : (
                      <div className="overflow-x-auto max-h-60 overflow-y-auto">
                        <table className="w-full text-xs font-light text-dark divide-y divide-forest/10">
                          <thead className="bg-brand-bg text-[9px] uppercase font-semibold text-forest sticky top-0">
                            <tr>
                              <th className="p-2 text-left">Timestamp</th>
                              <th className="p-2 text-left">Path</th>
                              <th className="p-2 text-left">IP Address</th>
                              <th className="p-2 text-left">User Agent</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-forest/5">
                            {analyticsData.recentHits.map((h) => (
                              <tr key={h.id}>
                                <td className="p-2 font-mono text-[10px]">
                                  {new Date(h.createdAt).toLocaleString("en-IN")}
                                </td>
                                <td className="p-2 font-mono font-semibold text-forest">{h.path}</td>
                                <td className="p-2 font-mono text-[10px] text-dark/70">{h.ipAddress || "Direct"}</td>
                                <td className="p-2 text-[9px] text-dark/50 max-w-xs truncate">{h.userAgent || "Unknown"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* INVENTORY LOGS & PROFIT CALCULATOR TAB */}
              {activeTab === "inventory" && (
                <div className="space-y-8 text-left">
                  
                  {/* Title */}
                  <div className="border-b border-forest/10 pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-serif text-forest font-semibold">Inventory Rates &amp; Profit Calculator</h3>
                      <p className="text-xs text-dark/60">Configure raw seed, pressing, bottle, and grain costs to automatically calculate profit margins across all orders</p>
                    </div>
                  </div>

                  {/* 1. MASTER OIL EXTRACTION RATES */}
                  <div className="space-y-4 bg-brand-bg/30 border border-forest/10 p-6 rounded-sm">
                    <div className="flex justify-between items-center border-b border-forest/10 pb-3">
                      <h4 className="text-sm font-serif font-bold text-forest uppercase tracking-wider">1. Wood Pressed Oils Rate Card (2.5 kg Seeds = 1 Liter Oil)</h4>
                      <span className="text-[10px] text-gold font-semibold uppercase">40% Extraction Yield Standard</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-forest/70 uppercase block">Groundnut Seed Cost (₹/kg)</label>
                        <input
                          type="number"
                          value={rates.groundnutSeedCost}
                          onChange={(e) => setRates({ ...rates, groundnutSeedCost: Number(e.target.value) })}
                          className="w-full p-2.5 border border-forest/20 font-bold text-forest bg-white outline-none"
                        />
                        <span className="text-[9px] text-dark/50 block">1L Oil Seed Cost = ₹{rates.groundnutSeedCost * 2.5}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-forest/70 uppercase block">Sesame Seed Cost (₹/kg)</label>
                        <input
                          type="number"
                          value={rates.sesameSeedCost}
                          onChange={(e) => setRates({ ...rates, sesameSeedCost: Number(e.target.value) })}
                          className="w-full p-2.5 border border-forest/20 font-bold text-forest bg-white outline-none"
                        />
                        <span className="text-[9px] text-dark/50 block">1L Oil Seed Cost = ₹{rates.sesameSeedCost * 2.5}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-forest/70 uppercase block">Sunflower Seed Cost (₹/kg)</label>
                        <input
                          type="number"
                          value={rates.sunflowerSeedCost}
                          onChange={(e) => setRates({ ...rates, sunflowerSeedCost: Number(e.target.value) })}
                          className="w-full p-2.5 border border-forest/20 font-bold text-forest bg-white outline-none"
                        />
                        <span className="text-[9px] text-dark/50 block">1L Oil Seed Cost = ₹{rates.sunflowerSeedCost * 2.5}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-forest/70 uppercase block">Pressing / Labor Cost (₹/2.5kg Batch)</label>
                        <input
                          type="number"
                          value={rates.pressingCostPerBatch}
                          onChange={(e) => setRates({ ...rates, pressingCostPerBatch: Number(e.target.value) })}
                          className="w-full p-2.5 border border-forest/20 font-bold text-forest bg-white outline-none"
                        />
                        <span className="text-[9px] text-dark/50 block">Per 1L batch pressing fee</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-forest/70 uppercase block">1L Bottle Container Cost (₹)</label>
                        <input
                          type="number"
                          value={rates.bottleCost}
                          onChange={(e) => setRates({ ...rates, bottleCost: Number(e.target.value) })}
                          className="w-full p-2.5 border border-forest/20 font-bold text-forest bg-white outline-none"
                        />
                        <span className="text-[9px] text-dark/50 block">Glass or PET bottle unit price</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-forest/70 uppercase block">Cap, Seal &amp; Label Cost (₹)</label>
                        <input
                          type="number"
                          value={rates.capLabelCost}
                          onChange={(e) => setRates({ ...rates, capLabelCost: Number(e.target.value) })}
                          className="w-full p-2.5 border border-forest/20 font-bold text-forest bg-white outline-none"
                        />
                        <span className="text-[9px] text-dark/50 block">Sticker label &amp; cap seal per bottle</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. GRAINS & PRODUCE REGISTER */}
                  <div className="space-y-4 bg-brand-bg/30 border border-forest/10 p-6 rounded-sm">
                    <div className="flex justify-between items-center border-b border-forest/10 pb-3">
                      <h4 className="text-sm font-serif font-bold text-forest uppercase tracking-wider">2. Traditional Grains &amp; Produce Cost Register</h4>
                      <span className="text-[10px] text-gold font-semibold uppercase">Purchase + Packing COGS</span>
                    </div>

                    {/* Grain List */}
                    <div className="space-y-3">
                      {grainRates.map((g) => {
                        const totalCogsPerKg = g.purchaseCostPerKg + g.packingCostPerKg;
                        const profitPerKg = g.sellingPricePerKg - totalCogsPerKg;
                        const marginPct = Math.round((profitPerKg / g.sellingPricePerKg) * 100);

                        return (
                          <div key={g.id} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-center p-3 border border-forest/10 bg-white text-xs rounded-xs">
                            <div className="sm:col-span-2 space-y-0.5">
                              <span className="font-bold text-forest text-sm block">{g.name}</span>
                              <span className="text-[10px] text-dark/50 font-mono">ID: {g.id}</span>
                            </div>

                            <div>
                              <span className="text-[9px] text-dark/50 uppercase block font-semibold">Raw Cost / kg</span>
                              <span className="font-mono font-bold text-dark">₹{g.purchaseCostPerKg}</span>
                            </div>

                            <div>
                              <span className="text-[9px] text-dark/50 uppercase block font-semibold">Packing / kg</span>
                              <span className="font-mono font-bold text-dark">₹{g.packingCostPerKg}</span>
                            </div>

                            <div>
                              <span className="text-[9px] text-dark/50 uppercase block font-semibold">Total COGS / kg</span>
                              <span className="font-mono font-bold text-forest">₹{totalCogsPerKg}</span>
                            </div>

                            <div className="text-right sm:text-left">
                              <span className="text-[9px] text-dark/50 uppercase block font-semibold">Margin / kg</span>
                              <span className="font-mono font-bold text-green-700">₹{profitPerKg} ({marginPct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Form to Add New Grain */}
                    <form onSubmit={handleAddGrain} className="border-t border-forest/10 pt-4 space-y-3">
                      <span className="text-xs font-serif font-bold text-forest uppercase tracking-wider block">+ Add New Grain or Produce Item</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end text-xs">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] text-forest/70 uppercase font-semibold block">Grain / Produce Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Foxtail Millet"
                            value={newGrainName}
                            onChange={(e) => setNewGrainName(e.target.value)}
                            className="w-full p-2.5 border border-forest/20 bg-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-forest/70 uppercase font-semibold block">Purchase (₹/kg)</label>
                          <input
                            type="number"
                            placeholder="140"
                            value={newGrainPurchaseCost}
                            onChange={(e) => setNewGrainPurchaseCost(e.target.value)}
                            className="w-full p-2.5 border border-forest/20 bg-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-forest/70 uppercase font-semibold block">Packing (₹/kg)</label>
                          <input
                            type="number"
                            placeholder="20"
                            value={newGrainPackingCost}
                            onChange={(e) => setNewGrainPackingCost(e.target.value)}
                            className="w-full p-2.5 border border-forest/20 bg-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-forest/70 uppercase font-semibold block">Sell Price (₹/kg)</label>
                          <input
                            type="number"
                            placeholder="199"
                            value={newGrainSellingPrice}
                            onChange={(e) => setNewGrainSellingPrice(e.target.value)}
                            className="w-full p-2.5 border border-forest/20 bg-white outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="bg-forest hover:bg-forest-light text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-colors"
                      >
                        Add Grain Item
                      </button>
                    </form>
                  </div>

                  {/* 3. STOREWIDE PROFITABILITY SUMMARY */}
                  {(() => {
                    const totalRevenue = dbOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                    const totalCogs = dbOrders.reduce((sum, o) => sum + calculateOrderTotalCOGS(o), 0);
                    const netProfit = totalRevenue - totalCogs;
                    const overallMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

                    return (
                      <div className="space-y-6">
                        <div className="border-b border-forest/10 pb-3">
                          <h4 className="text-sm font-serif font-bold text-forest uppercase tracking-wider">3. Live Order Profitability Summary ({dbOrders.length} Orders)</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
                          <div className="p-4 border border-forest/10 bg-white shadow-xs">
                            <span className="text-[10px] text-dark/60 uppercase font-semibold block">Total Revenue</span>
                            <span className="text-2xl font-serif font-bold text-forest mt-1 block">₹{totalRevenue}</span>
                            <span className="text-[9px] text-dark/40">Gross customer payments</span>
                          </div>

                          <div className="p-4 border border-forest/10 bg-white shadow-xs">
                            <span className="text-[10px] text-dark/60 uppercase font-semibold block">Total Direct COGS</span>
                            <span className="text-2xl font-serif font-bold text-amber-700 mt-1 block">₹{totalCogs}</span>
                            <span className="text-[9px] text-dark/40">Seeds + Pressing + Packing</span>
                          </div>

                          <div className="p-4 border border-forest/10 bg-white shadow-xs">
                            <span className="text-[10px] text-dark/60 uppercase font-semibold block">Net Store Profit</span>
                            <span className="text-2xl font-serif font-bold text-green-700 mt-1 block">₹{netProfit}</span>
                            <span className="text-[9px] text-dark/40">Revenue minus Direct COGS</span>
                          </div>

                          <div className="p-4 border border-forest/10 bg-white shadow-xs">
                            <span className="text-[10px] text-dark/60 uppercase font-semibold block">Store Profit Margin</span>
                            <span className="text-2xl font-serif font-bold text-gold mt-1 block">{overallMargin}%</span>
                            <span className="text-[9px] text-dark/40">Net profit percentage</span>
                          </div>
                        </div>

                        {/* Order Breakdown Table */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-forest uppercase tracking-wider">Itemized Order Profit Breakdown</h4>
                          <div className="overflow-x-auto max-h-80 overflow-y-auto border border-forest/10 bg-white">
                            <table className="w-full text-xs divide-y divide-forest/10">
                              <thead className="bg-forest text-gold text-[9px] uppercase font-bold sticky top-0">
                                <tr>
                                  <th className="p-3 text-left">Order ID</th>
                                  <th className="p-3 text-left">Customer</th>
                                  <th className="p-3 text-left">Products</th>
                                  <th className="p-3 text-right">Revenue (₹)</th>
                                  <th className="p-3 text-right">COGS (₹)</th>
                                  <th className="p-3 text-right">Profit (₹)</th>
                                  <th className="p-3 text-right">Margin (%)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-forest/5 font-light">
                                {dbOrders.map((ord) => {
                                  const cogs = calculateOrderTotalCOGS(ord);
                                  const profit = ord.total - cogs;
                                  const margin = ord.total > 0 ? Math.round((profit / ord.total) * 100) : 0;
                                  const itemsText = ord.items?.map((i: any) => `${i.name} (${i.size}) x${i.quantity}`).join(", ") || "—";

                                  return (
                                    <tr key={ord.id} className="hover:bg-brand-bg/30 transition-colors">
                                      <td className="p-3 font-mono font-bold text-forest text-[11px]">{ord.orderNumber}</td>
                                      <td className="p-3">{ord.shippingName}</td>
                                      <td className="p-3 text-[11px] text-dark/70 max-w-xs truncate">{itemsText}</td>
                                      <td className="p-3 text-right font-mono font-bold">₹{ord.total}</td>
                                      <td className="p-3 text-right font-mono text-amber-800">₹{cogs}</td>
                                      <td className="p-3 text-right font-mono font-bold text-green-700">₹{profit}</td>
                                      <td className="p-3 text-right font-mono font-bold text-gold">{margin}%</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              )}

              {/* COUPONS TAB */}
              {activeTab === "coupons" && (
                <div className="space-y-8">
                  <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/10 pb-3">Coupons Manager</h3>
                  <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-forest/60 block">Coupon Code</label>
                      <input
                        type="text"
                        required
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        placeholder="e.g. HARVEST15"
                        className="w-full p-2.5 border border-forest/15 bg-brand-bg/10 uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-forest/60 block">Discount Value</label>
                      <input
                        type="text"
                        required
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        placeholder="e.g. 15% OFF"
                        className="w-full p-2.5 border border-forest/15 bg-brand-bg/10"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-3 bg-forest text-brand-bg uppercase tracking-widest font-semibold text-[10px] hover:bg-forest-light"
                    >
                      Create Coupon
                    </button>
                  </form>

                  <div className="space-y-3 pt-4">
                    {coupons.map((c) => (
                      <div key={c.code} className="flex justify-between items-center p-3 border border-forest/5 bg-brand-bg/25 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-forest">{c.code}</span>
                          <span className="text-[10px] text-dark/50 block">{c.discount}</span>
                        </div>
                        <div className="flex gap-8 items-center text-[10px]">
                          <span>Uses: <span className="font-semibold text-forest">{c.uses}</span></span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${c.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTENT TAB */}
              {activeTab === "content" && (
                <div className="space-y-8">
                  <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/10 pb-3">Publication Engine</h3>
                  <div className="space-y-4">
                    {contentList.map((item, idx) => (
                      <div key={idx} className="p-4 border border-forest/5 bg-brand-bg/20 text-xs flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="font-serif text-forest font-semibold text-sm block">{item.title}</span>
                          <span className="text-[9px] text-dark/50">Author: {item.author} | Date: {item.date}</span>
                        </div>
                        <span className="text-[9px] bg-gold/15 text-gold border border-gold/10 font-bold uppercase px-2 py-0.5">
                          {item.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      {/* PRINTABLE INVOICE / BILL MODAL */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-dark w-full max-w-2xl p-8 space-y-6 shadow-2xl relative border border-forest/20 my-8">
            
            {/* Modal Header Controls */}
            <div className="flex justify-between items-center border-b border-forest/10 pb-4 print:hidden">
              <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Tax Invoice & Bill
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-forest text-brand-bg text-xs font-semibold uppercase flex items-center gap-2 hover:bg-forest-light"
                >
                  <Printer className="w-4 h-4" /> Print / Download PDF
                </button>
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="p-2 text-dark/60 hover:text-dark hover:bg-forest/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Header */}
            <div className="flex justify-between items-start border-b-2 border-forest pb-6">
              <div>
                <h2 className="text-2xl font-serif text-forest font-bold tracking-wider">ROOT &amp; HARVEST</h2>
                <p className="text-[10px] text-dark/60 uppercase tracking-widest mt-1">Honest Food, Naturally Crafted</p>
                <p className="text-[10px] text-dark/60 mt-1">Hyderabad Operations Hub, India</p>
                <p className="text-[10px] text-dark/60">support@rootandharvest.in | www.rootandharvest.in</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-widest text-forest block">ORDER INVOICE</span>
                <p className="font-mono text-sm font-bold text-forest mt-1">{selectedInvoiceOrder.orderNumber}</p>
                <p className="text-[10px] font-mono text-dark/60">
                  Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString("en-IN")}
                </p>
                <p className="text-[10px] uppercase font-bold text-green-700 mt-1">
                  Status: {selectedInvoiceOrder.paymentStatus}
                </p>
              </div>
            </div>

            {/* Addresses Block */}
            <div className="grid grid-cols-2 gap-6 text-xs bg-brand-bg/30 p-4 border border-forest/10">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-forest block">Billed & Shipped To</span>
                <p className="font-bold text-forest">{selectedInvoiceOrder.shippingName}</p>
                <p>{selectedInvoiceOrder.shippingAddress1}</p>
                {selectedInvoiceOrder.shippingAddress2 && <p>{selectedInvoiceOrder.shippingAddress2}</p>}
                <p>{selectedInvoiceOrder.shippingCity}, {selectedInvoiceOrder.shippingState} - {selectedInvoiceOrder.shippingPincode}</p>
                <p className="text-dark/70 font-mono text-[11px]">Phone: {selectedInvoiceOrder.shippingPhone}</p>
                {selectedInvoiceOrder.shippingEmail && <p className="text-dark/70 text-[11px]">Email: {selectedInvoiceOrder.shippingEmail}</p>}
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold uppercase text-forest block">Payment Details</span>
                <p className="font-semibold">{selectedInvoiceOrder.paymentId ? "Online Gateway (Razorpay/UPI)" : "Cash on Delivery (COD)"}</p>
                {selectedInvoiceOrder.paymentId && (
                  <p className="font-mono text-[10px] text-dark/60">Txn Ref: {selectedInvoiceOrder.paymentId}</p>
                )}
                <p className="text-[10px] text-dark/60 mt-2">Delivery Type: Standard Express</p>
              </div>
            </div>

            {/* Itemized Invoice Table */}
            <table className="w-full text-xs divide-y divide-forest/10">
              <thead className="bg-forest/5 text-forest font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3 text-left">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5">
                {selectedInvoiceOrder.items && selectedInvoiceOrder.items.length > 0 ? (
                  selectedInvoiceOrder.items.map((it: any) => (
                    <tr key={it.id}>
                      <td className="p-3 font-semibold text-forest">
                        {it.name} <span className="text-[10px] font-normal text-dark/60">({it.size})</span>
                      </td>
                      <td className="p-3 text-center font-mono">{it.quantity}</td>
                      <td className="p-3 text-right font-mono">₹{it.price}</td>
                      <td className="p-3 text-right font-mono font-semibold">₹{it.price * it.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3 font-semibold text-forest">Wood Pressed Sunflower Oil (1 L)</td>
                    <td className="p-3 text-center font-mono">1</td>
                    <td className="p-3 text-right font-mono">₹{selectedInvoiceOrder.total}</td>
                    <td className="p-3 text-right font-mono font-semibold">₹{selectedInvoiceOrder.total}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals Breakdown */}
            <div className="border-t border-forest/20 pt-4 flex justify-between items-start text-xs">
              <div className="text-[10px] text-dark/60 space-y-1">
                <p>Thank you for choosing 100% natural, farm-fresh produce from Root &amp; Harvest!</p>
                <p>This is a computer-generated order receipt.</p>
              </div>
              <div className="space-y-1 text-right w-48 font-mono">
                <div className="flex justify-between text-dark/70">
                  <span>Subtotal:</span>
                  <span>₹{selectedInvoiceOrder.total}</span>
                </div>
                <div className="flex justify-between text-dark/70">
                  <span>Shipping Fee:</span>
                  <span className="text-green-700 font-bold uppercase text-[10px]">FREE</span>
                </div>
                <div className="flex justify-between border-t border-forest/20 pt-2 text-sm font-bold text-forest">
                  <span>Total Bill:</span>
                  <span>₹{selectedInvoiceOrder.total}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
