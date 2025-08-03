"use client";
import React from 'react';
import { useNextPush } from 'next-push/client';
import { useEffect, useState } from 'react';
import { subscribe as subscribeAction, subscribers as subscribersAction, unsubscribe as unsubscribeAction } from './actions';

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

			alert('Successfully subscribed to notifications!');
		} catch (error: any) {
			console.error('Subscription failed:', error);

			if (error.message.includes('self-signed certificate') || error.message.includes('certificate')) {
				alert('Certificate error in development mode. Will work in production.');
			} else {
				alert('Subscription error: ' + error.message);
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


			alert('Successfully unsubscribed from notifications!');
		} catch (error: any) {
			console.error('Unsubscribe error:', error);

			if (error.message.includes('self-signed certificate') || error.message.includes('certificate')) {
				alert('Certificate error in development mode. Will work in production.');
			} else {
				alert('Unsubscribe error: ' + error.message);
			}
		}
	};

	const handleSendNotificationToSubscriber = async (subscriber: any) => {
		try {
			const response = await fetch('/api/send-notification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					subscription: subscriber,
					notification: {
						title: 'Custom Notification',
						body: 'This is a custom notification for this subscriber!',
						icon: '/icon-192x192.png',
						url: 'https://example.com'
					}
				})
			});

			if (response.ok) {
				alert('Notification sent successfully!');
			} else {
				alert('Failed to send notification: ' + response.statusText);
			}
		} catch (error: any) {
			console.error('Send notification error:', error);
			alert('Failed to send notification: ' + error.message);
		}
	};

	const handleDeleteSubscriber = async (endpoint: string) => {
		if (!confirm('Are you sure you want to delete this subscription?')) {
			return;
		}

		try {
			const subscrip = subscribers.find(sub => sub.endpoint === endpoint);
			await unsubscribeAction({
				endpoint: subscrip.endpoint,
				keys: {
					p256dh: subscrip.keys.p256dh,
					auth: subscrip.keys.auth
				},
				expirationTime: subscrip.expirationTime ?? 0
			});

			const updatedSubscribers = await subscribersAction();
			setSubscribers(updatedSubscribers);

			alert('Subscription deleted successfully!');
		} catch (error: any) {
			console.error('Delete subscriber error:', error);
			alert('Failed to delete subscription: ' + error.message);
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
		} catch (error: any) {
			console.error('Send notification error:', error);
			alert('Failed to send notification: ' + error.message);
		}
	}

	return (
		<div className="bg-gray-50 py-8 min-h-screen">
			<div className="mx-auto px-4 max-w-6xl">
				<div className="gap-8 grid grid-cols-1 lg:grid-cols-2">
					{/* Left Side - Demo */}
					<div className="bg-white shadow-sm border border-gray-100 rounded-lg">
						<div className="px-6 py-4 border-gray-100 border-b">
							<h2 className="font-medium text-gray-900 text-lg">Push Notification Demo</h2>
							<p className="mt-1 text-gray-500 text-sm">Test the notification system</p>
						</div>

						<div className="space-y-6 p-6">
							{/* Development Warning */}
							{process.env.NODE_ENV === 'development' && (
								<div className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg">
									<h3 className="mb-2 font-medium text-yellow-800">Development Mode</h3>
									<p className="text-yellow-600 text-sm">
										Self-signed certificate errors will be ignored. Will work properly in production.
									</p>
								</div>
							)}

							{/* Status Info */}
							<div className="gap-4 grid grid-cols-2">
								<div className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-center">
									<div className="mb-1 text-gray-500 text-sm">Supported</div>
									<div className="font-medium text-gray-900">{isSupported ? 'Yes' : 'No'}</div>
								</div>
								<div className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-center">
									<div className="mb-1 text-gray-500 text-sm">Permission</div>
									<div className="font-medium text-gray-900 capitalize">{permission}</div>
								</div>
							</div>

							{/* Subscription Button */}
							{isSupported && (
								<button
									onClick={subscribed ? handleUnsubscribe : handleSubscribe}
									disabled={loading}
									className={`w-full px-4 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${subscribed
										? 'bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300'
										: 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300'
										} disabled:text-gray-500`}
								>
									{loading ? 'Processing...' : (subscribed ? 'Unsubscribe' : 'Subscribe to Notifications')}
								</button>
							)}

							{!isSupported && (
								<div className="bg-orange-50 p-4 border border-orange-200 rounded-lg">
									<h3 className="mb-2 font-medium text-orange-800">Push Notifications Not Supported</h3>
									<p className="text-orange-600 text-sm">This browser doesn't support push notifications.</p>
								</div>
							)}
						</div>
					</div>

					{/* Right Side - Subscription List */}
					<div className="bg-white shadow-sm border border-gray-100 rounded-lg">
						<div className="px-6 py-4 border-gray-100 border-b">
							<h2 className="font-medium text-gray-900 text-lg">Subscription Management</h2>
							<p className="mt-1 text-gray-500 text-sm">
								{subscribers.length} active subscription{subscribers.length !== 1 ? 's' : ''}
							</p>
						</div>

						<div className="p-6">
							<button className="bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-lg w-full font-medium text-white transition-colors duration-200"
								onClick={() => handleSendNotificationToAll()}
							>
								Send Test Notification
							</button>
						</div>

						<div className="p-6">
							{subscribers.length === 0 ? (
								<div className="py-8 text-center">
									<div className="mb-4 text-gray-400 text-4xl">📱</div>
									<h3 className="mb-2 font-medium text-gray-600">No Subscriptions Yet</h3>
									<p className="text-gray-500 text-sm">
										Start by subscribing from the left panel
									</p>
								</div>
							) : (
								<div className="space-y-4 max-h-96 overflow-y-auto">
									{subscribers.map((subscriber, index) => (
										<div key={index} className="bg-gray-50 p-4 border border-gray-100 rounded-lg">
											<details>
												<summary className="text-gray-500 text-xs cursor-pointer">
													Subscription Details
												</summary>
												<pre className="bg-gray-50 mt-2 p-2 rounded text-gray-500 text-xs whitespace-pre-wrap">
													{JSON.stringify(subscriber, null, 4)}
												</pre>
											</details>
											<div className="flex justify-between items-start mb-3">
												<div className="flex-1 min-w-0">
													<div className="font-medium text-gray-900 text-sm truncate">
														Subscription #{index + 1} {subscription?.endpoint === subscriber.endpoint ? '(You)' : ''}
													</div>
													<div className="mt-1 text-gray-500 text-xs truncate">
														{subscriber.endpoint}
													</div>
													<div className="mt-1 text-gray-400 text-xs">
														{new Date(subscriber.created_at).toLocaleString('en-US')}
													</div>
												</div>
											</div>

											<div className="flex gap-2">
												<button
													onClick={() => handleSendNotificationToSubscriber(subscriber)}
													className="flex-1 bg-green-500 hover:bg-green-600 px-3 py-2 rounded font-medium text-white text-xs transition-colors duration-200"
												>
													📤 Send Notification
												</button>
												<button
													onClick={() => handleDeleteSubscriber(subscriber.endpoint)}
													className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded font-medium text-white text-xs transition-colors duration-200"
												>
													🗑️ Delete
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotificationDemo;