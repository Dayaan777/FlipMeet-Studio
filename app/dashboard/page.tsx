"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import type { Order, OrderStatus } from "@/lib/order-store";
import { drops } from "@/data/drops";

const STATUS_LABELS: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  in_production: {
    label: "In Production",
    bg: "bg-accent/10",
    text: "text-accent",
    border: "border-accent/40",
  },
  shipped: {
    label: "Shipped",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
  },
};

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
];

// Helper to normalize Supabase records into the client Order structure
function normalizeSupabaseOrder(dbOrder: any): Order {
  const drop = drops[0];
  const itemsList = Array.isArray(dbOrder.items) ? dbOrder.items : [];

  return {
    id: dbOrder.id,
    customerId: dbOrder.customer_id || `cust-${dbOrder.id}`,
    customerName: dbOrder.customer_name || dbOrder.customerName || "Customer",
    customerEmail: dbOrder.email || dbOrder.customerEmail || "",
    customerPhone: dbOrder.phone || dbOrder.customerPhone || "",
    shippingAddress: dbOrder.shipping_address || dbOrder.shippingAddress || "",
    dropId: "drop-001",
    total: Number(dbOrder.total) || 0,
    status: (dbOrder.status || "pending").toLowerCase() as OrderStatus,
    createdAt: dbOrder.created_at || new Date().toISOString(),
    deliveryWindow: { start: "2026-10-20", end: "2026-10-30" },
    notes: dbOrder.notes || "",
    items: itemsList.map((item: any) => {
      const productId = item.product_id || item.productId || item.lookId || "look-01";
      const matchedLook = drop?.looks.find((l) => l.id === productId);
      return {
        lookId: productId,
        name: matchedLook?.name || productId.toUpperCase(),
        size: item.size || "M",
        price: Number(item.price_at_purchase || item.price) || 18500,
        quantity: Number(item.quantity) || 1,
        image: matchedLook?.images[0] || `/images/looks/${productId}.jpg`,
      };
    }),
  };
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders.map(normalizeSupabaseOrder));
      } else {
        throw new Error(data.error || "Failed to load orders");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching orders";
      console.error("Fetch orders error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to persist status change.");
      }
    } catch (err) {
      console.error("Failed to update status in Supabase:", err);
      fetchOrders(false);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.customerPhone.includes(query) ||
        order.items.some((i) => i.name.toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, searchQuery]);

  // Key KPI metrics
  const metrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalUnitsSold = validOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const inProductionCount = orders.filter((o) => o.status === "in_production").length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalUnitsSold,
      pendingCount,
      inProductionCount,
      allocationPercent: Math.min(100, Math.round((totalUnitsSold / 600) * 100)),
    };
  }, [orders]);

  // Allocation quota per look (each limited to 100)
  const lookAllocation = useMemo(() => {
    const drop = drops[0];
    const counts: Record<string, number> = {};

    drop.looks.forEach((look) => {
      counts[look.name] = 0;
      counts[look.id] = 0;
    });

    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        o.items.forEach((item) => {
          counts[item.name] = (counts[item.name] || 0) + item.quantity;
          counts[item.lookId] = (counts[item.lookId] || 0) + item.quantity;
        });
      });

    return drop.looks.map((look) => {
      const sold = (counts[look.name] || 0) + (counts[look.id] || 0);
      const limit = 100;
      return {
        id: look.id,
        name: look.name,
        description: look.description,
        image: look.images[0],
        sold,
        limit,
        remaining: Math.max(0, limit - sold),
        percent: Math.min(100, Math.round((sold / limit) * 100)),
      };
    });
  }, [orders]);

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ["Order ID", "Date", "Customer Name", "Email", "Phone", "Status", "Total", "Items", "Address"];
    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toISOString().split("T")[0],
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerEmail,
      o.customerPhone,
      o.status,
      o.total,
      `"${o.items.map((i) => `${i.name} (${i.size}) x${i.quantity}`).join("; ")}"`,
      `"${o.shippingAddress.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flipmeet_orders_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct WhatsApp status message
  const handleSendWhatsAppUpdate = (order: Order) => {
    const text = encodeURIComponent(
      `Hello ${order.customerName}! Update on your FlipMeet Studio Drop 001 Order (${order.id}): Your order status is now "${order.status.toUpperCase()}". Scheduled delivery: ${new Date(order.deliveryWindow.start).toLocaleDateString("en-GB", { month: "short", day: "2-digit" })} – ${new Date(order.deliveryWindow.end).toLocaleDateString("en-GB", { month: "short", day: "2-digit", year: "numeric" })}. Thank you for building for the culture!`
    );
    const phone = order.customerPhone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg px-4 sm:px-6 pt-28 pb-24">
        <div className="mx-auto max-w-7xl">
          {/* Header Bar */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-border pb-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                STUDIO CONTROL // DROP 001
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide text-text-primary mt-1">
                OPERATIONS DASHBOARD
              </h1>
              <p className="text-xs text-text-secondary mt-1">
                Live order fulfillment queue, inventory allocation, and customer communications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin"
                className="rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
              >
                PRODUCT INVENTORY →
              </Link>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-2 rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-primary hover:border-text-secondary transition-colors"
              >
                <span>↓</span> EXPORT CSV
              </button>

              <button
                type="button"
                onClick={() => fetchOrders(false)}
                disabled={refreshing || loading}
                title="Fetch latest orders from Supabase"
                className="rounded-sm border border-base-border bg-base-bg px-3.5 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <span className={refreshing ? "animate-spin" : ""}>↺</span>
                {refreshing ? "Refreshing..." : "Refresh Orders"}
              </button>

              <Link
                href="/"
                className="rounded-sm bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors"
              >
                View Storefront →
              </Link>

              <form action="/api/admin/logout" method="POST">
                <button
                  type="submit"
                  className="rounded-sm border border-base-border bg-base-bg px-3.5 py-2.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
                  title="Lock administrative session"
                >
                  LOCK SESSION
                </button>
              </form>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 rounded-sm border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-400 flex items-center justify-between">
              <span>Error loading orders: {error}</span>
              <button
                type="button"
                onClick={() => fetchOrders()}
                className="rounded-sm bg-red-500/20 px-3 py-1 font-bold text-red-300 hover:bg-red-500/30 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* KPI CARDS */}
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="rounded-sm border border-base-border bg-base-surface/80 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
                Total Gross Revenue
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-text-primary mt-2">
                PKR {metrics.totalRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                <span>↑</span> Drop 001 Active Window
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-sm border border-base-border bg-base-surface/80 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
                Total Orders Placed
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-text-primary mt-2">
                {metrics.totalOrders} <span className="text-sm font-normal text-text-secondary">orders</span>
              </p>
              <p className="text-[11px] text-accent mt-2">
                {metrics.pendingCount} orders pending confirmation
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-sm border border-base-border bg-base-surface/80 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
                Drop 001 Units Sold
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-text-primary mt-2">
                {metrics.totalUnitsSold} <span className="text-sm font-normal text-text-secondary">/ 600 pieces</span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-base-border overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${metrics.allocationPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-accent">{metrics.allocationPercent}%</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-sm border border-base-border bg-base-surface/80 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
                In Production Queue
              </p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-accent mt-2">
                {metrics.inProductionCount} <span className="text-sm font-normal text-text-secondary">garments</span>
              </p>
              <p className="text-[11px] text-text-secondary mt-2">
                Target delivery: 20–30 Oct 2026
              </p>
            </div>
          </div>

          {/* TWO COLUMN SECTION: INVENTORY BREAKDOWN & RECENT ORDERS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left 2 Cols: Order Management Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-text-primary">
                  Order Management ({filteredOrders.length})
                </h2>

                {/* Search */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, name, phone, item..."
                  className="w-full sm:w-64 rounded-sm border border-base-border bg-base-surface px-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    statusFilter === "all"
                      ? "bg-accent text-text-primary"
                      : "bg-base-surface text-text-secondary hover:text-text-primary"
                  }`}
                >
                  All ({orders.length})
                </button>
                {ALL_STATUSES.map((st) => {
                  const count = orders.filter((o) => o.status === st).length;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                        statusFilter === st
                          ? "bg-accent text-text-primary"
                          : "bg-base-surface text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {st.replace("_", " ")} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Orders Table Container */}
              <div className="overflow-x-auto rounded-sm border border-base-border bg-base-surface/60">
                {loading ? (
                  <div className="p-16 text-center text-xs text-text-secondary flex flex-col items-center justify-center gap-3">
                    <span className="size-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span>Loading live orders from Supabase...</span>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-12 text-center text-xs text-text-secondary">
                    {orders.length === 0
                      ? "No orders found in Supabase database yet."
                      : "No orders match the current filter or search term."}
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-text-secondary">
                    <thead className="border-b border-base-border bg-base-surface/80 text-[10px] uppercase tracking-widest text-text-secondary font-medium">
                      <tr>
                        <th className="px-4 py-3">Order</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Items</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-border/50 font-normal">
                      {filteredOrders.map((order) => {
                        const statusCfg = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

                        return (
                          <tr
                            key={order.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-4 py-3.5 font-display font-bold text-text-primary whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="hover:text-accent transition-colors text-left"
                              >
                                {order.id}
                                <span className="block text-[10px] font-normal text-text-secondary">
                                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                                    month: "short",
                                    day: "2-digit",
                                  })}
                                </span>
                              </button>
                            </td>

                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <p className="font-bold text-text-primary">{order.customerName}</p>
                              <a
                                href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                {order.customerPhone} ↗
                              </a>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex -space-x-2 overflow-hidden">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="relative size-8 rounded-full border border-base-border bg-base-bg overflow-hidden"
                                    title={`${item.name} (${item.size})`}
                                  >
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                ))}
                              </div>
                              <span className="text-[10px] text-text-secondary block mt-1">
                                {order.items.map((i) => `${i.name} [${i.size}]`).join(", ")}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 font-display font-bold text-text-primary whitespace-nowrap">
                              PKR {order.total.toLocaleString()}
                            </td>

                            {/* Status Changer Select */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateStatus(order.id, e.target.value as OrderStatus)
                                }
                                className={`rounded-sm border px-2 py-1 text-[11px] font-bold uppercase tracking-wider bg-base-bg cursor-pointer transition-colors focus:outline-none ${statusCfg.text} ${statusCfg.border}`}
                              >
                                {ALL_STATUSES.map((st) => (
                                  <option key={st} value={st} className="bg-base-surface text-text-primary">
                                    {st.replace("_", " ").toUpperCase()}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="rounded-sm border border-base-border px-2.5 py-1 text-[11px] font-bold text-text-primary hover:border-text-secondary transition-colors"
                              >
                                Details
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendWhatsAppUpdate(order)}
                                className="rounded-sm border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
                              >
                                WhatsApp ↗
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right 1 Col: Drop 001 Allocation & Limited 100 Tracker */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-text-primary">
                Drop 001 Allocation (100 / Look)
              </h2>

              <div className="rounded-sm border border-base-border bg-base-surface/80 p-5 backdrop-blur-sm space-y-4">
                <p className="text-xs text-text-secondary">
                  Live order quota tracking for all six chapters in DROP 001.
                </p>

                <div className="space-y-4">
                  {lookAllocation.map((look) => (
                    <div key={look.id} className="border-b border-base-border/50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-text-primary">{look.name}</span>
                        <span className="text-text-secondary">
                          <strong className="text-accent">{look.sold}</strong> / {look.limit} sold
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full rounded-full bg-base-bg overflow-hidden border border-base-border">
                        <div
                          className="h-full bg-accent transition-all duration-500"
                          style={{ width: `${look.percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-text-secondary mt-1">
                        <span>{look.description}</span>
                        <span>{look.remaining} pieces left</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Studio Info Card */}
              <div className="rounded-sm border border-base-border bg-base-surface/50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Fulfillment Schedule
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Orders close Oct 1st. Batch manufacturing starts Oct 2nd. Shipments dispatch Oct 20–30 via private courier.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS MODAL / DRAWER */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-xl rounded-sm border border-base-border bg-base-surface p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-base-border pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl font-bold text-text-primary">
                      {selectedOrder.id}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                        STATUS_LABELS[selectedOrder.status]?.bg || "bg-yellow-500/10"
                      } ${STATUS_LABELS[selectedOrder.status]?.text || "text-yellow-400"} ${
                        STATUS_LABELS[selectedOrder.status]?.border || "border-yellow-500/30"
                      }`}
                    >
                      {selectedOrder.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Created on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-text-secondary hover:text-text-primary text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Customer details */}
              <div className="grid grid-cols-2 gap-4 rounded-sm border border-base-border bg-base-bg p-4 mb-5 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary">CUSTOMER</p>
                  <p className="font-bold text-text-primary mt-0.5">{selectedOrder.customerName}</p>
                  <p className="text-text-secondary">{selectedOrder.customerEmail}</p>
                  <p className="text-text-secondary">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary">SHIPPING ADDRESS</p>
                  <p className="text-text-primary mt-0.5 whitespace-pre-line">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Itemized list */}
              <div className="border-t border-b border-base-border py-3 mb-5 max-h-56 overflow-y-auto divide-y divide-base-border/50">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 rounded-sm border border-base-border bg-base-bg overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-contain" />
                      </div>
                      <div>
                        <p className="font-bold text-text-primary">{item.name}</p>
                        <p className="text-[11px] text-text-secondary">
                          Size: <strong className="text-text-primary">{item.size}</strong> • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-display font-bold text-text-primary">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total & Action */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary">TOTAL AMOUNT</p>
                  <p className="font-display text-xl font-bold text-accent">
                    PKR {selectedOrder.total.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppUpdate(selectedOrder)}
                    className="rounded-sm border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
                  >
                    Notify WhatsApp 💬
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-sm bg-base-border px-4 py-2.5 text-xs font-bold text-text-primary hover:bg-white/20 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
