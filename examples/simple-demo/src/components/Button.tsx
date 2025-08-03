import Link from "next/link"
import React from "react"

export const Button = ({
	children,
	onClick,
	variant = 'primary',
	className = '',
	href,
	target = '_self',
}: { children: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'blue' | 'subscribe', className?: string, href?: string, target?: string }) => {
	const variants = {
		primary: 'from-orange-500 via-indigo-500 to-blue-500/85 text-white bg-linear-to-br border border-b-2 border-zinc-950/40 shadow-md shadow-zinc-950/20 ring-1 ring-inset ring-white/10 transition-[filter] duration-200 hover:brightness-110 active:brightness-90',
		blue: 'from-indigo-500 to-blue-500/85 text-white bg-linear-to-br border border-b-2 border-zinc-950/10 shadow-md shadow-zinc-950/10 ring-1 ring-inset ring-white/10 transition-[filter] duration-200 hover:brightness-110 active:brightness-90',
		secondary: 'bg-gray-50 hover:bg-gray-200/50 border-zinc-100/50 relative border-b-2 shadow-sm shadow-zinc-950/15 ring-1 ring-zinc-300 text-black',
		subscribe: 'bg-linear-to-b **:[text-shadow:0_1px_0_black] border-black from-black/80 to-black text-white border text-sm shadow-md shadow-zinc-950/30 ring ring-inset ring-white/20 transition-[filter] duration-200 hover:brightness-125 active:brightness-95'
	}

	const Component = href ? Link : 'button' as any;

	return (
		<Component className={`px-4 h-11 flex items-center gap-4 justify-center rounded-xl font-medium transition-all  cursor-pointer duration-200 ${variants[variant]} ${className}`} onClick={onClick} href={href} target={target}>
			{children}
		</Component>
	)
}