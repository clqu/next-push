"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerPush = void 0;
const web_push_1 = __importDefault(require("web-push"));
const createServerPush = (mail = 'admin@example.com', vapidKeys) => {
    if (typeof window !== 'undefined') {
        throw new Error("createServerPush sadece server-side'da kullanılabilir");
    }
    web_push_1.default.setVapidDetails(`mailto:${mail}`, vapidKeys.publicKey, vapidKeys.privateKey);
    return {
        sendNotification: async (subscription, data) => {
            try {
                const payload = JSON.stringify(data);
                await web_push_1.default.sendNotification(subscription, payload);
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        },
        sendNotificationToAll: async (subscriptions, data) => {
            const results = await Promise.allSettled(subscriptions.map(subscription => web_push_1.default.sendNotification(subscription, JSON.stringify(data))));
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            return { successful, failed, results };
        }
    };
};
exports.createServerPush = createServerPush;
