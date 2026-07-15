export function showLocalNotification(title: string, body: string, url?: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') return;

  navigator.serviceWorker?.ready.then((reg) => {
    reg.showNotification(title, {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: url || '/' },
      tag: `local-${Date.now()}`,
    });
  });
}
