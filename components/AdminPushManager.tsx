"use client";

import { useEffect, useState, useCallback } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function AdminPushManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  // Check support and active subscription on mount
  const checkStatus = useCallback(async () => {
    if (typeof window === "undefined") return;

    const secure =
      window.isSecureContext ??
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");
    setIsSecure(secure);

    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setIsSupported(false);
      setLoading(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);

    try {
      // Register or get registration
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);

      // Fetch device count & key
      const res = await fetch("/api/admin/push-subscription");
      if (res.ok) {
        const data = await res.json();
        setDeviceCount(data.deviceCount ?? null);
      }
    } catch (err) {
      console.warn("[AdminPushManager] Status check error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleEnable = async () => {
    setActionLoading(true);
    setMessage(null);

    if (!isSecure) {
      setMessage({
        type: "error",
        text: `Chrome requires HTTPS for notifications. When opening via local IP (${window.location.host}), Chrome blocks notifications automatically. Please deploy and open your live HTTPS site.`,
      });
      setActionLoading(false);
      return;
    }

    // If iPhone and not added to home screen yet
    if (isIOS && !isStandalone) {
      setShowIOSGuide(true);
      setActionLoading(false);
      return;
    }

    try {
      if (Notification.permission === "denied") {
        setMessage({
          type: "error",
          text: "Notification permission is blocked for this site in Chrome. Tap the lock/tune icon next to the URL in Chrome -> Permissions -> Notifications -> Allow.",
        });
        setActionLoading(false);
        return;
      }

      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setMessage({
          type: "error",
          text: "Notification permission was denied. Tap the lock/tune icon next to the URL in Chrome -> Permissions -> Notifications -> Allow.",
        });
        setActionLoading(false);
        return;
      }

      // Ensure service worker is ready
      const reg = await navigator.serviceWorker.ready;

      // Fetch VAPID public key
      const keyRes = await fetch("/api/admin/push-subscription");
      if (!keyRes.ok) throw new Error("Could not retrieve push keys from server.");
      const { vapidPublicKey } = await keyRes.json();

      if (!vapidPublicKey) {
        throw new Error("VAPID public key is not configured.");
      }

      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe with PushManager
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      // Save to Supabase via server route
      const saveRes = await fetch("/api/admin/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save push subscription to database.");
      }

      setIsSubscribed(true);
      setMessage({
        type: "success",
        text: "🔔 Order notifications enabled! Sending a quick test alert to your phone...",
      });

      // Fire a test alert immediately
      await fetch("/api/admin/push-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      checkStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to enable notifications.";
      setMessage({ type: "error", text: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable = async () => {
    setActionLoading(true);
    setMessage(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await fetch("/api/admin/push-subscription", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }

      setIsSubscribed(false);
      setMessage({
        type: "info",
        text: "Notifications disabled on this device.",
      });
      checkStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to disable notifications.";
      setMessage({ type: "error", text: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendTest = async () => {
    setTestSending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/push-test", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test alert.");

      setMessage({
        type: "success",
        text: "⚡ Test notification sent! Check your phone's notification banner.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send test notification.";
      setMessage({ type: "error", text: msg });
    } finally {
      setTestSending(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="mb-6 rounded-sm border border-base-border bg-base-surface/80 p-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Status Info */}
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isSubscribed
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                : "bg-amber-400"
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Phone Order Alerts (PWA)
              </span>
              {isSubscribed ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  ACTIVE ON THIS DEVICE
                </span>
              ) : (
                <span className="text-[10px] bg-base-bg text-text-secondary border border-base-border px-2 py-0.5 rounded-full uppercase tracking-widest">
                  INACTIVE
                </span>
              )}
            </div>

            <p className="text-[11px] text-text-secondary mt-1">
              {isSubscribed
                ? `You will get instant push alerts on this phone whenever a customer places an order.${
                    deviceCount && deviceCount > 1 ? ` (${deviceCount} devices connected)` : ""
                  }`
                : "Enable push notifications to get real-time order alerts directly on your phone like Shopify."}
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {isSubscribed ? (
            <>
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testSending}
                className="rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                {testSending ? "SENDING..." : "⚡ TEST NOTIFICATION"}
              </button>
              <button
                type="button"
                onClick={handleDisable}
                disabled={actionLoading}
                className="rounded-sm border border-base-border bg-base-bg px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors disabled:opacity-50"
              >
                DISABLE
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEnable}
              disabled={actionLoading}
              className="rounded-sm bg-accent hover:bg-accent-dim px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-primary transition-all shadow-md shadow-accent/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>🔔</span> {actionLoading ? "ENABLING..." : "ENABLE ON THIS PHONE"}
            </button>
          )}
        </div>
      </div>

      {/* Status feedback message */}
      {message && (
        <div
          className={`mt-3 text-xs p-2.5 rounded-sm flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : message.type === "error"
              ? "bg-accent/10 text-accent border border-accent/30"
              : "bg-base-bg text-text-secondary border border-base-border"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-text-secondary hover:text-text-primary ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* iOS Installation Instruction Modal / Callout */}
      {showIOSGuide && (
        <div className="mt-4 border-t border-base-border pt-3">
          <div className="bg-base-bg border border-base-border rounded-sm p-3 text-xs text-text-secondary">
            <p className="font-bold text-text-primary uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <span>📱</span> iPhone Setup Required (Apple Policy):
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Open this page in <strong>Safari</strong> on your iPhone.</li>
              <li>Tap the <strong>Share</strong> button (box with an arrow pointing up at the bottom).</li>
              <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
              <li>Open the newly created <strong>FlipMeet Studio</strong> app from your home screen.</li>
              <li>Click <strong>&quot;Enable On This Phone&quot;</strong> and tap <strong>Allow</strong>.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-2 text-[10px] text-accent underline uppercase tracking-widest font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {/* HTTPS Required Callout (e.g. if testing on local IP) */}
      {!isSecure && (
        <div className="mt-4 border-t border-base-border pt-3">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-3 text-xs text-amber-300">
            <p className="font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5 text-amber-400">
              <span>🔒</span> HTTPS Connection Required:
            </p>
            <p className="text-[11px] leading-relaxed text-amber-200/90">
              Android Chrome strictly prohibits push notifications on local HTTP addresses (like <code>{typeof window !== "undefined" ? window.location.origin : ""}</code>). When testing on an HTTP IP address, Chrome automatically suppresses notification permission prompts.
            </p>
            <p className="text-[11px] leading-relaxed text-amber-200/90 mt-1.5 font-medium">
              👉 Once pushed to your live website (<strong>https://flipmeetstudio.com/admin</strong>), open it on your phone and tap Enable. Chrome will prompt and work immediately!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
