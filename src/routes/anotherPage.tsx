import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useAction } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Heading, Text } from '~/components/ui/typography'

export const Route = createFileRoute('/anotherPage')({
    component: AnotherPage,
})

function AnotherPage() {
    const callMyAction = useAction(api.myFunctions.myAction)
    const [isLoading, setIsLoading] = useState(false)
    const [lastAdded, setLastAdded] = useState<number | null>(null)

    const { data } = useSuspenseQuery(
        convexQuery(api.myFunctions.listNumbers, { count: 10 }),
    )

    const handleAddNumber = async () => {
        setIsLoading(true)
        const randomNum = Math.round(Math.random() * 100)
        setLastAdded(randomNum)

        try {
            await callMyAction({ first: randomNum })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
            <div className="max-w-3xl mx-auto w-full space-y-12">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <Text variant="small" className="text-primary font-medium">
                            Convex Actions
                        </Text>
                    </div>
                    <Heading variant="h2" className="text-center">
                        Server-Side Actions
                    </Heading>
                    <Text className="text-muted-foreground max-w-xl mx-auto">
                        Trigger server-side functions that can interact with
                        third-party APIs, send emails, or perform complex
                        operations
                    </Text>
                </div>

                {/* Action Card */}
                <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Heading variant="h5">Add Random Number</Heading>
                            <Badge variant="secondary" className="font-mono">
                                Action
                            </Badge>
                        </div>
                        <Text variant="muted">
                            Execute a server action that adds a random number
                            between 0-100 to the database
                        </Text>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={handleAddNumber}
                            disabled={isLoading}
                            size="lg"
                            className="flex-1"
                        >
                            {isLoading ? 'Processing...' : 'Execute Action'}
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link to="/">
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Back Home
                            </Link>
                        </Button>
                    </div>

                    {/* Last Added Indicator */}
                    {lastAdded !== null && (
                        <div className="p-4 bg-accent/30 border border-accent/50 rounded-lg">
                            <Text variant="small" className="text-accent-foreground">
                                Last added:{' '}
                                <span className="font-mono font-bold text-lg">
                                    {lastAdded}
                                </span>
                            </Text>
                        </div>
                    )}
                </div>

                {/* Data Display */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Heading variant="h5">Current Database</Heading>
                        <Badge variant="outline" className="font-mono">
                            {data.numbers.length}{' '}
                            {data.numbers.length === 1 ? 'entry' : 'entries'}
                        </Badge>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        {data.numbers.length === 0 ? (
                            <Text
                                variant="muted"
                                className="text-center py-8"
                            >
                                No numbers yet. Execute the action above to add
                                one!
                            </Text>
                        ) : (
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                {data.numbers.map((num, idx) => (
                                    <div
                                        key={idx}
                                        className="aspect-square flex items-center justify-center bg-primary/10 border border-primary/20 rounded-lg font-mono text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
                                    >
                                        {num}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subtle Background Gradient */}
            <div className="absolute inset-0 -z-10 bg-linear-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
        </main>
    )
}
