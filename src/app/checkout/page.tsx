"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Lock,
  ChevronRight,
  MapPin,
  CreditCard,
  ShoppingBag,
  ShieldCheck,
  RefreshCw,
  Plus,
  Truck,
  Shield,
  Phone,
  Edit2,
  X,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/layout/AuthProvider";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Script from "next/script";
import { lookupPincode, calculateShippingFee } from "@/lib/pincode";
import { ALL_INDIAN_STATES, getCitiesForState } from "@/data/india-locations";

// Zod Schema for New Address / Shipping
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

// Checkout Steps:
// 1. "phone"    - Mobile Number Entry
// 2. "otp"      - 6-Digit OTP Verification
// 3. "shipping" - Returning Customer Saved Addresses or New Customer Shipping Details
// 4. "review"   - Address Summary, Cart Review & Payment Method Selection
// 5. "payment"  - Razorpay / COD processing modal
type CheckoutStep = "phone" | "otp" | "shipping" | "review" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useApp();
  const { user, refresh } = useAuth();

  // Primary checkout state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("phone");
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null);

  // Phone & OTP state
  const [rawPhone, setRawPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Firebase Auth states
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);

  // Edit address form state
  const [editName, setEditName] = useState("");
  const [editLine1, setEditLine1] = useState("");
  const [editLine2, setEditLine2] = useState("");
  const [editState, setEditState] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editType, setEditType] = useState("Home");
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [paymentMethod, setPaymentMethod] = useState<"Razorpay" | "COD">("Razorpay");

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // React Hook Form for New Address
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset,
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
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCityInput, setCustomCityInput] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<{ city: string; state: string; isHyderabad: boolean } | null>(null);

  // Initialize invisible reCAPTCHA for Firebase Phone Auth
  useEffect(() => {
    if (typeof window !== "undefined" && !recaptchaVerifier && auth && auth.app) {
      try {
        const verifier = new RecaptchaVerifier(auth, "recaptcha-container-checkout", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA verification passed
          },
          "expired-callback": () => {
            setPhoneError("Security verification expired. Please resend code.");
          },
        });
        setRecaptchaVerifier(verifier);
      } catch (err: any) {
        console.error("reCAPTCHA init error:", err);
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

  // Lead capture helper
  const captureCheckoutLead = async (nameVal?: string, phoneVal?: string, emailVal?: string, stepVal?: string) => {
    try {
      const p = phoneVal || verifiedPhone || rawPhone || user?.phone;
      const e = emailVal || watch("email") || user?.email;
      const n = nameVal || watch("name") || user?.name;
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
    } catch {}
  };

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cart.length === 0 && paymentStatus !== "success") {
      router.push("/cart");
    }
  }, [cart.length, paymentStatus, router]);

  // Initial check: if user already has an authenticated session with a verified phone
  useEffect(() => {
    if (user?.phone) {
      const clean = user.phone.replace(/\D/g, "").slice(-10);
      setVerifiedPhone(clean);
      setRawPhone(clean);
      setPhoneVerified(true);
      setValue("phone", clean);
      if (user.name) setValue("name", user.name);
      if (user.email) setValue("email", user.email);

      // Fetch saved addresses securely
      fetchUserSavedAddresses();
    }
  }, [user]);

  // Fetch saved addresses from server (requires authenticated session)
  const fetchUserSavedAddresses = async () => {
    setAddressLoading(true);
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          setIsExistingCustomer(true);
          const defaultAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
          setSelectedAddressId(defaultAddr.id);
          applyAddressToShipping(defaultAddr);
          setShowNewAddressForm(false);
          setCurrentStep("shipping");
          return data.addresses;
        } else {
          setSavedAddresses([]);
          setIsExistingCustomer(false);
          setShowNewAddressForm(true);
          setCurrentStep("shipping");
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

  // Apply saved address to shipping data
  const applyAddressToShipping = (addr: any) => {
    const formattedData: ShippingFormValues = {
      name: addr.name,
      phone: (addr.phone || verifiedPhone || rawPhone).replace(/\D/g, "").slice(-10),
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
    setValue("email", formattedData.email || "");
    setValue("addressLine1", formattedData.addressLine1);
    setValue("addressLine2", formattedData.addressLine2 || "");
    setValue("state", formattedData.state);
    setValue("city", formattedData.city);
    setValue("pincode", formattedData.pincode);
    setValue("addressType", formattedData.addressType);
  };

  // Pincode auto-detection handler
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

  // ── STEP 1: SEND OTP (Firebase Phone Auth) ──
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = rawPhone.replace(/\D/g, "").slice(-10);
    if (clean.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number");
      return;
    }
    setPhoneError("");
    setOtpSending(true);
    setOtpError("");

    const formattedPhone = `+91${clean}`;

    try {
      if (!auth || !auth.app) {
        throw new Error("Firebase configuration is missing or incomplete.");
      }

      let verifier = recaptchaVerifier;
      if (!verifier) {
        verifier = new RecaptchaVerifier(auth, "recaptcha-container-checkout", {
          size: "invisible",
        });
        setRecaptchaVerifier(verifier);
      }

      const isDev = process.env.NODE_ENV !== "production";
      if (isDev) {
        console.log("[DEV BYPASS] Simulating phone OTP confirmation result...");
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
      } else {
        const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
        setConfirmationResult(result);
      }

      setOtpTimer(30);
      setOtpDigits(["", "", "", "", "", ""]);
      setCurrentStep("otp");
      captureCheckoutLead(undefined, clean, undefined, "checkout_otp_sent");

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      console.error("[FIREBASE_SEND_OTP_ERROR]", err);
      let userMessage = `Could not send OTP: ${err.message || err.code || "Unknown error"}`;
      if (err.code === "auth/invalid-phone-number") {
        userMessage = "The phone number entered is invalid. Please enter a valid 10-digit mobile number.";
      } else if (err.code === "auth/too-many-requests") {
        userMessage = "Too many verification attempts. Please wait a few minutes and try again.";
      }
      setPhoneError(userMessage);

      // Re-initialize recaptcha on failure
      if (recaptchaVerifier) {
        try { recaptchaVerifier.clear(); } catch {}
        setRecaptchaVerifier(null);
      }
    } finally {
      setOtpSending(false);
    }
  };

  // ── STEP 2: OTP INPUT HANDLERS ──
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

  // ── STEP 2: VERIFY OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");
    const clean = rawPhone.replace(/\D/g, "").slice(-10);
    const formattedPhone = `+91${clean}`;

    try {
      let idToken = "mock-firebase-id-token";
      if (confirmationResult) {
        const userCredential = await confirmationResult.confirm(code);
        idToken = await userCredential.user.getIdToken();
      }

      // Exchange verified token with backend to set session cookies and fetch saved addresses
      const fbRes = await fetch("/api/auth/firebase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, idToken }),
      });

      const data = await fbRes.json();
      if (!fbRes.ok) {
        throw new Error(data.error || "Failed to verify code");
      }

      // Successful verification
      setPhoneVerified(true);
      setVerifiedPhone(clean);
      setValue("phone", clean);

      if (refresh) {
        try { await refresh(); } catch {}
      }

      const addresses = data.addresses || [];
      const isExisting = Boolean(data.isExistingCustomer || addresses.length > 0);
      setIsExistingCustomer(isExisting);

      // Case A: Returning customer with saved addresses
      if (addresses.length > 0) {
        setSavedAddresses(addresses);
        const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
        setSelectedAddressId(defaultAddr.id);
        applyAddressToShipping(defaultAddr);
        setShowNewAddressForm(false);
        setCurrentStep("shipping");
      } else {
        // Case B: New customer
        setSavedAddresses([]);
        setShowNewAddressForm(true);
        if (data.user?.name) setValue("name", data.user.name);
        if (data.user?.email) setValue("email", data.user.email);
        setCurrentStep("shipping");
      }

      captureCheckoutLead(data.user?.name, clean, data.user?.email, "phone_verified");
    } catch (err: any) {
      console.error("[VERIFY_OTP_ERROR]", err);
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

  // ── STEP 3: SUBMIT NEW ADDRESS FORM ──
  const onShippingSubmit = async (data: ShippingFormValues) => {
    const finalData: ShippingFormValues = {
      ...data,
      phone: verifiedPhone || rawPhone.replace(/\D/g, "").slice(-10),
    };
    setShippingData(finalData);
    captureCheckoutLead(finalData.name, finalData.phone, finalData.email, "address_completed");

    if (finalData.saveAddress) {
      try {
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: finalData.name,
            phone: finalData.phone,
            addressLine1: finalData.addressLine1,
            addressLine2: finalData.addressLine2 || "",
            city: finalData.city,
            state: finalData.state,
            pincode: finalData.pincode,
            type: finalData.addressType || "Home",
            isDefault: savedAddresses.length === 0,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.address) {
            setSavedAddresses((prev) => [resData.address, ...prev]);
            setSelectedAddressId(resData.address.id);
          }
        }
      } catch (err) {
        console.warn("[SAVE_ADDRESS_WARN]", err);
      }
    }

    setCurrentStep("review");
  };

  // ── STEP 3: EDIT ADDRESS SUBMISSION ──
  const handleOpenEditAddress = (addr: any) => {
    setEditingAddress(addr);
    setEditName(addr.name || "");
    setEditLine1(addr.addressLine1 || "");
    setEditLine2(addr.addressLine2 || "");
    setEditState(addr.state || "");
    setEditCity(addr.city || "");
    setEditPincode(addr.pincode || "");
    setEditType(addr.type || "Home");
    setEditIsDefault(Boolean(addr.isDefault));
    setEditError("");
  };

  const handleSaveEditedAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editLine1.trim() || !editState.trim() || !editCity.trim() || !editPincode.trim()) {
      setEditError("Please fill in all required fields");
      return;
    }
    if (!/^\d{6}$/.test(editPincode.trim())) {
      setEditError("Please enter a valid 6-digit pincode");
      return;
    }

    setEditSaving(true);
    setEditError("");
    try {
      const res = await fetch("/api/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAddress.id,
          name: editName.trim(),
          addressLine1: editLine1.trim(),
          addressLine2: editLine2.trim() || "",
          state: editState.trim(),
          city: editCity.trim(),
          pincode: editPincode.trim(),
          type: editType,
          isDefault: editIsDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update address");
        return;
      }

      const updated = data.address || {
        ...editingAddress,
        name: editName.trim(),
        addressLine1: editLine1.trim(),
        addressLine2: editLine2.trim(),
        state: editState.trim(),
        city: editCity.trim(),
        pincode: editPincode.trim(),
        type: editType,
        isDefault: editIsDefault,
      };

      setSavedAddresses((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : editIsDefault ? { ...a, isDefault: false } : a))
      );
      setSelectedAddressId(updated.id);
      applyAddressToShipping(updated);
      setEditingAddress(null);
      setCurrentStep("review");
    } catch (err) {
      console.error("[UPDATE_ADDRESS_ERROR]", err);
      setEditError("Failed to update address. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  // ── STEP 4: PROCEED TO PAYMENT ──
  const handleProceedToPayment = async () => {
    if (!shippingData) {
      setCurrentStep("shipping");
      return;
    }

    setCurrentStep("payment");
    setPaymentStatus("processing");
    setShowPaymentModal(true);

    const { shippingCharge } = calculateShippingFee(
      shippingData.pincode,
      isCustomCity ? customCityInput : shippingData.city,
      subtotal,
      shippingData.state
    );
    const totalToPay = subtotal + shippingCharge;

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalToPay,
          cartItems: cart,
          shippingData,
          paymentMethod,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");

      // If COD in dev/localhost, finalize immediately
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

      // Razorpay Checkout
      const formattedPhone = shippingData.phone
        ? shippingData.phone.startsWith("+")
          ? shippingData.phone
          : `+91${shippingData.phone.replace(/\D/g, "").slice(-10)}`
        : "";

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TEIC4Fxh9xf0S0",
        amount: data.amount || Math.round(totalToPay * 100),
        currency: "INR",
        name: "Root & Harvest",
        description: `Order #${data.order_number}`,
        order_id: data.order_id,
        prefill: {
          name: shippingData.name || "",
          contact: formattedPhone,
          email: shippingData.email || "support@rootandharvest.in",
        },
        handler: async function (paymentRes: any) {
          setPaymentStatus("processing");
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: paymentRes.razorpay_payment_id,
                razorpay_order_id: paymentRes.razorpay_order_id,
                razorpay_signature: paymentRes.razorpay_signature,
                db_order_id: data.db_order_id,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
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
          },
        },
        theme: {
          color: "#1e3f20",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (failRes: any) {
        console.error("[RAZORPAY_PAYMENT_FAILED]", failRes.error);
        alert(`Payment failed: ${failRes.error?.description || "Transaction declined"}`);
        setPaymentStatus("idle");
        setShowPaymentModal(false);
        setCurrentStep("review");
      });

      rzp.open();
    } catch (error: any) {
      console.error("[CHECKOUT_PAYMENT_INIT_ERROR]", error);
      alert(error.message || "Failed to initialize payment");
      setPaymentStatus("idle");
      setShowPaymentModal(false);
      setCurrentStep("review");
    }
  };

  // Visual Steps Progress Indicator
  const stepsConfig = [
    { id: "phone", label: "Mobile", icon: Phone },
    { id: "otp", label: "Verify", icon: ShieldCheck },
    { id: "shipping", label: "Address", icon: MapPin },
    { id: "review", label: "Payment", icon: CreditCard },
  ];

  const getStepIndex = (step: CheckoutStep) => {
    switch (step) {
      case "phone":
        return 0;
      case "otp":
        return 1;
      case "shipping":
        return 2;
      case "review":
      case "payment":
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentStep);

  const formatMaskedPhone = (phoneNum: string) => {
    const clean = phoneNum.replace(/\D/g, "").slice(-10);
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return `+91 ${clean}`;
  };

  if (cart.length === 0 && paymentStatus !== "success") {
    return null;
  }

  return (
    <div className="bg-brand-bg text-dark font-sans font-light min-h-screen flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container-checkout" className="invisible absolute"></div>

      {/* Header */}
      <header className="border-b border-forest/10 bg-white py-5 px-6 relative z-10 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/cart" className="text-dark/50 hover:text-forest transition-colors flex items-center gap-1.5 text-xs font-medium">
            <ArrowLeft className="w-4 h-4" /> Return to Cart
          </Link>
          <span className="font-serif text-xl md:text-2xl text-forest tracking-wider uppercase font-normal">Root &amp; Harvest</span>
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-medium">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Secure
          </div>
        </div>
      </header>

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Checkout Multi-Step Container */}
            <div className="lg:col-span-7 space-y-6">

              {/* Progress Stepper */}
              <div className="flex items-center justify-between relative px-2 sm:px-6">
                <div className="absolute top-4 left-6 right-6 h-[1.5px] bg-forest/15 -z-0" />
                {stepsConfig.map((s, idx) => {
                  const isPast = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;
                  return (
                    <div key={s.id} className="flex flex-col items-center gap-2 bg-brand-bg px-2 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs transition-all ${
                          isCurrent
                            ? "border-forest bg-forest text-white shadow-sm ring-4 ring-forest/10"
                            : isPast
                            ? "border-forest/50 bg-forest/10 text-forest"
                            : "border-forest/20 bg-white text-dark/30"
                        }`}
                      >
                        {isPast ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold ${
                          isCurrent ? "text-forest font-bold" : isPast ? "text-forest/80" : "text-dark/40"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Main Step Content Card */}
              <div className="bg-white p-6 sm:p-10 shadow-sm border border-forest/10 relative overflow-hidden rounded-md">
                <AnimatePresence mode="wait">

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 1: PHONE NUMBER INPUT                                  */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {currentStep === "phone" && (
                    <motion.div
                      key="step-phone"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1.5 text-center sm:text-left pb-2 border-b border-forest/10">
                        <h2 className="text-2xl sm:text-3xl font-serif text-forest flex items-center justify-center sm:justify-start gap-2">
                          Let&apos;s get your order delivered <span className="text-red-500">❤️</span>
                        </h2>
                        <p className="text-sm text-dark/60 font-light">
                          Enter your mobile number to continue.
                        </p>
                      </div>

                      <form onSubmit={handleSendOtp} className="space-y-6 pt-2">
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-widest text-dark/70 font-semibold block">
                            Mobile Number
                          </label>
                          <div className="flex rounded-sm overflow-hidden border border-forest/30 focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/10 transition-all bg-brand-bg/30">
                            <span className="px-4 py-3.5 bg-forest/5 text-forest font-semibold text-sm border-r border-forest/20 flex items-center">
                              +91
                            </span>
                            <input
                              type="tel"
                              maxLength={10}
                              autoFocus
                              value={rawPhone}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                setRawPhone(val);
                                if (phoneError) setPhoneError("");
                              }}
                              placeholder="Enter 10-digit mobile number"
                              className="w-full px-4 py-3.5 text-base tracking-wider font-mono outline-none bg-transparent placeholder:font-sans placeholder:tracking-normal placeholder:text-dark/35"
                            />
                          </div>
                          {phoneError && (
                            <p className="text-xs text-red-600 font-medium pt-1">{phoneError}</p>
                          )}
                        </div>

                        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/70 rounded text-xs text-emerald-900 flex items-start gap-2.5 leading-relaxed">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span>
                            We&apos;ll send a quick 6-digit OTP to verify your order and automatically retrieve your saved addresses.
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={otpSending || rawPhone.length !== 10}
                          className="w-full px-8 py-4 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {otpSending ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" /> Sending OTP...
                            </>
                          ) : (
                            <>
                              Send OTP <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 2: OTP VERIFICATION                                    */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {currentStep === "otp" && (
                    <motion.div
                      key="step-otp"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="text-center sm:text-left pb-2 border-b border-forest/10 space-y-1.5">
                        <div className="flex items-center justify-center sm:justify-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-forest" />
                          </div>
                          <h2 className="text-2xl font-serif text-forest">Verify your mobile number</h2>
                        </div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-dark/65">
                          <span>We sent a 6-digit code to</span>
                          <span className="font-semibold text-forest font-mono">
                            {formatMaskedPhone(rawPhone)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStep("phone");
                              setOtpDigits(["", "", "", "", "", ""]);
                              setOtpError("");
                            }}
                            className="text-xs text-gold font-semibold underline underline-offset-2 hover:text-forest transition-colors ml-1 cursor-pointer"
                          >
                            Edit Phone Number
                          </button>
                        </div>
                      </div>

                      {otpError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded text-center font-medium">
                          {otpError}
                        </div>
                      )}

                      <form onSubmit={handleVerifyOtp} className="space-y-6 pt-2">
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block text-center">
                            Enter 6-Digit OTP Code
                          </label>
                          {/* 6 Digit Inputs */}
                          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                            {otpDigits.map((digit, idx) => (
                              <input
                                key={idx}
                                ref={(el) => {
                                  otpRefs.current[idx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl font-mono font-bold border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/10 outline-none rounded bg-brand-bg/30 text-forest transition-all"
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={otpVerifying || otpDigits.join("").length < 6}
                          className="w-full px-8 py-4.5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {otpVerifying ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" /> Verify &amp; Continue
                            </>
                          )}
                        </button>

                        {/* Cooldown Timer & Resend */}
                        <div className="text-center pt-1">
                          {otpTimer > 0 ? (
                            <p className="text-xs text-dark/50">
                              Resend OTP in <span className="font-semibold text-forest font-mono">{otpTimer}s</span>
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={otpSending}
                              className="text-xs font-semibold uppercase tracking-wider text-forest hover:text-gold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                            </button>
                          )}
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 3: DETERMINE CUSTOMER TYPE (RETURNING vs NEW)          */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {currentStep === "shipping" && (
                    <motion.div
                      key="step-shipping"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      {/* Sub-Case 1: INLINE EDIT ADDRESS FORM */}
                      {editingAddress ? (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between pb-3 border-b border-forest/10">
                            <div>
                              <h2 className="text-xl font-serif text-forest">Edit Saved Address</h2>
                              <p className="text-xs text-dark/55">Update address details for this delivery</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingAddress(null)}
                              className="text-dark/40 hover:text-dark p-1 cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {editError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded">
                              {editError}
                            </div>
                          )}

                          <form onSubmit={handleSaveEditedAddress} className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                Full Name
                              </label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none rounded-sm bg-brand-bg/20"
                                required
                              />
                            </div>

                            {/* Verified Mobile Number - Locked & Read Only */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                  Mobile Number
                                </label>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3" /> Verified
                                </span>
                              </div>
                              <div className="flex items-center bg-gray-100 border border-gray-300 rounded-sm p-3 text-sm text-gray-700 font-mono">
                                <Lock className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
                                <span>+91 {verifiedPhone || rawPhone}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                Address Line 1 (Flat, House No., Street)
                              </label>
                              <input
                                type="text"
                                value={editLine1}
                                onChange={(e) => setEditLine1(e.target.value)}
                                className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none rounded-sm bg-brand-bg/20"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                Address Line 2 (Landmark - Optional)
                              </label>
                              <input
                                type="text"
                                value={editLine2}
                                onChange={(e) => setEditLine2(e.target.value)}
                                className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none rounded-sm bg-brand-bg/20"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                  State
                                </label>
                                <select
                                  value={editState}
                                  onChange={(e) => {
                                    setEditState(e.target.value);
                                    setEditCity("");
                                  }}
                                  className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none rounded-sm bg-white"
                                  required
                                >
                                  <option value="">Select State</option>
                                  {ALL_INDIAN_STATES.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                  City
                                </label>
                                <input
                                  type="text"
                                  value={editCity}
                                  onChange={(e) => setEditCity(e.target.value)}
                                  placeholder="City / District"
                                  className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none rounded-sm bg-brand-bg/20"
                                  required
                                >
                                </input>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                  Pincode
                                </label>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={editPincode}
                                  onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                  placeholder="6-digit Pincode"
                                  className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none rounded-sm bg-brand-bg/20 font-mono"
                                  required
                                />
                              </div>
                            </div>

                            {/* Tag: Home / Work */}
                            <div className="space-y-1 pt-1">
                              <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                Address Type
                              </label>
                              <div className="flex gap-3">
                                {["Home", "Work", "Other"].map((tag) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setEditType(tag)}
                                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded-sm transition-all cursor-pointer ${
                                      editType === tag
                                        ? "bg-forest text-white border-forest shadow-xs"
                                        : "border-forest/20 text-forest bg-transparent hover:bg-forest/5"
                                    }`}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <input
                                type="checkbox"
                                id="editIsDefault"
                                checked={editIsDefault}
                                onChange={(e) => setEditIsDefault(e.target.checked)}
                                className="accent-forest w-4 h-4 cursor-pointer"
                              />
                              <label htmlFor="editIsDefault" className="text-xs text-dark/70 cursor-pointer select-none">
                                Make this my default delivery address
                              </label>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                              <button
                                type="submit"
                                disabled={editSaving}
                                className="flex-1 py-3.5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all rounded-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                {editSaving ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...
                                  </>
                                ) : (
                                  "Update & Use this address"
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingAddress(null)}
                                className="py-3.5 px-6 border border-forest/20 text-forest text-xs uppercase tracking-widest font-semibold hover:bg-forest/5 transition-all rounded-sm cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : savedAddresses.length > 0 && !showNewAddressForm ? (
                        /* Sub-Case 2: RETURNING CUSTOMER - SAVED ADDRESS CARDS */
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-forest/10">
                            <div>
                              <h2 className="text-2xl font-serif text-forest flex items-center gap-2">
                                Welcome back! <span className="text-red-500">❤️</span>
                              </h2>
                              <p className="text-xs text-dark/60 mt-0.5">
                                We found your saved addresses. Select where you want your order delivered.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewAddressForm(true);
                                reset({
                                  name: user?.name || "",
                                  phone: verifiedPhone || rawPhone,
                                  email: user?.email || "",
                                  addressLine1: "",
                                  addressLine2: "",
                                  city: "",
                                  state: "",
                                  pincode: "",
                                  saveAddress: true,
                                  addressType: "Home",
                                });
                                setIsCustomCity(false);
                                setCustomCityInput("");
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-forest/5 hover:bg-forest/10 text-forest text-xs font-semibold uppercase tracking-wider border border-forest/20 rounded-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
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
                                  className={`p-5 border-2 transition-all cursor-pointer rounded-md relative ${
                                    isSelected
                                      ? "border-forest bg-forest/[0.03] shadow-sm"
                                      : "border-forest/15 hover:border-forest/30 bg-white"
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                          isSelected ? "border-forest" : "border-dark/30"
                                        }`}
                                      >
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

                                    {/* Inline Edit Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditAddress(addr);
                                      }}
                                      className="inline-flex items-center gap-1 text-xs text-gold hover:text-forest font-semibold transition-colors px-2 py-1 rounded hover:bg-gold/10 cursor-pointer"
                                    >
                                      <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                  </div>

                                  <div className="pl-6.5 space-y-0.5 text-xs md:text-sm text-dark/75 font-light pt-1.5">
                                    <p>
                                      {addr.addressLine1}
                                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                                    </p>
                                    <p>
                                      {addr.city}, {addr.state} - <strong className="font-semibold text-dark font-mono">{addr.pincode}</strong>
                                    </p>
                                    <p className="text-dark/55 text-xs pt-1 flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-forest/70" /> +91 {addr.phone || verifiedPhone}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Primary CTA for returning customer */}
                          <div className="pt-3">
                            <button
                              type="button"
                              onClick={() => {
                                const chosen = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];
                                if (chosen) {
                                  applyAddressToShipping(chosen);
                                  setCurrentStep("review");
                                }
                              }}
                              className="w-full px-8 py-4 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm cursor-pointer"
                            >
                              Use this address &amp; Continue <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Sub-Case 3: NEW CUSTOMER OR ADD NEW ADDRESS FORM */
                        <div className="space-y-6">
                          <div className="flex items-center justify-between pb-3 border-b border-forest/10">
                            <div>
                              <h2 className="text-2xl font-serif text-forest">
                                {savedAddresses.length > 0 ? "Add New Address" : "Shipping Details"}
                              </h2>
                              <p className="text-xs text-dark/55 mt-0.5">
                                Please provide complete address details for timely delivery
                              </p>
                            </div>
                            {savedAddresses.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowNewAddressForm(false)}
                                className="text-xs font-semibold text-gold hover:text-forest transition-colors cursor-pointer"
                              >
                                ← Back to Saved Addresses
                              </button>
                            )}
                          </div>

                          <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-5">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                Full Name
                              </label>
                              <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    placeholder="Recipient's full name"
                                    className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors rounded-sm"
                                  />
                                )}
                              />
                              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>

                            {/* Mobile Number (LOCKED & READ-ONLY with Verified Badge) */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                  Mobile Number
                                </label>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Verified
                                </span>
                              </div>
                              <div className="flex items-center bg-gray-100/90 border border-gray-300/80 rounded-sm px-4 py-3.5 text-sm text-gray-700 font-mono select-none">
                                <Lock className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
                                <span>+91 {verifiedPhone || rawPhone}</span>
                                <span className="text-[10px] text-gray-500 ml-auto font-sans font-normal">
                                  Locked to verified number
                                </span>
                              </div>
                            </div>

                            {/* Email Address (Optional) */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                Email Address (Optional)
                              </label>
                              <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="email"
                                    placeholder="For order invoices and updates"
                                    className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors rounded-sm"
                                  />
                                )}
                              />
                              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                            </div>

                            {/* Address Line 1 */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                House No., Flat, Building, Street (Address Line 1)
                              </label>
                              <Controller
                                name="addressLine1"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    placeholder="e.g. Flat 402, Green Meadows, Main Road"
                                    className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors rounded-sm"
                                  />
                                )}
                              />
                              {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
                            </div>

                            {/* Address Line 2 */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                Landmark / Locality (Address Line 2 - Optional)
                              </label>
                              <Controller
                                name="addressLine2"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    placeholder="e.g. Near Community Hall, Landmark"
                                    className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors rounded-sm"
                                  />
                                )}
                              />
                            </div>

                            {/* 1. STATE SELECTION */}
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
                                    className="w-full p-3.5 text-sm font-medium border border-forest/30 focus:border-forest outline-none bg-white transition-colors cursor-pointer rounded-sm"
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

                            {/* 2. CITY SELECTION */}
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
                                    <div className="space-y-2">
                                      <select
                                        value={isCustomCity ? "Other" : isInList ? currentCity : currentCity ? "Other" : ""}
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
                                        className="w-full p-3.5 text-sm font-medium border border-forest/30 focus:border-forest outline-none bg-white transition-colors cursor-pointer disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed rounded-sm"
                                      >
                                        <option value="">
                                          {stateToUse ? `-- Select City in ${stateToUse} --` : "-- Select State Above First --"}
                                        </option>
                                        {availableCities.map((ct) => (
                                          <option key={ct} value={ct}>
                                            {ct}
                                          </option>
                                        ))}
                                        {stateToUse && <option value="Other">✨ Other (Enter City/Town Manually)</option>}
                                      </select>

                                      {isCustomCity && (
                                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-1 pt-1">
                                          <label className="text-[10px] uppercase tracking-wider text-gold font-bold block">
                                            Enter City / Town Name:
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="e.g. Gachibowli, Kondapur, or town name"
                                            value={customCityInput}
                                            onChange={(e) => {
                                              const manualVal = e.target.value;
                                              setCustomCityInput(manualVal);
                                              field.onChange(manualVal);
                                            }}
                                            className="w-full p-3.5 text-sm border-2 border-gold focus:border-forest outline-none bg-white transition-colors rounded-sm shadow-xs"
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
                                <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                  Pincode (6-Digits)
                                </label>
                                {pincodeLoading && (
                                  <span className="text-[10px] text-forest/70 flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Detecting location...
                                  </span>
                                )}
                              </div>
                              <Controller
                                name="pincode"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    maxLength={6}
                                    placeholder="e.g. 500001, 600001, 560001"
                                    onChange={(e) => handlePincodeInput(e.target.value, field.onChange)}
                                    className="w-full p-3.5 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/40 transition-colors font-mono rounded-sm"
                                  />
                                )}
                              />
                              {errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}

                              {detectedLocation && (
                                <div className="flex items-center gap-2 text-xs text-forest bg-forest/5 border border-forest/15 px-3.5 py-2.5 rounded-md mt-1.5">
                                  <MapPin className="w-4 h-4 text-gold shrink-0" />
                                  <div>
                                    <span className="font-semibold text-dark">
                                      {detectedLocation.city ? `${detectedLocation.city}, ` : ""}
                                      {detectedLocation.state}
                                    </span>
                                    <span className="text-dark/60 ml-2">
                                      {detectedLocation.isHyderabad ? (
                                        <strong className="text-emerald-700 font-bold">• Free Local Delivery</strong>
                                      ) : (
                                        <span>
                                          •{" "}
                                          {subtotal >= 999 ? (
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

                            {/* Save Address As Tag */}
                            <div className="space-y-1.5 pt-1">
                              <label className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                                Address Type
                              </label>
                              <Controller
                                name="addressType"
                                control={control}
                                render={({ field }) => (
                                  <div className="flex gap-3">
                                    {["Home", "Work", "Other"].map((tag) => (
                                      <button
                                        key={tag}
                                        type="button"
                                        onClick={() => field.onChange(tag)}
                                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded-sm transition-all cursor-pointer ${
                                          field.value === tag
                                            ? "bg-forest text-white border-forest shadow-xs"
                                            : "border-forest/20 text-forest hover:bg-forest/5 bg-transparent"
                                        }`}
                                      >
                                        {tag}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              />
                            </div>

                            {/* Save Address Checkbox */}
                            <div className="flex items-center gap-2 pt-1">
                              <Controller
                                name="saveAddress"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    type="checkbox"
                                    id="saveAddressNew"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="accent-forest w-4 h-4 cursor-pointer"
                                  />
                                )}
                              />
                              <label htmlFor="saveAddressNew" className="text-xs text-dark/70 cursor-pointer select-none">
                                Save this address to my profile for future orders
                              </label>
                            </div>

                            <div className="pt-4">
                              <button
                                type="submit"
                                className="w-full px-8 py-4.5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm cursor-pointer"
                              >
                                Continue to Review <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 4: REVIEW & PAYMENT                                    */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {currentStep === "review" && (
                    <motion.div
                      key="step-review"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-forest/10">
                        <div>
                          <h2 className="text-2xl font-serif text-forest">Review Order</h2>
                          <p className="text-xs text-forest/70 font-medium flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Phone verified &amp; ready for checkout
                          </p>
                        </div>
                      </div>

                      {/* Selected Delivery Address Summary with [ Change ] */}
                      <div className="bg-brand-bg/50 p-5 rounded-md border border-forest/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-widest text-dark/50 font-bold flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-forest" /> Delivering To
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStep("shipping");
                            }}
                            className="text-xs font-semibold text-gold hover:text-forest underline underline-offset-2 transition-colors cursor-pointer"
                          >
                            Change Address
                          </button>
                        </div>
                        <div className="pt-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-forest text-sm sm:text-base">{shippingData?.name}</p>
                            <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-forest/10 text-forest rounded">
                              {shippingData?.addressType || "Home"}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-dark/75 font-light pt-0.5">
                            {shippingData?.addressLine1}
                            {shippingData?.addressLine2 ? `, ${shippingData.addressLine2}` : ""}, {shippingData?.city},{" "}
                            {shippingData?.state} - <span className="font-mono font-semibold">{shippingData?.pincode}</span>
                          </p>
                          <p className="text-xs text-dark/60 font-mono pt-1">
                            Contact: +91 {shippingData?.phone || verifiedPhone}
                          </p>
                        </div>
                      </div>

                      {/* Order Items List */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-widest text-dark/50 font-bold">Items in Order</h4>
                        <div className="divide-y divide-forest/10 border-y border-forest/10 max-h-[220px] overflow-y-auto pr-1">
                          {cart.map((item, idx) => (
                            <div key={idx} className="py-3 flex items-center justify-between">
                              <div className="flex items-center gap-3.5">
                                <div className="relative w-12 h-14 bg-brand-bg rounded border border-forest/10 overflow-hidden shrink-0">
                                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                </div>
                                <div>
                                  <p className="font-serif text-forest text-sm font-semibold">{item.product.name}</p>
                                  <p className="text-xs text-dark/55 font-light">
                                    Size: {item.size} {item.bottleType ? `(${item.bottleType})` : ""} × {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <span className="font-serif text-dark font-semibold text-sm">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      {(() => {
                        const shippingInfo = calculateShippingFee(
                          shippingData?.pincode || watch("pincode"),
                          isCustomCity ? customCityInput : shippingData?.city || watch("city"),
                          subtotal,
                          shippingData?.state || watch("state")
                        );
                        const totalToPay = subtotal + shippingInfo.shippingCharge;

                        return (
                          <div className="space-y-2.5 pt-2 text-sm font-light">
                            <div className="flex justify-between text-dark/80">
                              <span>Subtotal</span>
                              <span className="font-semibold text-dark">₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-dark/80 items-center">
                              <span>Shipping ({shippingInfo.description})</span>
                              <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                {shippingInfo.shippingLabel}
                              </span>
                            </div>
                            <div className="flex justify-between items-end border-t border-forest/15 pt-3">
                              <span className="text-xs uppercase tracking-widest text-dark/60 font-bold">Total Payable</span>
                              <span className="text-2xl sm:text-3xl font-serif text-forest font-bold tracking-tight">
                                ₹{totalToPay}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Payment Method Selector */}
                      {process.env.NODE_ENV !== "production" && (
                        <div className="bg-brand-bg/40 p-4 rounded-md border border-forest/10 space-y-2">
                          <span className="text-[10px] uppercase tracking-widest text-dark/60 font-semibold block">
                            Select Payment Method (Dev Preview)
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("Razorpay")}
                              className={`p-3 text-center text-xs font-semibold border rounded-sm transition-all cursor-pointer ${
                                paymentMethod === "Razorpay"
                                  ? "bg-forest text-white border-forest shadow-xs"
                                  : "bg-white text-forest border-forest/20 hover:bg-forest/5"
                              }`}
                            >
                              Online Payment (Razorpay)
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("COD")}
                              className={`p-3 text-center text-xs font-semibold border rounded-sm transition-all cursor-pointer ${
                                paymentMethod === "COD"
                                  ? "bg-forest text-white border-forest shadow-xs"
                                  : "bg-white text-forest border-forest/20 hover:bg-forest/5"
                              }`}
                            >
                              Cash on Delivery (COD)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Primary CTA: Proceed to Payment */}
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={handleProceedToPayment}
                          className="w-full px-8 py-4.5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm cursor-pointer"
                        >
                          {process.env.NODE_ENV !== "production" && paymentMethod === "COD" ? (
                            <>
                              Place COD Order <Lock className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              Proceed to Payment <Lock className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Sticky Order Summary Sidebar */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white p-6 border border-forest/10 shadow-sm rounded-md space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-forest/10">
                  <h3 className="font-serif font-bold text-lg text-forest">Order Summary</h3>
                  <span className="text-xs font-bold px-2.5 py-1 bg-forest/10 text-forest rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </span>
                </div>

                <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto pr-1">
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
                      {calculateShippingFee(
                        shippingData?.pincode || watch("pincode"),
                        isCustomCity ? customCityInput : shippingData?.city || watch("city"),
                        subtotal,
                        shippingData?.state || watch("state")
                      ).shippingLabel}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-forest block">Total Amount</span>
                      <span className="text-[10px] text-gray-500">Includes all taxes</span>
                    </div>
                    <span className="text-2xl font-serif font-bold text-forest">
                      ₹
                      {subtotal +
                        calculateShippingFee(
                          shippingData?.pincode || watch("pincode"),
                          isCustomCity ? customCityInput : shippingData?.city || watch("city"),
                          subtotal,
                          shippingData?.state || watch("state")
                        ).shippingCharge}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Badges Card */}
              <div className="bg-emerald-50/50 p-5 border border-emerald-200/60 rounded-md space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 font-bold">
                  <Shield className="w-4 h-4 text-emerald-700" /> Root &amp; Harvest Guarantee
                </h4>
                <ul className="text-xs text-emerald-950 space-y-2 leading-snug">
                  <li className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      <strong>Free Shipping</strong> in Hyderabad (₹100 flat across India, Free &gt; ₹999)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      <strong>100% Secure Checkout</strong> via Razorpay &amp; UPI
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      <strong>Direct Delivery</strong> from Cold-Pressed Farm Mill
                    </span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Payment Processing Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white w-full max-w-sm overflow-hidden shadow-2xl relative border border-forest/10 rounded-md">
                <div className="bg-forest p-6 text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg font-serif">Root &amp; Harvest</h3>
                    <p className="text-xs opacity-80">Secured via Razorpay</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl font-mono">
                      ₹
                      {subtotal +
                        calculateShippingFee(
                          shippingData?.pincode,
                          shippingData?.city,
                          subtotal,
                          shippingData?.state
                        ).shippingCharge}
                    </p>
                  </div>
                </div>

                <div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
                  {paymentStatus === "processing" && (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-10 h-10 border-4 border-forest/30 border-t-forest rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-dark/75">Connecting to Payment Gateway...</p>
                      <p className="text-xs text-dark/40 text-center">Do not close this window or click back.</p>
                    </div>
                  )}
                  {paymentStatus === "success" && (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-green-700">Order Placed Successfully!</p>
                      <p className="text-xs text-dark/40 text-center">Redirecting you to order confirmation...</p>
                    </div>
                  )}
                </div>

                <div className="bg-dark/5 p-3 text-center text-[10px] font-semibold text-dark/40 uppercase tracking-widest border-t border-dark/10">
                  Razorpay 256-Bit SSL Encrypted
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
