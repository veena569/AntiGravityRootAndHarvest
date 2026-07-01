"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Download, ShoppingBag, MapPin, Truck } from "lucide-react";
import { useApp, Order } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/get-order?id=${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) setError(data.error);
          else setOrder(data);
        })
        .catch(err => setError(err.message));
    }
  }, [orderId]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="text-2xl font-serif text-red-800">Error: {error}</h2>
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
          View & Download Receipt
        </button>
      </div>

      {/* Printable Invoice Modal Dialog */}
      <AnimatePresence>
        {showInvoiceModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvoiceModal(false)}
              className="fixed inset-0 z-50 bg-black backdrop-blur-sm print:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-3xl bg-white shadow-2xl overflow-y-auto max-h-[90vh] border border-forest/10 p-8 md:p-12 text-left rounded-sm print:fixed print:inset-0 print:m-0 print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white print:z-[9999]"
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
                    <h2 className="text-xl font-serif tracking-[0.2em] uppercase text-forest font-semibold leading-none">Root & Harvest</h2>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-gold mt-2 leading-none font-medium block">From Trusted Farms to Your Family.</span>
                    <p className="mt-6 text-[11px] text-dark/70">
                      Surat, Gujarat, India<br />
                      hello@rootandharvest.in | www.rootandharvest.in<br />
                      GSTIN: 24AAACR1234F1Z0
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
                    <p className="uppercase tracking-widest text-forest/60 font-semibold mb-3">Billing & Shipping</p>
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
                          <p className="text-dark/60 text-[10px] mt-1">Size: {item.size}</p>
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
                    <div className="flex justify-between border-t border-forest/10 pt-4 text-sm font-serif font-bold text-forest">
                      <span>Invoice Total</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
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
