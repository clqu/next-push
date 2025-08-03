import webpush, { PushSubscription } from 'web-push';
import type { NotificationData } from '../types';

export const createServerPush = (mail: string = 'admin@example.com', vapidKeys: { publicKey: string; privateKey: string }) => {
	if (typeof window !== 'undefined') {
		throw new Error("createServerPush sadece server-side'da kullanılabilir");
	}

	webpush.setVapidDetails(
		`mailto:${mail}`,
		vapidKeys.publicKey,
		vapidKeys.privateKey
	);

	return {
		sendNotification: async (subscription: PushSubscription, data: NotificationData) => {
			try {
				const payload = JSON.stringify(data);
				await webpush.sendNotification(subscription, payload);
				return { success: true };
			} catch (error: any) {
				return { success: false, error: error.message };
			}
		},

		sendNotificationToAll: async (subscriptions: PushSubscription[], data: NotificationData) => {
			const results = await Promise.allSettled(
				subscriptions.map(subscription =>
					webpush.sendNotification(subscription, JSON.stringify(data))
				)
			);

			const successful = results.filter(r => r.status === 'fulfilled').length;
			const failed = results.filter(r => r.status === 'rejected').length;

			return { successful, failed, results };
		}
	};
}; 