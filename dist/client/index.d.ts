import type { PushConfig, PushError, PushProgress } from '../types';
export declare const useNextPush: (config?: PushConfig) => {
    isSupported: boolean;
    subscribed: boolean;
    loading: boolean;
    permission: NotificationPermission;
    error: PushError | null;
    progress: PushProgress;
    subscribe: () => Promise<PushSubscription>;
    unsubscribe: () => Promise<PushSubscription | null | undefined>;
    toggle: () => Promise<PushSubscription | null | undefined>;
    reset: () => Promise<void>;
    check: () => Promise<void>;
    getSubscription: () => Promise<PushSubscription | null | undefined>;
    subscription: PushSubscription | null;
};
export { NextPushProvider, useNextPushContext } from './provider';
