"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/products";

type ProductForm = {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  sizes: string;
  images: string;
  description: string;
};

const DEFAULT_FORM: ProductForm = {
  id: "",
  name: "",
  category: "DROP 001",
  price: "18500",
  stock: "100",
  sizes: "S, M, L, XL",
  images: "/images/looks/look-01.jpg",
  description: "",
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State: null = closed, "add" = new product, Product = edit mode
  const [activeModal, setActiveModal] = useState<"add" | Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>(DEFAULT_FORM);
  const [formSaving, setFormSaving] = useState(false);

  // Delete confirmation modal state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch products directly from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }
      setProducts(
        (data || []).map((p) => ({
          ...p,
          price: Number(p.price),
        }))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load products.";
      setStatusMessage({ type: "error", text: `Supabase Error: ${message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Open modal in Add mode
  const handleOpenAdd = () => {
    const nextNum = products.length + 1;
    const generatedId = `look-0${nextNum}`;
    setFormData({
      ...DEFAULT_FORM,
      id: generatedId,
      name: `Look 0${nextNum}`,
      images: `/images/looks/look-0${Math.min(nextNum, 6)}.jpg`,
    });
    setActiveModal("add");
  };

  // Open modal in Edit mode
  const handleOpenEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category || "DROP 001",
      price: product.price.toString(),
      stock: product.stock.toString(),
      sizes: (product.sizes || []).join(", "),
      images: (product.images || []).join(", "),
      description: product.description || "",
    });
    setActiveModal(product);
  };

  // Save (Create or Update) product to Supabase
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setStatusMessage(null);

    const parsedSizes = formData.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedImages = formData.images
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      id: formData.id.trim(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      sizes: parsedSizes.length > 0 ? parsedSizes : ["S", "M", "L", "XL"],
      images: parsedImages.length > 0 ? parsedImages : [`/images/looks/${formData.id.trim()}.jpg`],
      description: formData.description.trim(),
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to save product.");
      }

      setStatusMessage({
        type: "success",
        text: `Product "${payload.name}" ${activeModal === "add" ? "created" : "updated"} successfully.`,
      });

      setActiveModal(null);
      await fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save product.";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setFormSaving(false);
    }
  };

  // Delete product via server-side authenticated route
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deletingProduct.id }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to delete product.");
      }

      setStatusMessage({
        type: "success",
        text: `Product "${deletingProduct.name}" deleted successfully.`,
      });
      setDeletingProduct(null);
      await fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete product.";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-bg text-text-primary px-4 sm:px-8 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Top Header */}
        <header className="mb-8 border-b border-base-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
              <span className="size-2 rounded-full bg-accent animate-pulse" />
              FLIPMEET STUDIO // DATABASE CONTROL
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide text-text-primary mt-1">
              ADMIN DASHBOARD
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Direct live sync with Supabase <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">products</code> table.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="rounded-sm bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors shadow-lg shadow-accent/20 flex items-center gap-1.5"
            >
              <span>+</span> ADD PRODUCT
            </button>

            <Link
              href="/dashboard"
              className="rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
            >
              ORDERS DASHBOARD →
            </Link>

            <Link
              href="/"
              target="_blank"
              className="rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
            >
              VIEW STORE ↗
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
        </header>

        {/* Status Notification Toast */}
        {statusMessage && (
          <div
            className={`mb-6 rounded-sm border p-4 text-xs flex items-center justify-between transition-all ${
              statusMessage.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-accent/40 bg-accent/10 text-accent"
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-text-secondary hover:text-text-primary font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-sm border border-base-border bg-base-surface/80 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
              Total Products in Supabase
            </p>
            <p className="font-display text-3xl font-bold text-text-primary mt-2">
              {products.length} <span className="text-sm font-normal text-text-secondary">items</span>
            </p>
          </div>

          <div className="rounded-sm border border-base-border bg-base-surface/80 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
              Total Allocated Stock
            </p>
            <p className="font-display text-3xl font-bold text-accent mt-2">
              {products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)}{" "}
              <span className="text-sm font-normal text-text-secondary">pieces</span>
            </p>
          </div>

          <div className="rounded-sm border border-base-border bg-base-surface/80 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
              Active Category
            </p>
            <p className="font-display text-3xl font-bold text-text-primary mt-2">
              DROP 001
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, category, ID..."
              className="w-full rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="rounded-sm border border-base-border bg-base-surface px-3.5 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 self-end sm:self-auto"
          >
            <span>↺</span> {loading ? "Syncing..." : "Refresh Supabase Data"}
          </button>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto rounded-sm border border-base-border bg-base-surface/60">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="border-b border-base-border bg-base-surface/90 text-[10px] uppercase tracking-widest text-text-secondary font-medium">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Stock</th>
                <th className="px-5 py-3.5">Sizes</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-border/50">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xs text-text-secondary">
                    Loading products from Supabase...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xs text-text-secondary">
                    No products found. Click &quot;Add Product&quot; to insert one into Supabase.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const img = product.images && product.images.length > 0
                    ? product.images[0]
                    : `/images/looks/${product.id}.jpg`;

                  return (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Thumbnail */}
                      <td className="px-5 py-4 font-display text-text-primary whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-sm border border-base-border bg-base-bg overflow-hidden shrink-0 flex items-end justify-center">
                            <Image
                              src={img}
                              alt={product.name}
                              fill
                              className="object-contain object-bottom"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-wide text-text-primary">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-text-secondary font-mono">
                              {product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-block rounded-full border border-base-border bg-base-bg px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                          {product.category || "DROP 001"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 font-display font-bold text-text-primary whitespace-nowrap">
                        PKR {Number(product.price).toLocaleString()}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-1.5 rounded-full ${
                              product.stock > 0 ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          <span className="font-mono text-text-primary font-bold">
                            {product.stock}
                          </span>
                          <span className="text-[10px] text-text-secondary">units</span>
                        </div>
                      </td>

                      {/* Sizes */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {(product.sizes || []).map((s) => (
                            <span
                              key={s}
                              className="rounded-sm border border-base-border bg-base-bg px-1.5 py-0.5 text-[9px] font-bold text-text-secondary"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                        <Link
                          href={`/product/${product.id}`}
                          target="_blank"
                          className="inline-block rounded-sm border border-base-border bg-base-bg px-2.5 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
                          title="View live product page"
                        >
                          View ↗
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="rounded-sm border border-base-border bg-base-surface px-2.5 py-1 text-[11px] font-bold text-text-primary hover:border-accent hover:text-accent transition-colors"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingProduct(product)}
                          className="rounded-sm border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg rounded-sm border border-base-border bg-base-surface p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-base-border pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.28em] text-accent">
                  SUPABASE DIRECT WRITE
                </span>
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-text-primary mt-1">
                  {activeModal === "add" ? "Add New Product" : `Edit ${formData.name}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-text-secondary hover:text-text-primary text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Product ID */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                    Product ID / Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g. look-07"
                    disabled={activeModal !== "add"}
                    className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors disabled:opacity-50 font-mono"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="DROP 001"
                    className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Look 07"
                  className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="18500"
                    min="0"
                    className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors font-mono"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                    Allocated Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="100"
                    min="0"
                    className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors font-mono"
                    required
                  />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                  Available Sizes (Comma Separated) *
                </label>
                <input
                  type="text"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="S, M, L, XL"
                  className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                  Image Paths / URLs (Comma Separated) *
                </label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="/images/looks/look-01.jpg"
                  className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors font-mono"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                  Description *
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Heavyweight Cotton + Raw Edge Denim"
                  className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              {/* Modal Buttons */}
              <div className="border-t border-base-border pt-5 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  disabled={formSaving}
                  className="rounded-sm border border-base-border bg-base-bg px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="rounded-sm bg-accent px-5 py-2 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors disabled:opacity-50"
                >
                  {formSaving ? "Saving to Supabase..." : activeModal === "add" ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-sm border border-red-500/40 bg-base-surface p-6 shadow-2xl">
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-red-400">
              Confirm Product Deletion
            </h3>
            <p className="text-xs text-text-secondary mt-2">
              Are you sure you want to permanently delete{" "}
              <strong className="text-text-primary">{deletingProduct.name}</strong> ({deletingProduct.id}) from the Supabase <code className="text-accent">products</code> table?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={deleteLoading}
                className="rounded-sm border border-base-border bg-base-bg px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleteLoading}
                className="rounded-sm bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
