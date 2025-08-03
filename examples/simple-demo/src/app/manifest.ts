import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "next-push",
		short_name: "next-push",
		description: "A modern, lightweight push notification library for Next.js applications.",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#3b82f6",
		orientation: "portrait",
		scope: "/",
		lang: "tr",
		icons: [
			{
				src: "/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
			}
		],
		categories: [
			"productivity",
			"utilities"
		]
	}
}