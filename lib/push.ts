import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://gqazaajfycutqildyrqw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYXphYWpmeWN1dHFpbGR5cnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTEzNzAsImV4cCI6MjEwNDcyNzM3MH0.9SnZ_D9L9duzG0bOUEPkKnWu065z4eWuUeK17i5eK5M";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BDEAKKNvMb0N3gKN1RUDAaJZ_gHbj2ciE1I7_QYHBefCh5YuP-K1yr4qSJB7R4hGx0JJTCthxQr5TazbgAMcfgE";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  "2kyspHMfHaRe9G2gmCKMSylpDyS1YtO7uKeFvKHbsrU";
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:admin@flipmeetstudio.com";

// Configure web-push details
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.error("[WebPush] Failed to set VAPID details:", e);
}

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false },
  });
}

export interface OrderPushPayload {
  orderId: string;
  customerName: string;
  total: number;
  itemsCount?: number;
  city?: string;
}

/**
 * Dispatches a push notification to all registered admin devices.
 * Removes expired or invalid subscriptions automatically.
 */
export async function sendOrderPushNotification(payload: OrderPushPayload) {
  try {
    const supabase = getAdminClient();
    const { data: subs, error } = await supabase
      .from("admin_push_subscriptions")
      .select("id, endpoint, p256dh, auth");

    if (error) {
      console.error("[WebPush] Error fetching push subscriptions:", error.message);
      return;
    }

    if (!subs || subs.length === 0) {
      console.log("[WebPush] No admin push subscriptions registered.");
      return;
    }

    const notificationData = JSON.stringify({
      title: "🛍️ New Order Received!",
      body: `#${payload.orderId} · PKR ${payload.total.toLocaleString()} from ${payload.customerName}${
        payload.city ? ` (${payload.city})` : ""
      }`,
      icon: "/favicon.png",
      badge: "/favicon.png",
      url: "/admin/orders",
      orderId: payload.orderId,
      tag: `order-${payload.orderId}`,
    });

    const staleIds: string[] = [];

    await Promise.all(
      subs.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, notificationData);
        } catch (err: unknown) {
          const webPushError = err as { statusCode?: number; message?: string };
          // 404 or 410 means subscription is expired or cancelled
          if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
            console.log(`[WebPush] Subscription expired (${webPushError.statusCode}), queueing for removal:`, sub.id);
            staleIds.push(sub.id);
          } else {
            console.error(`[WebPush] Error sending push to subscription ${sub.id}:`, webPushError.message || err);
          }
        }
      })
    );

    // Clean up stale subscriptions
    if (staleIds.length > 0) {
      await supabase.from("admin_push_subscriptions").delete().in("id", staleIds);
      console.log(`[WebPush] Cleaned up ${staleIds.length} stale subscription(s).`);
    }
  } catch (err) {
    console.error("[WebPush] sendOrderPushNotification failed:", err);
  }
}

/**
 * Sends a single test notification to a specific subscription.
 */
export async function sendTestNotification(subscription: {
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  const payload = JSON.stringify({
    title: "⚡ Order Alerts Active!",
    body: "FlipMeet Studio order notifications are working on this device.",
    icon: "/favicon.png",
    badge: "/favicon.png",
    url: "/admin",
    tag: "test-alert",
  });

  return await webpush.sendNotification(pushSubscription, payload);
}
