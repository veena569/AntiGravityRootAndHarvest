"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, MapPin, Package, Heart, RefreshCw, Star, Trash2, Calendar, ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Button, 
  Heading, 
  Container, 
  Section, 
  Price, 
  Badge 
} from "@/components/ui";

export default function AccountPage() {
  const {
    products,
    wishlist,
    toggleWishlist,
    addresses,
    addAddress,
    removeAddress,
    orders,
    subscriptions,
    updateSubscriptionStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "wishlist" | "subscriptions">("orders");

  // Address form fields
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddAddr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrLine1 || !addrCity || !addrState || !addrPincode) return;

    addAddress({
      name: addrName,
      phone: `+91 ${addrPhone}`,
      addressLine1: addrLine1,
      addressLine2: addrLine2,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      isDefault: addresses.length === 0
    });

    // Reset fields
    setAddrName("");
    setAddrPhone("");
    setAddrLine1("");
    setAddrLine2("");
    setAddrCity("");
    setAddrState("");
    setAddrPincode("");
    setShowAddForm(false);
  };

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24 text-left">
        <Container size="lg" className="space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-forest/10 pb-8">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">CUSTOMER PORTAL</span>
              <Heading level="h1" className="text-forest tracking-tight">My Account</Heading>
            </div>
            
            <div className="flex items-center gap-4 bg-white border border-forest/10 p-5 rounded-sm shadow-sm shrink-0">
              <div className="w-12 h-12 rounded-full bg-forest text-brand-bg flex items-center justify-center font-bold font-serif text-xl border border-gold">
                AP
              </div>
              <div>
                <Heading level="h5" className="text-forest">Abhinav Patel</Heading>
                <p className="text-xs text-dark/70 font-light mt-0.5">hello@rootandharvest.in</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Sidebar Navigation (Left - 3 columns) */}
            <div className="lg:col-span-3 bg-white border border-forest/10 p-6 rounded-sm shadow-sm space-y-2 sticky top-32">
              {[
                { id: "orders", label: "Order History", icon: <Package className="w-5 h-5" /> },
                { id: "subscriptions", label: "Subscriptions", icon: <RefreshCw className="w-5 h-5" /> },
                { id: "addresses", label: "Saved Addresses", icon: <MapPin className="w-5 h-5" /> },
                { id: "wishlist", label: "My Wishlist", icon: <Heart className="w-5 h-5" /> }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full p-4 text-sm font-semibold uppercase tracking-wider flex items-center gap-3 rounded-sm transition-all ${
                      isActive ? "bg-forest text-white shadow-sm" : "text-forest/80 hover:bg-forest/5 hover:text-forest"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Dashboard Content (Right - 9 columns) */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Order History */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <Heading level="h3" className="text-forest">Your Orders</Heading>
                  
                  {orders.length === 0 ? (
                    <div className="bg-white border border-forest/10 rounded-sm p-16 text-center space-y-6 shadow-sm">
                      <Package className="w-10 h-10 text-gold mx-auto" />
                      <Heading level="h5" className="text-forest">No order placement records found.</Heading>
                      <Button href="/products" size="lg">
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {orders.map((ord) => (
                        <div key={ord.id} className="bg-white border border-forest/10 rounded-sm p-6 md:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-wrap justify-between items-center gap-6 border-b border-forest/10 pb-6 text-sm font-light">
                            <div className="space-y-1">
                              <span className="text-xs text-dark/70 block uppercase tracking-wider font-semibold">Order ID</span>
                              <span className="font-mono font-medium text-forest">{ord.orderNumber}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-dark/70 block uppercase tracking-wider font-semibold">Placed On</span>
                              <span className="font-medium text-dark/90">{ord.date}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-dark/70 block uppercase tracking-wider font-semibold">Order Status</span>
                              <Badge variant="outline" className="border-forest/30 text-forest">{ord.orderStatus}</Badge>
                            </div>
                            <div className="space-y-1 text-right">
                              <span className="text-xs text-dark/70 block uppercase tracking-wider font-semibold">Total Paid</span>
                              <Price amount={ord.total} size="sm" />
                            </div>
                          </div>

                          {/* Ordered items details */}
                          <div className="divide-y divide-forest/5">
                            {ord.items.map((item, i) => (
                              <div key={i} className="py-4 flex justify-between items-center gap-4 text-sm">
                                <div className="flex gap-4 items-center">
                                  <div className="relative w-16 h-20 border border-forest/5 rounded-sm bg-brand-bg shrink-0 overflow-hidden shadow-sm">
                                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-medium text-forest block">{item.product.name}</span>
                                    <span className="text-xs text-dark/70 block">{item.size} × {item.quantity}</span>
                                  </div>
                                </div>
                                <Price amount={item.price * item.quantity} size="sm" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subscriptions */}
              {activeTab === "subscriptions" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-forest/10">
                    <Heading level="h3" className="text-forest">Active Subscriptions</Heading>
                    <Button
                      href="/products/groundnut-oil"
                      variant="outline"
                      size="sm"
                    >
                      New Delivery Schedule
                    </Button>
                  </div>

                  {subscriptions.length === 0 ? (
                    <div className="bg-white border border-forest/10 rounded-sm p-16 text-center space-y-6 shadow-sm">
                      <RefreshCw className="w-10 h-10 text-gold mx-auto" />
                      <Heading level="h5" className="text-forest">No active recurring schedules.</Heading>
                      <p className="text-sm text-dark/70 max-w-md mx-auto font-light leading-relaxed">
                        Subscribe to your favorite cooking oils and save 10% on every monthly or bi-monthly delivery.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {subscriptions.map((sub) => (
                        <div key={sub.id} className="bg-white border border-forest/10 rounded-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-sm">
                          <div className="flex gap-5 items-center">
                            <div className="relative w-20 h-24 bg-brand-bg border border-forest/5 rounded-sm shrink-0 shadow-sm overflow-hidden">
                              <Image src={sub.product.image} alt={sub.product.name} fill className="object-cover" />
                            </div>
                            <div className="space-y-1.5 text-sm">
                              <Heading level="h5" className="text-forest">{sub.product.name}</Heading>
                              <p className="text-dark/70 font-light">Size: {sub.size} | Frequency: <span className="capitalize font-medium text-forest">{sub.frequency}</span></p>
                              <p className="text-gold font-medium">Price per ship: ₹{sub.price} (10% Sub-Discount)</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-6 items-center">
                            <div className="text-sm text-left">
                              <span className="text-xs text-dark/70 uppercase tracking-wider font-semibold block mb-1">Next Dispatch</span>
                              <span className="font-medium flex items-center gap-2 text-forest">
                                <Calendar className="w-4 h-4 text-gold" />
                                {sub.nextDelivery}
                              </span>
                            </div>

                            {sub.status === "active" ? (
                              <Button
                                variant="outline"
                                onClick={() => updateSubscriptionStatus(sub.id, "paused")}
                                size="sm"
                              >
                                Pause Delivery
                              </Button>
                            ) : (
                              <Button
                                onClick={() => updateSubscriptionStatus(sub.id, "active")}
                                size="sm"
                              >
                                Resume Delivery
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Saved Addresses */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-forest/10">
                    <Heading level="h3" className="text-forest">Saved Addresses</Heading>
                    <Button
                      variant={showAddForm ? "outline" : "primary"}
                      onClick={() => setShowAddForm(!showAddForm)}
                      size="sm"
                    >
                      {showAddForm ? "Cancel Form" : "Add Address"}
                    </Button>
                  </div>

                  {/* Add Address Form overlay */}
                  <AnimatePresence>
                    {showAddForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white border border-forest/10 rounded-sm p-8 shadow-sm"
                      >
                        <form onSubmit={handleAddAddr} className="space-y-5 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-widest text-forest/70 font-semibold block">Full Name</label>
                              <input
                                type="text"
                                required
                                value={addrName}
                                onChange={(e) => setAddrName(e.target.value)}
                                className="w-full text-sm p-3 border border-forest/20 rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none bg-brand-bg/30 transition-all"
                                placeholder="Abhinav Patel"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-widest text-forest/70 font-semibold block">Phone</label>
                              <input
                                type="tel"
                                required
                                value={addrPhone}
                                onChange={(e) => setAddrPhone(e.target.value)}
                                className="w-full text-sm p-3 border border-forest/20 rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none bg-brand-bg/30 transition-all"
                                placeholder="9876543210"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-forest/70 font-semibold block">Address Line 1</label>
                            <input
                              type="text"
                              required
                              value={addrLine1}
                              onChange={(e) => setAddrLine1(e.target.value)}
                              className="w-full text-sm p-3 border border-forest/20 rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none bg-brand-bg/30 transition-all"
                              placeholder="Flat/House number"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-forest/70 font-semibold block">Address Line 2 (Optional)</label>
                            <input
                              type="text"
                              value={addrLine2}
                              onChange={(e) => setAddrLine2(e.target.value)}
                              className="w-full text-sm p-3 border border-forest/20 rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none bg-brand-bg/30 transition-all"
                              placeholder="Street address, colony"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-widest text-forest/70 font-semibold block">City</label>
                              <input
                                type="text"
                                required
                                value={addrCity}
                                onChange={(e) => setAddrCity(e.target.value)}
                                className="w-full text-sm p-3 border border-forest/20 rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none bg-brand-bg/30 transition-all"
                                placeholder="Bengaluru"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-widest text-forest/70 font-semibold block">State</label>
                              <input
                                type="text"
                                required
                                value={addrState}
                                onChange={(e) => setAddrState(e.target.value)}
                                className="w-full text-sm p-3 border border-forest/20 rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none bg-brand-bg/30 transition-all"
                                placeholder="Karnataka"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-widest text-forest/70 font-semibold block">Pincode</label>
                              <input
                                type="text"
                                required
                                value={addrPincode}
                                onChange={(e) => setAddrPincode(e.target.value)}
                                className="w-full text-sm p-3 border border-forest/20 rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none bg-brand-bg/30 transition-all"
                                placeholder="560038"
                              />
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button type="submit" size="md">
                              Save Address
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-white border border-forest/10 rounded-sm p-6 space-y-4 shadow-sm relative hover:shadow-md transition-shadow">
                        <div className="space-y-1.5 text-sm font-light">
                          <div className="flex gap-3 items-center">
                            <span className="font-semibold text-forest text-base">{addr.name}</span>
                            {addr.isDefault && (
                              <Badge variant="outline" className="border-gold/40 text-gold bg-gold/5">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-dark/80 mt-2">{addr.addressLine1}</p>
                          {addr.addressLine2 && <p className="text-dark/80">{addr.addressLine2}</p>}
                          <p className="text-dark/80">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-dark/70 mt-2 font-medium">Phone: {addr.phone}</p>
                        </div>

                        <button
                          onClick={() => removeAddress(addr.id)}
                          className="absolute bottom-6 right-6 text-forest/40 hover:text-gold transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlist */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <Heading level="h3" className="text-forest pb-2 border-b border-forest/10">Your Wishlist</Heading>
                  
                  {wishlist.length === 0 ? (
                    <div className="bg-white border border-forest/10 rounded-sm p-16 text-center space-y-6 shadow-sm">
                      <Heart className="w-10 h-10 text-gold mx-auto" />
                      <Heading level="h5" className="text-forest">Your wishlist is empty.</Heading>
                      <Button href="/products" size="lg">
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {wishlistedProducts.map((p) => (
                        <div key={p.id} className="bg-white border border-forest/10 rounded-sm p-6 flex gap-5 items-center shadow-sm relative group hover:border-gold/30 hover:shadow-md transition-all">
                          <div className="relative w-20 h-24 bg-brand-bg rounded-sm overflow-hidden shrink-0 shadow-sm border border-forest/5">
                            <Image src={p.image} alt={p.name} fill className="object-cover transition-transform group-hover:scale-105 duration-500" />
                          </div>
                          <div className="space-y-1.5 text-sm">
                            <Heading level="h5" className="leading-snug text-forest group-hover:text-gold transition-colors">
                              <Link href={`/products/${p.id}`}>{p.name}</Link>
                            </Heading>
                            <p className="text-xs text-dark/70 font-light line-clamp-2">{p.shortDescription}</p>
                            <Link href={`/products/${p.id}`} className="text-[10px] font-bold text-gold uppercase tracking-widest inline-block pt-1">
                              View Product
                            </Link>
                          </div>

                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="absolute top-4 right-4 text-gold/70 hover:text-red-500 transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </Container>
      </main>

      <Footer />
    </>
  );
}
