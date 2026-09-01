"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, ChevronRight, MapPin, CreditCard, ShoppingBag, ShieldCheck, RefreshCw, Plus, Truck, Shield } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/layout/AuthProvider";
import Script from "next/script";
import { lookupPincode, calculateShippingFee } from "@/lib/pincode";
import { ALL_INDIAN_STATES, getCitiesForState } from "@/data/india-locations";

// Zod Schema for Shipping
const shippingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit number"),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Valid 6-digit pincode required"),
  saveAddress: z.boolean().optional().default(true),
  addressType: z.string().optional().default("Home"),
});
type ShippingFormValues = z.infer<typeof shippingSchema>;

// Steps now include OTP verification
type CheckoutStep = "shipping" | "verify" | "review" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, placeOrder, clearCart } = useApp();
  const { user, login } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Firebase Auth states
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Initialize invisible reCAPTCHA for checkout verification
  useEffect(() => {
    if (typeof window !== "undefined" && !recaptchaVerifier) {
      try {
        const verifier = new RecaptchaVerifier(auth, "recaptcha-container-checkout", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA verification passed
          },
          "expired-callback": () => {
            setOtpError("Security verification expired. Please resend code.");
          }
        });
        setRecaptchaVerifier(verifier);
      } catch (err: any) {
        console.error("reCAPTCHA checkout init error:", err);
      }
    }
    return () => {
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch {}
      }
    };
  }, [recaptchaVerifier]);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

  // Load guest info from localStorage (set by login page)
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rh_guest");
      if (raw) {
        const g = JSON.parse(raw);
        setGuestName(g.name || "");
        setGuestPhone(g.phone || "");
      }
    } catch {}
  }, []);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"Razorpay" | "COD">("Razorpay");

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      saveAddress: true,
      addressType: "Home",
    },
  });

  const selectedState = watch("state");
  const selectedCity = watch("city");
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCityInput, setCustomCityInput] = useState("");

  // Pincode auto-detection states
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<{ city: string; state: string; isHyderabad: boolean } | null>(null);

  const handlePincodeInput = async (rawPin: string, onChange: (v: string) => void) => {
    const cleaned = rawPin.replace(/\D/g, "").slice(0, 6);
    onChange(cleaned);

    if (cleaned.length === 6) {
      setPincodeLoading(true);
      try {
        const loc = await lookupPincode(cleaned);
        if (loc) {
          setDetectedLocation(loc);
          if (loc.state) {
            setValue("state", loc.state, { shouldValidate: true });
            const stateCities = getCitiesForState(loc.state);
            if (loc.city) {
              const matchedCity = stateCities.find(
                (c) =>
                  c.toLowerCase() === loc.city.toLowerCase() ||
                  loc.city.toLowerCase().includes(c.toLowerCase()) ||
                  c.toLowerCase().includes(loc.city.toLowerCase())
              );
              if (matchedCity) {
                setValue("city", matchedCity, { shouldValidate: true });
                setIsCustomCity(false);
                setCustomCityInput("");
              } else {
                setValue("city", loc.city, { shouldValidate: true });
                setIsCustomCity(true);
                setCustomCityInput(loc.city);
              }
            }
          }
        } else {
          setDetectedLocation(null);
        }
      } catch (e) {
        console.error("Pincode lookup error:", e);
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setDetectedLocation(null);
    }
  };

  // Fetch saved addresses from server
  const fetchUserSavedAddresses = async (phoneOrUserId?: string) => {
    setAddressLoading(true);
    try {
      const url = phoneOrUserId ? `/api/addresses?phone=${encodeURIComponent(phoneOrUserId)}` : `/api/addresses`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
          setSelectedAddressId(defaultAddr.id);
          applyAddressToShipping(defaultAddr);
          setShowNewAddressForm(false);
          return data.addresses;
        } else {
          setSavedAddresses([]);
          setShowNewAddressForm(true);
          return [];
        }
      }
    } catch (err) {
      console.error("Failed to load saved addresses:", err);
      setShowNewAddressForm(true);
    } finally {
      setAddressLoading(false);
    }
    return [];
  };

  // Apply a saved address to shippingData
  const applyAddressToShipping = (addr: any) => {
    const formattedData: ShippingFormValues = {
      name: addr.name,
      phone: addr.phone.replace(/\D/g, "").slice(-10),
      email: addr.email || "",
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      saveAddress: false,
      addressType: addr.type || "Home",
    };
    setShippingData(formattedData);
    setValue("name", formattedData.name);
    setValue("phone", formattedData.phone);
    setValue("addressLine1", formattedData.addressLine1);
    setValue("addressLine2", formattedData.addressLine2 || "");
    setValue("state", formattedData.state);
    setValue("city", formattedData.city);
    setValue("pincode", formattedData.pincode);
  };

  // Initial load of addresses if user is logged in
  useEffect(() => {
    if (user?.phone) {
      fetchUserSavedAddresses(user.phone);
    } else if (guestPhone) {
      fetchUserSavedAddresses(guestPhone);
    }
  }, [user, guestPhone]);

  // Pre-fill name & phone once guest data loads
  useEffect(() => {
    if (guestName) setValue("name", guestName);
    if (guestPhone) setValue("phone", guestPhone.replace(/^\+91/, "").slice(-10));
  }, [guestName, guestPhone, setValue]);

  // Redirect to cart if cart is empty, inside useEffect to prevent server-side pre-render ReferenceError: location is not defined
  useEffect(() => {
    if (cart.length === 0 && paymentStatus !== "success") {
      router.push("/cart");
    }
  }, [cart.length, paymentStatus, router]);

  if (cart.length === 0 && paymentStatus !== "success") {
    return null;
  }

  // Helper: Live capture of abandoned checkout leads
  const captureCheckoutLead = async (nameVal?: string, phoneVal?: string, emailVal?: string, stepVal?: string) => {
    try {
      const p = phoneVal || watch("phone") || user?.phone || guestPhone;
      const e = emailVal || watch("email") || user?.email;
      const n = nameVal || watch("name") || user?.name || guestName;
      if (!p && !e) return;
      const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          phone: p,
          email: e,
          stage: stepVal || currentStep,
          cartItems: cart,
          cartTotal,
        }),
      });
    } catch (err) {}
  };

  // Auto-capture lead when phone or email is typed (10 digits / valid email)
  const watchedPhone = watch("phone");
  const watchedEmail = watch("email");
  const watchedName = watch("name");
  useEffect(() => {
    if ((watchedPhone && watchedPhone.length >= 10) || (watchedEmail && watchedEmail.includes("@"))) {
      const timer = setTimeout(() => {
        captureCheckoutLead(watchedName, watchedPhone, watchedEmail, "checkout_shipping");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [watchedPhone, watchedEmail, watchedName]);

  // ── STEP 1: Shipping form submit → go to OTP verify or Review ──
  const onShippingSubmit = async (data: ShippingFormValues) => {
    setShippingData(data);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError("");
    captureCheckoutLead(data.name, data.phone, data.email, "address_completed");

    if (user) {
      // User is already logged in -> save address if requested and proceed to review
      if (data.saveAddress) {
        try {
          await fetch("/api/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.name,
              phone: data.phone,
              addressLine1: data.addressLine1,
              addressLine2: data.addressLine2,
              city: data.city,
              state: data.state,
              pincode: data.pincode,
              type: data.addressType,
              isDefault: savedAddresses.length === 0,
            }),
          });
        } catch (e) {}
      }
      setCurrentStep("review");
      captureCheckoutLead(data.name, data.phone, data.email, "payment_pending");
    } else {
      // Prompt OTP verification using Firebase Phone Auth
      setCurrentStep("verify");
      captureCheckoutLead(data.name, data.phone, data.email, "checkout_otp");
      await sendOtp(data.phone);
    }
  };

  // ── Send OTP via Firebase Client SDK ──
  const sendOtp = async (phoneStr: string) => {
    setOtpSending(true);
    setOtpError("");
    try {
      if (!auth || !auth.app) {
        throw new Error("Firebase configuration is missing or incomplete. Please check your .env file and ensure NEXT_PUBLIC_FIREBASE_* keys are configured.");
      }
      if (!recaptchaVerifier) {
        throw new Error("Security verification (reCAPTCHA) is not ready. Refresh and try again.");
      }
      
      const cleanPhone = phoneStr.replace(/\D/g, "");
      const formattedPhone = `+91${cleanPhone.slice(-10)}`;
      
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev) {
        console.log("[DEV BYPASS] Simulating checkout phone OTP confirmation result directly...");
        setConfirmationResult({
          confirm: async (code: string) => {
            const verifyRes = await fetch("/api/auth/verify-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: formattedPhone, code }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              return {
                user: {
                  getIdToken: async () => "mock-firebase-id-token"
                }
              };
            } else {
              throw new Error(verifyData.error || "Invalid OTP code");
            }
          }
        } as any);
        setOtpTimer(30);
      } else {
        const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
        setConfirmationResult(result);
        setOtpTimer(30);
      }
    } catch (err: any) {
      console.error("[FIREBASE_SEND_OTP_CHECKOUT_ERROR]", err);
      let userMsg = `Could not send verification code. Error: ${err.message || err.code || "Unknown error"}`;
      if (err.code === "auth/invalid-phone-number") {
        userMsg = "The phone number entered is invalid. Please check and try again.";
      } else if (err.code === "auth/too-many-requests") {
        userMsg = "Too many verification requests. Please try again in a few minutes.";
      }
      setOtpError(userMsg);

      // Reset recaptcha on failure
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch {}
        setRecaptchaVerifier(null);
      }
    } finally {
      setOtpSending(false);
    }
  };

  // ── OTP input handlers ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) { setOtpError("Please enter all 6 digits"); return; }

    if (!confirmationResult) {
      setOtpError("Verification session expired. Please resend the code.");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");
    try {
      // Confirm the OTP code in Firebase Auth
      const userCredential = await confirmationResult.confirm(code);
      
      // Fetch verified JWT ID Token
      const idToken = await userCredential.user.getIdToken();

      // Submit token to server API to create/link user in Prisma database
      const formattedPhone = `+91${shippingData?.phone.replace(/\D/g, "").slice(-10)}`;
      try {
        await login(formattedPhone, idToken, shippingData?.name);
      } catch (sessionErr) {
        console.warn("[CHECKOUT_SESSION_LINK_WARN]", sessionErr);
      }

      // Save guest details in localStorage for fallback pre-fills
      try {
        localStorage.setItem("rh_guest", JSON.stringify({
          name: shippingData?.name.trim(),
          phone: formattedPhone,
          verified: true
        }));
      } catch {}

      // Check if user has saved addresses in DB
      const existingAddresses = await fetchUserSavedAddresses(formattedPhone);

      // If user had existing saved addresses and did not type a complete new address, let them pick their saved address!
      if (existingAddresses && existingAddresses.length > 1) {
        setCurrentStep("shipping");
        setShowNewAddressForm(false);
      } else {
        // Save current address to database if requested
        if (shippingData?.saveAddress) {
          try {
            await fetch("/api/addresses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: shippingData.name,
                phone: shippingData.phone,
                addressLine1: shippingData.addressLine1,
                addressLine2: shippingData.addressLine2,
                city: shippingData.city,
                state: shippingData.state,
                pincode: shippingData.pincode,
                type: shippingData.addressType,
                isDefault: true,
              }),
            });
          } catch (e) {}
        }
        setCurrentStep("review");
      }
    } catch (err: any) {
      console.error("[FIREBASE_VERIFY_OTP_CHECKOUT_ERROR]", err);
      let userMsg = "Incorrect or expired verification code. Please check and try again.";
      if (err.code === "auth/invalid-verification-code") {
        userMsg = "The OTP code entered is incorrect.";
      } else if (err.code === "auth/code-expired") {
        userMsg = "This OTP has expired. Please click resend to get a new code.";
      }
      setOtpError(userMsg);
    } finally {
      setOtpVerifying(false);
    }
  };

  // ── Proceed to payment ──
  const handleProceedToPayment = async () => {
    setCurrentStep("payment");
    setPaymentStatus("processing");
    setShowPaymentModal(true);
    const { shippingCharge } = calculateShippingFee(shippingData?.pincode, shippingData?.city, subtotal);
    const totalToPay = subtotal + shippingCharge;

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalToPay, cartItems: cart, shippingData, paymentMethod }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // If COD, complete order directly without showing Razorpay modal (only in dev/localhost)
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev && paymentMethod === "COD") {
        setPaymentStatus("success");
        setTimeout(() => {
          clearCart();
          setShowPaymentModal(false);
          router.push(`/order-success?id=${data.db_order_id}`);
        }, 1500);
        return;
      }

      // Trigger Razorpay payment modal
      const formattedPhone = shippingData?.phone
        ? (shippingData.phone.startsWith("+")
          ? shippingData.phone
          : `+91${shippingData.phone.replace(/\D/g, "").slice(-10)}`)
        : "";

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TEIC4Fxh9xf0S0",
        amount: data.amount || Math.round(subtotal * 100),
        currency: "INR",
        name: "Root & Harvest",
        description: `Order #${data.order_number}`,
        order_id: data.order_id,
        prefill: {
          name: shippingData?.name || "",
          contact: formattedPhone,
          email: shippingData?.email || "support@rootandharvest.in",
        },
        handler: async function (response: any) {
          setPaymentStatus("processing");
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                db_order_id: data.db_order_id,
              }),
            });
            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok) {
              setPaymentStatus("success");
              setTimeout(() => {
                clearCart();
                setShowPaymentModal(false);
                router.push(`/order-success?id=${data.db_order_id}`);
              }, 1500);
            } else {
              alert(`Payment verification failed: ${verifyData.error}`);
              setPaymentStatus("idle");
              setShowPaymentModal(false);
              setCurrentStep("review");
            }
          } catch (err) {
            console.error("[VERIFY_PAYMENT_FAILED]", err);
            alert("Network error verifying payment. Please contact support.");
            setPaymentStatus("idle");
            setShowPaymentModal(false);
            setCurrentStep("review");
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentStatus("idle");
            setShowPaymentModal(false);
            setCurrentStep("review");
            console.log("Payment canceled by user.");
          },
        },
        theme: {
          color: "#1e3f20", // Custom brand color (Forest green)
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("[RAZORPAY_PAYMENT_FAILED]", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setPaymentStatus("idle");
        setShowPaymentModal(false);
        setCurrentStep("review");
      });

      rzp.open();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to initialize payment");
      setPaymentStatus("idle");
      setShowPaymentModal(false);
      setCurrentStep("review");
    }
  };

  // Steps for progress indicator
  const steps = [
    { id: "shipping", label: "Shipping", icon: MapPin },
    { id: "verify",   label: "Verify",   icon: ShieldCheck },
    { id: "review",   label: "Review",   icon: ShoppingBag },
    { id: "payment",  label: "Payment",  icon: CreditCard },
  ];

  return (
    <div className="bg-brand-bg text-dark font-sans font-light min-h-screen flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container-checkout" className="invisible absolute"></div>
      {/* Header */}
      <header className="border-b border-forest/10 bg-white py-6 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/cart" className="text-dark/40 hover:text-forest transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-serif text-xl text-forest tracking-wider uppercase">Root &amp; Harvest</span>
          <Lock className="w-4 h-4 text-dark/40" />
        </div>
      </header>

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">

          {/* Step Indicator */}
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-forest/10 -z-10" />
            {steps.map((step, idx) => {
              const currentIdx = steps.findIndex(s => s.id === currentStep);
              const isPast = currentIdx > idx;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center gap-3 bg-brand-bg px-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                    isCurrent ? "border-forest bg-forest text-white" :
                    isPast    ? "border-forest/50 bg-forest/5 text-forest" :
                                "border-forest/20 bg-white text-dark/30"
                  }`}>
                    {isPast ? <Check className="w-4 h-4" /> : <step.icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest font-semibold ${isCurrent || isPast ? "text-forest" : "text-dark/40"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="bg-white p-8 md:p-12 shadow-sm border border-forest/5 relative overflow-hidden">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: SHIPPING (SAVED ADDRESSES OR NEW ADDRESS) ── */}
              {currentStep === "shipping" && (
                <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  
                  {/* CASE A: USER HAS SAVED ADDRESSES & IS NOT FORCING NEW FORM */}
                  {savedAddresses.length > 0 && !showNewAddressForm ? (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
                        <div>
                          <h2 className="text-2xl font-serif text-forest">Select Delivery Address</h2>
                          <p className="text-xs text-dark/60 mt-0.5">
                            {user?.phone ? `Logged in with +91 ${user.phone.replace(/\D/g, "").slice(-10)}` : "Choose a saved address below"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewAddressForm(true);
                            setValue("addressLine1", "");
                            setValue("addressLine2", "");
                            setValue("city", "");
                            setValue("state", "");
                            setValue("pincode", "");
                            setIsCustomCity(false);
                            setCustomCityInput("");
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-forest/5 hover:bg-forest/10 text-forest text-xs font-semibold uppercase tracking-wider border border-forest/20 rounded-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add New Address
                        </button>
                      </div>

                      {/* Saved Address Cards */}
                      <div className="space-y-3.5">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => {
                                setSelectedAddressId(addr.id);
                                applyAddressToShipping(addr);
                              }}
                              className={`p-5 border-2 transition-all cursor-pointer rounded-sm relative ${
                                isSelected ? "border-forest bg-forest/[0.03] shadow-sm" : "border-forest/15 hover:border-forest/30 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-forest" : "border-dark/30"}`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-forest" />}
                                  </div>
                                  <span className="font-semibold text-forest text-sm md:text-base">{addr.name}</span>
                                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-forest/10 text-forest rounded">
                                    {addr.type || "Home"}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-gold/15 text-gold rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="pl-6 space-y-0.5 text-xs md:text-sm text-dark/75 font-light">
                                <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                                <p>{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
                                <p className="text-dark/50 text-xs pt-1">Contact: +91 {addr.phone}</p>
                              </div>

                              {isSelected && (
                                <div className="mt-4 pl-6 pt-3 border-t border-forest/10 flex items-center justify-between">
                                  <span className="text-xs text-forest/70 font-medium">Selected for delivery</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      applyAddressToShipping(addr);
                                      setCurrentStep("review");
                                    }}
                                    className="px-6 py-2.5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors flex items-center gap-2 rounded-sm shadow-sm"
                                  >
                                    Deliver Here <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* CASE B: NEW ADDRESS FORM */
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-forest/10">
                        <div>
                          <h2 className="text-2xl font-serif text-forest">
                            {savedAddresses.length > 0 ? "Add New Address" : "Shipping Details"}
                          </h2>
                          <p className="text-xs text-dark/50 mt-0.5">Please provide complete address details for timely delivery</p>
                        </div>
                        {savedAddresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowNewAddressForm(false)}
                            className="text-xs font-semibold text-gold hover:underline"
                          >
                            ← Back to Saved Addresses
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold">Full Name</label>
                          <Controller name="name" control={control} render={({ field }) => (
                            <input {...field} placeholder="Recipient's full name" className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors" />
                          )} />
                          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold">
                            Phone Number <span className="text-gold normal-case text-[9px]">(For delivery updates &amp; OTP)</span>
                          </label>
                          <Controller name="phone" control={control} render={({ field }) => (
                            <div className="flex">
                              <span className="p-3.5 border border-r-0 border-forest/20 bg-brand-bg/80 text-sm text-dark/50 font-medium">+91</span>
                              <input {...field} type="tel" maxLength={10} placeholder="10-digit mobile number" className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors" />
                            </div>
                          )} />
                          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold">Email Address (Optional)</label>
                          <Controller name="email" control={control} render={({ field }) => (
                            <input {...field} type="email" placeholder="For order invoices" className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors" />
                          )} />
                          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold">House No., Flat, Building, Street (Address Line 1)</label>
                          <Controller name="addressLine1" control={control} render={({ field }) => (
                            <input {...field} placeholder="e.g. Flat 402, Green Meadows, Main Road" className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors" />
                          )} />
                          {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold">Landmark / Locality (Address Line 2 - Optional)</label>
                          <Controller name="addressLine2" control={control} render={({ field }) => (
                            <input {...field} placeholder="e.g. Near Community Hall" className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors" />
                          )} />
                        </div>

                        {/* 1. STATE SELECTION (FIRST) */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-dark/60 font-bold block">
                            State <span className="text-forest font-normal text-[9px]">(Select Indian State)</span>
                          </label>
                          <Controller
                            name="state"
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => {
                                  const chosenState = e.target.value;
                                  field.onChange(chosenState);
                                  setValue("city", "", { shouldValidate: true });
                                  setIsCustomCity(false);
                                  setCustomCityInput("");
                                }}
                                className="w-full p-3.5 text-sm font-medium border border-forest/30 focus:border-forest outline-none bg-white transition-colors cursor-pointer"
                              >
                                <option value="">-- Select Indian State --</option>
                                {ALL_INDIAN_STATES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                          {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                        </div>

                        {/* 2. CITY SELECTION (SECOND - POPULATED BASED ON SELECTED STATE) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase tracking-widest text-dark/60 font-bold block">
                              City / District {selectedState ? <span className="text-forest font-semibold text-[9px]">({selectedState})</span> : ""}
                            </label>
                            {!selectedState && (
                              <span className="text-[10px] text-amber-700 font-medium">← Please select State above first</span>
                            )}
                          </div>
                          <Controller
                            name="city"
                            control={control}
                            render={({ field }) => {
                              const stateToUse = selectedState || getValues("state") || "";
                              const availableCities = getCitiesForState(stateToUse);
                              const currentCity = field.value || "";
                              const isInList = availableCities.includes(currentCity);

                              return (
                                <div className="space-y-3">
                                  <select
                                    value={isCustomCity ? "Other" : (isInList ? currentCity : (currentCity ? "Other" : ""))}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "Other") {
                                        setIsCustomCity(true);
                                        field.onChange(customCityInput || "");
                                      } else {
                                        setIsCustomCity(false);
                                        setCustomCityInput("");
                                        field.onChange(val);
                                      }
                                    }}
                                    disabled={!stateToUse}
                                    className="w-full p-3.5 text-sm font-medium border border-forest/30 focus:border-forest outline-none bg-white transition-colors cursor-pointer disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    <option value="">
                                      {stateToUse ? `-- Select City in ${stateToUse} --` : "-- Select State Above First --"}
                                    </option>
                                    {availableCities.map((ct) => (
                                      <option key={ct} value={ct}>
                                        {ct}
                                      </option>
                                    ))}
                                    {stateToUse && (
                                      <option value="Other">✨ Other (Enter City/Town Manually)</option>
                                    )}
                                  </select>

                                  {isCustomCity && (
                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 pt-1">
                                      <label className="text-[10px] uppercase tracking-wider text-gold font-bold block">
                                        Enter Your City / Town / Village Name:
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="e.g. Gachibowli, Kondapur, or village name"
                                        value={customCityInput}
                                        onChange={(e) => {
                                          const manualVal = e.target.value;
                                          setCustomCityInput(manualVal);
                                          field.onChange(manualVal);
                                        }}
                                        className="w-full p-3.5 text-sm border-2 border-gold focus:border-forest outline-none bg-white transition-colors placeholder:text-dark/40 shadow-sm"
                                      />
                                    </motion.div>
                                  )}
                                </div>
                              );
                            }}
                          />
                          {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                        </div>

                        {/* 3. PINCODE */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold">Pincode (6-Digits)</label>
                            {pincodeLoading && (
                              <span className="text-[10px] text-forest/70 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Detecting location...
                              </span>
                            )}
                          </div>
                          <Controller name="pincode" control={control} render={({ field }) => (
                            <input
                              {...field}
                              maxLength={6}
                              placeholder="e.g. 500001, 600001, 560001"
                              onChange={(e) => handlePincodeInput(e.target.value, field.onChange)}
                              className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors"
                            />
                          )} />
                          {errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}

                          {detectedLocation && (
                            <div className="flex items-center gap-2 text-xs text-forest bg-forest/5 border border-forest/15 px-3.5 py-2.5 rounded-md mt-1.5 transition-all">
                              <MapPin className="w-4 h-4 text-gold shrink-0" />
                              <div>
                                <span className="font-semibold text-dark">
                                  {detectedLocation.city ? `${detectedLocation.city}, ` : ""}{detectedLocation.state}
                                </span>
                                <span className="text-dark/60 ml-2">
                                  {detectedLocation.isHyderabad ? (
                                    <strong className="text-emerald-700 font-bold">• Free Local Delivery</strong>
                                  ) : (
                                    <span>
                                      • {subtotal >= 999 ? (
                                        <strong className="text-emerald-700 font-bold">Free Shipping (Order &gt; ₹999)</strong>
                                      ) : (
                                        <strong className="text-forest font-semibold">Standard Shipping: ₹100</strong>
                                      )}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Address Tag Selector */}
                        <div className="space-y-1.5 pt-2">
                          <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block mb-1">Save Address As</label>
                          <Controller name="addressType" control={control} render={({ field }) => (
                            <div className="flex gap-3">
                              {["Home", "Office", "Other"].map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => field.onChange(tag)}
                                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded-sm transition-all ${
                                    field.value === tag
                                      ? "bg-forest text-white border-forest shadow-sm"
                                      : "border-forest/20 text-forest hover:bg-forest/5 bg-transparent"
                                  }`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          )} />
                        </div>

                        {/* Save Address Checkbox */}
                        <div className="flex items-center gap-2 pt-2">
                          <Controller name="saveAddress" control={control} render={({ field }) => (
                            <input
                              type="checkbox"
                              id="saveAddress"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="accent-forest w-4 h-4 cursor-pointer"
                            />
                          )} />
                          <label htmlFor="saveAddress" className="text-xs text-dark/70 cursor-pointer select-none">
                            Save this address to my profile for future orders
                          </label>
                        </div>

                        <div className="pt-6">
                          <button type="submit" disabled={otpSending} className="w-full px-8 py-4.5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-2 group disabled:opacity-60 rounded-sm shadow-sm">
                            {otpSending ? (
                              <><RefreshCw className="w-4 h-4 animate-spin" /> Sending OTP...</>
                            ) : (
                              <>{user ? "Proceed to Review Order" : "Continue & Verify Phone"} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </motion.div>
              )}

              {/* ── STEP 2: OTP VERIFICATION ── */}
              {currentStep === "verify" && (
                <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-forest/8 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-forest" />
                    </div>
                    <h2 className="text-2xl font-serif text-forest">Verify Your Phone</h2>
                  </div>
                  <p className="text-sm text-dark/55 mb-8">
                    A 6-digit OTP has been sent to{" "}
                    <span className="font-semibold text-forest">+91 {shippingData?.phone}</span>.{" "}
                    <button onClick={() => setCurrentStep("shipping")} className="text-gold underline underline-offset-2 text-xs">Change number</button>
                  </p>


                  {otpError && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-xs text-red-600 text-center">{otpError}</div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-8">
                    {/* 6 OTP boxes */}
                    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { otpRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-mono border border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/8 outline-none bg-brand-bg/50 transition-all"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={otpVerifying || otpDigits.join("").length < 6}
                      className="w-full px-8 py-5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {otpVerifying ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</>
                      ) : (
                        <><ShieldCheck className="w-4 h-4" /> Verify &amp; Continue</>
                      )}
                    </button>

                    {/* Resend */}
                    <div className="text-center">
                      {otpTimer > 0 ? (
                        <p className="text-xs text-dark/45">
                          Resend OTP in <span className="font-semibold text-forest">{otpTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendOtp(shippingData?.phone || "")}
                          disabled={otpSending}
                          className="text-xs font-semibold uppercase tracking-widest text-forest hover:text-gold transition-colors flex items-center gap-1.5 mx-auto"
                        >
                          <RefreshCw className="w-3 h-3" /> Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 3: REVIEW ── */}
              {currentStep === "review" && (
                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif text-forest">Review Order</h2>
                      <p className="text-xs text-forest/60 mt-0.5">Phone verified ✓</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="divide-y divide-forest/10 border-y border-forest/10">
                      {cart.map((item, idx) => (
                        <div key={idx} className="py-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-16 bg-brand-bg border border-forest/5">
                              <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                            </div>
                            <div>
                              <p className="font-serif text-forest">{item.product.name}</p>
                              <p className="text-xs text-dark/50 font-light">
                                Size: {item.size} {item.bottleType ? `(${item.bottleType})` : ""} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-serif text-black">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-brand-bg/50 p-6 space-y-2 border border-forest/5 text-sm rounded-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Delivering To</span>
                        <button onClick={() => setCurrentStep("shipping")} className="text-[10px] uppercase tracking-widest text-gold font-semibold underline">Edit / Change Address</button>
                      </div>
                      <p className="font-medium text-forest">{shippingData?.name}</p>
                      <p className="text-dark/70 font-light">{shippingData?.addressLine1}{shippingData?.addressLine2 ? `, ${shippingData?.addressLine2}` : ""}, {shippingData?.city}, {shippingData?.state} - {shippingData?.pincode}</p>
                      <p className="text-dark/70 font-light">+91 {shippingData?.phone}</p>
                    </div>

                    {(() => {
                      const shippingInfo = calculateShippingFee(shippingData?.pincode, shippingData?.city, subtotal);
                      const totalToPay = subtotal + shippingInfo.shippingCharge;

                      return (
                        <div className="space-y-4 pt-4 text-sm font-light">
                          <div className="flex justify-between text-dark/80">
                            <span>Subtotal</span><span>₹{subtotal}</span>
                          </div>
                          <div className="flex justify-between text-dark/80">
                            <span>Shipping ({shippingInfo.description})</span>
                            <span className="text-forest font-medium">
                              {shippingInfo.shippingLabel}
                            </span>
                          </div>
                          <div className="flex justify-between items-end border-t border-forest/10 pt-4">
                            <span className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Total to Pay</span>
                            <span className="text-3xl font-serif text-black tracking-tight">₹{totalToPay}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Payment Method Selector */}
                    {process.env.NODE_ENV !== "production" && (
                      <div className="bg-brand-bg/50 p-6 space-y-3 border border-forest/5 text-sm mt-6">
                        <span className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold block">Select Payment Method</span>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("Razorpay")}
                            className={`flex-1 p-3 text-center text-xs font-semibold border transition-all ${
                              paymentMethod === "Razorpay" 
                                ? "bg-forest text-brand-bg border-forest" 
                                : "bg-white text-forest border-forest/15 hover:bg-forest/5"
                            }`}
                          >
                            Online Payment (Razorpay)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("COD")}
                            className={`flex-1 p-3 text-center text-xs font-semibold border transition-all ${
                              paymentMethod === "COD" 
                                ? "bg-forest text-brand-bg border-forest" 
                                : "bg-white text-forest border-forest/15 hover:bg-forest/5"
                            }`}
                          >
                            Cash on Delivery (COD)
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-8">
                      <button onClick={handleProceedToPayment} className="w-full px-8 py-5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-2 group">
                        {process.env.NODE_ENV !== "production" && paymentMethod === "COD" ? "Place COD Order" : "Proceed to Payment"} <Lock className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
            </div>

            {/* Right Column: Sticky Order Summary Sidebar */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white p-6 border border-forest/10 shadow-sm rounded-lg space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-forest/10">
                  <h3 className="font-serif font-bold text-lg text-forest">Order Summary</h3>
                  <span className="text-xs font-bold px-2.5 py-1 bg-forest/10 text-forest rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </span>
                </div>

                <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 bg-gray-50 rounded border border-gray-200 overflow-hidden shrink-0">
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-xs text-forest leading-tight">{item.product.name}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Size: {item.size} {item.bottleType ? `(${item.bottleType})` : ""} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-gray-900 shrink-0">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-forest/10 space-y-2.5 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Subtotal</span>
                    <span className="font-bold text-gray-900 text-sm">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Shipping Charge</span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      {calculateShippingFee(shippingData?.pincode, shippingData?.city, subtotal).shippingLabel}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-forest block">Total Amount</span>
                      <span className="text-[10px] text-gray-500">Includes all taxes</span>
                    </div>
                    <span className="text-2xl font-serif font-bold text-forest">₹{subtotal + calculateShippingFee(shippingData?.pincode, shippingData?.city, subtotal).shippingCharge}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges Card */}
              <div className="bg-emerald-50/50 p-5 border border-emerald-200/60 rounded-lg space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 font-bold">
                  <Shield className="w-4 h-4 text-emerald-700" /> Root &amp; Harvest Guarantee
                </h4>
                <ul className="text-xs text-emerald-950 space-y-2 leading-snug">
                  <li className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span><strong>Free Shipping</strong> in Hyderabad (₹100 flat across India)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span><strong>100% Secure Checkout</strong> via Razorpay &amp; UPI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span><strong>Instant Notifications</strong> on WhatsApp &amp; Email</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm overflow-hidden shadow-2xl relative border border-forest/10">
                <div className="bg-forest p-6 text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">Root &amp; Harvest</h3>
                    <p className="text-xs opacity-80">Secured via Razorpay</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl">₹{subtotal}</p>
                  </div>
                </div>

                <div className="p-8 flex flex-col items-center justify-center min-h-[220px]">
                  {paymentStatus === "processing" && (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-10 h-10 border-4 border-forest/30 border-t-forest rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-dark/70">Secure Payment Processing...</p>
                      <p className="text-xs text-dark/40 text-center">Do not close this window or click back.</p>
                    </div>
                  )}
                  {paymentStatus === "success" && (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-green-700">Payment Verified Successfully</p>
                      <p className="text-xs text-dark/40 text-center">Redirecting you to order confirmation...</p>
                    </div>
                  )}
                </div>

                <div className="bg-dark/5 p-3 text-center text-[10px] font-semibold text-dark/40 uppercase tracking-widest border-t border-dark/10">
                  Razorpay Secure Gateway
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
