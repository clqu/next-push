self.addEventListener('install', (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
	if (!event.data) {
		console.log('No data received');
		return;
	}

	try {
		const data = event.data.json();

		const options = {
			body: data.message,
			icon: data.icon || '/icon.png',
			badge: '/badge.png',
			data: {
				url: data.url,
				...data
			},
			requireInteraction: false,
			silent: false,
			tag: data.tag || 'next-push-notification'
		};

		event.waitUntil(
			self.registration.showNotification(data.title, options)
		);
	} catch (error) {
		console.error('Error processing push notification:', error);
	}
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.notification.data?.url) {
		event.waitUntil(
			self.clients.openWindow(event.notification.data.url)
		);
	}
});

self.addEventListener('notificationclose', (event) => {
});

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});