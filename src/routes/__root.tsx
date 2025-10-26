import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import { ThemeProvider } from 'next-themes'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'
import { AnimatedThemeToggler } from '~/components/ui/animated-theme-toggler'

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient
}>()({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'HelpQue - Digital Queue Management',
            },
        ],
        links: [
            { rel: 'stylesheet', href: appCss },
            {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: '/apple-touch-icon.png',
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '32x32',
                href: '/favicon-32x32.png',
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '16x16',
                href: '/favicon-16x16.png',
            },
            { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
            { rel: 'icon', href: '/favicon.ico' },
        ],
    }),
    // notFoundComponent: () => <div>Route not found</div>,
    component: RootComponent,
})

function RootComponent() {
    return (
        <RootDocument>
            <Outlet />
            <div className="fixed bottom-6 right-6 z-50">
                <AnimatedThemeToggler />
            </div>
        </RootDocument>
    )
}

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning={true} className="h-full">
            <head>
                <HeadContent />
            </head>
            <body className="min-h-screen">
                <ThemeProvider
                    attribute="class"
                    storageKey="helpque-theme"
                    enableSystem={true}
                >
                    {children}
                </ThemeProvider>
                <Scripts />
            </body>
        </html>
    )
}
