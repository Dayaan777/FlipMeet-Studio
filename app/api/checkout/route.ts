import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gqazaajfycutqildyrqw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYXphYWpmeWN1dHFpbGR5cnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTEzNzAsImV4cCI6MjEwNDcyNzM3MH0.9SnZ_D9L9duzG0bOUEPkKnWu065z4eWuUeK17i5eK5M";

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: {
      persistSession: false,
    },
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

    // Validation
    if (!resolvedName) {
      return NextResponse.json(
        { error: "Customer name is required." },
        { status: 400 }
      );
    }

    if (!resolvedEmail || !resolvedEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!resolvedPhone) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required to create an order." },
        { status: 400 }
      );
    }

    if (isNaN(resolvedTotal) || resolvedTotal <= 0) {
      return NextResponse.json(
        { error: "Order total must be a positive number." },
        { status: 400 }
      );
    }

    const orderId = body.id || generateOrderId();

    // Prepare normalized items payload
    const orderItemsPayload = items.map((item: any, idx: number) => {
      const productId = item.product_id || item.productId || item.lookId || `item-${idx + 1}`;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const priceAtPurchase = Number(item.price_at_purchase || item.price) || 0;
      const size = item.size || "M";
      const itemId = `item-${orderId}-${idx + 1}-${Math.random().toString(36).slice(2, 6)}`;

      return {
        id: itemId,
        order_id: orderId,
        product_id: productId,
        quantity,
        price_at_purchase: priceAtPurchase,
        size,
      };
    });

    const supabaseAdmin = getAdminClient();

    // 1. If service role key is configured, insert directly into tables
    if (serviceRoleKey) {
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          id: orderId,
          customer_name: resolvedName,
          email: resolvedEmail,
          phone: resolvedPhone,
          total: resolvedTotal,
          status: "pending",
          shipping_address: resolvedAddress,
          notes: resolvedNotes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      return NextResponse.json(
        {
          success: true,
          order: {
            ...order,
            items: orderItemsPayload,
          },
        },
        { status: 201 }
      );
    }

    // 2. Fallback: Call database SECURITY DEFINER function
    const { data: order, error: rpcError } = await supabaseAdmin.rpc(
      "create_order_secure",
      {
        p_order_id: orderId,
        p_customer_name: resolvedName,
        p_email: resolvedEmail,
        p_phone: resolvedPhone,
        p_total: resolvedTotal,
        p_status: "pending",
        p_shipping_address: resolvedAddress,
        p_notes: resolvedNotes,
        p_items: orderItemsPayload,
      }
    );

    if (rpcError) throw rpcError;

    return NextResponse.json(
      {
        success: true,
        order: {
          ...order,
          items: orderItemsPayload,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create order.";
    console.error("Checkout route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
