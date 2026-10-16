// FlipMeet Studio - Service Worker for Web Push Notifications

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  if (!event.data) {
    return;
  }

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'FlipMeet Studio',
      body: event.data.text(),
    };
  }

  const title = payload.title || '🛍️ New Order Received!';
  const options = {
    body: payload.body || 'A new order has been placed on FlipMeet Studio.',
    icon: payload.icon || '/favicon.png',
    badge: payload.badge || '/favicon.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: payload.url || '/admin/orders',
      orderId: payload.orderId,
    },
    tag: payload.tag || ('order-' + Date.now()),
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin/orders';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          if (client.url.includes('/admin')) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
