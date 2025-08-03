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

### Quick Setup Guide

1. **Install the package:**
```bash
npm install next-push
```

2. **Set environment variables:**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

3. **Create service worker file:**
```javascript
// /public/sw.js
self.addEventListener('install', (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
	if (!event.data) {
		console.log('No data received');
		return;
	}

	try {
		const data = event.data.json();

		const options = {
			body: data.message,
			icon: data.icon || '/icon.png',
			badge: '/badge.png',
			data: {
				url: data.url,
				...data
			},
			requireInteraction: false,
			silent: false,
			tag: data.tag || 'next-push-notification'
		};

		event.waitUntil(
			self.registration.showNotification(data.title, options)
		);
	} catch (error) {
		console.error('Error processing push notification:', error);
	}
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.notification.data?.url) {
		event.waitUntil(
			self.clients.openWindow(event.notification.data.url)
		);
	}
});

self.addEventListener('notificationclose', (event) => {
});

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
```

4. **Wrap your app with NextPushProvider:**
```typescript
import { NextPushProvider } from 'next-push/client';

function App() {
  return (
    <NextPushProvider>
      <YourApp />
    </NextPushProvider>
  );
}
```

5. **Use in your component:**
```typescript
import { useNextPushContext } from 'next-push/client';

function MyComponent() {
  const { subscribe, subscribed } = useNextPushContext();
  
  return (
    <button onClick={subscribe}>
      {subscribed ? 'Unsubscribe' : 'Subscribe'}
    </button>
  );
}
```

That's it! 🎉

### Client-Side Setup

```typescript
import { NextPushProvider, useNextPushContext } from 'next-push/client';

// Wrap your app with NextPushProvider
function App() {
  return (
    <NextPushProvider>
      <MyComponent />
    </NextPushProvider>
  );
}

const MyComponent = () => {
  const {
    isSupported,
    subscribed,
    loading,
    permission,
    error,
    subscription,
    subscribe,
    unsubscribe
  } = useNextPushContext(); // VAPID key otomatik olarak environment variable'dan alınır

  const handleSubscribe = async () => {
    try {
      await subscribe();
      console.log('Successfully subscribed to push notifications');
      console.log('Subscription:', subscription);
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  return (
    <div>
      {error && (
        <div style={{ color: 'red' }}>
          Error: {error.message}
        </div>
      )}
      
      {isSupported ? (
        <div>
          <p>Permission: {permission}</p>
          <p>Subscribed: {subscribed ? 'Yes' : 'No'}</p>
          {subscription && (
            <p>Subscription: {subscription.endpoint.slice(0, 50)}...</p>
          )}
          {!subscribed && (
            <button 
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? 'Subscribing...' : 'Subscribe to Notifications'}
            </button>
          )}
          {subscribed && (
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
- 🤖 **Simple Setup**: Easy service worker setup with provided template
- 🔑 **Auto VAPID**: Automatic VAPID key management from environment variables
- 🎯 **Shorter API**: Simplified hook names for better developer experience
- 🌐 **Context Provider**: Global state management with React Context
- 🛡 **Error Handling**: Built-in error state and handling
- ⚡ **Auto-Subscribe**: Automatic subscription when permission is granted
- 📊 **Subscription State**: Access to current PushSubscription object

## 📋 API Reference

### Client Module (`next-push/client`)

#### `NextPushProvider`

A React context provider that automatically sets up the service worker and provides push notification functionality.

#### `useNextPushContext()`

A React hook that provides push notification functionality. Must be used within a `NextPushProvider`.

##### Parameters

- `config.vapidPublicKey` (string): Your VAPID public key
- `config.defaultIcon?` (string): Default icon URL for notifications
- `config.onNotificationClick?` (function): Callback when notification is clicked

##### Returns

- `isSupported` (boolean): Whether push notifications are supported
- `subscribed` (boolean): Current subscription status (shorter name)
- `loading` (boolean): Loading state for async operations (shorter name)
- `permission` (NotificationPermission): Current notification permission
- `error` (PushError | null): Current error state with detailed error types
- `progress` (PushProgress): Current operation progress
- `subscription` (PushSubscription | null): Current push subscription object
- `subscribe()` (function): Subscribe to push notifications
- `unsubscribe()` (function): Unsubscribe from push notifications
- `toggle()` (function): Toggle subscription state
- `reset()` (function): Reset error state and progress
- `check()` (function): Check current subscription status (shorter name)
- `getSubscription()` (function): Get current subscription

#### Types

```typescript
interface PushConfig {
  vapidPublicKey?: string; // Optional - automatically loaded from environment variables
  defaultIcon?: string;
  onNotificationClick?: (url?: string) => void;
  logger?: (message: string, type: 'info' | 'error') => void;
  retryAttempts?: number; // Number of retry attempts (default: 3)
  retryDelay?: number; // Delay between retries in ms (default: 1000)
  autoSubscribe?: boolean; // Automatically subscribe when permission is granted
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

### 2. Service Worker Setup

Next-Push requires a service worker file to handle push notifications. You need to create a service worker file in your public directory.

**Create Service Worker File:**

Create `public/sw.js` with the following content:

```javascript
// Next-Push Service Worker

self.addEventListener('install', (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
	if (!event.data) {
		console.log('No data received');
		return;
	}

	try {
		const data = event.data.json();

		const options = {
			body: data.message,
			icon: data.icon || '/icon.png',
			badge: '/badge.png',
			data: {
				url: data.url,
				...data
			},
			requireInteraction: false,
			silent: false,
			tag: data.tag || 'next-push-notification'
		};

		event.waitUntil(
			self.registration.showNotification(data.title, options)
		);
	} catch (error) {
		console.error('Error processing push notification:', error);
	}
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.notification.data?.url) {
		event.waitUntil(
			self.clients.openWindow(event.notification.data.url)
		);
	}
});

self.addEventListener('notificationclose', (event) => {
});

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
```

### 3. Environment Variables

```env
# Client-side (public)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key

# Server-side (private)
VAPID_PRIVATE_KEY=your-private-key
```

### 4. VAPID Key Management

Next-Push automatically looks for VAPID public key in this order:

1. **Config parameter**: `useNextPush({ vapidPublicKey: '...' })`
2. **Global variable**: `window.NEXT_PUSH_VAPID_PUBLIC_KEY`
3. **Environment variable**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

```typescript
// Automatic - loads from environment variable
const { subscribe } = useNextPush();

// Manual - loads from config
const { subscribe } = useNextPush({
  vapidPublicKey: 'your-key-here'
});
```

## 📝 Examples

### Migration from v1.0.x

If you're upgrading from an older version:

```typescript
// Old way
const { isSubscribed, isLoading, checkSubscription } = useNextPush({
  vapidPublicKey: 'required-key'
});

// New way
const { subscribed, loading, check } = useNextPush(); // VAPID key automatic
```

### Basic Usage

```typescript
// pages/index.tsx
import { useNextPush } from 'next-push/client';

export default function Home() {
  const { isSupported, subscribed, subscription, subscribe, unsubscribe } = useNextPush(); // VAPID key automatic

  return (
    <div>
      <h1>Push Notification Demo</h1>
      {isSupported && (
        <div>
          <button onClick={subscribed ? unsubscribe : subscribe}>
            {subscribed ? 'Unsubscribe' : 'Subscribe'}
          </button>
          {subscription && (
            <p>Subscription active: {subscription.endpoint.slice(0, 50)}...</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### Context Provider Usage

```typescript
// _app.tsx
import { NextPushProvider } from 'next-push/client';

export default function App({ Component, pageProps }) {
  return (
    <NextPushProvider>
      <Component {...pageProps} />
    </NextPushProvider>
  );
}

// Any component
import { useNextPushContext } from 'next-push/client';

const MyComponent = () => {
  const { subscribe, subscribed, subscription } = useNextPushContext();
  
  return (
    <div>
      <button onClick={subscribe} disabled={subscribed}>
        {subscribed ? 'Subscribed' : 'Subscribe'}
      </button>
      {subscription && (
        <p>Subscription active</p>
      )}
    </div>
  );
};
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
  const { isSupported, subscribe, subscribed } = useNextPush(config);
  
