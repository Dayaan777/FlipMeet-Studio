"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/products";
import { parseSizeVariants, serializeSizeVariants, type SizeVariant } from "@/lib/products";

type ProductForm = {
  id: string;
  name: string;
  category: string;
  price: string;
  old_price: string;
  description: string;
  is_bundle: boolean;
};

const DEFAULT_FORM: ProductForm = {
  id: "",
  name: "",
  category: "Outfits",
  price: "23500",
  old_price: "",
  description: "",
  is_bundle: false,
};

type SecondaryFileItem = {
  id: string;
  file: File;
  previewUrl: string;
};

const DEFAULT_TOP_VARIANTS: SizeVariant[] = [
  { size: "S", stock: 100, isDefault: false, type: "top" },
  { size: "M", stock: 100, isDefault: true, type: "top" },
  { size: "L", stock: 100, isDefault: false, type: "top" },
  { size: "XL", stock: 100, isDefault: false, type: "top" },
];
const DEFAULT_BOTTOM_VARIANTS: SizeVariant[] = [
  { size: "28", stock: 100, isDefault: false, type: "bottom" },
  { size: "30", stock: 100, isDefault: true, type: "bottom" },
  { size: "32", stock: 100, isDefault: false, type: "bottom" },
  { size: "34", stock: 100, isDefault: false, type: "bottom" },
  { size: "36", stock: 100, isDefault: false, type: "bottom" },
];


