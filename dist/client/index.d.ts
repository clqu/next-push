import type { PushConfig, NotificationData } from '../types';
export declare const useNextPush: (config: PushConfig) => {
    isSupported: boolean;
    isSubscribed: boolean;
    isLoading: boolean;
    permission: NotificationPermission;
    subscribe: () => Promise<PushSubscription>;
    unsubscribe: () => Promise<void>;
    sendTestNotification: (data: NotificationData) => string;
    checkSubscription: () => Promise<void>;
};
