"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editCourier, setEditCourier] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders"); if (!res.ok) throw new Error("Failed to fetch orders"); const data = await res.json(); const error = null;

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load orders." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEditClick = (order: any) => {
    setEditingId(order.id);
    setEditStatus(order.status || "ORDER_SECURED");
    setEditCourier(order.courier_name || "");
    setEditTracking(order.tracking_number || "");
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, status: editStatus, courier_name: editCourier || null, tracking_number: editTracking || null }) }); const error = res.ok ? null : await res.text();

      if (error) throw error;
      
      setStatusMessage({ type: "success", text: "Order updated successfully!" });
      setEditingId(null);
      fetchOrders();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-base-bg text-text-primary p-6 md:p-12 font-sans selection:bg-accent selection:text-black pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-base-border">
          <div>
            <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-text-secondary/60 mb-3">
              <Link href="/admin" className="hover:text-accent">&larr; BACK TO PRODUCTS</Link>
            </div>
            <h1 className="font-display tracking-widest text-3xl md:text-4xl font-bold uppercase tracking-wide text-text-primary mt-1">
              ORDER MANAGEMENT
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Live sync with <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">orders</code> table.
            </p>
          </div>
          <button 
            onClick={fetchOrders}
            className="text-xs font-bold tracking-widest uppercase bg-base-surface border border-base-border px-5 py-2 hover:border-accent hover:text-accent transition-all"
          >
            {loading ? "Syncing..." : "Refresh"}
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-4 text-xs font-bold tracking-widest uppercase rounded-sm border ${
            statusMessage.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {statusMessage.text}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-base-surface border border-base-border rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/50 text-text-secondary text-[10px] uppercase tracking-widest border-b border-base-border">
                <tr>
                  <th className="px-6 py-4 font-bold">Order ID & Date</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Tracking</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-border text-text-primary/80">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-accent">{order.id}</div>
                      <div className="text-[10px] text-text-secondary mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{order.customer_name}</div>
                      <div className="text-xs text-text-secondary">{order.email}</div>
                    </td>
                    
                    {/* Status Column */}
                    <td className="px-6 py-4">
                      {editingId === order.id ? (
                        <select 
                          value={editStatus} 
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="bg-base-bg border border-base-border p-1.5 text-xs text-text-primary focus:border-accent outline-none"
                        >
                          <option value="pending">pending (Legacy)</option>
                          <option value="ORDER_SECURED">ORDER_SECURED</option>
                          <option value="STUDIO_PROCESSING">STUDIO_PROCESSING</option>
                          <option value="DISPATCHED">DISPATCHED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm border ${
                          order.status === "ORDER_SECURED" ? "border-blue-500/30 text-blue-400 bg-blue-500/10" :
                          order.status === "STUDIO_PROCESSING" ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10" :
                          order.status === "DISPATCHED" ? "border-accent/30 text-accent bg-accent/10" :
                          order.status === "DELIVERED" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
                          "border-base-border text-text-secondary"
                        }`}>
                          {order.status}
                        </span>
                      )}
                    </td>
                    
                    {/* Tracking Column */}
                    <td className="px-6 py-4">
                      {editingId === order.id ? (
                        <div className="flex flex-col gap-2">
                          <input 
                            placeholder="Courier (e.g. TCS)"
                            value={editCourier}
                            onChange={(e) => setEditCourier(e.target.value)}
                            className="bg-base-bg border border-base-border p-1.5 text-xs text-text-primary focus:border-accent outline-none w-32"
                          />
                          <input 
                            placeholder="Tracking #"
                            value={editTracking}
                            onChange={(e) => setEditTracking(e.target.value)}
                            className="bg-base-bg border border-base-border p-1.5 text-xs text-text-primary focus:border-accent outline-none w-32 font-mono"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs">{order.courier_name || "-"}</div>
                          <div className="text-xs font-mono text-text-secondary mt-1">{order.tracking_number || "-"}</div>
                        </div>
                      )}
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      {editingId === order.id ? (
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => setEditingId(null)} className="text-xs text-text-secondary hover:text-white">
                            Cancel
                          </button>
                          <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="text-[10px] font-bold tracking-widest uppercase bg-accent text-white px-3 py-1.5 rounded-sm hover:bg-accent/90"
                          >
                            {saving ? "..." : "Save"}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleEditClick(order)}
                          className="text-xs text-accent hover:text-white underline underline-offset-4"
                        >
                          Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-secondary text-sm">
                      No orders found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
