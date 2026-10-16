import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendTestNotification, sendOrderPushNotification } from "@/lib/push";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

// ---------------------------------------------------------------------------
// POST /api/admin/push-test
// Sends a test push alert to verify phone notifications work
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body = null;
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    if (body?.subscription?.endpoint) {
      // Send directly to the specified subscription
      await sendTestNotification({
        endpoint: body.subscription.endpoint,
        p256dh: body.subscription.keys.p256dh,
        auth: body.subscription.keys.auth,
      });
    } else {
      // Broadcast test alert to all admin subscriptions
      await sendOrderPushNotification({
        orderId: "TEST-001",
        customerName: "Test Customer",
        total: 7500,
        city: "Karachi",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully!",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send test push.";
    console.error("[push-test] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
