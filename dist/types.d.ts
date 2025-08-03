export interface PushConfig {
    vapidPublicKey: string;
    defaultIcon?: string;
    onNotificationClick?: (url?: string) => void;
    logger?: (message: string, type: 'info' | 'error') => void;
}
export interface ServerNotificationData {
    title: string;
    message: string;
    url?: string;
    icon?: string;
}
export interface NotificationData {
    title: string;
    message: string;
    url?: string;
    icon?: string;
}
