import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gqazaajfycutqildyrqw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getAdminClient() {
  // If serviceRoleKey is missing, we log a warning because RLS will likely block requests
  if (!serviceRoleKey) {
    console.warn("Missing SUPABASE_SERVICE_ROLE_KEY. Admin queries may fail due to RLS.");
  }
  return createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false },
  });
}

export async function GET(request: Request) {
  // Check custom cookie authentication
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (session !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getAdminClient();
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch all products to stitch names into order_items
  // (Since order_items only has product_id and no FK to products)
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, name");
  
  const productMap = new Map(products?.map((p) => [p.id, p.name]) || []);

  const dataWithProductNames = orders?.map((order) => {
    if (order.order_items && Array.isArray(order.order_items)) {
      order.order_items = order.order_items.map((item: any) => ({
        ...item,
        name: productMap.get(item.product_id) || item.product_id,
      }));
    }
    return order;
  });

  return NextResponse.json(dataWithProductNames);
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (session !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  let { status } = body;
  const { tracking_number, courier_name } = body;
  const id = body.id || body.orderId;
  
  if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });

  // Map frontend status to DB check constraint statuses
  if (status) {
    const s = status.toLowerCase();
    if (s === "pending" || s === "confirmed") status = "ORDER_SECURED";
    else if (s === "in_production") status = "STUDIO_PROCESSING";
    else if (s === "shipped") status = "DISPATCHED";
    else if (s === "delivered") status = "DELIVERED";
    else if (s === "cancelled") status = "CANCELLED";
  }

  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status, tracking_number, courier_name })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (session !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = body.id || body.orderId;
  
  if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });

  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
