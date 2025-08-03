import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextPushProvider } from 'next-push/client';
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Push Notification Admin",
	description: "Push notification yönetim paneli",
	manifest: "/manifest.json",
	themeColor: "#3b82f6",
	viewport: "width=device-width, initial-scale=1, maximum-scale=1",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Push Admin",
	},
	icons: {
		icon: [
			{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [
			{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="tr">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<NextPushProvider>
					{children}
				</NextPushProvider>
			</body>
		</html>
	);
}
