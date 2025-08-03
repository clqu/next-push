"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNextPushContext = exports.NextPushProvider = exports.useNextPush = void 0;
const react_1 = require("react");
const urlBase64ToUint8Array = (base64String) => {
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
const useNextPush = (config) => {
    const [isSupported, setIsSupported] = (0, react_1.useState)(false);
    const [isSubscribed, setIsSubscribed] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [permission, setPermission] = (0, react_1.useState)('default');
    const [registered, setRegistered] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [progress, setProgress] = (0, react_1.useState)('idle');
    const [subscription, setSubscription] = (0, react_1.useState)(null);
    // Otomatik VAPID key yönetimi
    const getVapidPublicKey = () => {
        // 1. Önce config'den al
        if (config === null || config === void 0 ? void 0 : config.vapidPublicKey) {
            return config.vapidPublicKey;
        }
        // 2. Environment variable'dan al
        if (typeof window !== 'undefined' && window.__NEXT_PUSH_VAPID_PUBLIC_KEY__) {
            return window.__NEXT_PUSH_VAPID_PUBLIC_KEY__;
        }
        // 3. Standart environment variable'dan al
        if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
            return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        }
        // 4. Global variable'dan al
        if (typeof window !== 'undefined' && window.NEXT_PUSH_VAPID_PUBLIC_KEY) {
            return window.NEXT_PUSH_VAPID_PUBLIC_KEY;
        }
        throw createPushError('VAPID public key is required. Please provide it in config, environment variable NEXT_PUBLIC_VAPID_PUBLIC_KEY, or set window.NEXT_PUSH_VAPID_PUBLIC_KEY', 'VAPID_MISSING');
    };
    // Error handling utility
    const createPushError = (message, type, originalError) => {
        const pushError = new Error(message);
        pushError.type = type;
        pushError.name = 'PushError';
        if (originalError) {
            pushError.details = originalError;
        }
        return pushError;
    };
    const handleError = (error, context, type = 'UNKNOWN_ERROR') => {
        var _a;
        const pushError = createPushError(error.message, type, error);
        setError(pushError);
        (_a = config === null || config === void 0 ? void 0 : config.logger) === null || _a === void 0 ? void 0 : _a.call(config, `${context}: ${error.message}`, 'error');
        console.error(`${context}:`, error);
    };
    // Retry utility
    const retry = async (fn, attempts = (config === null || config === void 0 ? void 0 : config.retryAttempts) || 3, delay = (config === null || config === void 0 ? void 0 : config.retryDelay) || 1000) => {
        var _a;
        try {
            return await fn();
        }
        catch (error) {
            if (attempts <= 1) {
                throw error;
            }
            (_a = config === null || config === void 0 ? void 0 : config.logger) === null || _a === void 0 ? void 0 : _a.call(config, `Retrying... (${attempts - 1} attempts left)`, 'info');
            await new Promise(resolve => setTimeout(resolve, delay));
            return retry(fn, attempts - 1, delay);
        }
    };
    (0, react_1.useEffect)(() => {
        const supported = 'serviceWorker' in navigator && 'PushManager' in window;
        setIsSupported(supported);
        if (supported) {
            setPermission(Notification.permission);
        }
    }, []);
    // Permission change listener
    (0, react_1.useEffect)(() => {
        if (!isSupported)
            return;
        const handlePermissionChange = () => {
            var _a;
            const newPermission = Notification.permission;
            setPermission(newPermission);
            // Auto-subscribe when permission is granted
            if ((config === null || config === void 0 ? void 0 : config.autoSubscribe) && newPermission === 'granted' && !isSubscribed && !isLoading) {
                (_a = config === null || config === void 0 ? void 0 : config.logger) === null || _a === void 0 ? void 0 : _a.call(config, 'Permission granted, auto-subscribing...', 'info');
                subscribe().catch(error => {
                    var _a;
                    (_a = config === null || config === void 0 ? void 0 : config.logger) === null || _a === void 0 ? void 0 : _a.call(config, `Auto-subscribe failed: ${error.message}`, 'error');
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
    }, [isSupported, config === null || config === void 0 ? void 0 : config.autoSubscribe, isSubscribed, isLoading]);
    const registerServiceWorker = async () => {
        var _a;
        try {
            const registration = await navigator.serviceWorker.register((config === null || config === void 0 ? void 0 : config.serviceWorkerUrl) || '/sw.js');
            (_a = config === null || config === void 0 ? void 0 : config.logger) === null || _a === void 0 ? void 0 : _a.call(config, 'Service Worker registered:', 'info');
            return registration;
        }
        catch (error) {
            handleError(error, 'Service Worker registration failed', 'SERVICE_WORKER_FAILED');
            throw error;
        }
    };
    const checkSubscription = async () => {
        var _a;
        if (!isSupported)
            return;
        try {
            const registration = await registerServiceWorker();
            await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        }
        catch (error) {
            (_a = config === null || config === void 0 ? void 0 : config.logger) === null || _a === void 0 ? void 0 : _a.call(config, 'Subscription check error:', 'error');
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
            const subscription = await retry(() => registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey())
            }));
            setIsSubscribed(true);
            setProgress('ready');
            setSubscription(subscription);
            return subscription;
        }
        catch (error) {
            setProgress('error');
            handleError(error, 'Subscribe error', 'SUBSCRIPTION_FAILED');
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    };
    const unsubscribe = async () => {
        if (!isSupported)
            return;
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
        }
        catch (error) {
            setProgress('error');
            handleError(error, 'Unsubscribe error', 'UNSUBSCRIPTION_FAILED');
        }
        finally {
            setIsLoading(false);
        }
    };
    const getSubscription = async () => {
        if (!isSupported)
            return;
        const registration = await registerServiceWorker();
        const subscription = await registration.pushManager.getSubscription();
        setSubscription(subscription);
        return subscription;
    };
    (0, react_1.useEffect)(() => {
        getSubscription();
    }, [isSupported]);
    (0, react_1.useEffect)(() => {
        if (isSupported) {
            checkSubscription();
        }
    }, [isSupported]);
    // Auto-subscribe effect
    (0, react_1.useEffect)(() => {
        var _a;
        if (isSupported && (config === null || config === void 0 ? void 0 : config.autoSubscribe) && permission === 'granted' && !isSubscribed && !isLoading) {
            (_a = config === null || config === void 0 ? void 0 : config.logger) === null || _a === void 0 ? void 0 : _a.call(config, 'Auto-subscribing...', 'info');
            subscribe().catch(error => {
                var _a;
                (_a = config === null || config === void 0 ? void 0 : config.logger) === null || _a === void 0 ? void 0 : _a.call(config, `Auto-subscribe failed: ${error.message}`, 'error');
            });
        }
    }, [isSupported, config === null || config === void 0 ? void 0 : config.autoSubscribe, permission, isSubscribed, isLoading]);
    // Batch operations
    const toggle = async () => {
        if (isSubscribed) {
            return await unsubscribe();
        }
        else {
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
exports.useNextPush = useNextPush;
// Re-export provider
var provider_1 = require("./provider");
Object.defineProperty(exports, "NextPushProvider", { enumerable: true, get: function () { return provider_1.NextPushProvider; } });
Object.defineProperty(exports, "useNextPushContext", { enumerable: true, get: function () { return provider_1.useNextPushContext; } });
