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
    "orders" | "bills" | "inventory" | "expenses" | "analytics" | "coupons" | "content"
  >("orders");

  // Business Expenses & Procurement Ledger State
  const [businessExpenses, setBusinessExpenses] = useState<any[]>([
    {
      id: "exp-1",
      date: "2026-08-01",
      category: "Seeds",
      item: "Organic Groundnut Seeds",
      quantity: "500 kg",
      unitCost: 125,
      amount: 62500,
      notes: "Saurashtra Farm Direct Purchase @ ₹125/kg",
    },
    {
      id: "exp-2",
      date: "2026-08-05",
      category: "Bottles",
      item: "1L Food Grade Oil Bottles",
      quantity: "500 pcs",
      unitCost: 35,
      amount: 17500,
      notes: "PET Bottles Batch @ ₹35/pc",
    },
    {
      id: "exp-3",
      date: "2026-08-10",
      category: "Cardboard Boxes",
      item: "Corrugated Shipping Boxes",
      quantity: "300 pcs",
      unitCost: 25,
      amount: 7500,
      notes: "Heavy-duty 5-ply shipping boxes @ ₹25/pc",
    },
    {
      id: "exp-4",
      date: "2026-08-12",
      category: "Label Printing",
      item: "Custom Waterproof Bottle Labels & Cap Seals",
      quantity: "2000 pcs",
      unitCost: 4,
      amount: 8000,
      notes: "Metallic foil sticker printing @ ₹4/pc",
    },
    {
      id: "exp-5",
      date: "2026-08-15",
      category: "Travelling",
      item: "Farm Visit & Seed Transport Freight",
      quantity: "1 Trip",
      unitCost: 4500,
      amount: 4500,
      notes: "Transport from Rajkot mandi to pressing unit",
    },
    {
      id: "exp-6",
      date: "2026-08-18",
      category: "Covers & Packing",
      item: "Bubble Wrap & Outer Poly Covers",
      quantity: "2 Rolls",
      unitCost: 1100,
      amount: 2200,
      notes: "Protective packaging for shipments @ ₹1100/roll",
    },
  ]);

  // Form State for Adding New Business Expense
  const [newExpDate, setNewExpDate] = useState("");
  const [newExpCategory, setNewExpCategory] = useState("Seeds");
  const [newExpItem, setNewExpItem] = useState("");
  const [newExpQty, setNewExpQty] = useState("");
  const [newExpUnitCost, setNewExpUnitCost] = useState("");
  const [newExpAmount, setNewExpAmount] = useState("");
  const [newExpNotes, setNewExpNotes] = useState("");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpItem) return;

    const unitCostNum = Number(newExpUnitCost) || 0;
    const qtyNum = parseFloat(newExpQty) || 1;
    const computedAmount = Number(newExpAmount) || Math.round(unitCostNum * qtyNum);

    if (!computedAmount) return;

    const newEntry = {
      id: `exp-${Date.now()}`,
      date: newExpDate || new Date().toISOString().split("T")[0],
      category: newExpCategory,
      item: newExpItem.trim(),
      quantity: newExpQty.trim() || "1",
      unitCost: unitCostNum || (qtyNum > 0 ? Math.round(computedAmount / qtyNum) : computedAmount),
      amount: computedAmount,
      notes: newExpNotes.trim(),
    };
    setBusinessExpenses([newEntry, ...businessExpenses]);
    setNewExpItem("");
    setNewExpQty("");
    setNewExpUnitCost("");
    setNewExpAmount("");
    setNewExpNotes("");
  };

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
  // Dynamic Oil & Grain Master Rate Registers
  const [oilRates, setOilRates] = useState<any[]>([
    {
      id: "groundnut-oil",
      name: "Wood Pressed Groundnut Oil",
      seedCostPerKg: 125,
      seedRatioPerLiter: 2.5,
      pressingCostPerKg: 30,
      packagingCostPerLiter: 45, // ₹35 bottle + ₹10 cap & label
      sellingPricePerLiter: 449,
    },
    {
      id: "sesame-oil",
      name: "Wood Pressed Sesame Oil",
      seedCostPerKg: 125,
      seedRatioPerLiter: 2.5,
      pressingCostPerKg: 30,
      packagingCostPerLiter: 45,
      sellingPricePerLiter: 599,
    },
    {
      id: "sunflower-oil",
      name: "Wood Pressed Sunflower Oil",
      seedCostPerKg: 110,
      seedRatioPerLiter: 2.5,
      pressingCostPerKg: 30,
      packagingCostPerLiter: 45,
      sellingPricePerLiter: 465,
    },
  ]);

  // Form State for Adding New Custom Oils
  const [newOilName, setNewOilName] = useState("");
  const [newOilSeedCost, setNewOilSeedCost] = useState("");
  const [newOilSeedRatio, setNewOilSeedRatio] = useState("2.5");
  const [newOilPressingCost, setNewOilPressingCost] = useState("30");
  const [newOilPackagingCost, setNewOilPackagingCost] = useState("45");
  const [newOilSellingPrice, setNewOilSellingPrice] = useState("");

  const handleAddOil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOilName || !newOilSeedCost || !newOilSellingPrice) return;
    const newOil = {
      id: newOilName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: newOilName.trim(),
      seedCostPerKg: Number(newOilSeedCost),
      seedRatioPerLiter: Number(newOilSeedRatio || 2.5),
      pressingCostPerKg: Number(newOilPressingCost || 30),
      packagingCostPerLiter: Number(newOilPackagingCost || 45),
      sellingPricePerLiter: Number(newOilSellingPrice),
    };
    setOilRates([...oilRates, newOil]);
    setNewOilName("");
    setNewOilSeedCost("");
    setNewOilSellingPrice("");
  };

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

  // Estimated Courier / Shipping Cost per Order
  const [estimatedShippingCostPerOrder, setEstimatedShippingCostPerOrder] = useState(70);

  // Helper: Calculate item-level COGS dynamically using Oil & Grain Rate Cards
  const calculateOrderItemCOGS = (item: any): number => {
    if (!item) return 0;
    const nameLower = String(item.name || "").toLowerCase();
    const sizeLower = String(item.size || "").toLowerCase();
    const qty = Number(item.quantity || 1);

    // Check Oil Matches
    for (let i = 0; i < oilRates.length; i++) {
      const oil = oilRates[i];
      const oilNameLower = String(oil.name || "").toLowerCase();
      const oilIdLower = String(oil.id || "").toLowerCase();
      if (nameLower.includes(oilNameLower) || nameLower.includes(oilIdLower.replace(/-/g, " "))) {
        let literMultiplier = 1.0;
        if (sizeLower.includes("500") || sizeLower.includes("0.5")) literMultiplier = 0.5;
        else if (sizeLower.includes("2 l")) literMultiplier = 2.0;
        else if (sizeLower.includes("5 l")) literMultiplier = 5.0;

        const seedsNeededKg = (oil.seedRatioPerLiter || 2.5) * literMultiplier;
        const seedCost = seedsNeededKg * (oil.seedCostPerKg || 0);
        const pressingCost = seedsNeededKg * (oil.pressingCostPerKg || 30);
        const packCost = (oil.packagingCostPerLiter || 45) * literMultiplier;

        return Math.round((seedCost + pressingCost + packCost) * qty);
      }
    }

    // Check Grain Matches
    for (let i = 0; i < grainRates.length; i++) {
      const grain = grainRates[i];
      const grainNameLower = String(grain.name || "").toLowerCase();
      const grainIdLower = String(grain.id || "").toLowerCase();
      if (nameLower.includes(grainNameLower) || nameLower.includes(grainIdLower)) {
        let weightKg = 1.0;
        if (sizeLower.includes("500 g") || sizeLower.includes("0.5 kg")) weightKg = 0.5;
        else if (sizeLower.includes("2 kg")) weightKg = 2.0;
        else if (sizeLower.includes("5 kg")) weightKg = 5.0;

        const unitCogs = ((grain.purchaseCostPerKg || 0) + (grain.packingCostPerKg || 0)) * weightKg;
        return Math.round(unitCogs * qty);
      }
    }

    return Math.round((Number(item.price) || 0) * qty * 0.6);
  };

  const calculateOrderTotalCOGS = (order: any): number => {
    if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return Math.round(Number(order?.total || 0) * 0.6) + estimatedShippingCostPerOrder;
    }
    let productCogs = 0;
    for (let i = 0; i < order.items.length; i++) {
      productCogs += calculateOrderItemCOGS(order.items[i]);
    }
    return productCogs + estimatedShippingCostPerOrder;
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
                { id: "inventory", label: "Inventory & Profit Calculator", icon: <Database className="w-4 h-4 text-gold" /> },
                { id: "expenses", label: "Business Expenses & Ledger", icon: <BarChart3 className="w-4 h-4 text-emerald-600" /> },
                { id: "analytics", label: "Complete Site Hits", icon: <Activity className="w-4 h-4" /> },
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

                  {/* 1. DYNAMIC OILS COST REGISTER */}
                  <div className="space-y-4 bg-brand-bg/30 border border-forest/10 p-6 rounded-sm">
                    <div className="flex justify-between items-center border-b border-forest/10 pb-3">
                      <h4 className="text-sm font-serif font-bold text-forest uppercase tracking-wider">1. Wood Pressed Oils Master Cost Register</h4>
                      <span className="text-[10px] text-gold font-semibold uppercase">Seeds + Pressing + Packaging COGS</span>
                    </div>

                    {/* Oils List */}
                    <div className="space-y-3">
                      {oilRates.map((o, idx) => {
                        const seedCostFor1L = o.seedRatioPerLiter * o.seedCostPerKg;
                        const pressingCostFor1L = o.seedRatioPerLiter * o.pressingCostPerKg;
                        const totalCogsFor1L = seedCostFor1L + pressingCostFor1L + o.packagingCostPerLiter;
                        const profitFor1L = o.sellingPricePerLiter - totalCogsFor1L;
                        const marginPct = Math.round((profitFor1L / o.sellingPricePerLiter) * 100);

                        return (
                          <div key={o.id} className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-center p-3.5 border border-forest/10 bg-white text-xs rounded-xs">
                            <div className="sm:col-span-2 space-y-0.5">
                              <span className="font-bold text-forest text-sm block">{o.name}</span>
                              <span className="text-[10px] text-dark/50 font-mono">ID: {o.id} | {o.seedRatioPerLiter}kg seeds/L</span>
                            </div>

                            <div>
                              <label className="text-[9px] text-dark/50 uppercase block font-semibold">Seed Rate (₹/kg)</label>
                              <input
                                type="number"
                                value={o.seedCostPerKg}
                                onChange={(e) => {
                                  const updated = [...oilRates];
                                  updated[idx].seedCostPerKg = Number(e.target.value);
                                  setOilRates(updated);
                                }}
                                className="w-20 p-1 border border-forest/20 font-mono font-bold text-dark outline-none text-xs"
                              />
                            </div>

                            <div>
                              <label className="text-[9px] text-dark/50 uppercase block font-semibold">Pressing (₹/kg)</label>
                              <input
                                type="number"
                                value={o.pressingCostPerKg}
                                onChange={(e) => {
                                  const updated = [...oilRates];
                                  updated[idx].pressingCostPerKg = Number(e.target.value);
                                  setOilRates(updated);
                                }}
                                className="w-20 p-1 border border-forest/20 font-mono font-bold text-dark outline-none text-xs"
                              />
                            </div>

                            <div>
                              <label className="text-[9px] text-dark/50 uppercase block font-semibold">Bottle &amp; Pack (₹/L)</label>
                              <input
                                type="number"
                                value={o.packagingCostPerLiter}
                                onChange={(e) => {
                                  const updated = [...oilRates];
                                  updated[idx].packagingCostPerLiter = Number(e.target.value);
                                  setOilRates(updated);
                                }}
                                className="w-20 p-1 border border-forest/20 font-mono font-bold text-dark outline-none text-xs"
                              />
                            </div>

                            <div>
                              <span className="text-[9px] text-dark/50 uppercase block font-semibold">Total 1L COGS</span>
                              <span className="font-mono font-bold text-forest text-sm">₹{Math.round(totalCogsFor1L)}</span>
                            </div>

                            <div className="text-right sm:text-left">
                              <span className="text-[9px] text-dark/50 uppercase block font-semibold">1L Margin</span>
                              <span className="font-mono font-bold text-green-700 text-sm">₹{Math.round(profitFor1L)} ({marginPct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Form to Add New Oil */}
                    <form onSubmit={handleAddOil} className="border-t border-forest/10 pt-4 space-y-3">
                      <span className="text-xs font-serif font-bold text-forest uppercase tracking-wider block">+ Add New Wood Pressed Oil</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end text-xs">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] text-forest/70 uppercase font-semibold block">Oil Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Wood Pressed Coconut Oil"
                            value={newOilName}
                            onChange={(e) => setNewOilName(e.target.value)}
                            className="w-full p-2 border border-forest/20 bg-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-forest/70 uppercase font-semibold block">Seed Cost (₹/kg)</label>
                          <input
                            type="number"
                            placeholder="160"
                            value={newOilSeedCost}
                            onChange={(e) => setNewOilSeedCost(e.target.value)}
                            className="w-full p-2 border border-forest/20 bg-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-forest/70 uppercase font-semibold block">Seeds/L (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="2.5"
                            value={newOilSeedRatio}
                            onChange={(e) => setNewOilSeedRatio(e.target.value)}
                            className="w-full p-2 border border-forest/20 bg-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-forest/70 uppercase font-semibold block">Pressing (₹/kg)</label>
                          <input
                            type="number"
                            placeholder="30"
                            value={newOilPressingCost}
                            onChange={(e) => setNewOilPressingCost(e.target.value)}
                            className="w-full p-2 border border-forest/20 bg-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-forest/70 uppercase font-semibold block">1L Sell Price (₹)</label>
                          <input
                            type="number"
                            placeholder="599"
                            value={newOilSellingPrice}
                            onChange={(e) => setNewOilSellingPrice(e.target.value)}
                            className="w-full p-2 border border-forest/20 bg-white outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="bg-forest hover:bg-forest-light text-white text-xs font-bold uppercase tracking-wider px-5 py-2 transition-colors"
                      >
                        Add Oil Item
                      </button>
                    </form>
                  </div>

                  {/* 2. GRAINS & PRODUCE REGISTER */}
                  <div className="space-y-4 bg-brand-bg/30 border border-forest/10 p-6 rounded-sm">
                    <div className="flex justify-between items-center border-b border-forest/10 pb-3">
                      <h4 className="text-sm font-serif font-bold text-forest uppercase tracking-wider">2. Traditional Grains &amp; Produce Cost Register</h4>
                      <span className="text-[10px] text-gold font-semibold uppercase">Purchase + Packing COGS</span>
                    </div>

                    {/* Grain List */}
                    <div className="space-y-3">
                      {grainRates.map((g, idx) => {
                        const totalCogsPerKg = g.purchaseCostPerKg + g.packingCostPerKg;
                        const profitPerKg = g.sellingPricePerKg - totalCogsPerKg;
                        const marginPct = g.sellingPricePerKg > 0 ? Math.round((profitPerKg / g.sellingPricePerKg) * 100) : 0;

                        return (
                          <div key={g.id} className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-center p-3.5 border border-forest/10 bg-white text-xs rounded-xs">
                            <div className="sm:col-span-2 space-y-0.5">
                              <span className="font-bold text-forest text-sm block">{g.name}</span>
                              <span className="text-[10px] text-dark/50 font-mono">ID: {g.id}</span>
                            </div>

                            <div>
                              <label className="text-[9px] text-dark/50 uppercase block font-semibold">Raw Cost (₹/kg)</label>
                              <input
                                type="number"
                                value={g.purchaseCostPerKg}
                                onChange={(e) => {
                                  const updated = [...grainRates];
                                  updated[idx].purchaseCostPerKg = Number(e.target.value);
                                  setGrainRates(updated);
                                }}
                                className="w-20 p-1 border border-forest/20 font-mono font-bold text-dark outline-none text-xs"
                              />
                            </div>

                            <div>
                              <label className="text-[9px] text-dark/50 uppercase block font-semibold">Packing (₹/kg)</label>
                              <input
                                type="number"
                                value={g.packingCostPerKg}
                                onChange={(e) => {
                                  const updated = [...grainRates];
                                  updated[idx].packingCostPerKg = Number(e.target.value);
                                  setGrainRates(updated);
                                }}
                                className="w-20 p-1 border border-forest/20 font-mono font-bold text-dark outline-none text-xs"
                              />
                            </div>

                            <div>
                              <label className="text-[9px] text-dark/50 uppercase block font-semibold">Sell Price (₹/kg)</label>
                              <input
                                type="number"
                                value={g.sellingPricePerKg}
                                onChange={(e) => {
                                  const updated = [...grainRates];
                                  updated[idx].sellingPricePerKg = Number(e.target.value);
                                  setGrainRates(updated);
                                }}
                                className="w-20 p-1 border border-forest/20 font-mono font-bold text-dark outline-none text-xs"
                              />
                            </div>

                            <div>
                              <span className="text-[9px] text-dark/50 uppercase block font-semibold">Total COGS / kg</span>
                              <span className="font-mono font-bold text-forest text-sm">₹{totalCogsPerKg}</span>
                            </div>

                            <div className="text-right sm:text-left">
                              <span className="text-[9px] text-dark/50 uppercase block font-semibold">Margin / kg</span>
                              <span className="font-mono font-bold text-green-700 text-sm">₹{profitPerKg} ({marginPct}%)</span>
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
                    const totalShipping = dbOrders.length * estimatedShippingCostPerOrder;
                    const netProfit = totalRevenue - totalCogs;
                    const overallMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

                    return (
                      <div className="space-y-6">
                        <div className="border-b border-forest/10 pb-3 flex justify-between items-center">
                          <h4 className="text-sm font-serif font-bold text-forest uppercase tracking-wider">3. Live Order Profitability Summary ({dbOrders.length} Orders)</h4>
                          <div className="flex items-center gap-2 bg-white border border-forest/20 px-3 py-1 text-xs">
                            <span className="text-[10px] text-dark/70 font-semibold uppercase">Courier / Shipping Fee (₹/Order):</span>
                            <input
                              type="number"
                              value={estimatedShippingCostPerOrder}
                              onChange={(e) => setEstimatedShippingCostPerOrder(Number(e.target.value))}
                              className="w-16 p-1 border border-forest/30 font-mono font-bold text-forest text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
                          <div className="p-4 border border-forest/10 bg-white shadow-xs">
                            <span className="text-[10px] text-dark/60 uppercase font-semibold block">Total Revenue</span>
                            <span className="text-2xl font-serif font-bold text-forest mt-1 block">₹{totalRevenue.toLocaleString("en-IN")}</span>
                            <span className="text-[9px] text-dark/40">Gross customer payments</span>
                          </div>

                          <div className="p-4 border border-forest/10 bg-white shadow-xs">
                            <span className="text-[10px] text-dark/60 uppercase font-semibold block">Total Direct COGS</span>
                            <span className="text-2xl font-serif font-bold text-amber-700 mt-1 block">₹{totalCogs.toLocaleString("en-IN")}</span>
                            <span className="text-[9px] text-dark/40">Includes ₹{totalShipping.toLocaleString("en-IN")} total shipping</span>
                          </div>

                          <div className="p-4 border border-forest/10 bg-white shadow-xs">
                            <span className="text-[10px] text-dark/60 uppercase font-semibold block">Net Store Profit</span>
                            <span className="text-2xl font-serif font-bold text-green-700 mt-1 block">₹{netProfit.toLocaleString("en-IN")}</span>
                            <span className="text-[9px] text-dark/40">Revenue minus COGS &amp; Shipping</span>
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
                                  <th className="p-3 text-left">Order Items</th>
                                  <th className="p-3 text-right">Order Total</th>
                                  <th className="p-3 text-right">Prod COGS</th>
                                  <th className="p-3 text-right">Shipping</th>
                                  <th className="p-3 text-right">Total COGS</th>
                                  <th className="p-3 text-right">Net Profit</th>
                                  <th className="p-3 text-right">Margin %</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-forest/5 font-light">
                                {dbOrders.map((ord) => {
                                  const totalCogs = calculateOrderTotalCOGS(ord);
                                  const prodCogs = totalCogs - estimatedShippingCostPerOrder;
                                  const profit = ord.total - totalCogs;
                                  const margin = ord.total > 0 ? Math.round((profit / ord.total) * 100) : 0;
                                  const itemsText = ord.items?.map((i: any) => `${i.name} (${i.size}) x${i.quantity}`).join(", ") || "—";

                                  return (
                                    <tr key={ord.id} className="hover:bg-brand-bg/30 transition-colors">
                                      <td className="p-3 font-mono font-bold text-forest text-[11px]">{ord.orderNumber}</td>
                                      <td className="p-3">{ord.shippingName}</td>
                                      <td className="p-3 text-[11px] text-dark/70 max-w-xs truncate">{itemsText}</td>
                                      <td className="p-3 text-right font-mono font-bold">₹{ord.total}</td>
                                      <td className="p-3 text-right font-mono text-amber-800">₹{prodCogs}</td>
                                      <td className="p-3 text-right font-mono text-dark/70">₹{estimatedShippingCostPerOrder}</td>
                                      <td className="p-3 text-right font-mono font-bold text-amber-900">₹{totalCogs}</td>
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

              {/* BUSINESS EXPENSES & CAPITAL LEDGER TAB */}
              {activeTab === "expenses" && (
                <div className="space-y-8 text-left">
                  {/* Header */}
                  <div className="border-b border-forest/10 pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-serif text-forest font-semibold">Day 1 Business Expenses &amp; Capital Ledger</h3>
                      <p className="text-xs text-dark/60">
                        Log every rupee spent on seeds, bottles, boxes, travel, label printing, poly covers, and operational costs from Day 1
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  {(() => {
                    const totalExpenses = businessExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
                    const totalRevenue = dbOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
                    const netCashFlow = totalRevenue - totalExpenses;

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-brand-bg/40 border border-forest/15 p-4 rounded-sm">
                          <span className="text-[10px] text-dark/60 uppercase font-semibold block">Total Capital Spent (Day 1 - Now)</span>
                          <span className="text-2xl font-serif font-bold text-red-700 font-mono mt-1 block">
                            ₹{totalExpenses.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9px] text-dark/50 block mt-1">Total operational &amp; capital procurement</span>
                        </div>

                        <div className="bg-brand-bg/40 border border-forest/15 p-4 rounded-sm">
                          <span className="text-[10px] text-dark/60 uppercase font-semibold block">Total Store Sales Revenue</span>
                          <span className="text-2xl font-serif font-bold text-forest font-mono mt-1 block">
                            ₹{totalRevenue.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9px] text-dark/50 block mt-1">From {dbOrders.length} online orders</span>
                        </div>

                        <div className="bg-brand-bg/40 border border-forest/15 p-4 rounded-sm">
                          <span className="text-[10px] text-dark/60 uppercase font-semibold block">Net Business Surplus / Position</span>
                          <span className={`text-2xl font-serif font-bold font-mono mt-1 block ${netCashFlow >= 0 ? "text-green-700" : "text-amber-700"}`}>
                            {netCashFlow >= 0 ? `+₹${netCashFlow.toLocaleString("en-IN")}` : `-₹${Math.abs(netCashFlow).toLocaleString("en-IN")}`}
                          </span>
                          <span className="text-[9px] text-dark/50 block mt-1">Total Store Revenue minus Total Expenses</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Form to Add New Expense Log */}
                  <form onSubmit={handleAddExpense} className="bg-brand-bg/20 border border-forest/10 p-5 rounded-sm space-y-4">
                    <span className="text-xs font-serif font-bold text-forest uppercase tracking-wider block">
                      + Log New Business Expense / Procurement
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] text-forest/70 uppercase font-semibold block">Date</label>
                        <input
                          type="date"
                          value={newExpDate}
                          onChange={(e) => setNewExpDate(e.target.value)}
                          className="w-full p-2 border border-forest/20 bg-white outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-forest/70 uppercase font-semibold block">Category</label>
                        <select
                          value={newExpCategory}
                          onChange={(e) => setNewExpCategory(e.target.value)}
                          className="w-full p-2 border border-forest/20 bg-white outline-none font-semibold"
                        >
                          <option value="Seeds">Seeds &amp; Raw Grain</option>
                          <option value="Bottles">Oil Bottles &amp; Jars</option>
                          <option value="Cardboard Boxes">Cardboard Shipping Boxes</option>
                          <option value="Label Printing">Label &amp; Sticker Printing</option>
                          <option value="Covers &amp; Packing">Poly Covers &amp; Bubble Wrap</option>
                          <option value="Travelling">Travelling &amp; Freight</option>
                          <option value="Labor &amp; Pressing">Pressing &amp; Labor Charges</option>
                          <option value="Machinery">Machinery &amp; Equipment</option>
                          <option value="Marketing">Marketing &amp; Branding</option>
                          <option value="Misc">Miscellaneous Expense</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-forest/70 uppercase font-semibold block">Item / Description</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Organic Groundnut Seeds"
                          value={newExpItem}
                          onChange={(e) => setNewExpItem(e.target.value)}
                          className="w-full p-2 border border-forest/20 bg-white outline-none text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-forest/70 uppercase font-semibold block">Quantity / Weight</label>
                        <input
                          type="text"
                          placeholder="500 kg / 1000 pcs"
                          value={newExpQty}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewExpQty(val);
                            const q = parseFloat(val);
                            const u = parseFloat(newExpUnitCost);
                            if (q > 0 && u > 0) setNewExpAmount(String(Math.round(q * u)));
                          }}
                          className="w-full p-2 border border-forest/20 bg-white outline-none text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-forest/70 uppercase font-semibold block">Rate (₹/kg or ₹/pc)</label>
                        <input
                          type="number"
                          placeholder="125"
                          value={newExpUnitCost}
                          onChange={(e) => {
                            const uVal = e.target.value;
                            setNewExpUnitCost(uVal);
                            const u = parseFloat(uVal);
                            const q = parseFloat(newExpQty);
                            if (q > 0 && u > 0) setNewExpAmount(String(Math.round(q * u)));
                          }}
                          className="w-full p-2 border border-forest/20 bg-white font-mono outline-none text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-forest/70 uppercase font-semibold block">Total Amount (₹)</label>
                        <input
                          type="number"
                          required
                          placeholder="62500"
                          value={newExpAmount}
                          onChange={(e) => setNewExpAmount(e.target.value)}
                          className="w-full p-2 border border-forest/20 bg-white font-bold font-mono outline-none text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      <div className="space-y-1 sm:col-span-3">
                        <label className="text-[10px] text-forest/70 uppercase font-semibold block">Supplier / Notes (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Purchased from Saurashtra farm direct mandi batch #4"
                          value={newExpNotes}
                          onChange={(e) => setNewExpNotes(e.target.value)}
                          className="w-full p-2 text-xs border border-forest/20 bg-white outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-forest hover:bg-forest-light text-white text-xs font-bold uppercase tracking-wider px-5 py-2 transition-colors w-full"
                      >
                        Log Business Expense
                      </button>
                    </div>
                  </form>

                  {/* Expenses Ledger Table */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-forest/10 pb-2">
                      <h4 className="text-sm font-serif font-bold text-forest uppercase tracking-wider">Day 1 Expense &amp; Procurement Log</h4>
                      <span className="text-[10px] text-gold font-semibold uppercase">{businessExpenses.length} Expense Records</span>
                    </div>

                    <div className="overflow-x-auto border border-forest/10 bg-white">
                      <table className="w-full text-xs font-light text-dark divide-y divide-forest/10">
                        <thead className="bg-brand-bg/50 text-[9px] uppercase font-bold text-forest">
                          <tr>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Category</th>
                            <th className="p-3 text-left">Item Description</th>
                            <th className="p-3 text-left">Quantity</th>
                            <th className="p-3 text-right">Cost / Rate (₹/unit)</th>
                            <th className="p-3 text-right">Total Amount (₹)</th>
                            <th className="p-3 text-left">Notes / Supplier</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-forest/5 font-mono">
                          {businessExpenses.map((exp) => (
                            <tr key={exp.id} className="hover:bg-forest/5 transition-colors">
                              <td className="p-3 text-[11px] font-semibold text-dark/70">{exp.date}</td>
                              <td className="p-3">
                                <span className="bg-forest/10 text-forest text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs font-sans">
                                  {exp.category}
                                </span>
                              </td>
                              <td className="p-3 font-sans font-semibold text-forest">{exp.item}</td>
                              <td className="p-3 text-dark/70">{exp.quantity}</td>
                              <td className="p-3 text-right text-dark/80">
                                {exp.unitCost ? `₹${exp.unitCost}` : "—"}
                              </td>
                              <td className="p-3 text-right font-bold text-red-700">₹{exp.amount.toLocaleString("en-IN")}</td>
                              <td className="p-3 font-sans text-[11px] text-dark/60 max-w-xs truncate">{exp.notes || "-"}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => setBusinessExpenses(businessExpenses.filter((e) => e.id !== exp.id))}
                                  className="text-red-600 hover:text-red-800 text-[10px] uppercase font-bold font-sans"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
