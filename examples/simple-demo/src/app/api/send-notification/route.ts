import { createServerPush } from 'next-push/server';
import { NextRequest } from 'next/server';

const pushServer = createServerPush(
	'admin@example.com',
	{
		publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
		privateKey: process.env.VAPID_PRIVATE_KEY!
	}
);

export const POST = async (req: NextRequest) => {
	const { subscription, notification, multiple } = await req.json();

	if (multiple) {
		const result = await pushServer.sendNotificationToAll(multiple, notification);
		return Response.json({ message: 'Notification sent successfully' });
	}

	try {
		const result = await pushServer.sendNotification(subscription, notification);

		if (result.success) {
			return Response.json({ message: 'Notification sent successfully' });
		} else {
			return Response.json({ error: result.error }, { status: 500 });
		}
	} catch (error) {
		return Response.json({ error: 'Failed to send notification' }, { status: 500 });
	}
};