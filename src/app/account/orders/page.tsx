"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="animate-pulse h-32 bg-forest/5 rounded-sm" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2 className="text-xl font-serif text-forest mb-6">Order History</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white p-12 border border-forest/5 shadow-sm text-center space-y-4">
          <p className="text-dark/60 text-sm">You haven't placed any orders yet.</p>
          <Link href="/products" className="inline-block mt-4 text-xs font-semibold uppercase tracking-widest text-forest hover:text-gold transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-forest/5 shadow-sm overflow-hidden">
              <div className="bg-forest/5 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between border-b border-forest/10 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold mb-1">Order Placed</p>
                  <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold mb-1">Total</p>
                  <p className="text-sm font-medium">₹{order.total}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold mb-1">Order #</p>
                  <p className="text-sm font-mono font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-semibold rounded-full ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="text-right">
                  <Link href={`/order-success?id=${order.id}`} className="text-xs font-semibold uppercase tracking-widest text-forest hover:text-gold transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-forest">{item.name}</p>
                      <p className="text-xs text-dark/60 mt-1">Size: {item.size} • Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
