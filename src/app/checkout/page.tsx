"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, ChevronRight, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/components/layout/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

// Zod Schema for Shipping
const shippingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit number"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Valid 6-digit pincode required"),
});
type ShippingFormValues = z.infer<typeof shippingSchema>;

type CheckoutStep = "shipping" | "review" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { cart, placeOrder, clearCart } = useApp();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null);
  
  // Fake payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (cart.length === 0 && paymentStatus !== "success") {
      router.push("/cart");
    }
  }, [cart, router, paymentStatus]);

  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const onShippingSubmit = (data: ShippingFormValues) => {
    setShippingData(data);
    setCurrentStep("review");
  };

  const handleProceedToPayment = async () => {
    setCurrentStep("payment");
    setShowPaymentModal(true);

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: subtotal,
          cartItems: cart,
          shippingData
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setCreatedOrder(data);
    } catch (error) {
      console.error(error);
      alert("Failed to initialize payment");
      setShowPaymentModal(false);
      setCurrentStep("review");
    }
  };

  const handleMockCashfreePayment = async () => {
    if (!createdOrder) return;
    setPaymentStatus("processing");
    
    try {
      const response = await fetch("/api/confirm-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: createdOrder.order_id,
          payment_id: `txn_${Date.now()}`,
          status: "paid"
        })
      });

      if (response.ok) {
        setPaymentStatus("success");
        setTimeout(() => {
          clearCart();
          setShowPaymentModal(false);
          router.push(`/order-success?id=${createdOrder.order_id}`);
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      setPaymentStatus("idle");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-forest/30 border-t-forest rounded-full animate-spin" />
      </div>
    );
  }

  if (cart.length === 0 && paymentStatus !== "success") return null;

  const steps = [
    { id: "shipping", label: "Shipping", icon: MapPin },
    { id: "review", label: "Review", icon: ShoppingBag },
    { id: "payment", label: "Payment", icon: CreditCard },
  ];

  return (
    <div className="bg-brand-bg text-dark font-sans font-light min-h-screen flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-forest/10 bg-white py-6 px-6 relative z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/cart" className="text-dark/40 hover:text-forest transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-serif text-xl text-forest tracking-wider uppercase">Root & Harvest</span>
          <Lock className="w-4 h-4 text-dark/40" />
        </div>
      </header>

      <main className="flex-grow py-16 px-6">
        <div className="max-w-2xl mx-auto space-y-16">
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-forest/10 -z-10" />
            {steps.map((step, idx) => {
              const isPast = steps.findIndex(s => s.id === currentStep) > idx;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center gap-3 bg-brand-bg px-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                    isCurrent ? 'border-forest bg-forest text-white' : 
                    isPast ? 'border-forest/50 bg-forest/5 text-forest' : 
                    'border-forest/20 bg-white text-dark/30'
                  }`}>
                    {isPast ? <Check className="w-4 h-4" /> : <step.icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-semibold ${isCurrent || isPast ? 'text-forest' : 'text-dark/40'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Single Column Content Area */}
          <div className="bg-white p-8 md:p-12 shadow-sm border border-forest/5 relative overflow-hidden">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: SHIPPING */}
              {currentStep === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif text-forest mb-8">Shipping Coordinate</h2>
                  <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6">
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Full Name</label>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <input {...field} className="w-full p-4 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 transition-colors" />
                        )}
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Phone Number</label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <div className="flex">
                            <span className="p-4 border border-r-0 border-forest/20 bg-brand-bg/80 text-sm text-dark/50">+91</span>
                            <input {...field} type="tel" maxLength={10} className="w-full p-4 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 transition-colors" />
                          </div>
                        )}
                      />
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Address Line 1</label>
                      <Controller
                        name="addressLine1"
                        control={control}
                        render={({ field }) => (
                          <input {...field} className="w-full p-4 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 transition-colors" />
                        )}
                      />
                      {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Address Line 2 (Optional)</label>
                      <Controller
                        name="addressLine2"
                        control={control}
                        render={({ field }) => (
                          <input {...field} className="w-full p-4 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 transition-colors" />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">City</label>
                        <Controller
                          name="city"
                          control={control}
                          render={({ field }) => (
                            <input {...field} className="w-full p-4 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 transition-colors" />
                          )}
                        />
                        {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">State</label>
                        <Controller
                          name="state"
                          control={control}
                          render={({ field }) => (
                            <input {...field} className="w-full p-4 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 transition-colors" />
                          )}
                        />
                        {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Pincode</label>
                      <Controller
                        name="pincode"
                        control={control}
                        render={({ field }) => (
                          <input {...field} maxLength={6} className="w-full p-4 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 transition-colors" />
                        )}
                      />
                      {errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}
                    </div>

                    <div className="pt-8">
                      <button type="submit" className="w-full px-8 py-5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-2 group">
                        Continue to Review
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}

              {/* STEP 2: REVIEW */}
              {currentStep === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif text-forest mb-8">Review Order</h2>
                  
                  <div className="space-y-8">
                    {/* Item list */}
                    <div className="divide-y divide-forest/10 border-y border-forest/10">
                      {cart.map((item, idx) => (
                        <div key={idx} className="py-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-16 bg-brand-bg border border-forest/5">
                              <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                            </div>
                            <div>
                              <p className="font-serif text-forest">{item.product.name}</p>
                              <p className="text-xs text-dark/50 font-light">Size: {item.size} × {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-serif text-forest">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping summary */}
                    <div className="bg-brand-bg/50 p-6 space-y-2 border border-forest/5 text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Delivering To</span>
                        <button onClick={() => setCurrentStep("shipping")} className="text-[10px] uppercase tracking-widest text-gold font-semibold underline">Edit</button>
                      </div>
                      <p className="font-medium text-forest">{shippingData?.name}</p>
                      <p className="text-dark/70 font-light">{shippingData?.addressLine1}, {shippingData?.city}, {shippingData?.state} - {shippingData?.pincode}</p>
                      <p className="text-dark/70 font-light">+91 {shippingData?.phone}</p>
                    </div>

                    {/* Totals */}
                    <div className="space-y-4 pt-4 text-sm font-light">
                      <div className="flex justify-between text-dark/80">
                        <span>Subtotal</span>
                        <span>₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-dark/80">
                        <span>Shipping</span>
                        <span className="text-forest font-medium">Complimentary</span>
                      </div>
                      <div className="flex justify-between items-end border-t border-forest/10 pt-4">
                        <span className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Total to Pay</span>
                        <span className="text-3xl font-serif text-forest tracking-tight">₹{subtotal}</span>
                      </div>
                    </div>

                    <div className="pt-8">
                      <button onClick={handleProceedToPayment} className="w-full px-8 py-5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-2 group">
                        Proceed to Payment
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <div className="text-center text-[10px] uppercase tracking-widest text-dark/40 font-semibold flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            256-bit Secure Encryption
          </div>
        </div>
      </main>

      {/* Cashfree Mock Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white w-full max-w-sm overflow-hidden shadow-2xl relative border border-forest/10">
                {/* Modal Header */}
                <div className="bg-[#411171] p-6 text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">Root & Harvest</h3>
                    <p className="text-sm opacity-80">Order #{`RH-${Math.floor(Math.random() * 90000)}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl">₹{subtotal}</p>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                  {paymentStatus === "idle" && (
                    <div className="w-full space-y-6">
                      <div className="text-center text-sm font-semibold text-dark/60 mb-6">Secured by Cashfree Payments</div>
                      <button onClick={handleMockCashfreePayment} className="w-full py-4 bg-[#6A1B9A] text-white font-semibold rounded shadow-sm hover:bg-[#411171] transition-colors">
                        Pay via UPI
                      </button>
                      <button onClick={handleMockCashfreePayment} className="w-full py-4 border border-dark/20 text-dark font-semibold rounded hover:bg-dark/5 transition-colors">
                        Pay via Cards / Netbanking
                      </button>
                    </div>
                  )}

                  {paymentStatus === "processing" && (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-10 h-10 border-4 border-[#6A1B9A]/30 border-t-[#6A1B9A] rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-dark/70">Processing Payment...</p>
                    </div>
                  )}

                  {paymentStatus === "success" && (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-green-700">Payment Successful</p>
                    </div>
                  )}
                </div>

                <div className="bg-dark/5 p-3 text-center text-[10px] font-semibold text-dark/40 uppercase tracking-widest border-t border-dark/10">
                  Test Mode - No real charge
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
