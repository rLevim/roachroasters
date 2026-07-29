// Self-hosted Web Push service worker (replaces OneSignal).
// Receives push events from the browser push service and shows notifications.

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'RoachRoasters', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'RoachRoasters';
  const options = {
    body: data.body || '',
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    data: { url: data.url || '/' },
    tag: data.tag || undefined,
    renotify: Boolean(data.tag),
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(url).catch(() => {});
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
