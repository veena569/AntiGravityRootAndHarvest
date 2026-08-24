"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ALL_INDIAN_STATES, getCitiesForState } from "@/data/india-locations";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simple form state for adding a new address
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", isDefault: false, type: "Home"
  });
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCityInput, setCustomCityInput] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAddresses = () => {
    fetch("/api/addresses")
      .then(res => res.json())
      .then(data => {
        if (data.addresses) setAddresses(data.addresses);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", isDefault: false, type: "Home" });
        fetchAddresses();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-forest/5 rounded-sm" />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-forest">Saved Addresses</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="text-xs uppercase tracking-widest font-semibold text-forest hover:text-gold transition-colors"
          >
            + Add New
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 md:p-8 border border-forest/20 shadow-sm mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-dark mb-6">Add New Address</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Phone Number</label>
                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Address Line 1</label>
                <input required value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value})} className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Address Line 2 (Optional)</label>
                <input value={formData.addressLine2} onChange={e => setFormData({...formData, addressLine2: e.target.value})} className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">State</label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => {
                    setFormData({ ...formData, state: e.target.value, city: "" });
                    setIsCustomCity(false);
                    setCustomCityInput("");
                  }}
                  className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 cursor-pointer"
                >
                  <option value="">-- Select State --</option>
                  {ALL_INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">City / District</label>
                {(() => {
                  const stateCities = getCitiesForState(formData.state);
                  const currentCity = formData.city;
                  const isInList = stateCities.includes(currentCity);

                  return (
                    <div className="space-y-2">
                      <select
                        required
                        disabled={!formData.state}
                        value={isCustomCity ? "Other" : (isInList ? currentCity : (currentCity ? "Other" : ""))}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "Other") {
                            setIsCustomCity(true);
                            setFormData({ ...formData, city: customCityInput });
                          } else {
                            setIsCustomCity(false);
                            setFormData({ ...formData, city: val });
                          }
                        }}
                        className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 cursor-pointer disabled:opacity-50"
                      >
                        <option value="">
                          {formData.state ? "-- Select City / District --" : "Select State first"}
                        </option>
                        {stateCities.map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                        <option value="Other">Other (Enter Manually)</option>
                      </select>

                      {isCustomCity && (
                        <input
                          required
                          type="text"
                          placeholder="Type City / Town / Village name"
                          value={customCityInput}
                          onChange={(e) => {
                            setCustomCityInput(e.target.value);
                            setFormData({ ...formData, city: e.target.value });
                          }}
                          className="w-full p-3 text-sm border-2 border-gold/40 focus:border-forest outline-none bg-white placeholder:text-dark/40"
                        />
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Pincode</label>
                <input required maxLength={6} value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full p-3 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold block mb-2">Address Tag</label>
                <div className="flex gap-3">
                  {["Home", "Office", "Other"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData({...formData, type: tag})}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded-sm transition-all ${
                        formData.type === tag
                          ? "bg-forest text-white border-forest shadow-sm"
                          : "border-forest/20 text-forest hover:bg-forest/5 bg-transparent"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="accent-forest" />
                <label htmlFor="isDefault" className="text-xs text-dark/70 cursor-pointer">Set as default shipping address</label>
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-forest/10">
              <button type="submit" disabled={saving} className="px-6 py-3 bg-forest text-white text-[10px] uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Save Address"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-forest text-forest text-[10px] uppercase tracking-widest font-semibold hover:bg-forest/5 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-white p-12 border border-forest/5 shadow-sm text-center">
          <p className="text-dark/60 text-sm">You haven't saved any addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white p-6 border border-forest/10 shadow-sm relative group">
              {address.isDefault && (
                <span className="absolute top-6 right-6 bg-forest text-white text-[9px] uppercase tracking-widest px-2 py-1 font-semibold">
                  Default
                </span>
              )}
              <div className="flex items-center gap-2">
                <p className="font-semibold text-forest text-sm">{address.name}</p>
                {address.type && (
                  <span className="bg-forest/10 text-forest text-[9px] uppercase tracking-widest px-2 py-0.5 font-semibold rounded-sm">
                    {address.type}
                  </span>
                )}
              </div>
              <div className="mt-4 text-xs text-dark/70 space-y-1">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state} - {address.pincode}</p>
                <p className="pt-2 text-dark/90 font-medium">Ph: {address.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
