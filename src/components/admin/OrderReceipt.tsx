"use client";

import React from "react";
import Image from "next/image";
import { Printer, X, ExternalLink, MapPin, Phone, Mail, CheckCircle2, AlertCircle, Clock, RotateCcw } from "lucide-react";

export interface OrderReceiptItem {
  id?: string;
  productId?: string;
  name: string;
  size?: string;
  price: number;
  quantity: number;
}

export interface OrderReceiptData {
  id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  orderStatus?: string;
  paymentId?: string | null;
  createdAt: string | Date;
  shippingName: string;
  shippingPhone: string;
  shippingEmail?: string | null;
  shippingAddress1: string;
  shippingAddress2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  addressType?: string | null;
  items?: OrderReceiptItem[];
  // Optional partial payment overrides if recorded
  onlinePaid?: number;
  paidAmount?: number;
  codAmount?: number;
}

export interface OrderReceiptProps {
  order: OrderReceiptData;
  onClose?: () => void;
  showModalControls?: boolean;
}

export function computeReceiptTotals(order: OrderReceiptData) {
  const items = order.items && order.items.length > 0 ? order.items : [];
  const itemsSubtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  
  const grandTotal = Number(order.total) || 0;
  
  // Calculate shipping charges or discounts
  let shippingCharges = 0;
  let discount = 0;
  
  if (items.length > 0) {
    if (grandTotal > itemsSubtotal) {
      shippingCharges = grandTotal - itemsSubtotal;
    } else if (itemsSubtotal > grandTotal) {
      discount = itemsSubtotal - grandTotal;
    }
  } else {
    // If no items list present, use grand total as subtotal
    shippingCharges = 0;
    discount = 0;
  }

  // Payment Breakdown
  const normalizedStatus = (order.paymentStatus || "").toLowerCase().trim();
  const hasPaymentId = Boolean(order.paymentId && order.paymentId.trim() !== "");
  const isRefunded = normalizedStatus === "refunded";
  const isFailed = normalizedStatus === "failed";
  const isPaid = normalizedStatus === "paid" || (hasPaymentId && !["failed", "cod", "refunded", "pending"].includes(normalizedStatus));
  const isCOD = normalizedStatus === "cod";
  const isPending = normalizedStatus === "pending" || (!isPaid && !isCOD && !isRefunded && !isFailed);

  let paymentMode = "Online Gateway (Razorpay / UPI)";
  let paymentStatusLabel = "Paid";
  let onlineCollected = 0;
  let codToCollect = 0;
  let alreadyPaid = 0;
  let balanceDue = 0;
  let badgeColor = "bg-green-100 text-green-800 border-green-300";
  let deliveryInstruction = "FULLY PAID ONLINE — DO NOT COLLECT CASH FROM CUSTOMER";

  // Check for partial payment fields if present
  const explicitOnlinePaid = typeof order.onlinePaid === "number" ? order.onlinePaid : typeof order.paidAmount === "number" ? order.paidAmount : null;
  const isPartial = explicitOnlinePaid !== null && explicitOnlinePaid > 0 && explicitOnlinePaid < grandTotal;

  if (isPartial) {
    paymentMode = "Partial Online + COD Balance";
    paymentStatusLabel = "Partially Paid";
    onlineCollected = explicitOnlinePaid;
    codToCollect = Math.max(0, grandTotal - explicitOnlinePaid);
    alreadyPaid = explicitOnlinePaid;
    balanceDue = codToCollect;
    badgeColor = "bg-amber-100 text-amber-900 border-amber-300";
    deliveryInstruction = `PARTIALLY PAID — COLLECT BALANCE ₹${codToCollect.toFixed(2)} CASH / UPI ON DELIVERY`;
  } else if (isRefunded) {
    paymentMode = hasPaymentId ? "Online (Refunded)" : "Cash on Delivery (Refunded)";
    paymentStatusLabel = "Refunded";
    onlineCollected = 0;
    codToCollect = 0;
    alreadyPaid = 0;
    balanceDue = 0;
    badgeColor = "bg-gray-100 text-gray-800 border-gray-300";
    deliveryInstruction = "ORDER REFUNDED — DO NOT DISPATCH OR COLLECT PAYMENT";
  } else if (isFailed) {
    paymentMode = "Online Gateway";
    paymentStatusLabel = "Payment Failed";
    onlineCollected = 0;
    codToCollect = 0;
    alreadyPaid = 0;
    balanceDue = grandTotal;
    badgeColor = "bg-red-100 text-red-800 border-red-300";
    deliveryInstruction = `PAYMENT FAILED — COLLECT ₹${grandTotal.toFixed(2)} BEFORE RELEASING PARCEL`;
  } else if (isPaid) {
    paymentMode = "Online Gateway (Razorpay / UPI)";
    paymentStatusLabel = "Paid";
    onlineCollected = grandTotal;
    codToCollect = 0;
    alreadyPaid = grandTotal;
    balanceDue = 0;
    badgeColor = "bg-green-100 text-green-800 border-green-300";
    deliveryInstruction = "FULLY PAID ONLINE — DO NOT COLLECT CASH FROM CUSTOMER";
  } else if (isCOD) {
    paymentMode = "Cash on Delivery (COD)";
    paymentStatusLabel = "Pending on Delivery";
    onlineCollected = 0;
    codToCollect = grandTotal;
    alreadyPaid = 0;
    balanceDue = grandTotal;
    badgeColor = "bg-yellow-100 text-yellow-900 border-yellow-300";
    deliveryInstruction = `CASH ON DELIVERY (COD) — COLLECT ₹${codToCollect.toFixed(2)} CASH / UPI ON DELIVERY`;
  } else if (isPending) {
    paymentMode = hasPaymentId ? "Online Gateway (Pending)" : "Pending";
    paymentStatusLabel = "Pending";
    onlineCollected = 0;
    codToCollect = 0;
    alreadyPaid = 0;
    balanceDue = grandTotal;
    badgeColor = "bg-amber-100 text-amber-900 border-amber-300";
    deliveryInstruction = `PAYMENT PENDING — OUTSTANDING AMOUNT: ₹${grandTotal.toFixed(2)}`;
  } else {
    // Default fallback
    paymentMode = hasPaymentId ? "Online Gateway" : "Cash on Delivery (COD)";
    paymentStatusLabel = order.paymentStatus || "Pending";
    onlineCollected = isPaid ? grandTotal : 0;
    codToCollect = isPaid ? 0 : grandTotal;
    alreadyPaid = isPaid ? grandTotal : 0;
    balanceDue = isPaid ? 0 : grandTotal;
    deliveryInstruction = isPaid
      ? "FULLY PAID ONLINE — DO NOT COLLECT CASH"
      : `COLLECT ₹${grandTotal.toFixed(2)} ON DELIVERY`;
  }

  return {
    items,
    itemsSubtotal: items.length > 0 ? itemsSubtotal : grandTotal,
    shippingCharges,
    discount,
    grandTotal,
    paymentMode,
    paymentStatusLabel,
    onlineCollected,
    codToCollect,
    alreadyPaid,
    balanceDue,
    badgeColor,
    deliveryInstruction,
    isPaid,
    isCOD,
  };
}

