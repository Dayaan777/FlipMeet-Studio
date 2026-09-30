"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const TRACKING_STEPS = [
  { key: "ORDER_SECURED", label: "ORDER SECURED" },
  { key: "STUDIO_PROCESSING", label: "STUDIO PROCESSING" },
  { key: "DISPATCHED", label: "DISPATCHED" },
  { key: "DELIVERED", label: "DELIVERED" },
];

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrderData(null);
    setCopied(false);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to locate order.");
      }

      setOrderData(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyTracking = () => {
    if (orderData?.tracking_number) {
      navigator.clipboard.writeText(orderData.tracking_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine current step index
  const currentStatusIndex = orderData 
    ? TRACKING_STEPS.findIndex((s) => s.key === orderData.status) 
    : -1;
  const activeIndex = currentStatusIndex >= 0 ? currentStatusIndex : 0; // Default to step 0 if pending or unknown

  return (
    <>
      <NavBar mobileSolid />
      <main className="min-h-screen bg-base-bg pt-32 pb-20 px-6 sm:px-8 text-text-primary selection:bg-accent selection:text-white">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl tracking-wider text-text-primary mb-3 uppercase">Locate Order</h1>
            <p className="text-sm tracking-widest text-text-secondary uppercase">
              Enter your credentials to track your archive.
            </p>
          </div>

          {!orderData ? (
            <form onSubmit={handleTrack} className="bg-base-surface/50 border border-base-border backdrop-blur-md p-6 sm:p-8 rounded-xl max-w-md mx-auto">
              {error && (
                <div className="mb-6 p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs text-center rounded-sm tracking-wide">
                  {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="orderId" className="block text-[10px] font-bold tracking-[0.25em] text-text-secondary mb-2 uppercase">
                    Order Number
                  </label>
                  <input
                    id="orderId"
                    type="text"
                    required
                    placeholder="e.g. #FM-2026-1049"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full bg-base-bg border border-base-border px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-white/20"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold tracking-[0.25em] text-text-secondary mb-2 uppercase">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Used at checkout"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-base-bg border border-base-border px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-white/20"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-accent hover:bg-accent/90 text-white font-bold text-[11px] tracking-[0.2em] uppercase py-3.5 rounded-sm transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center h-[46px]"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Track Details"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="max-w-md mx-auto">
              <button 
                onClick={() => setOrderData(null)}
                className="mb-8 text-[10px] tracking-widest text-text-secondary hover:text-white transition-colors flex items-center gap-2 uppercase"
              >
                <span>&larr;</span> Search Another
              </button>

              <div className="bg-base-surface/50 border border-base-border p-6 sm:p-8 rounded-xl backdrop-blur-md">
                <div className="mb-8 pb-6 border-b border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-accent uppercase mb-1">Order Found</p>
                    <p className="text-xl font-display tracking-wider">{orderData.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] tracking-widest text-text-secondary uppercase mb-1">Date</p>
                    <p className="text-xs font-mono text-white/80">
                      {new Date(orderData.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                {/* Vertical Stepper */}
                <div className="relative pl-3 space-y-8">
                  {/* Vertical Line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10" />
                  
                  {/* Filled Vertical Line */}
                  <div 
                    className="absolute left-[15px] top-2 w-px bg-accent transition-all duration-700 ease-out" 
                    style={{ height: `${(activeIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
                  />

                  {TRACKING_STEPS.map((step, index) => {
                    const isCompleted = index <= activeIndex;
                    const isActive = index === activeIndex;
                    
                    return (
                      <div key={step.key} className="relative flex items-center gap-6">
                        {/* Dot */}
                        <div className={`relative z-10 flex-shrink-0 w-2.5 h-2.5 rounded-full transition-colors duration-500 delay-[${index * 150}ms] ${
                          isCompleted ? "bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.8)]" : "bg-base-bg border border-white/20"
                        }`} />
                        
                        {/* Text */}
                        <div>
                          <p className={`text-xs tracking-[0.2em] font-bold transition-colors duration-300 ${
                            isActive ? "text-white" : isCompleted ? "text-white/70" : "text-white/30"
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Courier Box */}
                {(orderData.status === "DISPATCHED" || orderData.status === "DELIVERED") && orderData.tracking_number && (
                  <div className="mt-10 p-5 rounded-lg border border-accent/20 bg-accent/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <p className="text-[10px] tracking-widest text-text-secondary uppercase mb-3 font-bold">Shipping Details</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-white/60 mb-1 tracking-wider uppercase">Courier</p>
                        <p className="text-sm font-semibold tracking-wide">{orderData.courier_name || "Standard Shipping"}</p>
                      </div>
                      
                      <div className="sm:text-right">
                        <p className="text-xs text-white/60 mb-1 tracking-wider uppercase">Tracking Number</p>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-mono tracking-wider text-accent">{orderData.tracking_number}</p>
                          <button 
                            onClick={copyTracking}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Copy to clipboard"
                          >
                            {copied ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
