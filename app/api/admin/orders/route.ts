import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

// Server-side authentication check
async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return session === "authenticated";
}

// GET: Fetch all orders with items from Supabase (authenticated admin only)
export async function GET() {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session cookie required." },
      { status: 401 }
    );
  }

  try {
    const supabaseAdmin = getAdminClient();

    // 1. Direct query if service role key is present
    if (serviceRoleKey) {
      const { data: orders, error: ordersError } = await supabaseAdmin
        .from("orders")
        .select(`
          id,
          customer_name,
          email,
          phone,
          total,
          status,
          shipping_address,
          notes,
          created_at,
          items:order_items (
            id,
            order_id,
            product_id,
            quantity,
            price_at_purchase,
            size,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (!ordersError && orders) {
        return NextResponse.json({ success: true, orders });
      }
    }

    // 2. Fallback: Call database SECURITY DEFINER function
    const { data: rpcOrders, error: rpcError } = await supabaseAdmin.rpc("admin_get_orders");
    if (rpcError) throw rpcError;

    return NextResponse.json({ success: true, orders: rpcOrders || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch orders.";
    console.error("Admin orders GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Update order status (authenticated admin only)
export async function PATCH(request: Request) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session cookie required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { orderId, id, status } = body;
    const targetId = (orderId || id || "").trim();
    const targetStatus = (status || "").trim().toLowerCase();

    if (!targetId || !targetStatus) {
      return NextResponse.json(
        { error: "orderId and status are required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();

    // 1. Direct update if service role key is present
    if (serviceRoleKey) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .update({ status: targetStatus })
        .eq("id", targetId)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, order: data });
      }
    }

    // 2. Fallback: Call database SECURITY DEFINER function
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
      "admin_update_order_status",
      {
        p_order_id: targetId,
        p_status: targetStatus,
      }
    );

    if (rpcError) throw rpcError;

    return NextResponse.json({ success: true, order: rpcData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order status.";
    console.error("Admin orders PATCH error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
