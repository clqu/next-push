import type { Metadata } from "next";
import { Red_Hat_Display, Red_Hat_Mono } from "next/font/google";
import { NextPushProvider } from 'next-push/client';
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Red_Hat_Display({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Red_Hat_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "next-push",
	description: "A modern, lightweight push notification library for Next.js applications with full TypeScript support.",
	manifest: "/manifest.json",
	themeColor: "#3b82f6",
	viewport: "width=device-width, initial-scale=1, maximum-scale=1",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "next-push",
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
				<Toaster />
				<NextPushProvider>
					{children}
				</NextPushProvider>
			</body>
		</html>
	);
}
