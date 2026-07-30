self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('Push Received...');
    
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/img/logo.jpg',
        badge: '/img/logo.jpg',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        data: {
            url: data.url || '/'
        }
    });
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    if (e.notification.data && e.notification.data.url) {
        e.waitUntil(
            clients.openWindow(e.notification.data.url)
        );
    } else {
        e.waitUntil(
            clients.openWindow('/')
        );
    }
});
