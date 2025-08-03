export interface PushConfig {
    vapidPublicKey?: string;
    defaultIcon?: string;
    onNotificationClick?: (url?: string) => void;
    logger?: (message: string, type: 'info' | 'error') => void;
    retryAttempts?: number;
    retryDelay?: number;
    autoSubscribe?: boolean;
    serviceWorkerUrl?: string;
}
export type PushErrorType = 'VAPID_MISSING' | 'PERMISSION_DENIED' | 'PERMISSION_NOT_GRANTED' | 'NOT_SUPPORTED' | 'SERVICE_WORKER_FAILED' | 'SUBSCRIPTION_FAILED' | 'UNSUBSCRIPTION_FAILED' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
export type PushProgress = 'idle' | 'checking' | 'requesting' | 'subscribing' | 'unsubscribing' | 'ready' | 'error';
export interface PushError extends Error {
    type: PushErrorType;
    code?: string;
    details?: any;
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
