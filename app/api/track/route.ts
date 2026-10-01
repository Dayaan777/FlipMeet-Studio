import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gqazaajfycutqildyrqw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYXphYWpmeWN1dHFpbGR5cnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTEzNzAsImV4cCI6MjEwNDcyNzM3MH0.9SnZ_D9L9duzG0bOUEPkKnWu065z4eWuUeK17i5eK5M";

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, email } = body;

    const resolvedOrderId = (orderId || "").trim();
    const resolvedEmail = (email || "").trim().toLowerCase();

    if (!resolvedOrderId || !resolvedEmail) {
      return NextResponse.json({ error: "Order ID and Email are required." }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Use admin client to query to bypass RLS in case user is not logged in.
    // Security check: Verify email matches the order exactly.
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, status, tracking_number, courier_name, created_at, email")
      .eq("id", resolvedOrderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.email.toLowerCase() !== resolvedEmail) {
      return NextResponse.json({ error: "Email does not match this order." }, { status: 403 });
    }

    // Don't send back sensitive info like total price, address, etc. if not needed for tracking.
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        tracking_number: order.tracking_number,
        courier_name: order.courier_name,
        created_at: order.created_at,
        
      }
    });
  } catch (err: any) {
    console.error("Track route error:", err.message);
    return NextResponse.json({ error: "Failed to fetch tracking info." }, { status: 500 });
  }
}
