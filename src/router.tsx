import { Link, createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexAuthProvider } from '@convex-dev/auth/react'

import { AlertTriangle } from 'lucide-react'
import { routeTree } from './routeTree.gen'
import { Heading } from './components/ui/typography'
import { Button } from './components/ui/button'

export function getRouter() {
    const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!
    if (!CONVEX_URL) {
        console.error('missing envar CONVEX_URL')
    }
    const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

    const queryClient: QueryClient = new QueryClient({
        defaultOptions: {
            queries: {
                queryKeyHashFn: convexQueryClient.hashFn(),
                queryFn: convexQueryClient.queryFn(),
                gcTime: 5000,
            },
        },
    })
    convexQueryClient.connect(queryClient)

    const router = routerWithQueryClient(
        createRouter({
            routeTree,
            defaultPreload: 'intent',
            context: { queryClient },
            scrollRestoration: true,
            defaultPreloadStaleTime: 0, // Let React Query handle all caching
            defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
            defaultNotFoundComponent,
            Wrap: ({ children }) => (
                <ConvexAuthProvider client={convexQueryClient.convexClient}>
                    {children}
                </ConvexAuthProvider>
            ),
        }),
        queryClient,
    )

    return router
}

const defaultNotFoundComponent = () => (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-2">
        <Heading variant="h2" className="flex items-center gap-2">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
            Page Not Found
        </Heading>
        <Button asChild={true} variant="outline" className="ml-4">
            <Link to="/">Go Home</Link>
        </Button>
    </div>
)
