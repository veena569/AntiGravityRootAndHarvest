"use client";

import { useAuth } from "@/components/layout/AuthProvider";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-xl font-serif text-forest mb-6">Personal Details</h2>
        <div className="bg-white p-8 border border-forest/5 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Full Name</label>
              <p className="text-sm font-medium">{user.name || "—"}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Mobile Number</label>
              <p className="text-sm font-medium">{user.phone || "—"}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Email Address</label>
              <p className="text-sm font-medium">{user.email || "—"}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Account Type</label>
              <p className="text-sm font-medium">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
