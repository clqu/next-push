import webpush, { PushSubscription } from 'web-push';
import type { NotificationData } from '../types';
export declare const createServerPush: (mail: string | undefined, vapidKeys: {
    publicKey: string;
    privateKey: string;
}) => {
    sendNotification: (subscription: PushSubscription, data: NotificationData) => Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    sendNotificationToAll: (subscriptions: PushSubscription[], data: NotificationData) => Promise<{
        successful: number;
        failed: number;
        results: PromiseSettledResult<webpush.SendResult>[];
    }>;
};
