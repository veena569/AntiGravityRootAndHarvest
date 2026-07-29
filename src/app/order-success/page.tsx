"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Download, ShoppingBag, MapPin, Truck, X, Clock, Package, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [showTrackingModal, setShowTrackingModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchOrderDetails(retryCount = 0) {
      if (!orderId) return;

      try {
        const res = await fetch(`/api/get-order?id=${orderId}`);
        if (res.status === 401) {
          if (retryCount < 1) {
            console.log("[ORDER_SUCCESS] Unauthorized response. Attempting silent session refresh...");
            const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
            if (refreshRes.ok) {
              console.log("[ORDER_SUCCESS] Token refresh succeeded. Retrying order fetch...");
              await fetchOrderDetails(retryCount + 1);
              return;
            }
          }
          if (active) setError("Unauthorized");
          return;
        }

        const data = await res.json();
        if (!active) return;

        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
      } catch (err: any) {
        if (active) setError(err.message || "Failed to fetch order details");
      }
    }

    fetchOrderDetails();

    return () => {
      active = false;
    };
  }, [orderId]);

  if (error) {
    const isUnauthorized = error === "Unauthorized" || error.toLowerCase().includes("unauthorized") || error.toLowerCase().includes("auth");
    
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif text-forest">
            {isUnauthorized ? "Authentication Required" : "Something Went Wrong"}
          </h2>
          <p className="text-sm text-dark/70 leading-relaxed">
            {isUnauthorized 
              ? "Your session has expired or you are not signed in. Please log in to securely view your order confirmation details."
              : `We encountered an error loading your order details: ${error}`}
          </p>
        </div>
        {isUnauthorized && (
          <div className="pt-2">
            <Link
              href={`/login?callbackUrl=/order-success?id=${orderId}`}
              className="inline-block px-6 py-3 bg-forest hover:bg-forest-light text-white text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              Sign In to View Order
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="text-2xl font-serif text-forest">Loading order details...</h2>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-24 px-6">
      
      {/* Animated Success Checkbox */}
      <div className="text-center space-y-8 pt-12">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="w-32 h-32 bg-forest/5 rounded-full flex items-center justify-center mx-auto border border-forest/20 relative"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
            className="absolute inset-2 bg-forest rounded-full flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-white stroke-[3]" />
          </motion.div>
        </motion.div>

        <div className="space-y-4">
          <span className="text-xs uppercase tracking-[0.4em] text-gold font-semibold block">Order Confirmed</span>
          <h1 className="text-4xl md:text-5xl font-serif text-forest tracking-tight">Thank You for Your Trust</h1>
          <p className="text-lg text-dark/70 font-light max-w-xl mx-auto leading-relaxed">
            Honest food begins with honest roots. Your order <span className="font-mono text-forest bg-forest/5 px-2 py-1">{order.orderNumber}</span> is being carefully prepared.
          </p>
        </div>
      </div>

      {/* Track & Continue Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <button
          onClick={() => setShowTrackingModal(true)}
          className="px-8 py-4 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-3"
        >
          <Truck className="w-4 h-4" />
          Track Order
        </button>
        <Link
          href="/products"
          className="px-8 py-4 border border-forest/20 text-forest text-xs uppercase tracking-widest font-semibold hover:border-forest transition-colors flex items-center justify-center gap-3 bg-white"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="flex justify-center pb-20">
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="text-[10px] uppercase tracking-widest text-dark/50 hover:text-gold transition-colors underline flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          View &amp; Download Receipt
        </button>
      </div>

      {/* ── Center Flex container for printable invoice modal ── */}
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 print:static print:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvoiceModal(false)}
              className="fixed inset-0 bg-black backdrop-blur-sm print:hidden"
            />
            {/* Centered Modal Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white shadow-2xl overflow-y-auto max-h-[90vh] w-full max-w-3xl border border-forest/10 p-8 md:p-12 text-left rounded-sm z-50 relative print:static print:max-h-none print:border-none print:shadow-none print:w-full"
            >
              <div className="flex justify-between items-center mb-8 border-b border-forest/10 pb-4 print:hidden">
                <span className="text-xs uppercase tracking-widest text-forest font-bold">Tax Invoice Receipt</span>
                <div className="flex gap-4">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 border border-forest/20 text-xs font-semibold uppercase tracking-widest hover:border-forest"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="px-4 py-2 bg-forest text-white text-xs font-semibold uppercase tracking-widest"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Invoice Layout */}
              <div className="space-y-10 font-light text-xs text-dark leading-relaxed">
                
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-serif tracking-[0.2em] uppercase text-forest font-semibold leading-none">Root &amp; Harvest</h2>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-gold mt-2 leading-none font-medium block">From Trusted Farms to Your Family.</span>
                    <p className="mt-6 text-[11px] text-dark/70">
                      Hyderabad, India<br />
                      hello@rootandharvest.in | www.rootandharvest.in<br />
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-serif text-forest uppercase font-bold tracking-wider">TAX INVOICE</h3>
                    <p className="mt-2 text-[11px] text-dark/70">
                      Invoice No: <span className="font-mono font-semibold">{order.orderNumber}</span><br />
                      Date: {new Date(order.createdAt).toLocaleDateString()}<br />
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-forest/10" />

                <div className="grid grid-cols-2 gap-8 text-[11px]">
                  <div>
                    <p className="uppercase tracking-widest text-forest/60 font-semibold mb-3">Billing &amp; Shipping</p>
                    <p className="font-semibold text-forest text-xs">{order.shippingName}</p>
                    <p className="text-dark/80 mt-1">{order.shippingAddress1}</p>
                    {order.shippingAddress2 && <p className="text-dark/80">{order.shippingAddress2}</p>}
                    <p className="text-dark/80">{order.shippingCity}, {order.shippingState} - {order.shippingPincode}</p>
                    <p className="text-dark/80">Phone: {order.shippingPhone}</p>
                  </div>
                </div>

                <div className="border border-forest/10 rounded-sm overflow-hidden">
                  <div className="grid grid-cols-12 bg-forest/5 p-4 text-[10px] font-semibold uppercase tracking-widest text-forest border-b border-forest/10">
                    <div className="col-span-6">Harvest Item Description</div>
                    <div className="col-span-2 text-center">Unit Price</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Net Amount</div>
                  </div>
                  <div className="divide-y divide-forest/10">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 p-4 text-xs items-center">
                        <div className="col-span-6">
                          <p className="font-medium text-forest text-sm">{item.name}</p>
                          <p className="text-dark/60 text-[10px] mt-1">
                            Size: {item.size} {item.bottleType ? `(${item.bottleType})` : ""}
                          </p>
                        </div>
                        <div className="col-span-2 text-center">₹{item.price}</div>
                        <div className="col-span-2 text-center">{item.quantity}</div>
                        <div className="col-span-2 text-right font-medium">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-start gap-8 pt-4">
                  <div className="text-[11px] text-dark/70 max-w-md">
                    <p className="font-medium text-forest">Declaration</p>
                    <p className="mt-2 leading-relaxed">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. These unrefined oils are sediment-filtered with no chemicals added.</p>
                  </div>
                  <div className="min-w-[260px] space-y-4 text-xs bg-forest/5 p-6 rounded-sm">
                    <div className="flex justify-between border-t border-forest/10 pt-4 text-sm font-serif font-bold text-black">
                      <span>Invoice Total</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Center Flex container for tracking order modal ── */}
      <AnimatePresence>
        {showTrackingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTrackingModal(false)}
              className="fixed inset-0 bg-black backdrop-blur-sm"
            />
            {/* Centered Modal Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white shadow-2xl w-full max-w-lg border border-forest/10 p-8 text-left rounded-sm z-50 relative"
            >
              <button
                onClick={() => setShowTrackingModal(false)}
                className="absolute top-4 right-4 p-2 text-dark/40 hover:text-forest transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">Live Tracking Status</span>
                  <h3 className="text-2xl font-serif text-forest mt-1">Track Order #{order.orderNumber}</h3>
                  <p className="text-xs text-dark/50 mt-1">Carrier: Delhivery Express | Estimated Delivery: 2-3 Days</p>
                </div>

                <div className="h-[1px] bg-forest/10" />

                {/* Timeline */}
                <div className="relative pl-6 space-y-8">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-forest/10" />
                  
                  {/* Timeline point 1: Order Placed */}
                  <div className="relative flex gap-4 items-start">
                    <div className="absolute -left-[24px] w-4.5 h-4.5 rounded-full bg-green-500 flex items-center justify-center text-white border-2 border-white shadow-sm">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-forest">Order Placed</p>
                      <p className="text-[10px] text-dark/50 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                      <p className="text-xs text-dark/70 mt-1">Your order was successfully placed and verified.</p>
                    </div>
                  </div>

                  {/* Timeline point 2: Preparing & Packing */}
                  {(() => {
                    const status = order.orderStatus || "placed";
                    const isDone = ["packed", "shipped", "out_for_delivery", "delivered"].includes(status);
                    const isActive = status === "placed";
                    
                    return (
                      <div className={`relative flex gap-4 items-start ${!isDone && !isActive ? "opacity-50" : ""}`}>
                        <div className={`absolute -left-[24px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                          isDone ? "bg-green-500 text-white" : isActive ? "bg-forest text-white animate-pulse" : "bg-white border-forest/30 text-dark/30"
                        }`}>
                          {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Clock className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${isDone || isActive ? "text-forest" : ""}`}>Preparing &amp; Packing</p>
                          {isActive && <p className="text-[10px] text-gold font-semibold uppercase tracking-wider mt-0.5">In Progress</p>}
                          {isDone && <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider mt-0.5">Completed</p>}
                          <p className="text-xs text-dark/70 mt-1">
                            {isDone ? "Your items have been fresh wood-pressed and packed." : "We are wood-pressing fresh items and carefully packing your order."}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Timeline point 3: Shipped */}
                  {(() => {
                    const status = order.orderStatus || "placed";
                    const isDone = ["shipped", "out_for_delivery", "delivered"].includes(status);
                    const isActive = status === "packed";
                    
                    return (
                      <div className={`relative flex gap-4 items-start ${!isDone && !isActive ? "opacity-50" : ""}`}>
                        <div className={`absolute -left-[24px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                          isDone ? "bg-green-500 text-white" : isActive ? "bg-forest text-white animate-pulse" : "bg-white border-forest/30 text-dark/30"
                        }`}>
                          {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Package className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${isDone || isActive ? "text-forest" : ""}`}>Shipped</p>
                          {isActive && <p className="text-[10px] text-gold font-semibold uppercase tracking-wider mt-0.5">In Progress</p>}
                          {isDone && <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider mt-0.5">Completed</p>}
                          <p className="text-xs text-dark/70 mt-1">
                            {isDone ? "Courier has picked up your order and it is on the way." : "Pending courier pickup."}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Timeline point 4: Out for Delivery */}
                  {(() => {
                    const status = order.orderStatus || "placed";
                    const isDone = ["delivered"].includes(status);
                    const isActive = status === "out_for_delivery";
                    
                    return (
                      <div className={`relative flex gap-4 items-start ${!isDone && !isActive ? "opacity-50" : ""}`}>
                        <div className={`absolute -left-[24px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                          isDone ? "bg-green-500 text-white" : isActive ? "bg-forest text-white animate-pulse" : "bg-white border-forest/30 text-dark/30"
                        }`}>
                          {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Truck className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${isDone || isActive ? "text-forest" : ""}`}>Out for Delivery</p>
                          {isActive && <p className="text-[10px] text-gold font-semibold uppercase tracking-wider mt-0.5">In Progress</p>}
                          {isDone && <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider mt-0.5">Completed</p>}
                          <p className="text-xs text-dark/70 mt-1">
                            {isDone ? "Order has arrived in your city and is out for delivery." : isActive ? "Order is out with Delhivery Express courier for delivery." : "Pending arrival at nearest hub."}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Timeline point 5: Delivered */}
                  {(() => {
                    const status = order.orderStatus || "placed";
                    const isDone = status === "delivered";
                    
                    return (
                      <div className={`relative flex gap-4 items-start ${!isDone ? "opacity-50" : ""}`}>
                        <div className={`absolute -left-[24px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                          isDone ? "bg-green-500 text-white" : "bg-white border-forest/30 text-dark/30"
                        }`}>
                          {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <MapPin className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${isDone ? "text-forest" : ""}`}>Delivered</p>
                          {isDone && <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider mt-0.5">Completed</p>}
                          <p className="text-xs text-dark/70 mt-1">
                            {isDone ? "Delivered successfully! Enjoy your Root & Harvest goods." : "Pending delivery confirmation."}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                </div>

                <div className="h-[1px] bg-forest/10" />

                <div className="bg-forest/5 p-4 flex gap-3 rounded-sm border border-forest/10 items-start">
                  <AlertCircle className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div className="text-[10px] text-dark/70 leading-relaxed uppercase tracking-wider font-semibold">
                    You will receive real-time shipping updates on WhatsApp / SMS at +91 {order.shippingPhone}.
                  </div>
                </div>

                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="w-full py-4 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors rounded-none"
                >
                  Close Tracker
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="bg-brand-bg min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-24 md:py-32">
        <Suspense fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
            <h2 className="text-2xl font-serif text-forest">Loading...</h2>
          </div>
        }>
          <OrderSuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
