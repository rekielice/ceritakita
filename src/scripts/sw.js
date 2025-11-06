import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);

registerRoute(
  ({ url }) => url.origin === 'https://server.arcgisonline.com' || url.origin.endsWith('tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'map-tiles-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      // Simpan tile selama 1 bulan
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, 
        maxEntries: 200, // Batasi jumlah tile
      }),
    ],
  })
);

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let pushData;
  try {
    pushData = event.data ? event.data.json() : {
      title: 'Notifikasi Baru',
      body: 'Ada sesuatu yang baru di CeritaKita!',
      url: '/#/',
    };
  } catch (e) {
    console.error('Failed to parse push data:', e);
    pushData = {
      title: 'Notifikasi Baru',
      body: 'Ada sesuatu yang baru di CeritaKita!',
      url: '/#/',
    };
  }

  const options = {
    body: pushData.body || 'Klik untuk melihat.',
    icon: 'icons/icon-192x192.png', 
    badge: 'icons/icon-192x192.png',
    data:{ 
      url : pushData.url || '/#/'
    },
    actions: [
      { action: 'view-story', title: 'Lihat Cerita' } 
    ]
  };

  // Tampilkan notifikasi
  event.waitUntil(
    self.registration.showNotification(pushData.title || 'CeritaKita', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  // Selalu tutup notifikasi setelah di-klik
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  if (event.action === 'view-story' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus(); 
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  } 
});