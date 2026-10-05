import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://gqazaajfycutqildyrqw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getServiceClient() {
  return createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = (body.code || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Please enter a referral code." },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("referral_codes")
      .select("id, code, name, usage_count, discount_percent, categories, is_active")
      .ilike("code", code)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: "Invalid referral code. Please check and try again." },
        { status: 400 }
      );
    }

    if (!data.is_active) {
      return NextResponse.json(
        { success: false, message: "This code has been paused." },
        { status: 400 }
      );
    }

    // Only increment usage_count on the FIRST application by this user.
    // We track this with a cookie so removing and re-applying the same code
    // does not count as a new use.
    const cookieStore = await cookies();
    const cookieName = "ref_used_" + data.id;
    const alreadyUsed = cookieStore.get(cookieName);

    if (!alreadyUsed) {
      await supabase
        .from("referral_codes")
        .update({ usage_count: (data.usage_count || 0) + 1 })
        .eq("id", data.id);

      cookieStore.set(cookieName, "true", { path: "/", maxAge: 60 * 60 * 24 * 365 });
    }

    const discountPct = Number(data.discount_percent) || 0;
    const categories: string[] = Array.isArray(data.categories)
      ? data.categories
      : ["All categories"];

    const catText = categories.includes("All categories")
      ? "all products"
      : categories.join(", ");

    const message =
      discountPct > 0
        ? `Code ${data.code} applied: ${discountPct}% off ${catText}`
        : `Referral code accepted! You were referred by ${data.name}.`;

    return NextResponse.json({
      success: true,
      code: data.code,
      name: data.name,
      discountPercent: discountPct,
      categories,
      message,
    });
  } catch (err) {
    console.error("Referral API error:", err);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
