"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, 
  Send, 
  History, 
  Save, 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  Smartphone, 
  Key, 
  Eye, 
  EyeOff, 
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function WhatsappAdminPage() {
  const [config, setConfig] = useState({
    businessNumber: "",
    accessToken: "",
    phoneNumberId: "",
    enableCustomerAlerts: true,
    enableAdminAlerts: true,
  });

  const [testRecipient, setTestRecipient] = useState("");
  const [testMessage, setTestMessage] = useState("Hello from Root & Harvest! This is a test notification.");
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const [configAlert, setConfigAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testAlert, setTestAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showToken, setShowToken] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoadingConfig(true);
      const res = await fetch("/api/admin/whatsapp/config");
      const data = await res.json();
      if (res.ok && data.config) {
        setConfig({
          businessNumber: data.config.businessNumber || "",
          accessToken: data.config.accessToken || "",
          phoneNumberId: data.config.phoneNumberId || "",
          enableCustomerAlerts: data.config.enableCustomerAlerts,
          enableAdminAlerts: data.config.enableAdminAlerts,
        });
      }
    } catch (err: any) {
      console.error("Failed to load WhatsApp config", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch("/api/admin/whatsapp/logs");
      const data = await res.json();
      if (res.ok && data.logs) {
        setLogs(data.logs);
      }
    } catch (err: any) {
      console.error("Failed to load WhatsApp logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigAlert(null);
    try {
      const res = await fetch("/api/admin/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setConfigAlert({ type: "success", text: "WhatsApp API Configuration saved successfully!" });
      } else {
        setConfigAlert({ type: "error", text: data.error || "Failed to save configuration." });
      }
    } catch (err: any) {
      setConfigAlert({ type: "error", text: err.message || "Network error. Please try again." });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) {
      setTestAlert({ type: "error", text: "Recipient phone number is required." });
      return;
    }
    setSendingTest(true);
    setTestAlert(null);
    try {
      const res = await fetch("/api/admin/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: testRecipient, message: testMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestAlert({ type: "success", text: "Test WhatsApp notification sent successfully!" });
        fetchLogs(); // Reload logs
      } else {
        setTestAlert({ type: "error", text: data.error || "Failed to send test notification." });
      }
    } catch (err: any) {
      setTestAlert({ type: "error", text: err.message || "Network error sending test message." });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24 text-left">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-forest/5 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link href="/admin" className="text-xs uppercase tracking-wider text-gold font-semibold hover:underline flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                </Link>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif text-forest font-light flex items-center gap-3">
                <Settings className="w-8 h-8 text-gold" /> WhatsApp Cloud API Control
              </h1>
            </div>
            
            <button 
              onClick={fetchLogs}
              className="text-xs font-semibold uppercase tracking-wider text-forest bg-white border border-forest/10 px-4 py-2 hover:bg-forest/5 flex items-center gap-2"
            >
              <History className="w-4 h-4" /> Refresh Logs
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Config Form Panel (7 Columns) */}
            <div className="lg:col-span-7 bg-white border border-forest/5 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-forest/5 pb-3">
                <Key className="w-5 h-5 text-forest" />
                <h3 className="text-lg font-serif text-forest font-semibold">Meta Cloud API Credentials</h3>
              </div>

              {loadingConfig ? (
                <p className="text-xs text-dark/60 py-6">Loading WhatsApp configurations...</p>
              ) : (
                <form onSubmit={handleSaveConfig} className="space-y-6 text-xs text-dark">
                  
                  {configAlert && (
                    <div className={`p-4 border text-xs flex gap-3 ${
                      configAlert.type === "success" 
                        ? "bg-green-50 border-green-200 text-green-700" 
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                      {configAlert.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{configAlert.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Phone Number ID */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-forest/60 block">Phone Number ID</label>
                      <input
                        type="text"
                        required
                        value={config.phoneNumberId}
                        onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                        placeholder="e.g. 1048382910482"
                        className="w-full p-3 border border-forest/15 bg-brand-bg/5 font-mono text-xs focus:border-forest focus:outline-none"
                      />
                    </div>

                    {/* Business/Admin Phone Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-forest/60 block">Business/Admin Number (Recipient)</label>
                      <input
                        type="text"
                        required
                        value={config.businessNumber}
                        onChange={(e) => setConfig({ ...config, businessNumber: e.target.value })}
                        placeholder="e.g. 9666913832, 8008076707"
                        className="w-full p-3 border border-forest/15 bg-brand-bg/5 text-xs focus:border-forest focus:outline-none"
                      />
                      <span className="text-[9px] text-dark/50 block">Comma-separated numbers that receive admin order notifications.</span>
                    </div>
                  </div>

                  {/* Access Token */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-forest/60 block">Meta Permanent System User Token</label>
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        required
                        value={config.accessToken}
                        onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                        placeholder="EAABw..."
                        className="w-full p-3 pr-10 border border-forest/15 bg-brand-bg/5 font-mono text-xs focus:border-forest focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-3 text-forest/60 hover:text-forest"
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Notification Toggle Toggles */}
                  <div className="border-t border-forest/5 pt-6 space-y-4">
                    <label className="text-[10px] uppercase font-semibold text-forest/60 block">Notification Routing Rules</label>
                    
                    <div className="flex items-center justify-between p-3 border border-forest/5 bg-brand-bg/10">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-forest block">Customer Order Alerts</span>
                        <span className="text-[10px] text-dark/50">Send order placement confirmations to buyers.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, enableCustomerAlerts: !config.enableCustomerAlerts })}
                        className="text-forest focus:outline-none"
                      >
                        {config.enableCustomerAlerts ? (
                          <ToggleRight className="w-8 h-8 text-forest" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-dark/40" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-forest/5 bg-brand-bg/10">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-forest block">Admin Order Alerts</span>
                        <span className="text-[10px] text-dark/50">Receive notifications on the Business Number.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, enableAdminAlerts: !config.enableAdminAlerts })}
                        className="text-forest focus:outline-none"
                      >
                        {config.enableAdminAlerts ? (
                          <ToggleRight className="w-8 h-8 text-forest" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-dark/40" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="w-full py-3 bg-forest text-brand-bg uppercase tracking-widest font-semibold text-[10px] hover:bg-forest-light transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingConfig ? "Saving credentials..." : "Save Configuration"}
                  </button>

                </form>
              )}
            </div>

            {/* Test Notification Panel (5 Columns) */}
            <div className="lg:col-span-5 bg-white border border-forest/5 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-forest/5 pb-3">
                <Send className="w-5 h-5 text-forest" />
                <h3 className="text-lg font-serif text-forest font-semibold">Test Connection</h3>
              </div>

              <form onSubmit={handleSendTest} className="space-y-4 text-xs text-dark">
                
                {testAlert && (
                  <div className={`p-4 border text-xs flex gap-3 ${
                    testAlert.type === "success" 
                      ? "bg-green-50 border-green-200 text-green-700" 
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}>
                    {testAlert.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{testAlert.text}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-forest/60 block">Test Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-dark/40 font-semibold font-mono text-xs">+91</span>
                    <input
                      type="text"
                      required
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      placeholder="9666913832"
                      className="w-full p-3 pl-10 border border-forest/15 bg-brand-bg/5 text-xs focus:border-forest focus:outline-none"
                    />
                  </div>
                  <span className="text-[9px] text-dark/50 block">Include country code if outside India (defaults to +91).</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-forest/60 block">Message Body</label>
                  <textarea
                    required
                    rows={4}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full p-3 border border-forest/15 bg-brand-bg/5 text-xs focus:border-forest focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingTest}
                  className="w-full py-3 bg-gold text-forest uppercase tracking-widest font-semibold text-[10px] hover:bg-gold-light transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingTest ? "Sending message..." : "Send Test Notification"}
                </button>
              </form>
            </div>

          </div>

          {/* Logs History Section */}
          <div className="bg-white border border-forest/5 p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-forest/5 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-forest" />
                <h3 className="text-lg font-serif text-forest font-semibold">Notification transmission logs</h3>
              </div>
              <span className="text-[10px] text-dark/50 font-mono">Showing last 100 entries</span>
            </div>

            {loadingLogs ? (
              <p className="text-xs text-dark/60 py-6 text-center">Fetching log history...</p>
            ) : logs.length === 0 ? (
              <p className="text-xs text-dark/60 py-12 text-center">No WhatsApp notifications have been logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-light text-dark divide-y divide-forest/10">
                  <thead className="bg-brand-bg text-[10px] uppercase font-semibold text-forest text-left">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Retries</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Details / Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/5 text-left">
                    {logs.map((log) => {
                      const responseDetails = log.errorMessage 
                        ? log.errorMessage 
                        : (log.metaResponse ? "Meta API Accepted Request" : "No details");
                      
                      return (
                        <tr key={log.id} className="hover:bg-brand-bg/20">
                          <td className="p-3 font-mono text-[10px] whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 font-mono font-semibold">{log.recipient}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              log.messageType === "ADMIN" 
                                ? "bg-purple-50 text-purple-700 border border-purple-200" 
                                : log.messageType === "CUSTOMER"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-gray-50 text-gray-600 border border-gray-200"
                            }`}>
                              {log.messageType}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-center">{log.retryCount}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              log.status === "SUCCESS" 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : "bg-red-50 text-red-600 border border-red-200"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs truncate text-[10px] text-dark/70" title={responseDetails}>
                            {responseDetails}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
