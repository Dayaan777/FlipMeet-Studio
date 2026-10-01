import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gqazaajfycutqildyrqw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYXphYWpmeWN1dHFpbGR5cnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTEzNzAsImV4cCI6MjEwNDcyNzM3MH0.9SnZ_D9L9duzG0bOUEPkKnWu065z4eWuUeK17i5eK5M";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customerName,
      email,
      phone,
      total,
      items,
      shipping_address,
      shippingAddress,
      notes,
    } = body;

    const resolvedName = (customer_name || customerName || "").trim();
    const resolvedEmail = (email || "").trim();
    const resolvedPhone = (phone || "").trim();
    const resolvedAddress = (shipping_address || shippingAddress || "").trim();
    const resolvedNotes = (notes || "").trim();
    const resolvedTotal = Number(total);

    if (!resolvedName) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!resolvedEmail || !emailRegex.test(resolvedEmail)) return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    if (!resolvedPhone || !/^\d+$/.test(resolvedPhone)) return NextResponse.json({ error: "Phone number is required and must contain numeric digits only." }, { status: 400 });
    if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "At least one item is required to create an order." }, { status: 400 });
    if (isNaN(resolvedTotal) || resolvedTotal <= 0) return NextResponse.json({ error: "Order total must be a positive number." }, { status: 400 });

    const orderId = body.id || generateOrderId();

    const orderItemsPayload = items.map((item: any, idx: number) => {
      const productId = item.product_id || item.productId || item.lookId || `item-${idx + 1}`;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const priceAtPurchase = Number(item.price_at_purchase || item.price) || 0;
      const size = item.size || "M";
      const itemId = `item-${orderId}-${idx + 1}-${Math.random().toString(36).slice(2, 6)}`;
      return { id: itemId, order_id: orderId, product_id: productId, quantity, price_at_purchase: priceAtPurchase, size };
    });

    const supabaseAdmin = getAdminClient();

    const { error: orderError } = await supabaseAdmin.from("orders").insert({
      id: orderId,
      customer_name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      total: resolvedTotal,
      status: "ORDER_SECURED",
      shipping_address: resolvedAddress,
      notes: resolvedNotes,
    });

    if (orderError) {
      console.error("[Checkout] Supabase Insert Error:", orderError);
      return NextResponse.json({ error: `Supabase Error: ${orderError.message || JSON.stringify(orderError)}` }, { status: 500 });
    }

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItemsPayload);
    if (itemsError) {
      console.error("[Checkout] Order Items Insert Error:", itemsError);
    }

    const finalOrder = {
      id: orderId,
      customer_name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      total: resolvedTotal,
      status: "ORDER_SECURED",
      shipping_address: resolvedAddress,
      notes: resolvedNotes,
      items: orderItemsPayload,
    };

    try {
      const emailItems = orderItemsPayload.map((item: any) => {
        const matched = items.find((i: any) => i.lookId === item.product_id || i.product_id === item.product_id || i.productId === item.product_id);
        return { name: matched?.name || item.product_id.toUpperCase(), size: item.size, quantity: item.quantity, price: item.price_at_purchase };
      });
      await sendOrderConfirmationEmail({
        orderId,
        customerName: resolvedName,
        customerEmail: resolvedEmail,
        shippingAddress: resolvedAddress,
        total: resolvedTotal,
        items: emailItems,
        deliveryEstimate: "20-30 Oct 2026",
      });
    } catch (emailErr) {
      console.error("[Checkout] Failed to dispatch email:", emailErr);
    }

    return NextResponse.json({ success: true, order: finalOrder }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create order.";
    console.error("Checkout route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}