# Next-Push

A modern, lightweight push notification library for Next.js applications with full TypeScript support.

## 📦 Installation

```bash
# Using npm
npm install next-push

# Using yarn
yarn add next-push

# Using pnpm
pnpm add next-push
```

## 🚀 Quick Start

### Client-Side Setup

```typescript
import { useNextPush } from 'next-push/client';

const MyComponent = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = useNextPush({
    vapidPublicKey: 'your-vapid-public-key',
    defaultIcon: '/icon.png',
    onNotificationClick: (url) => {
      if (url) window.open(url, '_blank');
    }
  });

  const handleSubscribe = async () => {
    try {
      await subscribe();
      console.log('Successfully subscribed to push notifications');
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  return (
    <div>
      {isSupported ? (
        <div>
          <p>Permission: {permission}</p>
          <p>Subscribed: {isSubscribed ? 'Yes' : 'No'}</p>
          {!isSubscribed && (
            <button 
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe to Notifications'}
            </button>
          )}
          {isSubscribed && (
            <button onClick={unsubscribe}>
              Unsubscribe
            </button>
          )}
        </div>
      ) : (
        <p>Push notifications are not supported in this browser</p>
      )}
    </div>
  );
};
```

### Server-Side Setup

```typescript
import { createServerPush } from 'next-push/server';

// Generate VAPID keys
const vapidKeys = {
  publicKey: 'your-public-key',
  privateKey: 'your-private-key'
};

const pushServer = createServerPush('admin@example.com', vapidKeys);

// Send notification to a single subscription
const sendNotification = async (subscription: PushSubscription) => {
  const result = await pushServer.sendNotification(subscription, {
    title: 'Hello!',
    message: 'This is a test notification',
    url: 'https://example.com',
    icon: '/icon.png'
  });
  
  if (result.success) {
    console.log('Notification sent successfully');
  } else {
    console.error('Failed to send notification:', result.error);
  }
};

// Send notification to multiple subscriptions
const sendToAll = async (subscriptions: PushSubscription[]) => {
  const result = await pushServer.sendNotificationToAll(subscriptions, {
    title: 'Broadcast Message',
    message: 'This message was sent to all subscribers',
    url: 'https://example.com'
  });
  
  console.log(`Sent to ${result.successful} users, ${result.failed} failed`);
};
```

## 🌟 Features

- 🔔 **Easy Integration**: Simple React hook for client-side push notifications
- 🛡 **Type Safety**: Full TypeScript support with proper type definitions
- ⚡ **Lightweight**: Minimal bundle size with no heavy dependencies
- 🔒 **Secure**: Built-in VAPID key support for secure push notifications
- 📱 **Cross-Platform**: Works across all modern browsers and devices
- 🎯 **Flexible**: Customizable notification content and behavior
- 🔄 **Auto-Management**: Automatic service worker registration and subscription handling
- 🏗 **Modular**: Separate client and server modules for better tree-shaking

## 📋 API Reference

### Client Module (`next-push/client`)

#### `useNextPush(config: PushConfig)`

A React hook that provides push notification functionality.

##### Parameters

- `config.vapidPublicKey` (string): Your VAPID public key
- `config.defaultIcon?` (string): Default icon URL for notifications
- `config.onNotificationClick?` (function): Callback when notification is clicked

##### Returns

- `isSupported` (boolean): Whether push notifications are supported
- `isSubscribed` (boolean): Current subscription status
- `isLoading` (boolean): Loading state for async operations
- `permission` (NotificationPermission): Current notification permission
- `subscribe()` (function): Subscribe to push notifications
- `unsubscribe()` (function): Unsubscribe from push notifications
- `sendTestNotification()` (function): Send a test notification
- `checkSubscription()` (function): Check current subscription status

#### Types

```typescript
interface PushConfig {
  vapidPublicKey: string;
  defaultIcon?: string;
  onNotificationClick?: (url?: string) => void;
}

interface NotificationData {
  title: string;
  message: string;
  url?: string;
  icon?: string;
}
```

### Server Module (`next-push/server`)

#### `createServerPush(mail: string, vapidKeys: VapidKeys)`

Creates a server-side push notification handler.

##### Parameters

- `mail` (string): Email address for VAPID configuration
- `vapidKeys` (object): VAPID public and private keys

##### Returns

- `sendNotification(subscription, data)` (function): Send notification to single subscription
- `sendNotificationToAll(subscriptions, data)` (function): Send notification to multiple subscriptions

## 🔧 Setup Requirements

### 1. Generate VAPID Keys

```bash
# Using web-push library
npx web-push generate-vapid-keys
```

### 2. Create Service Worker

Create a `public/sw.js` file:

```javascript
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.message,
    icon: data.icon || '/icon.png',
    badge: '/badge.png',
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

### 3. Environment Variables

```env
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

## 📝 Examples

### Basic Usage

```typescript
// pages/index.tsx
import { useNextPush } from 'next-push/client';

export default function Home() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = useNextPush({
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
  });

  return (
    <div>
      <h1>Push Notification Demo</h1>
      {isSupported && (
        <button onClick={isSubscribed ? unsubscribe : subscribe}>
          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>
      )}
    </div>
  );
}
```

### API Route for Sending Notifications

```typescript
// pages/api/send-notification.ts
import { createServerPush } from 'next-push/server';
import type { NextApiRequest, NextApiResponse } from 'next';

const pushServer = createServerPush(
  'admin@example.com',
  {
    publicKey: process.env.VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { subscription, notification } = req.body;

  try {
    const result = await pushServer.sendNotification(subscription, notification);
    
    if (result.success) {
      res.status(200).json({ message: 'Notification sent successfully' });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
}
```

### Advanced Usage with TypeScript

```typescript
// types/push.ts
import type { NotificationData } from 'next-push/client';

export interface CustomNotificationData extends NotificationData {
  priority?: 'high' | 'normal';
  tag?: string;
}

// components/PushNotification.tsx
import { useNextPush } from 'next-push/client';
import type { PushConfig } from 'next-push/client';

interface CustomPushConfig extends PushConfig {
  onError?: (error: Error) => void;
}

export const PushNotification = ({ config }: { config: CustomPushConfig }) => {
  const { isSupported, subscribe, isSubscribed } = useNextPush(config);
  
  // Component implementation
};
```

## 🏗 Module Structure

```
next-push/
├── client/          # Client-side module
│   ├── index.ts     # React hooks and types
│   └── ...
└── server/          # Server-side module
    ├── index.ts     # Server utilities
    └── ...
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

[MIT](LICENSE) © 2025

## 🆘 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/clqu/next-push/issues) on GitHub.