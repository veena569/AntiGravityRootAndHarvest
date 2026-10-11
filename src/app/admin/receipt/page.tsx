"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, RefreshCw, AlertCircle } from "lucide-react";
import { OrderReceipt, OrderReceiptData } from "@/components/admin/OrderReceipt";

function ReceiptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || searchParams.get("id");

  const [order, setOrder] = useState<OrderReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!orderId) {
      setError("No Order ID provided in URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders?orderId=${encodeURIComponent(orderId)}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login?callbackUrl=" + encodeURIComponent(`/admin/receipt?orderId=${orderId}`));
        return;
      }
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || "Order not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load order receipt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center max-w-sm w-full space-y-3">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-800">Generating Print-Ready Receipt...</p>
          <p className="text-xs text-slate-500">Fetching live order records from database</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 text-center max-w-md w-full space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Receipt Not Available</h2>
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-100">
            {error || "Could not locate order details."}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={fetchOrder}
              className="px-3.5 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
            <Link
              href="/admin"
              className="px-3.5 py-1.5 bg-slate-200 text-slate-800 text-xs font-semibold rounded hover:bg-slate-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 py-4 sm:py-8 px-2 sm:px-4">
      {/* Top Navigation Bar (Hidden in Print) */}
      <div className="no-print max-w-2xl mx-auto mb-4 flex items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-xs">
        <Link
          href="/admin"
          className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Receipt Canvas */}
      <div className="max-w-2xl mx-auto shadow-md rounded-lg overflow-hidden">
        <OrderReceipt order={order} showModalControls={false} />
      </div>
    </div>
  );
}

export default function AdminReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <p className="text-xs text-slate-500">Loading receipt engine...</p>
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  );
}
