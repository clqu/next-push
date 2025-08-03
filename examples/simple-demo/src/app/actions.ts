"use server";

import postgres from 'postgres';

// Development ortamında SSL'i devre dışı bırak, production'da aktif et
const sslConfig = { ssl: 'verify-full' as const };

const sql = postgres(process.env.POSTGRES_URL!, sslConfig);

export const subscribe = async (subscription: {
	endpoint: string;
	keys: {
		p256dh: ArrayBuffer;
		auth: ArrayBuffer;
	};
	expirationTime: number;
}) => {
	try {
		const endpoint = subscription.endpoint;
		const { p256dh, auth } = subscription.keys;
		const expirationTime = subscription.expirationTime;

		if (!p256dh || !auth) {
			throw new Error("Invalid p256dh or auth");
		}


		const data = {
			endpoint,
			keys: {
				p256dh: Buffer.from(p256dh).toString('base64'),
				auth: Buffer.from(auth).toString('base64')
			},
			expirationTime
		}

		console.log(data);

		await sql`
			INSERT INTO subscriptions (value) VALUES (${JSON.stringify(data)})
		`;

		console.log('Subscription saved successfully');
	} catch (error) {
		console.error('Database error:', error);
		throw error;
	}
};

export const subscribers = async () => {
	try {
		const result = await sql`SELECT * FROM subscriptions`;
		return result.map((row: any) => JSON.parse(row.value));
	} catch (error) {
		console.error('Error fetching subscribers:', error);
		return [];
	}
};

export const unsubscribe = async (subscription: {
	endpoint: string;
	keys: {
		p256dh: ArrayBuffer | null;
		auth: ArrayBuffer | null;
	};
	expirationTime: number;
}) => {
	if (!subscription.keys.p256dh || !subscription.keys.auth) {
		throw new Error("Invalid p256dh or auth");
	}

	try {
		const data = JSON.stringify({
			endpoint: subscription.endpoint,
			keys: {
				p256dh: Buffer.from(subscription.keys.p256dh).toString('base64'),
				auth: Buffer.from(subscription.keys.auth).toString('base64')
			},
			expirationTime: subscription.expirationTime ?? 0
		});
		await sql`DELETE FROM subscriptions WHERE value = ${data}`;
		console.log('Subscription deleted successfully');
	} catch (error) {
		console.error('Error deleting subscription:', error);
		throw error;
	}
};