  // Component implementation
};
```

### Error Handling with Detailed Error Types

```typescript
import { useNextPush } from 'next-push/client';

const NotificationComponent = () => {
  const { subscribe, error, progress } = useNextPush();

  if (error) {
    switch (error.type) {
      case 'PERMISSION_DENIED':
        return <div>Please enable notifications in browser settings</div>;
      case 'VAPID_MISSING':
        return <div>VAPID key not configured</div>;
      case 'NOT_SUPPORTED':
        return <div>Push notifications not supported in this browser</div>;
      default:
        return <div>Error: {error.message}</div>;
    }
  }

  return (
    <div>
      <p>Progress: {progress}</p>
      <button onClick={subscribe}>Subscribe</button>
    </div>
  );
};
```

### Retry Mechanism

```typescript
const { subscribe } = useNextPush({
  retryAttempts: 5,
  retryDelay: 2000
});

// Automatically retries failed operations
await subscribe(); // Will retry up to 5 times with 2 second delays
```

### Auto-Subscribe

```typescript
const { subscribed } = useNextPush({
  autoSubscribe: true
});

// Automatically subscribes when permission is granted
// No manual subscribe() call needed!
```

### Batch Operations

```typescript
const { toggle, reset, subscribed } = useNextPush();

// Toggle subscription state
<button onClick={toggle}>
  {subscribed ? 'Disable' : 'Enable'} Notifications
</button>

// Reset error state and progress
<button onClick={reset}>Reset</button>
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

## 🔧 Troubleshooting

### Common Issues

**1. VAPID Key Error**
```
Error: VAPID public key is required
```
**Solution:** Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` environment variable or pass it in config.

**2. Permission Denied**
```
Error: Notification permission denied
```
**Solution:** User must manually enable notifications in browser settings.

**3. Permission Not Granted**
```
Error: Notification permission not granted
```
**Solution:** User declined the permission request. They can enable it later in browser settings.

**4. Service Worker Registration Failed**
```
Service Worker registration failed
```
**Solution:** Make sure you're using HTTPS in production (required for service workers).

**5. Push Notifications Not Supported**
```
Push notifications not supported
```
**Solution:** Check if browser supports service workers and push API.

**6. Subscription Failed**
```
Subscription failed
```
**Solution:** Check network connection and VAPID key configuration. The library will automatically retry.

### Debug Mode

Enable debug logging:
```typescript
const { subscribe } = useNextPush({
  logger: (message, type) => {
    console.log(`[Next-Push ${type}]:`, message);
  }
});
```

## 🆘 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/clqu/next-push/issues) on GitHub.