import { useState, useEffect } from 'react';
import type { PushConfig, PushError, PushErrorType, PushProgress } from '../types';

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

export const useNextPush = (config?: PushConfig) => {
	const [isSupported, setIsSupported] = useState(false);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission>('default');
	const [registered, setRegistered] = useState(false);
	const [error, setError] = useState<PushError | null>(null);
	const [progress, setProgress] = useState<PushProgress>('idle');
	const [subscription, setSubscription] = useState<PushSubscription | null>(null);

	// Otomatik VAPID key yönetimi
	const getVapidPublicKey = (): string => {
		// 1. Önce config'den al
		if (config?.vapidPublicKey) {
			return config.vapidPublicKey;
		}

		// 2. Environment variable'dan al
		if (typeof window !== 'undefined' && (window as any).__NEXT_PUSH_VAPID_PUBLIC_KEY__) {
			return (window as any).__NEXT_PUSH_VAPID_PUBLIC_KEY__;
		}

		// 3. Standart environment variable'dan al
		if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
			return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
		}

		// 4. Global variable'dan al
		if (typeof window !== 'undefined' && (window as any).NEXT_PUSH_VAPID_PUBLIC_KEY) {
			return (window as any).NEXT_PUSH_VAPID_PUBLIC_KEY;
		}

		throw createPushError(
			'VAPID public key is required. Please provide it in config, environment variable NEXT_PUBLIC_VAPID_PUBLIC_KEY, or set window.NEXT_PUSH_VAPID_PUBLIC_KEY',
			'VAPID_MISSING'
		);
	};

	// Error handling utility
	const createPushError = (message: string, type: PushErrorType, originalError?: Error): PushError => {
		const pushError = new Error(message) as PushError;
		pushError.type = type;
		pushError.name = 'PushError';
		if (originalError) {
			pushError.details = originalError;
		}
		return pushError;
	};

	const handleError = (error: Error, context: string, type: PushErrorType = 'UNKNOWN_ERROR') => {
		const pushError = createPushError(error.message, type, error);
		setError(pushError);
		config?.logger?.(`${context}: ${error.message}`, 'error');
		console.error(`${context}:`, error);
	};

	// Retry utility
	const retry = async <T>(
		fn: () => Promise<T>,
		attempts: number = config?.retryAttempts || 3,
		delay: number = config?.retryDelay || 1000
	): Promise<T> => {
		try {
			return await fn();
		} catch (error) {
			if (attempts <= 1) {
				throw error;
			}

			config?.logger?.(`Retrying... (${attempts - 1} attempts left)`, 'info');

			await new Promise(resolve => setTimeout(resolve, delay));
			return retry(fn, attempts - 1, delay);
		}
	};

	useEffect(() => {
		const supported = 'serviceWorker' in navigator && 'PushManager' in window;
		setIsSupported(supported);

		if (supported) {
			setPermission(Notification.permission);
		}
	}, []);

	// Permission change listener
	useEffect(() => {
		if (!isSupported) return;

		const handlePermissionChange = () => {
			const newPermission = Notification.permission;
			setPermission(newPermission);

			// Auto-subscribe when permission is granted
			if (config?.autoSubscribe && newPermission === 'granted' && !isSubscribed && !isLoading) {
				config?.logger?.('Permission granted, auto-subscribing...', 'info');
				subscribe().catch(error => {
					config?.logger?.(`Auto-subscribe failed: ${error.message}`, 'error');
				});
			}
		};

		// Listen for permission changes
		if ('permissions' in navigator) {
			navigator.permissions.query({ name: 'notifications' }).then(permissionStatus => {
				permissionStatus.addEventListener('change', handlePermissionChange);
				return () => permissionStatus.removeEventListener('change', handlePermissionChange);
			});
		}
	}, [isSupported, config?.autoSubscribe, isSubscribed, isLoading]);

	const registerServiceWorker = async () => {
		try {
			const registration = await navigator.serviceWorker.register(config?.serviceWorkerUrl || '/sw.js');

			config?.logger?.('Service Worker registered:', 'info');
			return registration;
		} catch (error) {
			handleError(error as Error, 'Service Worker registration failed', 'SERVICE_WORKER_FAILED');
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
			config?.logger?.('Subscription check error:', 'error');
		}
	};

	const subscribe = async () => {
		if (!isSupported) {
			throw createPushError('Push notifications not supported', 'NOT_SUPPORTED');
		}

		setIsLoading(true);
		setProgress('checking');

		try {
			if (Notification.permission === 'denied') {
				throw createPushError('Notification permission denied', 'PERMISSION_DENIED');
			}

			if (Notification.permission === 'default') {
				setProgress('requesting');
				const permission = await Notification.requestPermission();
				if (permission !== 'granted') {
					throw createPushError('Notification permission not granted', 'PERMISSION_NOT_GRANTED');
				}
				setPermission(permission);
			}

			setProgress('subscribing');

			const registration = await retry(() => registerServiceWorker());
			await navigator.serviceWorker.ready;

			const subscription = await retry(() =>
				registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey()) as any
				})
			);

			setIsSubscribed(true);
			setProgress('ready');
			setSubscription(subscription);
			return subscription;
		} catch (error) {
			setProgress('error');
			handleError(error as Error, 'Subscribe error', 'SUBSCRIPTION_FAILED');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const unsubscribe = async () => {
		if (!isSupported) return;

		setIsLoading(true);
		setProgress('unsubscribing');

		try {
			const registration = await registerServiceWorker();
			const subscription = await registration.pushManager.getSubscription();

			if (subscription) {
				await subscription.unsubscribe();
			}

			setIsSubscribed(false);
			setProgress('ready');
			setSubscription(subscription);
			return subscription;
		} catch (error) {
			setProgress('error');
			handleError(error as Error, 'Unsubscribe error', 'UNSUBSCRIPTION_FAILED');
		} finally {
			setIsLoading(false);
		}
	};

	const getSubscription = async () => {
		if (!isSupported) return;

		const registration = await registerServiceWorker();
		const subscription = await registration.pushManager.getSubscription();
		setSubscription(subscription);
		return subscription;
	};

	useEffect(() => {
		getSubscription();
	}, [isSupported]);

	useEffect(() => {
		if (isSupported) {
			checkSubscription();
		}
	}, [isSupported]);

	// Auto-subscribe effect
	useEffect(() => {
		if (isSupported && config?.autoSubscribe && permission === 'granted' && !isSubscribed && !isLoading) {
			config?.logger?.('Auto-subscribing...', 'info');
			subscribe().catch(error => {
				config?.logger?.(`Auto-subscribe failed: ${error.message}`, 'error');
			});
		}
	}, [isSupported, config?.autoSubscribe, permission, isSubscribed, isLoading]);

	// Batch operations
	const toggle = async () => {
		if (isSubscribed) {
			return await unsubscribe();
		} else {
			return await subscribe();
		}
	};

	const reset = async () => {
		if (isSubscribed) {
			await unsubscribe();
		}
		setError(null);
		setProgress('idle');
	};

	return {
		isSupported,
		subscribed: isSubscribed, // Daha kısa
		loading: isLoading, // Daha kısa
		permission,
		error,
		progress,
		subscribe,
		unsubscribe,
		toggle,
		reset,
		check: checkSubscription, // Daha kısa
		getSubscription,
		subscription
	};
};

// Re-export provider
export { NextPushProvider, useNextPushContext } from './provider';

