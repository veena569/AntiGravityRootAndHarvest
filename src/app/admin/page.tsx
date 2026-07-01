"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Settings, Plus, ShoppingBag, BarChart3, Database, Tag, Newspaper, Users, Eye, Check } from "lucide-react";
import { useApp, Product } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AdminPage() {
  const { products, orders } = useApp();
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "coupons" | "analytics" | "content">("orders");

  // Mock inventories
  const [inventoryList, setInventoryList] = useState([
    { name: "Wood Pressed Groundnut Oil (1 L)", sku: "RH-GNT-1L", stock: 124, limit: 20 },
    { name: "Wood Pressed Groundnut Oil (5 L)", sku: "RH-GNT-5L", stock: 18, limit: 10 },
    { name: "Wood Pressed Black Mustard Oil (1 L)", sku: "RH-MST-1L", stock: 89, limit: 15 },
    { name: "Raw Himalayan Honey (500 g)", sku: "RH-HNY-500G", stock: 45, limit: 15 }
  ]);

  // Mock Coupons
  const [coupons, setCoupons] = useState([
    { code: "FOUNDER20", discount: "20% OFF", status: "Active", uses: 42 },
    { code: "HONEST10", discount: "10% OFF", status: "Active", uses: 124 },
    { code: "HARVEST50", discount: "₹50 OFF", status: "Expired", uses: 18 }
  ]);

  // Mock Content (Blogs/Recipes)
  const [contentList, setContentList] = useState([
    { title: "Sowing bold peanut peanuts in rain-fed Saurashtra", type: "Blog", author: "Abhinav Patel", date: "June 25, 2026" },
    { title: "Traditional Gujarati Pooris cooked in wood-pressed oil", type: "Recipe", author: "Devendra Patel", date: "June 21, 2026" }
  ]);

  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;
    setCoupons([
      ...coupons,
      { code: newCouponCode.toUpperCase().trim(), discount: newCouponDiscount, status: "Active", uses: 0 }
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24 text-left">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-forest/5 pb-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">FOUNDERS' PANEL</span>
              <h1 className="text-3xl md:text-4xl font-serif text-forest font-light">Admin Dashboard</h1>
            </div>
            
            <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider text-forest bg-white border p-4 shrink-0">
              <div className="text-left">
                <span className="text-[9px] text-dark/50 block">Operational Node</span>
                <span>AHMEDABAD HUB (GUJARAT)</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Operational Revenue", val: `₹${orders.reduce((acc, o) => acc + o.total, 0) + 54980}`, desc: "Calculated from order registers" },
              { label: "Fulfillment Orders", val: orders.length + 32, desc: "Pending dispatches: 1" },
              { label: "Batches Sourced", val: products.length, desc: "Active traced farm batches" },
              { label: "Purity Audits", val: "100%", desc: "Verified laboratory trace clearances" }
            ].map((metric, i) => (
              <div key={i} className="bg-white border border-forest/5 p-6 shadow-sm">
                <span className="text-[10px] text-dark/60 uppercase block">{metric.label}</span>
                <span className="text-2xl font-serif font-bold text-forest mt-1 block">{metric.val}</span>
                <span className="text-[9px] text-gold mt-0.5 block font-light">{metric.desc}</span>
              </div>
            ))}
          </div>

          {/* Nav and Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Tabs Sidebar (Left - 3 columns) */}
            <div className="lg:col-span-3 bg-white border border-forest/5 p-6 space-y-2">
              {[
                { id: "orders", label: "Orders Register", icon: <ShoppingBag className="w-4 h-4" /> },
                { id: "inventory", label: "Inventory Logs", icon: <Database className="w-4 h-4" /> },
                { id: "analytics", label: "Analytics Charts", icon: <BarChart3 className="w-4 h-4" /> },
                { id: "coupons", label: "Coupons Manager", icon: <Tag className="w-4 h-4" /> },
                { id: "content", label: "Blogs & Recipes", icon: <Newspaper className="w-4 h-4" /> }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full p-4 text-xs font-semibold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                      isActive ? "bg-forest text-brand-bg font-bold" : "text-forest hover:bg-forest/5"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Panel Area (Right - 9 columns) */}
            <div className="lg:col-span-9 space-y-6 bg-white border border-forest/5 p-8 shadow-sm">
              
              {/* Orders Register */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/5 pb-3">Active Order Book</h3>
                  
                  {orders.length === 0 ? (
                    <p className="text-xs text-dark/60">No new orders placed. Default mock bookings active.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-light text-dark divide-y divide-forest/10">
                        <thead className="bg-brand-bg text-[10px] uppercase font-semibold text-forest text-left">
                          <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-forest/5">
                          {orders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-brand-bg/20">
                              <td className="p-3 font-mono font-semibold">{ord.orderNumber}</td>
                              <td className="p-3">{ord.address.name}</td>
                              <td className="p-3 font-semibold">₹{ord.total}</td>
                              <td className="p-3 uppercase">{ord.paymentMethod}</td>
                              <td className="p-3">
                                <span className="text-[9px] bg-green-50 text-green-700 font-bold px-2 py-0.5 uppercase">
                                  {ord.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Inventory Logs */}
              {activeTab === "inventory" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/5 pb-3">Operational Stock Register</h3>
                  
                  <div className="space-y-4">
                    {inventoryList.map((item) => (
                      <div key={item.sku} className="flex justify-between items-center p-4 border border-forest/5 bg-brand-bg/30 text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-forest block">{item.name}</span>
                          <span className="text-[10px] font-mono text-dark/50">SKU: {item.sku}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-[10px] text-dark/60 block">In Stock</span>
                            <span className={`font-bold ${item.stock <= item.limit ? "text-red-600 animate-pulse" : "text-forest"}`}>
                              {item.stock} Units
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDecrementStock(item.sku)}
                              className="px-2 py-1 bg-white border border-forest/15 font-bold hover:bg-forest/5"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleIncrementStock(item.sku)}
                              className="px-2 py-1 bg-forest text-brand-bg font-bold hover:bg-forest-light"
                            >
                              +10
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Charts */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/5 pb-3">Monthly Yield & Sales Trajectory</h3>
                  
                  <div className="space-y-6 text-xs">
                    {/* Mock Sales Chart SVG */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-dark/60 uppercase block">Weekly Sales Revenue Trajectory</span>
                      <div className="w-full aspect-[21/9] border border-forest/10 relative bg-brand-bg flex items-end p-4">
                        <svg className="absolute inset-0 w-full h-full p-6 text-gold" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {/* Grid lines */}
                          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(30,74,58,0.05)" strokeWidth="0.5" />
                          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(30,74,58,0.05)" strokeWidth="0.5" />
                          <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(30,74,58,0.05)" strokeWidth="0.5" />
                          
                          {/* Trajectory vector */}
                          <polyline
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            points="0,85 20,60 40,75 60,35 80,45 100,10"
                          />
                        </svg>
                        <div className="absolute bottom-2 left-6 right-6 flex justify-between text-[8px] text-dark/50 font-mono">
                          <span>Week 1</span>
                          <span>Week 2</span>
                          <span>Week 3</span>
                          <span>Week 4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coupons Manager */}
              {activeTab === "coupons" && (
                <div className="space-y-8">
                  <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/5 pb-3">Coupons Manager</h3>
                  
                  {/* Create coupon form */}
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

                  {/* List of active codes */}
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

              {/* Blogs & Recipes Publishing */}
              {activeTab === "content" && (
                <div className="space-y-8">
                  <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/5 pb-3">Publication Engine</h3>
                  
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
                  
                  {/* Simulated draft publisher warning */}
                  <div className="bg-brand-bg p-4 border border-gold/20 text-xs flex gap-3 text-forest">
                    <span>Publication Engine is synced with the Saurashtra blog sub-ledger. Select 'Content Management System' from settings to add drafts.</span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
