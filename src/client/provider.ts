"use client";
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useNextPush } from './index';
import type { PushConfig, PushError, PushProgress } from '../types';
import path from 'path';

interface NextPushContextType {
	isSupported: boolean;
	subscribed: boolean;
	loading: boolean;
	permission: NotificationPermission;
	error: PushError | null;
	progress: PushProgress;
	subscribe: () => Promise<PushSubscription | undefined>;
	unsubscribe: () => Promise<PushSubscription | null | undefined>;
	toggle: () => Promise<PushSubscription | null | undefined>;
	reset: () => Promise<void>;
	check: () => Promise<void>;
	getSubscription: () => Promise<PushSubscription | null | undefined>;
}

const NextPushContext = createContext<NextPushContextType | null>(null);

interface NextPushProviderProps {
	children: ReactNode;
	config?: PushConfig;
}

export const NextPushProvider: React.FC<NextPushProviderProps> = ({
	children,
	config
}) => {
	const pushState = useNextPush(config);

	return React.createElement(NextPushContext.Provider, { value: pushState }, children);
};

export const useNextPushContext = (): NextPushContextType => {
	const context = useContext(NextPushContext);

	if (!context) {
		throw new Error('useNextPushContext must be used within a NextPushProvider');
	}

	return context;
}; 