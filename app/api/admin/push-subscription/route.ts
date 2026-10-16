import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://gqazaajfycutqildyrqw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BDEAKKNvMb0N3gKN1RUDAaJZ_gHbj2ciE1I7_QYHBefCh5YuP-K1yr4qSJB7R4hGx0JJTCthxQr5TazbgAMcfgE";

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false },
  });
}

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

// ---------------------------------------------------------------------------
// GET /api/admin/push-subscription
// Returns VAPID public key and count of registered devices
// ---------------------------------------------------------------------------
export async function GET() {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { count, error } = await supabase
    .from("admin_push_subscriptions")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[push-subscription] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    vapidPublicKey: VAPID_PUBLIC_KEY,
    deviceCount: count || 0,
  });
}

// ---------------------------------------------------------------------------
// POST /api/admin/push-subscription
// Saves or updates a device push subscription
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription payload." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const { error } = await supabase
      .from("admin_push_subscriptions")
      .upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: userAgent || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      );

    if (error) {
      console.error("[push-subscription] Upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/push-subscription
// Removes a device push subscription
// ---------------------------------------------------------------------------
export async function DELETE(request: Request) {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { error } = await supabase
      .from("admin_push_subscriptions")
      .delete()
      .eq("endpoint", endpoint);

    if (error) {
      console.error("[push-subscription] Delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