export function OrderReceipt({ order, onClose, showModalControls = true }: OrderReceiptProps) {
  const totals = computeReceiptTotals(order);

  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(order.createdAt);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(order.createdAt);
    }
  }, [order.createdAt]);

  const invoiceNumber = `INV-${order.orderNumber}`;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleOpenStandalone = () => {
    if (typeof window !== "undefined") {
      window.open(`/admin/receipt?orderId=${encodeURIComponent(order.orderNumber)}`, "_blank");
    }
  };

  return (
    <div className="receipt-wrapper w-full bg-white text-gray-900 font-sans">
      {/* Print CSS Stylesheet (A5 Portrait default with graceful A4 scaling) */}
      <style jsx global>{`
        @page {
          size: A5 portrait;
          margin: 6mm 6mm 6mm 6mm;
        }

        @media print {
          html, body {
            background: #ffffff !important;
            color: #111827 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }

          /* Hide all surrounding website/admin UI */
          header, footer, nav, aside, .no-print, .print\\:hidden {
            display: none !important;
          }

          /* Ensure modal backdrop is removed in print */
          .fixed, .backdrop-blur-sm, .bg-black\\/60 {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
            width: 100% !important;
            inset: auto !important;
          }

          .receipt-paper {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border: 1px solid #9ca3af !important;
            background: #ffffff !important;
            page-break-after: auto;
          }

          .page-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Force browser graphics printing */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Screen Controls Header (Hidden in Print) */}
      {showModalControls && (
        <div className="no-print bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
              Tax Invoice &amp; Delivery Slip
            </span>
            <span className="text-xs font-mono text-slate-400">({order.orderNumber})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Print Receipt or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleOpenStandalone}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open dedicated print page in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Close Receipt Modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Printable Receipt Document (Styled for A5 & A4) */}
      <div className="receipt-paper bg-white p-5 md:p-6 max-w-2xl mx-auto border border-gray-300 shadow-sm text-xs leading-relaxed">
        
        {/* ========================================================= */}
        {/* 1. RECEIPT HEADER */}
        {/* ========================================================= */}
        <div className="border-b-2 border-[#1E4A3A] pb-4 mb-4">
          <div className="flex justify-between items-start gap-4">
            
            {/* Brand Logo & Tagline */}
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border border-[#B8903A]/40 bg-[#F8F5EF] shadow-xs">
                <Image
                  src="/logo.jpg"
                  alt="Root & Harvest Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                  priority
                />
              </div>

              <div>
                <h1 className="font-serif text-lg md:text-xl font-bold tracking-wider text-[#1E4A3A] uppercase leading-none">
                  ROOT &amp; HARVEST
                </h1>
                <p className="text-[10px] font-medium text-[#B8903A] tracking-wide mt-0.5">
                  “From Trusted Farms to Your Family”
                </p>
                <p className="text-[9px] text-gray-500 mt-1 leading-tight">
                  Flat No. 201, Majestic Pleasant Homes, Serilingampally, Hyderabad, TS - 500019
                </p>
                <p className="text-[9px] text-gray-500 leading-tight">
                  Ph: +91 9121603832, 8008076707 | Email: hello@rootandharvest.in | www.rootandharvest.in
                </p>
              </div>
            </div>

            {/* Invoice & Order Identity */}
            <div className="text-right shrink-0">
              <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-[#1E4A3A] text-white rounded-xs">
                TAX INVOICE &amp; RECEIPT
              </span>
              <p className="font-mono text-xs font-bold text-[#1E4A3A] mt-1">
                Order: #{order.orderNumber}
              </p>
              <p className="font-mono text-[10px] text-gray-600">
                Invoice: {invoiceNumber}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Date: {formattedDate}
              </p>
              <div className="mt-1">
                <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${totals.badgeColor}`}>
                  {totals.paymentStatusLabel}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CUSTOMER BILLING & SHIPPING ADDRESSES */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 gap-3 mb-4 page-break-avoid">
          {/* Billing Address */}
          <div className="border border-gray-200 bg-gray-50/50 p-2.5 rounded-sm">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#1E4A3A] block border-b border-gray-200 pb-1 mb-1.5">
              Customer / Billing Details
            </span>
            <p className="font-bold text-gray-900 text-[11px]">{order.shippingName}</p>
            <p className="text-gray-700 text-[10px] flex items-center gap-1 mt-0.5">
              <Phone className="w-2.5 h-2.5 text-gray-500 inline" /> {order.shippingPhone}
            </p>
            {order.shippingEmail && (
              <p className="text-gray-600 text-[9px] truncate flex items-center gap-1">
                <Mail className="w-2.5 h-2.5 text-gray-400 inline" /> {order.shippingEmail}
              </p>
            )}
            <div className="text-gray-600 text-[10px] mt-1 leading-snug">
              <p>{order.shippingAddress1}</p>
              {order.shippingAddress2 && <p>{order.shippingAddress2}</p>}
              <p>{order.shippingCity}, {order.shippingState} - <span className="font-mono font-semibold">{order.shippingPincode}</span></p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border border-gray-200 bg-gray-50/50 p-2.5 rounded-sm">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#1E4A3A] block border-b border-gray-200 pb-1 mb-1.5 flex items-center justify-between">
              <span>Delivery / Shipping Address</span>
              <span className="text-[8px] bg-white border border-gray-300 px-1 py-0.2 rounded text-gray-600">
                {order.addressType || "Home"}
              </span>
            </span>
            <p className="font-bold text-gray-900 text-[11px]">{order.shippingName}</p>
            <p className="text-gray-700 text-[10px] flex items-center gap-1 mt-0.5 font-medium">
              <MapPin className="w-2.5 h-2.5 text-amber-600 inline" /> {order.shippingAddress1}
            </p>
            {order.shippingAddress2 && (
              <p className="text-gray-600 text-[10px]">{order.shippingAddress2}</p>
            )}
            <p className="text-gray-700 text-[10px] font-semibold mt-0.5">
              {order.shippingCity}, {order.shippingState} - <span className="font-mono text-gray-900">{order.shippingPincode}</span>
            </p>
            <p className="text-gray-800 text-[10px] font-mono mt-1">
              Ph: <span className="font-bold">{order.shippingPhone}</span>
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. PRODUCT DETAILS TABLE */}
        {/* ========================================================= */}
        <div className="mb-4 page-break-avoid">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-[#1E4A3A] text-white text-[9px] uppercase tracking-wider">
                <th className="py-1.5 px-2.5 border border-gray-300 font-semibold w-8 text-center">#</th>
                <th className="py-1.5 px-2.5 border border-gray-300 font-semibold">Product Description</th>
                <th className="py-1.5 px-2 border border-gray-300 font-semibold text-center w-12">Qty</th>
                <th className="py-1.5 px-2.5 border border-gray-300 font-semibold text-right w-20">Unit Price</th>
                <th className="py-1.5 px-2.5 border border-gray-300 font-semibold text-right w-20">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-[10px]">
              {totals.items && totals.items.length > 0 ? (
                totals.items.map((item, idx) => {
                  const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                  return (
                    <tr key={item.id || idx} className="hover:bg-gray-50/50">
                      <td className="py-1.5 px-2.5 border border-gray-300 text-center font-mono text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2.5 border border-gray-300 font-medium text-gray-900">
                        <span>{item.name}</span>
                        {item.size && (
                          <span className="text-gray-500 text-[9px] font-normal ml-1">
                            ({item.size})
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 border border-gray-300 text-center font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-1.5 px-2.5 border border-gray-300 text-right font-mono">
                        ₹{Number(item.price).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2.5 border border-gray-300 text-right font-mono font-semibold text-gray-900">
                        ₹{lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="py-1.5 px-2.5 border border-gray-300 text-center font-mono text-gray-500">1</td>
                  <td className="py-1.5 px-2.5 border border-gray-300 font-medium text-gray-900">
                    Root &amp; Harvest Farm Produce
                  </td>
                  <td className="py-1.5 px-2 border border-gray-300 text-center font-mono">1</td>
                  <td className="py-1.5 px-2.5 border border-gray-300 text-right font-mono">
                    ₹{totals.grandTotal.toFixed(2)}
                  </td>
                  <td className="py-1.5 px-2.5 border border-gray-300 text-right font-mono font-semibold text-gray-900">
                    ₹{totals.grandTotal.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Subtotal, Shipping, Taxes and Grand Total */}
          <div className="flex justify-between items-start mt-2 pt-2 border-t border-gray-200">
            <div className="text-[9px] text-gray-500 max-w-xs space-y-0.5">
              <p>• Goods once sold are backed by Root &amp; Harvest purity guarantee.</p>
              <p>• GST/Taxes: Included in prices as per applicable farm produce rates.</p>
            </div>

            <div className="w-56 space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{totals.itemsSubtotal.toFixed(2)}</span>
              </div>

              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span>-₹{totals.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping Charges:</span>
                <span className={totals.shippingCharges === 0 ? "text-emerald-700 font-bold" : ""}>
                  {totals.shippingCharges > 0 ? `₹${totals.shippingCharges.toFixed(2)}` : "FREE (₹0.00)"}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 text-[9px]">
                <span>Taxes (GST):</span>
                <span>Included (₹0.00)</span>
              </div>

              <div className="flex justify-between border-t border-gray-400 pt-1 text-xs font-bold text-[#1E4A3A]">
                <span className="uppercase">Grand Total:</span>
                <span className="text-sm">₹{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. PAYMENT COLLECTION DETAILS SECTION */}
        {/* ========================================================= */}
        <div className="border-2 border-[#1E4A3A] bg-[#F8F5EF]/60 p-3 rounded-sm mb-4 page-break-avoid">
          <div className="flex items-center justify-between border-b border-[#1E4A3A]/20 pb-1.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E4A3A] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B8903A]" />
              PAYMENT DETAILS &amp; COLLECTION SLIP
            </span>
            <span className="text-[9px] font-mono text-gray-600">
              {order.paymentId ? `Ref: ${order.paymentId}` : "Payment Ref: Cash on Delivery"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[10px]">
            <div>
              <span className="text-[9px] text-gray-500 block uppercase">Payment Mode</span>
              <span className="font-semibold text-gray-900">{totals.paymentMode}</span>
            </div>

            <div>
              <span className="text-[9px] text-gray-500 block uppercase">Payment Status</span>
              <span className={`inline-block font-bold px-1.5 py-0.2 rounded text-[9px] uppercase border ${totals.badgeColor}`}>
                {totals.paymentStatusLabel}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-gray-500 block uppercase">Online Payment Collected</span>
              <span className="font-mono font-bold text-gray-900">₹{totals.onlineCollected.toFixed(2)}</span>
            </div>

            <div>
              <span className="text-[9px] text-gray-500 block uppercase">Amount Already Paid</span>
              <span className="font-mono font-bold text-emerald-800">₹{totals.alreadyPaid.toFixed(2)}</span>
            </div>

            <div>
              <span className="text-[9px] text-gray-500 block uppercase">COD Amount to Collect</span>
              <span className={`font-mono font-bold ${totals.codToCollect > 0 ? "text-red-700 text-xs" : "text-gray-900"}`}>
                ₹{totals.codToCollect.toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-gray-500 block uppercase">Remaining Amount Due</span>
              <span className={`font-mono font-bold ${totals.balanceDue > 0 ? "text-red-700 text-xs" : "text-emerald-800"}`}>
                ₹{totals.balanceDue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery Boy / Courier Executive Action Callout */}
          <div className={`mt-2.5 p-2 rounded text-center text-[10px] font-bold tracking-wide uppercase border ${
            totals.codToCollect > 0
              ? "bg-amber-100 text-amber-950 border-amber-300"
              : "bg-emerald-100 text-emerald-950 border-emerald-300"
          }`}>
            {totals.deliveryInstruction}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. RETURN ADDRESS SLIP (MANDATORY EXACT DETAILS) */}
        {/* ========================================================= */}
        <div className="border-2 border-dashed border-gray-400 bg-gray-50/70 p-3 rounded-sm page-break-avoid">
          <div className="flex items-start gap-2">
            <div className="shrink-0 pt-0.5">
              <RotateCcw className="w-3.5 h-3.5 text-[#1E4A3A]" />
            </div>
            <div className="w-full">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-red-800">
                IF UNDELIVERED, PLEASE RETURN TO:
              </h2>
              
              <div className="mt-1 text-[10px] text-gray-900 leading-snug">
                <p className="font-serif font-bold text-xs text-[#1E4A3A]">ROOT &amp; HARVEST</p>
                <p className="font-medium">Flat No. 201, Majestic Pleasant Homes,</p>
                <p className="font-medium">Central Park Phase - 1, Serilingampally,</p>
                <p className="font-medium">Hyderabad, Telangana - 500019, India.</p>
                <p className="font-medium mt-0.5 text-gray-900">Contact / Phone: <span className="font-mono font-bold text-[#1E4A3A]">8008076707</span></p>
              </div>

              <p className="text-[9px] italic text-gray-600 mt-1.5 border-t border-gray-300 pt-1">
                “If this parcel cannot be delivered to the recipient, please return it to the above address.”
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Footer Note */}
        <div className="mt-3 pt-2 border-t border-gray-200 text-center text-[8px] text-gray-400">
          This is an official computer-generated receipt issued by Root &amp; Harvest (www.rootandharvest.in).
        </div>

      </div>
    </div>
  );
}
