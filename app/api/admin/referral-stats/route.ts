import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://gqazaajfycutqildyrqw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// GET /api/admin/referral-stats
// Returns per-code stats computed live from the orders table.
// Only counts orders whose status is NOT cancelled or returned.
// ---------------------------------------------------------------------------
export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();

  const EXCLUDED = ["CANCELLED", "RETURNED", "cancelled", "returned"];

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, referral_code, total, discount_amount, status, created_at")
    .not("referral_code", "is", null)
    .not("status", "in", `(${EXCLUDED.map((s) => `"${s}"`).join(",")})`);

  if (error) {
    console.error("[referral-stats] query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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

  const statsMap: Record<string, CodeStats> = {};

  for (const order of orders ?? []) {
    const code = (order.referral_code as string | null)?.toUpperCase();
    if (!code) continue;

    if (!statsMap[code]) {
      statsMap[code] = {
        orderCount: 0,
        totalSales: 0,
        totalDiscount: 0,
        orders: [],
      };
    }

    statsMap[code].orderCount += 1;
    statsMap[code].totalSales += Number(order.total) || 0;
    statsMap[code].totalDiscount += Number(order.discount_amount) || 0;
    statsMap[code].orders.push({
      id: order.id,
      created_at: order.created_at,
      status: order.status,
      total: Number(order.total) || 0,
      discount_amount: order.discount_amount ? Number(order.discount_amount) : null,
    });
  }

  return NextResponse.json({ stats: statsMap });
}