export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State: null = closed, "add" = new product, Product = edit mode
  const [activeModal, setActiveModal] = useState<"add" | Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>(DEFAULT_FORM);
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([]);
  const [showTopUI, setShowTopUI] = useState(false);
  const [showBottomUI, setShowBottomUI] = useState(false);
  const [newTopSizeInput, setNewTopSizeInput] = useState("");
  const [newBottomSizeInput, setNewBottomSizeInput] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // Image Management State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const [existingSecondaryUrls, setExistingSecondaryUrls] = useState<string[]>([]);
  const [secondaryFiles, setSecondaryFiles] = useState<SecondaryFileItem[]>([]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);

  // Shipping Modal State
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingForm, setShippingForm] = useState({ Sindh: "", Balochistan: "", Punjab: "", KPK: "" });
  const [shippingSaving, setShippingSaving] = useState(false);

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
    const displayProducts = products.filter(p => p.category !== "SYSTEM");
    if (!searchQuery.trim()) return displayProducts;
    const q = searchQuery.toLowerCase();
    return displayProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Shipping Handlers
  const handleOpenShipping = () => {
    const sys = products.find(p => p.id === "system-shipping-rates");
    if (sys && sys.description) {
      try {
        setShippingForm(JSON.parse(sys.description));
      } catch (e) {
        // ignore
      }
    }
    setShowShippingModal(true);
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setShippingSaving(true);
    try {
      const payload = {
        id: "system-shipping-rates",
        name: "System: Shipping Rates",
        category: "SYSTEM",
        price: 0,
        stock: 0,
        sizes: ["SYSTEM"],
        images: [],
        description: JSON.stringify(shippingForm),
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save shipping rates");
      
      setStatusMessage({ type: "success", text: "Shipping rates updated live!" });
      setShowShippingModal(false);
      fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save shipping rates";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setShippingSaving(false);
    }
  };

  // Image state helpers
  const resetImageState = useCallback(() => {
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setExistingCoverUrl(null);

    secondaryFiles.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setSecondaryFiles([]);
    setExistingSecondaryUrls([]);

    if (coverInputRef.current) coverInputRef.current.value = "";
    if (secondaryInputRef.current) secondaryInputRef.current.value = "";
  }, [coverPreviewUrl, secondaryFiles]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
      secondaryFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [coverPreviewUrl, secondaryFiles]);

  const handleCloseModal = () => {
    resetImageState();
    setActiveModal(null);
  };

  // Image Compression Helper
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            resolve(new File([blob], newName, { type: "image/webp" }));
          } else {
            resolve(file);
          }
        }, "image/webp", 0.85);
      };
      img.onerror = () => resolve(file);
    });
  };

  const handleSetCoverFile = async (file: File) => {
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    const compressed = await compressImage(file);
    setCoverFile(compressed);
    setCoverPreviewUrl(URL.createObjectURL(compressed));
  };

  const handleRemoveCover = () => {
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setExistingCoverUrl(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const handleAddSecondaryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: SecondaryFileItem[] = [];
    for (const f of Array.from(files)) {
      const compressed = await compressImage(f);
      newItems.push({
        id: `${compressed.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file: compressed,
        previewUrl: URL.createObjectURL(compressed),
      });
    }
    setSecondaryFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveSecondaryFile = (id: string) => {
    setSecondaryFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleRemoveExistingSecondaryUrl = (index: number) => {
    setExistingSecondaryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearSecondaryFiles = () => {
    secondaryFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setSecondaryFiles([]);
    if (secondaryInputRef.current) {
      secondaryInputRef.current.value = "";
    }
  };

  // Open modal in Add mode
  const handleOpenAdd = () => {
    resetImageState();
    const nextNum = products.length + 1;
    const generatedId = `product-${String(nextNum).padStart(2, "0")}`;
    setFormData({
      ...DEFAULT_FORM,
      id: generatedId,
      name: `Product ${String(nextNum).padStart(2, "0")}`,
    });
    setSizeVariants([]); setNewTopSizeInput(""); setNewBottomSizeInput(""); setShowTopUI(false); setShowBottomUI(false);
    setActiveModal("add");
  };

  // Open modal in Edit mode
  const handleOpenEdit = (product: Product) => {
    resetImageState();
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category || "DROP 001",
      price: product.price.toString(),
      old_price: product.old_price ? product.old_price.toString() : "",
      description: product.description || "",
      is_bundle: !!product.is_bundle,
    });
    const imgs = product.images || [];
    setExistingCoverUrl(imgs[0] || null);
    setExistingSecondaryUrls(imgs.slice(1));
    const variants = parseSizeVariants(product.sizes || []);
    setSizeVariants(variants); setShowTopUI(variants.some(v => v.type === "top")); setShowBottomUI(variants.some(v => v.type === "bottom")); setNewTopSizeInput(""); setNewBottomSizeInput("");
    setActiveModal(product);
  };

  // Save (Create or Update) product to Supabase
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setStatusMessage(null);

    try {
      const cleanId = formData.id.trim();

      // 1. Process Cover Image (Single file direct device upload)
      let finalCoverUrl = existingCoverUrl || "";
      if (coverFile) {
        const fileExt = (coverFile.name.split(".").pop() || "png").toLowerCase();
        const random = Math.random().toString(36).substring(2, 7);
        const coverFileName = `${cleanId}-cover-${Date.now()}-${random}.${fileExt}`;

        const { error: coverUploadError } = await supabase.storage
          .from("products")
          .upload(coverFileName, coverFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (coverUploadError) {
          throw new Error(`Failed to upload cover image (${coverFile.name}): ${coverUploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(coverFileName);

        finalCoverUrl = publicUrl;
      }

      // 2. Process Secondary Images (Multiple files direct device upload)
      const uploadedSecondaryUrls: string[] = [];
      if (secondaryFiles.length > 0) {
        for (let i = 0; i < secondaryFiles.length; i++) {
          const item = secondaryFiles[i];
          const file = item.file;
          const fileExt = (file.name.split(".").pop() || "png").toLowerCase();
          const random = Math.random().toString(36).substring(2, 7);
          const secFileName = `${cleanId}-sec-${Date.now()}-${i}-${random}.${fileExt}`;

          const { error: secUploadError } = await supabase.storage
            .from("products")
            .upload(secFileName, file, {
              cacheControl: "3600",
              upsert: true,
            });

          if (secUploadError) {
            throw new Error(`Failed to upload secondary image (${file.name}): ${secUploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(secFileName);

          uploadedSecondaryUrls.push(publicUrl);
        }
      }

      const finalSecondaryUrls = [...existingSecondaryUrls, ...uploadedSecondaryUrls];

      // Assemble final images array: [finalCoverUrl, ...finalSecondaryUrls]
      let finalImages: string[] = [];
      if (finalCoverUrl) {
        finalImages = [finalCoverUrl, ...finalSecondaryUrls];
      } else if (finalSecondaryUrls.length > 0) {
        finalImages = finalSecondaryUrls;
      } else {
        finalImages = [`/images/looks/${cleanId}.jpg`];
      }

      // Compute total stock from size variants
      const totalStock = sizeVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      // Ensure at least one default; if none set, make first one default
      const hasDefault = sizeVariants.some(v => v.isDefault);
      const normalizedVariants = sizeVariants.map((v, i) => ({
        ...v,
        isDefault: hasDefault ? v.isDefault : i === 0,
      }));

      const payload = {
        id: cleanId,
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: Number(formData.price) || 0,
        old_price: formData.old_price ? Number(formData.old_price) : null,
        stock: totalStock,
        sizes: serializeSizeVariants(normalizedVariants),
        images: finalImages,
        description: formData.description.trim(),
        is_bundle: formData.is_bundle,
      };

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
        text: `Product successfully ${activeModal === "add" ? "created" : "updated"} in Supabase!`,
      });

      resetImageState();
      setActiveModal(null);
      fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save product.";
      setStatusMessage({ type: "error", text: `Error: ${message}` });
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 gap-4">
              <h1 className="font-display tracking-widest text-3xl md:text-4xl font-bold uppercase tracking-wide text-text-primary">
                ADMIN DASHBOARD
              </h1>
              <Link href="/admin/orders" className="text-xs bg-base-surface border border-base-border px-4 py-2 hover:border-accent transition-colors">
                Manage Orders &rarr;
              </Link>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Direct live sync with Supabase <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">products</code> table.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenShipping}
              className="rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
            >
              🚚 SHIPPING RATES
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="rounded-sm bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors shadow-lg shadow-accent/20 flex items-center gap-1.5"
            >
              <span>+</span> ADD PRODUCT
            </button>

            <Link
              href="/admin/referral"
              className="rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
            >
              🎟 REFERRALS
            </Link>

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
            <p className="font-display tracking-widest text-3xl font-bold text-text-primary mt-2 tracking-widest">
              {products.length} <span className="text-sm font-normal text-text-secondary">items</span>
            </p>
          </div>

          <div className="rounded-sm border border-base-border bg-base-surface/80 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
              Total Allocated Stock
            </p>
            <p className="font-display tracking-widest text-3xl font-bold text-accent mt-2 tracking-widest">
              {products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)}{" "}
              <span className="text-sm font-normal text-text-secondary">pieces</span>
            </p>
          </div>

          <div className="rounded-sm border border-base-border bg-base-surface/80 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
              Active Category
            </p>
            <p className="font-display tracking-widest text-3xl font-bold text-text-primary mt-2 tracking-widest">
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
                      <td className="px-5 py-4 font-display tracking-widest text-text-primary whitespace-nowrap tracking-widest">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-sm border border-base-border bg-base-bg overflow-hidden shrink-0 flex items-end justify-center">
                            <Image
                              src={img}
                              alt={product.name}
                              fill
                              sizes="48px"
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
                      <td className="px-5 py-4 font-display tracking-widest font-bold text-text-primary whitespace-nowrap tracking-widest">
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
                        <div className="flex gap-1 flex-wrap">
                          {(product.sizeVariants || []).map((v) => (
                            <span
                              key={v.size}
                              className="rounded-sm border border-base-border bg-base-bg px-1.5 py-0.5 text-[9px] font-bold text-text-secondary"
                            >
                              {v.size} · {v.stock}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-10 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg rounded-sm border border-base-border bg-base-surface p-6 sm:p-8 shadow-2xl relative mb-10">
            <div className="flex items-center justify-between border-b border-base-border pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.28em] text-accent">
                  SUPABASE DIRECT WRITE
                </span>
                <h2 className="font-display tracking-widest text-2xl font-bold uppercase tracking-wide text-text-primary mt-1">
                  {activeModal === "add" ? "Add New Product" : `Edit ${formData.name}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-text-secondary hover:text-text-primary text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product ID */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                    Product ID / Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g. product-07"
                    disabled={activeModal !== "add"}
                    className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors disabled:opacity-50 font-mono"
                    required
                  />
                </div>

                {/* Category Multi-Select */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                    Category *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Shirts", "Jerseys", "Pants", "Trousers", "Outfits"].map((cat) => {
                      const selectedCats = formData.category.split(",").map(c => c.trim()).filter(Boolean);
                      const isSelected = selectedCats.includes(cat);
                      
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormData({ ...formData, category: selectedCats.filter(c => c !== cat).join(", ") });
                            } else {
                              setFormData({ ...formData, category: [...selectedCats, cat].join(", ") });
                            }
                          }}
                          className={`rounded-sm border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                            isSelected 
                              ? "border-accent bg-accent/10 text-accent" 
                              : "border-base-border bg-base-bg text-text-secondary hover:text-text-primary hover:border-text-secondary"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
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

              {/* Price + Original Price */}
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                    OLD PRICE (OPTIONAL)
                  </label>
                  <input
                    type="number"
                    value={formData.old_price}
                    onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                    placeholder="(strikethrough price)"
                    min="0"
                    className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Bundle toggle */}
              <div className="flex items-center gap-3 rounded-sm border border-base-border bg-base-bg px-3.5 py-2.5">
                <input
                  type="checkbox"
                  id="is_bundle"
                  checked={formData.is_bundle}
                  onChange={(e) => setFormData({ ...formData, is_bundle: e.target.checked })}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
                <label htmlFor="is_bundle" className="text-xs text-text-secondary cursor-pointer select-none">
                  <span className="font-bold text-text-primary">Bundle product</span> — show only on Anime page; excluded from Shop, search &amp; homepage
                </label>
              </div>

              {/* SIZE VARIANTS MANAGER */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-3 font-medium">
                    Sizes & Stock
                  </label>
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!showTopUI) {
                          setShowTopUI(true);
                          if (!sizeVariants.some(v => v.type === "top")) {
                            setSizeVariants(prev => [...prev, ...DEFAULT_TOP_VARIANTS.map(v => ({...v}))]);
                          }
                        } else {
                          setShowTopUI(false);
                          setSizeVariants(prev => prev.filter(v => v.type !== "top"));
                        }
                      }}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-colors ${showTopUI ? "border-accent bg-accent/10 text-accent" : "border-base-border text-text-secondary hover:border-accent/50 hover:text-text-primary"}`}
                    >
                      TOP SIZE
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!showBottomUI) {
                          setShowBottomUI(true);
                          if (!sizeVariants.some(v => v.type === "bottom")) {
                            setSizeVariants(prev => [...prev, ...DEFAULT_BOTTOM_VARIANTS.map(v => ({...v}))]);
                          }
                        } else {
                          setShowBottomUI(false);
                          setSizeVariants(prev => prev.filter(v => v.type !== "bottom"));
                        }
                      }}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-colors ${showBottomUI ? "border-accent bg-accent/10 text-accent" : "border-base-border text-text-secondary hover:border-accent/50 hover:text-text-primary"}`}
                    >
                      BOTTOM SIZE
                    </button>
                  </div>

                  {showTopUI && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Top Sizes</p>
                      <div className="rounded-sm border border-base-border bg-base-bg overflow-hidden">
                        <div className="grid grid-cols-[auto_1fr_80px_32px] gap-2 px-3 py-2 border-b border-base-border bg-base-surface/50 text-[9px] font-bold uppercase tracking-widest text-text-secondary">
                          <span>Default</span>
                          <span>Size</span>
                          <span>Stock</span>
                          <span></span>
                        </div>
                        {sizeVariants.map((variant, idx) => variant.type === "top" && (
                          <div key={idx} className="grid grid-cols-[auto_1fr_80px_32px] gap-2 items-center px-3 py-2 border-b border-base-border/40 last:border-0">
                            <input
                              type="radio"
                              name="defaultTopSize"
                              checked={!!variant.isDefault}
                              onChange={() => setSizeVariants(sizeVariants.map((v, i) => v.type === "top" ? { ...v, isDefault: i === idx } : v))}
                              className="accent-accent cursor-pointer"
                            />
                            <span className="text-xs font-bold text-text-primary font-mono">{variant.size}</span>
                            <input
                              type="number"
                              min={0}
                              value={variant.stock}
                              onChange={(e) => setSizeVariants(sizeVariants.map((v, i) => i === idx ? { ...v, stock: Number(e.target.value) } : v))}
                              className="w-full rounded-sm border border-base-border bg-base-surface px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setSizeVariants(sizeVariants.filter((_, i) => i !== idx))}
                              className="text-red-400 hover:text-red-300 font-bold text-sm transition-colors"
                            >X</button>
                          </div>
                        ))}
                        <div className="flex px-3 py-2 bg-base-surface/30">
                          <input
                            type="text"
                            value={newTopSizeInput}
                            onChange={(e) => setNewTopSizeInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const s = newTopSizeInput.trim();
                                if (s && !sizeVariants.some(v => v.size === s && v.type === "top")) {
                                  setSizeVariants([...sizeVariants, { size: s, stock: 100, isDefault: false, type: "top" }]);
                                  setNewTopSizeInput("");
                                }
                              }
                            }}
                            placeholder="Add top size (e.g. XXL)"
                            className="w-full bg-transparent text-xs text-text-primary focus:outline-none placeholder:text-text-secondary/50 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const s = newTopSizeInput.trim();
                              if (s && !sizeVariants.some(v => v.size === s && v.type === "top")) {
                                setSizeVariants([...sizeVariants, { size: s, stock: 100, isDefault: false, type: "top" }]);
                                setNewTopSizeInput("");
                              }
                            }}
                            className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline whitespace-nowrap ml-2"
                          >Add</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {showBottomUI && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Bottom Sizes</p>
                      <div className="rounded-sm border border-base-border bg-base-bg overflow-hidden">
                        <div className="grid grid-cols-[auto_1fr_80px_32px] gap-2 px-3 py-2 border-b border-base-border bg-base-surface/50 text-[9px] font-bold uppercase tracking-widest text-text-secondary">
                          <span>Default</span>
                          <span>Size</span>
                          <span>Stock</span>
                          <span></span>
                        </div>
                        {sizeVariants.map((variant, idx) => variant.type === "bottom" && (
                          <div key={idx} className="grid grid-cols-[auto_1fr_80px_32px] gap-2 items-center px-3 py-2 border-b border-base-border/40 last:border-0">
                            <input
                              type="radio"
                              name="defaultBottomSize"
                              checked={!!variant.isDefault}
                              onChange={() => setSizeVariants(sizeVariants.map((v, i) => v.type === "bottom" ? { ...v, isDefault: i === idx } : v))}
                              className="accent-accent cursor-pointer"
                            />
                            <span className="text-xs font-bold text-text-primary font-mono">{variant.size}</span>
                            <input
                              type="number"
                              min={0}
                              value={variant.stock}
                              onChange={(e) => setSizeVariants(sizeVariants.map((v, i) => i === idx ? { ...v, stock: Number(e.target.value) } : v))}
                              className="w-full rounded-sm border border-base-border bg-base-surface px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setSizeVariants(sizeVariants.filter((_, i) => i !== idx))}
                              className="text-red-400 hover:text-red-300 font-bold text-sm transition-colors"
                            >X</button>
                          </div>
                        ))}
                        <div className="flex px-3 py-2 bg-base-surface/30">
                          <input
                            type="text"
                            value={newBottomSizeInput}
                            onChange={(e) => setNewBottomSizeInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const s = newBottomSizeInput.trim();
                                if (s && !sizeVariants.some(v => v.size === s && v.type === "bottom")) {
                                  setSizeVariants([...sizeVariants, { size: s, stock: 100, isDefault: false, type: "bottom" }]);
                                  setNewBottomSizeInput("");
                                }
                              }
                            }}
                            placeholder="Add bottom size (e.g. 38)"
                            className="w-full bg-transparent text-xs text-text-primary focus:outline-none placeholder:text-text-secondary/50 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const s = newBottomSizeInput.trim();
                              if (s && !sizeVariants.some(v => v.size === s && v.type === "bottom")) {
                                setSizeVariants([...sizeVariants, { size: s, stock: 100, isDefault: false, type: "bottom" }]);
                                setNewBottomSizeInput("");
                              }
                            }}
                            className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline whitespace-nowrap ml-2"
                          >Add</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-text-secondary mt-1.5">
                    Total stock: <strong className="text-accent">{sizeVariants.reduce((s, v) => s + (Number(v.stock) || 0), 0)}</strong> units
                  </p>
                </div>


                {/* PRODUCT IMAGES: TWO DISTINCT DEVICE UPLOAD SECTIONS */}
                <div className="space-y-4">
                  {/* SECTION 1: COVER IMAGE (SINGLE) */}
                  <div className="rounded-sm border border-base-border bg-base-bg/30 p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] uppercase tracking-widest text-text-primary font-bold">
                        Cover Image <span className="text-accent text-[9px] font-normal normal-case tracking-normal">(Required · Strictly 1 file)</span>
                      </label>
                      {(coverPreviewUrl || existingCoverUrl) && (
                        <span className="text-[9px] uppercase tracking-wider font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-sm border border-accent/20">
                          {coverFile ? "New file selected" : "Saved in database"}
                        </span>
                      )}
                    </div>

                    {/* Single device file input without multiple */}
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/avif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleSetCoverFile(e.target.files[0]);
                          e.target.value = "";
                        }
                      }}
                    />

                    {/* Dedicated preview card or upload trigger */}
                    {coverPreviewUrl || existingCoverUrl ? (
                      <div className="flex items-center gap-3.5 bg-base-bg border border-base-border rounded-sm p-2.5">
                        <div className="relative size-20 rounded-sm overflow-hidden border border-base-border bg-base-surface shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={coverPreviewUrl || existingCoverUrl || ""}
                            alt="Cover image preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate font-mono">
                            {coverFile ? coverFile.name : (existingCoverUrl?.split("/").pop() || "cover-image")}
                          </p>
                          <p className="text-[10px] text-text-secondary mt-0.5">
                            {coverFile ? `${(coverFile.size / 1024).toFixed(1)} KB · Ready to upload` : "Active cover image"}
                          </p>
                          <div className="flex items-center gap-2 mt-2.5">
                            <button
                              type="button"
                              onClick={() => coverInputRef.current?.click()}
                              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-base-surface border border-base-border hover:border-accent hover:text-accent text-text-primary rounded-sm transition-colors"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveCover}
                              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-sm transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="flex flex-col items-center justify-center w-full py-4 px-3 cursor-pointer rounded-sm border border-dashed border-base-border hover:border-accent bg-base-bg/50 hover:bg-base-bg transition-colors group"
                      >
                        <span className="text-xs font-bold uppercase tracking-widest text-accent group-hover:text-accent-dim">
                          + Choose Cover Image
                        </span>
                        <span className="text-[10px] text-text-secondary/70 mt-1">
                          Select 1 image file from device (PNG, JPG, WEBP, AVIF)
                        </span>
                      </button>
                    )}
                  </div>

                  {/* SECTION 2: SECONDARY IMAGES (MULTIPLE) */}
                  <div className="rounded-sm border border-base-border bg-base-bg/30 p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] uppercase tracking-widest text-text-primary font-bold">
                        Secondary Images <span className="text-text-secondary text-[9px] font-normal normal-case tracking-normal">(Optional · Multiple files)</span>
                      </label>
                      {(existingSecondaryUrls.length > 0 || secondaryFiles.length > 0) && (
                        <span className="text-[9px] uppercase tracking-wider font-mono text-text-secondary">
                          {existingSecondaryUrls.length + secondaryFiles.length} {existingSecondaryUrls.length + secondaryFiles.length === 1 ? "image" : "images"}
                        </span>
                      )}
                    </div>

                    {/* Multiple files input */}
                    <input
                      ref={secondaryInputRef}
                      type="file"
                      multiple
                      accept="image/png, image/jpeg, image/webp, image/avif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleAddSecondaryFiles(e.target.files);
                          e.target.value = "";
                        }
                      }}
                    />

                    {/* Choose Secondary Images trigger */}
                    <button
                      type="button"
                      onClick={() => secondaryInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-3 cursor-pointer rounded-sm border border-dashed border-base-border hover:border-accent bg-base-bg/50 hover:bg-base-bg transition-colors mb-3 group"
                    >
                      <span className="text-xs font-bold uppercase tracking-widest text-accent group-hover:text-accent-dim">
                        + Choose Secondary Images
                      </span>
                      <span className="text-[10px] text-text-secondary/70">
                        (Upload multiple files from device)
                      </span>
                    </button>

                    {/* Grid of thumbnail preview cards */}
                    {(existingSecondaryUrls.length > 0 || secondaryFiles.length > 0) ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                          {/* Saved secondary images */}
                          {existingSecondaryUrls.map((url, idx) => (
                            <div
                              key={`existing-sec-${idx}`}
                              className="group relative aspect-square rounded-sm border border-base-border bg-base-surface overflow-hidden shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`Secondary ${idx + 1}`} className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 left-1 bg-black/75 text-[8px] font-mono px-1 rounded text-text-secondary">
                                Saved
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingSecondaryUrl(idx)}
                                className="absolute top-1 right-1 size-5 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-all"
                                title="Remove secondary image"
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          {/* Newly chosen secondary files */}
                          {secondaryFiles.map((item) => (
                            <div
                              key={item.id}
                              className="group relative aspect-square rounded-sm border border-accent/40 bg-base-surface overflow-hidden shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 left-1 bg-accent/90 text-black text-[8px] font-mono px-1 rounded font-bold">
                                New
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSecondaryFile(item.id)}
                                className="absolute top-1 right-1 size-5 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-all"
                                title="Remove new image"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        {secondaryFiles.length > 0 && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-accent font-medium">
                              {secondaryFiles.length} new {secondaryFiles.length === 1 ? "image" : "images"} pending upload
                            </span>
                            <button
                              type="button"
                              onClick={handleClearSecondaryFiles}
                              className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
                            >
                              Clear New
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-text-secondary/60 text-center py-2">
                        No secondary images added yet.
                      </p>
                    )}
                  </div>
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
                  onClick={handleCloseModal}
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
            <h3 className="font-display tracking-widest text-xl font-bold uppercase tracking-wide text-red-400">
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

      {/* SHIPPING RATES MODAL */}
      {showShippingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-sm border border-base-border bg-base-surface p-6 sm:p-8 shadow-2xl">
            <h2 className="font-display tracking-widest text-xl font-bold uppercase tracking-wide text-text-primary mb-4">
              Delivery Pricing
            </h2>
            <form onSubmit={handleSaveShipping} className="space-y-4">
              {["Sindh", "Balochistan", "Punjab", "KPK"].map((prov) => (
                <div key={prov}>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                    {prov} (PKR)
                  </label>
                  <input
                    type="number"
                    value={shippingForm[prov as keyof typeof shippingForm] || ""}
                    onChange={(e) => setShippingForm({ ...shippingForm, [prov]: e.target.value })}
                    placeholder="e.g. 250"
                    className="w-full rounded-sm border border-base-border bg-base-bg px-3.5 py-2 text-xs text-text-primary focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
              ))}
              <div className="border-t border-base-border pt-4 flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowShippingModal(false)}
                  disabled={shippingSaving}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shippingSaving}
                  className="rounded-sm bg-accent px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-primary"
                >
                  {shippingSaving ? "Saving..." : "Save Rates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
