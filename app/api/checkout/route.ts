import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/email";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://gqazaajfycutqildyrqw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYXphYWpmeWN1dHFpbGR5cnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTEzNzAsImV4cCI6MjEwNDcyNzM3MH0.9SnZ_D9L9duzG0bOUEPkKnWu065z4eWuUeK17i5eK5M";

/** Service-role client bypasses RLS — only use server-side. */
function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false },
  });
}

function generateOrderId(): string {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FM-2026-${timestamp}${random}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type BundleSize = { outfitName: string; topSize: string; waist: string };

interface IncomingItem {
  lookId?: string;
  product_id?: string;
  productId?: string;
  name?: string;
  size?: string;
  price?: number;
  price_at_purchase?: number;
  quantity?: number;
  isBundle?: boolean;
  bundleSizes?: BundleSize[];
  category?: string;
}

// ---------------------------------------------------------------------------
// POST /api/checkout
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customer_name,
      customerName,
      email,
      phone,
      shipping_address,
      shippingAddress,
      notes,
      items,
      referral_code,
      orderId: clientOrderId,
    } = body;

    // ── Basic field resolution ──────────────────────────────────────────────
    const resolvedName = (customer_name || customerName || "").trim();
    const resolvedEmail = (email || "").trim();
    const resolvedPhone = (phone || "").trim();
    const resolvedAddress = (shipping_address || shippingAddress || "").trim();
    const resolvedNotes = (notes || "").trim();
    const rawReferralCode: string | undefined = referral_code
      ? String(referral_code).trim()
      : undefined;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!resolvedName)
      return NextResponse.json(
        { error: "Customer name is required." },
        { status: 400 }
      );

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!resolvedEmail || !emailRegex.test(resolvedEmail))
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );

    if (!resolvedPhone || !/^\d+$/.test(resolvedPhone))
      return NextResponse.json(
        {
          error:
            "Phone number is required and must contain numeric digits only.",
        },
        { status: 400 }
      );

    if (!Array.isArray(items) || items.length === 0)
      return NextResponse.json(
        { error: "At least one item is required to create an order." },
        { status: 400 }
      );

    const supabaseAdmin = getAdminClient();

    // ── Idempotency: return existing order if orderId already in DB ─────────
    const orderId: string = clientOrderId || generateOrderId();
    if (clientOrderId) {
      const { data: existing } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", clientOrderId)
        .maybeSingle();

      if (existing) {
        console.log("[Checkout] Duplicate orderId detected, returning existing:", clientOrderId);
        return NextResponse.json(
          {
            success: true,
            order: existing,
            referralApplied: !!existing.referral_code,
            referralMessage: existing.referral_code
              ? `Code ${existing.referral_code} was applied.`
              : undefined,
          },
          { status: 200 }
        );
      }
    }

    // ── Bundle product lookup ───────────────────────────────────────────────
    // Fetch once if any item is a bundle so we know server-side price.
    let bundleServerPrice: number | null = null;
    const hasBundle = (items as IncomingItem[]).some((i) => i.isBundle);
    if (hasBundle) {
      const { data: bundleProduct } = await supabaseAdmin
        .from("products")
        .select("price, id")
        .or("slug.eq.anime-bundle-5-outfits,is_bundle.eq.true")
        .maybeSingle();

      if (bundleProduct) {
        bundleServerPrice = Number(bundleProduct.price) || null;
      }
    }

    // ── Referral code validation ────────────────────────────────────────────
    let referralApplied = false;
    let referralDiscountPct = 0;
    let referralCategories: string[] = [];
    let referralMessage: string | undefined;

    if (rawReferralCode) {
      const { data: codeRow } = await supabaseAdmin
        .from("referral_codes")
        .select("discount_percent, categories, is_active")
        .ilike("code", rawReferralCode)
        .maybeSingle();

      if (codeRow && codeRow.is_active) {
        referralApplied = true;
        referralDiscountPct = Number(codeRow.discount_percent) || 0;
        referralCategories = Array.isArray(codeRow.categories)
          ? codeRow.categories
          : ["All categories"];
        referralMessage = `Code ${rawReferralCode.toUpperCase()} applied — ${referralDiscountPct}% off eligible items.`;
      } else {
        referralMessage = `Code ${rawReferralCode.toUpperCase()} is not valid or has expired. Order processed without discount.`;
      }
    }

    // ── Compute server-side prices per item ─────────────────────────────────
    const perItemDiscounts: Record<string, number> = {};
    let serverSubtotal = 0;

    const orderItemsPayload = (items as IncomingItem[]).map((item, idx) => {
      const productId =
        item.product_id || item.productId || item.lookId || `item-${idx + 1}`;
      const quantity = item.isBundle ? 1 : Math.max(1, Number(item.quantity) || 1);
      const size = item.size || "ONE SIZE";
      const itemId = `item-${orderId}-${idx + 1}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;

      // Determine base price — prefer server-fetched price for bundles
      let basePrice: number;
      if (item.isBundle && bundleServerPrice !== null) {
        basePrice = bundleServerPrice;
      } else {
        basePrice = Number(item.price_at_purchase || item.price) || 0;
      }

      // Apply referral discount if eligible
      let effectivePrice = basePrice;
      if (referralApplied && referralDiscountPct > 0) {
        const catMatch =
          referralCategories.includes("All categories") ||
          (item.category && referralCategories.includes(item.category));

        if (catMatch) {
          const discountedPrice = Math.round(
            basePrice * (1 - referralDiscountPct / 100)
          );
          const savedPerUnit = basePrice - discountedPrice;
          if (savedPerUnit > 0) {
            perItemDiscounts[productId] = savedPerUnit;
          }
          effectivePrice = discountedPrice;
        }
      }

      serverSubtotal += effectivePrice * quantity;

      return {
        id: itemId,
        order_id: orderId,
        product_id: productId,
        quantity,
        price_at_purchase: effectivePrice,
        size,
        bundle_sizes: item.isBundle && item.bundleSizes ? item.bundleSizes : null,
      };
    });

    // Shipping — browser hint total minus our computed subtotal gives shipping;
    // or fall back to 0 (free). We do NOT trust browser total for pricing.
    const browserTotal = Number(body.total) || 0;
    const shippingCost = Math.max(0, Math.round(browserTotal - serverSubtotal));
    const finalTotal = Math.round(serverSubtotal + shippingCost);
    const totalDiscount =
      Object.values(perItemDiscounts).reduce((s, v) => s + v, 0) *
      (items as IncomingItem[]).reduce((s, i) =>
        s + (i.isBundle ? 1 : Math.max(1, Number(i.quantity) || 1)),
        0
      ) || 0;
    // Simpler accurate discount: original subtotal - discounted subtotal
    const originalSubtotal = (items as IncomingItem[]).reduce((sum, item) => {
      const qty = item.isBundle ? 1 : Math.max(1, Number(item.quantity) || 1);
      let price = Number(item.price_at_purchase || item.price) || 0;
      if (item.isBundle && bundleServerPrice !== null) price = bundleServerPrice;
      return sum + price * qty;
    }, 0);
    const discountAmount = Math.round(originalSubtotal - serverSubtotal);

    // ── Insert order ────────────────────────────────────────────────────────
    const { error: orderError } = await supabaseAdmin.from("orders").insert({
      id: orderId,
      customer_name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      total: finalTotal,
      status: "ORDER_SECURED",
      shipping_address: resolvedAddress,
      notes: resolvedNotes,
      referral_code: referralApplied ? rawReferralCode : null,
      discount_amount: discountAmount > 0 ? discountAmount : null,
      per_item_discounts:
        Object.keys(perItemDiscounts).length > 0 ? perItemDiscounts : null,
    });

    if (orderError) {
      console.error("[Checkout] Supabase Insert Error:", orderError);
      return NextResponse.json(
        { error: `Supabase Error: ${orderError.message || JSON.stringify(orderError)}` },
        { status: 500 }
      );
    }

    // ── Insert order_items ──────────────────────────────────────────────────
    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsPayload);
    if (itemsError) {
      console.error("[Checkout] Order Items Insert Error:", itemsError);
    }

    // ── Reduce stock for bundle (by 1) ─────────────────────────────────────
    if (hasBundle && bundleServerPrice !== null) {
      await supabaseAdmin.rpc("decrement_bundle_stock", { bundle_slug: "anime-bundle-5-outfits" }).maybeSingle();
      // Non-fatal — rpc may not exist yet; stock management can be added separately
    }

    // ── Build email items list ──────────────────────────────────────────────
    const emailItems = orderItemsPayload.map((oi) => {
      const src = (items as IncomingItem[]).find(
        (i) =>
          (i.lookId || i.product_id || i.productId) === oi.product_id ||
          i.product_id === oi.product_id
      );
      return {
        name: src?.name || oi.product_id.toUpperCase(),
        size: oi.size,
        quantity: oi.quantity,
        price: oi.price_at_purchase,
        isBundle: src?.isBundle ?? false,
        bundleSizes: oi.bundle_sizes as BundleSize[] | null,
      };
    });

    const finalOrder = {
      id: orderId,
      customer_name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      total: finalTotal,
      status: "ORDER_SECURED",
      shipping_address: resolvedAddress,
      notes: resolvedNotes,
      referral_code: referralApplied ? rawReferralCode : null,
      discount_amount: discountAmount > 0 ? discountAmount : null,
      items: orderItemsPayload,
    };

    // ── Send confirmation email ─────────────────────────────────────────────
    try {
      await sendOrderConfirmationEmail({
        orderId,
        customerName: resolvedName,
        customerEmail: resolvedEmail,
        shippingAddress: resolvedAddress,
        total: finalTotal,
        items: emailItems,
        deliveryEstimate: "20-30 Oct 2026",
        referralCode: referralApplied ? rawReferralCode : undefined,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        perItemDiscounts:
          Object.keys(perItemDiscounts).length > 0 ? perItemDiscounts : undefined,
      });
    } catch (emailErr) {
      console.error("[Checkout] Failed to dispatch email:", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        order: finalOrder,
        referralApplied,
        referralMessage,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create order.";
    console.error("Checkout route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}