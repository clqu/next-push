"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNextPush = void 0;
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
    (0, react_1.useEffect)(() => {
        const supported = 'serviceWorker' in navigator && 'PushManager' in window;
        setIsSupported(supported);
        if (supported) {
            setPermission(Notification.permission);
        }
    }, []);
    const registerServiceWorker = async () => {
        var _a, _b;
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            (_a = config.logger) === null || _a === void 0 ? void 0 : _a.call(config, 'Service Worker registered:', 'info');
            return registration;
        }
        catch (error) {
            (_b = config.logger) === null || _b === void 0 ? void 0 : _b.call(config, 'Service Worker registration failed:', 'error');
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
            (_a = config.logger) === null || _a === void 0 ? void 0 : _a.call(config, 'Subscription check error:', 'error');
        }
    };
    const subscribe = async () => {
        var _a;
        if (!isSupported) {
            throw new Error('Push notifications not supported');
        }
        setIsLoading(true);
        try {
            if (Notification.permission === 'denied') {
                throw new Error('Notification permission denied');
            }
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Notification permission not granted');
                }
                setPermission(permission);
            }
            const registration = await registerServiceWorker();
            await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey)
            });
            setIsSubscribed(true);
            return subscription;
        }
        catch (error) {
            (_a = config.logger) === null || _a === void 0 ? void 0 : _a.call(config, 'Subscribe error:', 'error');
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    };
    const unsubscribe = async () => {
        var _a;
        if (!isSupported)
            return;
        setIsLoading(true);
        try {
            const registration = await registerServiceWorker();
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
            }
            setIsSubscribed(false);
        }
        catch (error) {
            (_a = config.logger) === null || _a === void 0 ? void 0 : _a.call(config, 'Unsubscribe error:', 'error');
        }
        finally {
            setIsLoading(false);
        }
    };
    // Test bildirimi gönder
    const sendTestNotification = (data) => {
        var _a;
        if (!isSubscribed) {
            throw new Error('Not subscribed to notifications');
        }
        const payload = JSON.stringify(data);
        (_a = config.logger) === null || _a === void 0 ? void 0 : _a.call(config, 'Test notification payload:', 'info');
        return payload;
    };
    (0, react_1.useEffect)(() => {
        if (isSupported) {
            checkSubscription();
        }
    }, [isSupported]);
    return {
        isSupported,
        isSubscribed,
        isLoading,
        permission,
        subscribe,
        unsubscribe,
        sendTestNotification,
        checkSubscription
    };
};
exports.useNextPush = useNextPush;
