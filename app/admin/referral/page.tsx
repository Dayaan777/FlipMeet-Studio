"use client";

import { useEffect, useState, useRef, Fragment } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ReferralCode = {
  id: string;
  code: string;
  name: string;
  usage_count: number;
  discount_percent: number;
  categories: string[];
  is_active: boolean;
};

type OrderEntry = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  discount_amount: number | null;
};

type CodeStats = {
  orderCount: number;
  totalSales: number;
  totalDiscount: number;
  orders: OrderEntry[];
};

const ALL_CATEGORIES_OPTION = "All categories";
const EXCLUDED_CATEGORIES = ["Anime", "System"];

export default function ReferralAdminPage() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [statsMap, setStatsMap] = useState<Record<string, CodeStats>>({});
  const [allCategories, setAllCategories] = useState<string[]>([]);

  // Add form
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDiscountPct, setNewDiscountPct] = useState<number | "">("");
  const [newCategories, setNewCategories] = useState<string[]>([ALL_CATEGORIES_OPTION]);
  const [adding, setAdding] = useState(false);
  const [showNewCatDropdown, setShowNewCatDropdown] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editDiscountPct, setEditDiscountPct] = useState<number | "">("");
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [showEditCatDropdown, setShowEditCatDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);

  const newCatRef = useRef<HTMLDivElement>(null);
  const editCatRef = useRef<HTMLDivElement>(null);

  // ── Data fetching ──────────────────────────────────────────

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("referral_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setStatusMessage({ type: "error", text: `Failed to load codes: ${error.message}` });
    } else {
      setCodes(data || []);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/referral-stats");
      if (res.ok) {
        const data = await res.json();
        setStatsMap(data.stats || {});
      }
    } catch { /* non-fatal */ }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from("products").select("category").not("category", "is", null);
      const cats = [
        ...new Set(
          (data || [])
            .map((r: { category: string }) => r.category)
            .filter((c) => c && !EXCLUDED_CATEGORIES.includes(c))
        ),
      ] as string[];
      setAllCategories(cats.sort());
    } catch { /* non-fatal */ }
  };

  useEffect(() => {
    fetchCodes();
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (newCatRef.current && !newCatRef.current.contains(e.target as Node)) setShowNewCatDropdown(false);
      if (editCatRef.current && !editCatRef.current.contains(e.target as Node)) setShowEditCatDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Category helpers ────────────────────────────────────────

  function toggleCategory(cat: string, selected: string[], setSelected: (v: string[]) => void) {
    if (cat === ALL_CATEGORIES_OPTION) {
      setSelected([ALL_CATEGORIES_OPTION]);
    } else {
      const withoutAll = selected.filter((c) => c !== ALL_CATEGORIES_OPTION);
      if (withoutAll.includes(cat)) {
        const next = withoutAll.filter((c) => c !== cat);
        setSelected(next.length === 0 ? [ALL_CATEGORIES_OPTION] : next);
      } else {
        setSelected([...withoutAll, cat]);
      }
    }
  }

  function catSummary(cats: string[]) {
    if (!cats || cats.length === 0) return "—";
    if (cats.includes(ALL_CATEGORIES_OPTION)) return "All categories";
    if (cats.length <= 2) return cats.join(", ");
    return `${cats.slice(0, 2).join(", ")} +${cats.length - 2} more`;
  }

  function CategoryDropdown({
    options,
    selected,
    setSelected,
    show,
    setShow,
    dropRef,
  }: {
    options: string[];
    selected: string[];
    setSelected: (v: string[]) => void;
    show: boolean;
    setShow: (v: boolean) => void;
    dropRef: React.RefObject<HTMLDivElement | null>;
  }) {
    return (
      <div className="relative" ref={dropRef}>
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="rounded-sm border border-base-border bg-base-bg px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none transition-colors flex items-center justify-between gap-2 min-w-[160px]"
        >
          <span className="truncate">{catSummary(selected)}</span>
          <span className="text-text-secondary text-[10px] shrink-0">{show ? "▴" : "▾"}</span>
        </button>

        {show && (
          <div className="fixed z-[200] w-52 bg-base-surface border border-base-border rounded-sm shadow-2xl max-h-60 overflow-y-auto mt-1">
            {[ALL_CATEGORIES_OPTION, ...options].map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(cat)}
                  onChange={() => toggleCategory(cat, selected, setSelected)}
                  className="accent-accent"
                />
                <span className="text-text-primary">{cat}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── CRUD handlers ────────────────────────────────────────────

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCode.trim().toUpperCase();
    const name = newName.trim();
    if (!code || !name) return;
    if (newDiscountPct !== "" && (Number(newDiscountPct) < 1 || Number(newDiscountPct) > 90)) {
      setStatusMessage({ type: "error", text: "Discount rate must be between 1 and 90%." });
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("referral_codes").insert({
      code,
      name,
      usage_count: 0,
      discount_percent: newDiscountPct || 0,
      categories: newCategories,
      is_active: true,
    });
    if (error) {
      setStatusMessage({ type: "error", text: `Failed to add code: ${error.message}` });
    } else {
      setStatusMessage({ type: "success", text: `Code "${code}" added successfully.` });
      setNewCode("");
      setNewName("");
      setNewDiscountPct("");
      setNewCategories([ALL_CATEGORIES_OPTION]);
      fetchCodes();
    }
    setAdding(false);
  };

  const handleSaveEdit = async (id: string) => {
    const code = editCode.trim().toUpperCase();
    const name = editName.trim();
    if (!code || !name) return;
    setSaving(true);
    const { error } = await supabase
      .from("referral_codes")
      .update({ code, name, discount_percent: editDiscountPct || 0, categories: editCategories })
      .eq("id", id);
    if (error) {
      setStatusMessage({ type: "error", text: `Failed to update: ${error.message}` });
    } else {
      setStatusMessage({ type: "success", text: "Code updated." });
      setEditId(null);
      fetchCodes();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    const { error } = await supabase.from("referral_codes").delete().eq("id", id);
    if (error) {
      setStatusMessage({ type: "error", text: `Failed to delete: ${error.message}` });
    } else {
      setStatusMessage({ type: "success", text: "Code deleted." });
      setDeletingId(null);
      fetchCodes();
    }
    setDeleteLoading(false);
  };

  const toggleActive = async (id: string, currentlyActive: boolean) => {
    const { error } = await supabase
      .from("referral_codes")
      .update({ is_active: !currentlyActive })
      .eq("id", id);
    if (!error) fetchCodes();
  };

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-base-bg text-text-primary px-4 sm:px-8 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-8 border-b border-base-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
              <span className="size-2 rounded-full bg-accent animate-pulse" />
              FLIPMEET STUDIO // REFERRAL CODES
            </div>
            <h1 className="font-display tracking-widest text-3xl font-bold uppercase text-text-primary mt-1">
              REFERRAL MANAGER
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { fetchCodes(); fetchStats(); }}
              className="rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
            >
              Refresh
            </button>
            <Link
              href="/admin"
              className="rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
            >
              ← BACK TO ADMIN
            </Link>
          </div>
        </header>

        {/* Status */}
        {statusMessage && (
          <div className={`mb-6 rounded-sm border p-4 text-xs flex items-center justify-between ${
            statusMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-accent/40 bg-accent/10 text-accent"
          }`}>
            <span>{statusMessage.text}</span>
            <button type="button" onClick={() => setStatusMessage(null)} className="text-text-secondary hover:text-text-primary font-bold ml-4">✕</button>
          </div>
        )}

        {/* Add New Code */}
        <div className="rounded-sm border border-base-border bg-base-surface/60 p-6 mb-8">
          <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-4">Add New Referral Code</p>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row flex-wrap gap-3 items-start">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="CODE (e.g. SARA10)"
              className="rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary font-mono uppercase placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors w-36"
              required
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name (e.g. Sara)"
              className="rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors w-36"
              required
            />
            <input
              type="number"
              min={0}
              max={90}
              value={newDiscountPct}
              onChange={(e) => setNewDiscountPct(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Discount % (0=tracking)"
              className="rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors w-44"
            />
            <CategoryDropdown
              options={allCategories}
              selected={newCategories}
              setSelected={setNewCategories}
              show={showNewCatDropdown}
              setShow={setShowNewCatDropdown}
              dropRef={newCatRef}
            />
            <button
              type="submit"
              disabled={adding}
              className="rounded-sm bg-accent px-5 py-2 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors disabled:opacity-50 shrink-0"
            >
              {adding ? "Adding..." : "+ Add Code"}
            </button>
          </form>
        </div>

        {/* Codes Table */}
        <div className="rounded-sm border border-base-border bg-base-surface/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary whitespace-nowrap">
              <thead className="border-b border-base-border bg-base-surface/90 text-[10px] uppercase tracking-widest text-text-secondary font-medium">
                <tr>
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Discount</th>
                  <th className="px-4 py-3.5">Categories</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Uses</th>
                  <th className="px-4 py-3.5">Orders</th>
                  <th className="px-4 py-3.5">Sales (PKR)</th>
                  <th className="px-4 py-3.5">Discount Given</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-border/50">
                {loading && codes.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-xs text-text-secondary">Loading...</td>
                  </tr>
                ) : codes.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-xs text-text-secondary">No referral codes yet. Add one above.</td>
                  </tr>
                ) : (
                  codes.map((rc) => {
                    const stats = statsMap[rc.code.toUpperCase()] || { orderCount: 0, totalSales: 0, totalDiscount: 0, orders: [] };
                    const isExpanded = expandedCodeId === rc.id;

                    return (
                      <Fragment key={rc.id}>
                        <tr className="hover:bg-white/[0.02] transition-colors">

                          {/* Code */}
                          <td className="px-4 py-4">
                            {editId === rc.id ? (
                              <input
                                value={editCode}
                                onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                                className="rounded-sm border border-accent bg-base-bg px-2 py-1 text-xs text-text-primary font-mono uppercase focus:outline-none w-28"
                              />
                            ) : (
                              <span className="font-mono font-bold text-text-primary bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-sm">
                                {rc.code}
                              </span>
                            )}
                          </td>

                          {/* Name */}
                          <td className="px-4 py-4">
                            {editId === rc.id ? (
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="rounded-sm border border-accent bg-base-bg px-2 py-1 text-xs text-text-primary focus:outline-none w-28"
                              />
                            ) : (
                              <span className="text-text-primary font-medium">{rc.name}</span>
                            )}
                          </td>

                          {/* Discount % */}
                          <td className="px-4 py-4">
                            {editId === rc.id ? (
                              <input
                                type="number"
                                min={0}
                                max={90}
                                value={editDiscountPct}
                                onChange={(e) => setEditDiscountPct(e.target.value === "" ? "" : Number(e.target.value))}
                                className="rounded-sm border border-accent bg-base-bg px-2 py-1 text-xs text-text-primary focus:outline-none w-20"
                              />
                            ) : rc.discount_percent > 0 ? (
                              <span className="font-bold text-accent">{rc.discount_percent}%</span>
                            ) : (
                              <span className="text-text-secondary">— (tracking)</span>
                            )}
                          </td>

                          {/* Categories */}
                          <td className="px-4 py-4 max-w-[160px]">
                            {editId === rc.id ? (
                              <CategoryDropdown
                                options={allCategories}
                                selected={editCategories}
                                setSelected={setEditCategories}
                                show={showEditCatDropdown}
                                setShow={setShowEditCatDropdown}
                                dropRef={editCatRef}
                              />
                            ) : (
                              <span className="text-text-secondary truncate">{catSummary(rc.categories || [])}</span>
                            )}
                          </td>

                          {/* Active toggle */}
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => toggleActive(rc.id, rc.is_active)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                                rc.is_active
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                  : "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                              }`}
                            >
                              {rc.is_active ? "ACTIVE" : "PAUSED"}
                            </button>
                          </td>

                          {/* Uses */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 font-mono font-bold px-2.5 py-0.5 rounded-full text-[10px] border ${
                              rc.usage_count > 0
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-base-bg border-base-border text-text-secondary"
                            }`}>
                              {rc.usage_count > 0 && <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                              {rc.usage_count} {rc.usage_count === 1 ? "use" : "uses"}
                            </span>
                          </td>

                          {/* Live stats */}
                          <td className="px-4 py-4 font-mono text-text-primary font-bold">{stats.orderCount}</td>
                          <td className="px-4 py-4 font-mono text-text-primary">
                            {stats.totalSales > 0 ? `PKR ${Math.round(stats.totalSales).toLocaleString()}` : "—"}
                          </td>
                          <td className="px-4 py-4 font-mono text-emerald-400">
                            {stats.totalDiscount > 0 ? `PKR ${Math.round(stats.totalDiscount).toLocaleString()}` : "—"}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4 text-right space-x-1.5">
                            {editId === rc.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(rc.id)}
                                  disabled={saving}
                                  className="rounded-sm bg-accent px-2.5 py-1 text-[11px] font-bold text-text-primary hover:bg-accent-dim transition-colors disabled:opacity-50"
                                >
                                  {saving ? "..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditId(null)}
                                  className="rounded-sm border border-base-border bg-base-bg px-2.5 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : deletingId === rc.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(rc.id)}
                                  disabled={deleteLoading}
                                  className="rounded-sm bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                                >
                                  {deleteLoading ? "..." : "Confirm"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(null)}
                                  className="rounded-sm border border-base-border bg-base-bg px-2.5 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setExpandedCodeId(isExpanded ? null : rc.id)}
                                  className="rounded-sm border border-base-border bg-base-surface px-2.5 py-1 text-[11px] font-bold text-text-primary hover:border-accent hover:text-accent transition-colors"
                                >
                                  {isExpanded ? "Hide" : "View Orders"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditId(rc.id);
                                    setEditCode(rc.code);
                                    setEditName(rc.name);
                                    setEditDiscountPct(rc.discount_percent ?? 0);
                                    setEditCategories(rc.categories || [ALL_CATEGORIES_OPTION]);
                                  }}
                                  className="rounded-sm border border-base-border bg-base-surface px-2.5 py-1 text-[11px] font-bold text-text-primary hover:border-accent hover:text-accent transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(rc.id)}
                                  className="rounded-sm border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>

                        {/* Per-code orders sub-table */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={10} className="px-4 py-4 bg-base-bg/50 border-t border-base-border/40">
                              <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-3">
                                Orders using {rc.code}
                              </p>
                              {stats.orders.length === 0 ? (
                                <p className="text-xs text-text-secondary">No qualifying orders yet.</p>
                              ) : (
                                <table className="w-full text-xs text-text-secondary">
                                  <thead className="text-[10px] uppercase tracking-widest border-b border-base-border">
                                    <tr>
                                      <th className="pb-2 pr-4 text-left">Date</th>
                                      <th className="pb-2 pr-4 text-left">Order #</th>
                                      <th className="pb-2 pr-4 text-left">Status</th>
                                      <th className="pb-2 pr-4 text-right">Total</th>
                                      <th className="pb-2 text-right">Discount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-base-border/30">
                                    {stats.orders.map((o) => (
                                      <tr key={o.id}>
                                        <td className="py-2 pr-4">
                                          {new Date(o.created_at).toLocaleDateString("en-GB", {
                                            day: "2-digit", month: "short", year: "numeric",
                                          })}
                                        </td>
                                        <td className="py-2 pr-4 font-mono text-accent">{o.id}</td>
                                        <td className="py-2 pr-4">
                                          <span className="uppercase tracking-widest text-[10px] font-bold">{o.status}</span>
                                        </td>
                                        <td className="py-2 pr-4 text-right font-bold text-text-primary">
                                          PKR {Number(o.total).toLocaleString()}
                                        </td>
                                        <td className="py-2 text-right text-emerald-400 font-bold">
                                          {o.discount_amount ? `PKR ${Number(o.discount_amount).toLocaleString()}` : "—"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
