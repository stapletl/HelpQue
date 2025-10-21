import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Text } from '~/components/ui/typography'
import { AuroraText } from '~/components/ui/aurora-text'

export const Route = createFileRoute('/')({
    component: Home,
})

function Home() {
    const {
        data: { viewer, numbers },
    } = useSuspenseQuery(
        convexQuery(api.myFunctions.listNumbers, { count: 10 }),
    )

    const addNumber = useMutation(api.myFunctions.addNumber)

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
            {/* Hero Section */}
            <div className="max-w-5xl mx-auto text-center space-y-8">
                {/* Main Title with Aurora Effect */}
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                        <AuroraText
                            colors={[
                                '#FF0080',
                                '#7928CA',
                                '#0070F3',
                                '#38bdf8',
                            ]}
                            speed={1.5}
                        >
                            HelpQue
                        </AuroraText>
                    </h1>
                    <Text className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                        Real-time queue management powered by{' '}
                        <span className="text-foreground font-semibold">
                            Convex
                        </span>{' '}
                        and{' '}
                        <span className="text-foreground font-semibold">
                            TanStack
                        </span>
                    </Text>
                </div>

                {/* Welcome Message */}
                <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="px-4 py-1.5">
                        Welcome {viewer ?? 'Anonymous'}
                    </Badge>
                </div>

                {/* CTA Section */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                        size="lg"
                        onClick={() => {
                            void addNumber({
                                value: Math.floor(Math.random() * 10),
                            })
                        }}
                        className="text-base px-8"
                    >
                        Try Live Sync
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="text-base px-8"
                    >
                        <Link to="/anotherPage">Explore More</Link>
                    </Button>
                </div>

                {/* Live Data Display */}
                <div className="pt-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <Text
                            variant="small"
                            className="text-accent-foreground"
                        >
                            Live Data Stream
                        </Text>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-auto">
                        <div className="text-4xl font-mono font-bold text-primary">
                            {numbers.length === 0
                                ? '—'
                                : numbers.slice(-5).reverse().join(' · ')}
                        </div>
                        <Text variant="muted" className="mt-2">
                            {numbers.length === 0
                                ? 'Click above to generate data'
                                : `${numbers.length} synchronized ${numbers.length === 1 ? 'entry' : 'entries'}`}
                        </Text>
                    </div>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
                    <Badge variant="secondary" className="font-mono text-xs">
                        Real-time Sync
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                        Serverless Backend
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                        Type-Safe
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                        Modern Stack
                    </Badge>
                </div>
            </div>

            {/* Subtle Background Gradient */}
            <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        </main>
    )
}
