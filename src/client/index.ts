import { useState, useEffect } from 'react';
import type { PushConfig, NotificationData } from '../types';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
};

export const useNextPush = (config: PushConfig) => {
	const [isSupported, setIsSupported] = useState(false);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission>('default');

	useEffect(() => {
		const supported = 'serviceWorker' in navigator && 'PushManager' in window;
		setIsSupported(supported);

		if (supported) {
			setPermission(Notification.permission);
		}
	}, []);

	const registerServiceWorker = async () => {
		try {
			const registration = await navigator.serviceWorker.register('/sw.js');
			config.logger?.('Service Worker registered:', 'info');
			return registration;
		} catch (error) {
			config.logger?.('Service Worker registration failed:', 'error');
			throw error;
		}
	};

	const checkSubscription = async () => {
		if (!isSupported) return;

		try {
			const registration = await registerServiceWorker();
			await navigator.serviceWorker.ready;

			const subscription = await registration.pushManager.getSubscription();
			setIsSubscribed(!!subscription);
		} catch (error) {
			config.logger?.('Subscription check error:', 'error');
		}
	};

	const subscribe = async () => {
		if (!isSupported) {
			throw new Error('Push notifications not supported');
		}

		setIsLoading(true);

		try {
			if (Notification.permission === 'denied') {
				throw new Error('Notification permission denied');
			}

			if (Notification.permission === 'default') {
				const permission = await Notification.requestPermission();
				if (permission !== 'granted') {
					throw new Error('Notification permission not granted');
				}
				setPermission(permission);
			}

			const registration = await registerServiceWorker();
			await navigator.serviceWorker.ready;

			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey) as any
			});

			setIsSubscribed(true);
			return subscription;
		} catch (error) {
			config.logger?.('Subscribe error:', 'error');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const unsubscribe = async () => {
		if (!isSupported) return;

		setIsLoading(true);

		try {
			const registration = await registerServiceWorker();
			const subscription = await registration.pushManager.getSubscription();

			if (subscription) {
				await subscription.unsubscribe();
			}

			setIsSubscribed(false);
		} catch (error) {
			config.logger?.('Unsubscribe error:', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	// Test bildirimi gönder
	const sendTestNotification = (data: NotificationData) => {
		if (!isSubscribed) {
			throw new Error('Not subscribed to notifications');
		}

		const payload = JSON.stringify(data);
		config.logger?.('Test notification payload:', 'info');
		return payload;
	};

	useEffect(() => {
		if (isSupported) {
			checkSubscription();
		}
	}, [isSupported]);

	return {
		isSupported,
		isSubscribed,
		isLoading,
		permission,
		subscribe,
		unsubscribe,
		sendTestNotification,
		checkSubscription
	};
};

