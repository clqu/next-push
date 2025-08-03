"use client";
import React from 'react';
import { useNextPush } from 'next-push/client';
import { useEffect, useState } from 'react';
import { subscribe as subscribeAction, subscribers as subscribersAction, unsubscribe as unsubscribeAction } from './actions';
import { toast } from 'sonner';
import { Button } from '@/components/Button';

const NotificationDemo = () => {
	const [subscribers, setSubscribers] = useState<any[]>([]);

	useEffect(() => {
		const fetchSubscribers = async () => {
			try {
				const subscribers = await subscribersAction();
				setSubscribers(subscribers);
			} catch (error) {
				console.error('Failed to fetch subscribers:', error);
			}
		};
		fetchSubscribers();
	}, []);

	const {
		isSupported,
		subscribed,
		loading,
		permission,
		subscribe,
		unsubscribe,
		subscription
	} = useNextPush();

	const handleSubscribe = async () => {
		try {
			if (process.env.NODE_ENV === 'development') {
				console.log('Development mode: Ignoring certificate errors');
			}

			const subscription = await subscribe();

			const endpoint = subscription.endpoint;
			const p256dh = subscription.getKey('p256dh');
			const auth = subscription.getKey('auth');
			const expirationTime = subscription.expirationTime;

			if (!p256dh || !auth) {
				throw new Error('Subscription keys unavailable');
			}

			try {
				await subscribeAction({
					endpoint,
					keys: {
						p256dh: p256dh,
						auth: auth
					},
					expirationTime: expirationTime ?? 0
				});

				const updatedSubscribers = await subscribersAction();
				setSubscribers(updatedSubscribers);
			} catch (dbError) {
				console.warn('Database save failed, but subscription is active:', dbError);
			}

			toast.success('Successfully subscribed to notifications!');
		} catch (error: any) {
			console.error('Subscription failed:', error);

			if (error.message.includes('self-signed certificate') || error.message.includes('certificate')) {
				toast.error('Certificate error in development mode. Will work in production.');
			} else {
				toast.error('Subscription error: ' + error.message);
			}
		}
	};

	const handleUnsubscribe = async () => {
		try {
			const value = await unsubscribe();

			if (value) {
				const endpoint = value.endpoint;
				const p256dh = value.getKey('p256dh');
				const auth = value.getKey('auth');
				const expirationTime = value.expirationTime;

				await unsubscribeAction({
					endpoint,
					keys: {
						p256dh,
						auth
					},
					expirationTime: expirationTime ?? 0
				});
			}

			const updatedSubscribers = await subscribersAction();
			setSubscribers(updatedSubscribers);

			toast.success('Successfully unsubscribed from notifications!');
		} catch (error: any) {
			console.error('Unsubscribe error:', error);

			if (error.message.includes('self-signed certificate') || error.message.includes('certificate')) {
				toast.error('Certificate error in development mode. Will work in production.');
			} else {
				toast.error('Unsubscribe error: ' + error.message);
			}
		}
	};

	const handleSendNotificationToAll = async () => {
		try {
			await fetch('/api/send-notification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					multiple: subscribers,
					notification: {
						title: 'Test Notification',
						body: 'This is a test notification!',
						icon: '/icon-192x192.png',
						url: 'https://example.com'
					}
				})
			});
			toast.success('Test notification sent to all subscribers!');
		} catch (error: any) {
			console.error('Send notification error:', error);
			toast.error('Failed to send notification: ' + error.message);
		}
	};

	const renderCodeBlock = (code: string, language: string = 'typescript') => (
		<pre className="bg-gradient-to-br from-white to-gray-50 p-6 border border-gray-200/50 rounded-xl text-black transition-all duration-300">
			<code>{code}</code>
		</pre>
	);

	return (
		<div className="bg-white min-h-screen">
			{/* Header */}
			<div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 border-gray-100 border-b">
				<div className="mx-auto px-6 py-24 max-w-4xl">
					<div className="text-center">
						<div className="relative mx-auto w-fit">
							<div className="top-0 -right-5 absolute flex justify-center items-center bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-6 h-6 font-extrabold text-white text-xs">9+</div>
							<h1 className="mb-4 font-bold text-gray-900 text-5xl">next-push</h1>
						</div>
						<p className="mx-auto mb-8 max-w-2xl text-gray-600 text-xl">
							A modern, lightweight push notification library for Next.js applications.
						</p>
						<div className="flex justify-center gap-4">
							<Button href="https://github.com/clqu/next-push" target="_blank" variant="secondary">GitHub</Button>
							<Button href="https://npmjs.com/package/next-push" target="_blank" variant="primary">
								npm install next-push
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="gap-16 grid grid-cols-2 mx-auto px-6 py-16">
				<section className="top-20 sticky bg-gradient-to-br from-white via-gray-50 to-blue-50 p-8 border border-blue-100/50 rounded-2xl h-min">
					<div className="flex items-center gap-3 mb-6">
						<div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-3 h-3 animate-pulse"></div>
						<h2 className="font-bold text-gray-900 text-3xl">Live Demo</h2>
					</div>

					{/* Status Info */}
					<div className="gap-4 grid grid-cols-2 mb-8">
						<div className="bg-white/80 backdrop-blur-sm p-6 border border-gray-200/50 rounded-xl transition-all duration-300">
							<div className="flex items-center gap-2 mb-2">
								<div className={`w-2 h-2 rounded-full ${isSupported ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-pink-500'}`}></div>
								<div className="font-medium text-gray-500 text-sm">Supported</div>
							</div>
							<div className="font-bold text-gray-900 text-2xl">{isSupported ? 'Yes' : 'No'}</div>
						</div>
						<div className="bg-white/80 backdrop-blur-sm p-6 border border-gray-200/50 rounded-xl transition-all duration-300">
							<div className="flex items-center gap-2 mb-2">
								<div className={`w-2 h-2 rounded-full ${permission === 'granted' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
									permission === 'denied' ? 'bg-gradient-to-r from-red-400 to-pink-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
									}`}></div>
								<div className="font-medium text-gray-500 text-sm">Permission</div>
							</div>
							<div className="font-bold text-gray-900 text-2xl capitalize">{permission}</div>
						</div>
					</div>

					{/* Subscription Button */}
					<div className="flex items-center gap-6 mb-6">
						{isSupported && (
							<Button onClick={subscribed ? handleUnsubscribe : handleSubscribe} variant={!subscribed ? 'subscribe' : 'secondary'} className="flex-1 px-6 w-full h-14 text-[16px] whitespace-nowrap">
								{loading ? (
									<div className="flex justify-center items-center gap-2">
										<div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
										Processing...
									</div>
								) : (
									<div className="flex justify-center items-center gap-2">
										{subscribed ? (
											<>
												<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
												Unsubscribe
											</>
										) : (
											<>
												<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM10 5h10V1H10v4zM4 13h6V9H4v4zM10 13h10V9H10v4z" />
												</svg>
												Subscribe to Notifications
											</>
										)}
									</div>
								)}
							</Button>
						)}

						{/* Test Notification */}
						{subscribers.length > 0 && (
							<Button onClick={handleSendNotificationToAll} variant="blue" className="w-full h-14 text-[16px]">
								<div className="flex justify-center items-center gap-2">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM10 5h10V1H10v4zM4 13h6V9H4v4zM10 13h10V9H10v4z" />
									</svg>
									Send Test Notification
								</div>
							</Button>
						)}
					</div>

					{!isSupported && (
						<div className="bg-gradient-to-r from-orange-50 to-red-50 mb-6 p-6 border border-orange-200/50 rounded-xl transition-all duration-300">
							<div className="flex items-center gap-3 mb-3">
								<svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
								<h4 className="font-semibold text-orange-800">Push Notifications Not Supported</h4>
							</div>
							<p className="text-orange-600">This browser doesn't support push notifications.</p>
						</div>
					)}

					{/* Subscribers List */}
					<div className="bg-white/80 backdrop-blur-sm p-6 border border-gray-200/50 rounded-xl transition-all duration-300">
						<div className="flex justify-between items-center mb-4">
							<h3 className="font-semibold text-gray-900 text-xl">Active Subscriptions</h3>
							<div className="bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full font-medium text-blue-800 text-sm">
								{subscribers.length} {subscribers.length === 1 ? 'subscription' : 'subscriptions'}
							</div>
						</div>

						{subscribers.length === 0 ? (
							<div className="py-12 text-center">
								<div className="mb-4 text-6xl">📱</div>
								<h4 className="mb-2 font-semibold text-gray-600">No Subscriptions Yet</h4>
								<p className="text-gray-500">Start by subscribing above</p>
							</div>
						) : (
							<div className="space-y-3 max-h-64 overflow-y-auto">
								{subscribers.map((subscriber, index) => (
									<div key={index} className="bg-white/60 backdrop-blur-sm p-4 border border-gray-200/50 rounded-xl transition-all duration-200">
										<div className="flex justify-between items-center">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-2 h-2"></div>
													<div className="font-semibold text-gray-900 text-sm truncate">
														Subscription #{index + 1} {subscription?.endpoint === subscriber.endpoint ? (
															<span className="bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-0.5 rounded-full text-blue-800 text-xs">You</span>
														) : ''}
													</div>
												</div>
												<div className="mt-1 text-gray-500 text-xs truncate">
													{subscription?.endpoint}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-2 h-2 animate-pulse"></div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</section>
				<div className="space-y-16">
					{/* Quick Start */}
					<section>
						<h2 className="mb-6 font-bold text-gray-900 text-3xl">Quick Start</h2>
						<p className="mb-6 text-gray-600 text-lg">Get started with Next-Push in just a few steps.</p>

						<div className="space-y-6">
							<div>
								<h3 className="mb-3 font-semibold text-gray-900 text-lg">1. Install the package</h3>
								{renderCodeBlock(`npm install next-push`)}
							</div>

							<div>
								<h3 className="mb-3 font-semibold text-gray-900 text-lg">2. Set environment variables</h3>
								{renderCodeBlock(`# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key`)}
							</div>

							<div>
								<h3 className="mb-3 font-semibold text-gray-900 text-lg">3. Wrap your app with NextPushProvider</h3>
								{renderCodeBlock(`import { NextPushProvider } from 'next-push/client';

function App() {
  return (
    <NextPushProvider>
      <YourApp />
    </NextPushProvider>
  );
}`)}
							</div>

							<div>
								<h3 className="mb-3 font-semibold text-gray-900 text-lg">4. Use in your component</h3>
								{renderCodeBlock(`import { useNextPush } from 'next-push/client';

function MyComponent() {
  const { subscribe, subscribed } = useNextPush();
  
  return (
    <button onClick={subscribe}>
      {subscribed ? 'Unsubscribe' : 'Subscribe'}
    </button>
  );
}`)}
							</div>
						</div>
					</section>

					{/* Features */}
					<section>
						<h2 className="mb-6 font-bold text-gray-900 text-3xl">Features</h2>
						<div className="gap-6 grid grid-cols-1 md:grid-cols-2">
							{[
								{ icon: '🔔', title: 'Easy Integration', desc: 'Simple React hook for client-side push notifications' },
								{ icon: '🛡️', title: 'Type Safety', desc: 'Full TypeScript support with proper type definitions' },
								{ icon: '⚡', title: 'Lightweight', desc: 'Minimal bundle size with no heavy dependencies' },
								{ icon: '🔒', title: 'Secure', desc: 'Built-in VAPID key support for secure push notifications' },
								{ icon: '📱', title: 'Cross-Platform', desc: 'Works across all modern browsers and devices' },
								{ icon: '🎯', title: 'Flexible', desc: 'Customizable notification content and behavior' },
								{ icon: '🔄', title: 'Auto-Management', desc: 'Automatic service worker registration and subscription handling' },
								{ icon: '🏗️', title: 'Modular', desc: 'Separate client and server modules for better tree-shaking' }
							].map((feature, index) => (
								<div key={index} className="bg-gradient-to-br from-white to-gray-50 p-6 border border-gray-200/50 rounded-xl transition-all duration-300">
									<div className="mb-3 text-2xl">{feature.icon}</div>
									<h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
									<p className="text-gray-600 text-sm">{feature.desc}</p>
								</div>
							))}
						</div>
					</section>

					{/* API Reference */}
					<section>
						<h2 className="mb-6 font-bold text-gray-900 text-3xl">API Reference</h2>

						<div className="space-y-8">
							<div>
								<h3 className="mb-4 font-semibold text-gray-900 text-xl">useNextPush Hook</h3>
								<p className="mb-4 text-gray-600">A React hook that provides push notification functionality.</p>
								{renderCodeBlock(`const {
  isSupported,    // boolean - Whether push notifications are supported
  subscribed,     // boolean - Current subscription status
  loading,        // boolean - Loading state for async operations
  permission,     // NotificationPermission - Current notification permission
  error,          // PushError | null - Current error state
  subscription,   // PushSubscription | null - Current push subscription object
  subscribe,      // function - Subscribe to push notifications
  unsubscribe,    // function - Unsubscribe from push notifications
  toggle,         // function - Toggle subscription state
  reset           // function - Reset error state and progress
} = useNextPush();`)}
							</div>

							<div>
								<h3 className="mb-4 font-semibold text-gray-900 text-xl">Configuration Options</h3>
								{renderCodeBlock(`interface PushConfig {
  vapidPublicKey?: string;        // Optional - automatically loaded from env
  defaultIcon?: string;           // Default icon URL for notifications
  onNotificationClick?: (url?: string) => void;
  logger?: (message: string, type: 'info' | 'error') => void;
  retryAttempts?: number;         // Number of retry attempts (default: 3)
  retryDelay?: number;            // Delay between retries in ms (default: 1000)
  autoSubscribe?: boolean;        // Auto subscribe when permission granted
}`)}
							</div>
						</div>
					</section>

					{/* Examples */}
					<section>
						<h2 className="mb-6 font-bold text-gray-900 text-3xl">Examples</h2>

						<div className="space-y-8">
							<div>
								<h3 className="mb-4 font-semibold text-gray-900 text-xl">Basic Usage</h3>
								{renderCodeBlock(`import { useNextPush } from 'next-push/client';

export default function Home() {
  const { isSupported, subscribed, subscribe, unsubscribe } = useNextPush();

  return (
    <div>
      {isSupported && (
        <button onClick={subscribed ? unsubscribe : subscribe}>
          {subscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>
      )}
    </div>
  );
}`)}
							</div>

							<div>
								<h3 className="mb-4 font-semibold text-gray-900 text-xl">Error Handling</h3>
								{renderCodeBlock(`const { subscribe, error } = useNextPush();

if (error) {
  switch (error.type) {
    case 'PERMISSION_DENIED':
      return <div>Please enable notifications in browser settings</div>;
    case 'VAPID_MISSING':
      return <div>VAPID key not configured</div>;
    case 'NOT_SUPPORTED':
      return <div>Push notifications not supported in this browser</div>;
    default:
      return <div>Error: {error.message}</div>;
  }
}`)}
							</div>

							<div>
								<h3 className="mb-4 font-semibold text-gray-900 text-xl">Server-Side Setup</h3>
								{renderCodeBlock(`import { createServerPush } from 'next-push/server';

const pushServer = createServerPush('admin@example.com', {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!
});

// Send notification to a single subscription
const result = await pushServer.sendNotification(subscription, {
  title: 'Hello!',
  message: 'This is a test notification',
  url: 'https://example.com',
  icon: '/icon.png'
});`)}
							</div>
						</div>
					</section>

					{/* Setup Requirements */}
					<section>
						<h2 className="mb-6 font-bold text-gray-900 text-3xl">Setup Requirements</h2>

						<div className="space-y-6">
							<div>
								<h3 className="mb-3 font-semibold text-gray-900 text-lg">1. Generate VAPID Keys</h3>
								{renderCodeBlock(`npx web-push generate-vapid-keys`)}
							</div>

							<div>
								<h3 className="mb-3 font-semibold text-gray-900 text-lg">2. Create Service Worker</h3>
								<p className="mb-3 text-gray-600">Create <code className="bg-gray-100 px-1 rounded">public/sw.js</code> with the provided template.</p>
								{renderCodeBlock(`self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.message,
    icon: data.icon || '/icon.png',
    data: { url: data.url, ...data }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});`)}
							</div>

							<div>
								<h3 className="mb-3 font-semibold text-gray-900 text-lg">3. Environment Variables</h3>
								{renderCodeBlock(`# Client-side (public)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key

# Server-side (private)
VAPID_PRIVATE_KEY=your-private-key`)}
							</div>
						</div>
					</section>
				</div>
			</div>

			{/* Footer */}
			<div className="bg-gradient-to-br from-gray-50 to-blue-50 mt-16 border-gray-100 border-t">
				<div className="mx-auto px-6 py-12 max-w-4xl">
					<div className="flex items-center gap-4">
						<img src="https://avatars.githubusercontent.com/u/76551996?v=4" alt="Next-Push Logo" className="rounded-full w-10 h-10" />
						<p className="text-gray-500">by <a href="https://github.com/clqu" target="_blank" className="font-bold text-blue-500 hover:text-blue-600 transition-all">clqu</a></p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotificationDemo;