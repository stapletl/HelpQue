import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useState } from 'react'
import {
    AuthLoading,
    Authenticated,
    Unauthenticated,
    useMutation,
} from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Text } from '~/components/ui/typography'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card'
import { SignInPage } from '~/auth/SignInPage'
import { SignOutButton } from '~/auth/SignOutButton'
import { AuthLoadingSpinner } from '~/auth/AuthLoadingSpinner'

export const Route = createFileRoute('/queues-admin/$id')({
    component: QueuePage,
})

function QueuePage() {
    return (
        <>
            <AuthLoading>{<AuthLoadingSpinner />}</AuthLoading>
            <Unauthenticated>
                <SignInPage
                    redirectTo={`/queues-admin/${Route.useParams().id}`}
                />
            </Unauthenticated>
            <Authenticated>
                <QueueView />
            </Authenticated>
        </>
    )
}

function QueueView() {
    const { id } = Route.useParams()
    const queueId = id as Id<'queues'>

    const { data: queue } = useSuspenseQuery(
        convexQuery(api.queues.getQueue, { queueId }),
    )

    const { data: entries } = useSuspenseQuery(
        convexQuery(api.queues.listQueueEntries, { queueId }),
    )

    const callNext = useMutation(api.queues.callNext)
    const markAsHelped = useMutation(api.queues.markAsHelped)
    const removeEntry = useMutation(api.queues.removeEntry)

    const [copied, setCopied] = useState(false)

    const handleCallNext = async () => {
        await callNext({ queueId })
    }

    const handleMarkHelped = async (entryId: Id<'queueEntries'>) => {
        await markAsHelped({ entryId })
    }

    const handleRemoveEntry = async (entryId: Id<'queueEntries'>) => {
        if (confirm('Are you sure you want to remove this student?')) {
            await removeEntry({ entryId })
        }
    }

    const copyLink = async () => {
        const url = `${window.location.origin}/queues/${queueId}`
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const formatWaitTime = (ms: number | null) => {
        if (!ms) return 'N/A'
        const minutes = Math.floor(ms / 60000)
        if (minutes < 1) return '< 1 min'
        return `${minutes} min`
    }

    if (!queue) {
        return (
            <div className="min-h-screen bg-background">
                <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/teacher"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <h1 className="text-2xl font-bold">HelpQue</h1>
                            </Link>
                        </div>
                        <SignOutButton />
                    </div>
                </header>
                <div className="container mx-auto px-4 py-8">
                    <Card>
                        <CardContent className="py-20 text-center">
                            <Text variant="muted">Queue not found</Text>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const waitingEntries = entries.filter((e) => e.status === 'waiting')
    const beingHelpedEntries = entries.filter(
        (e) => e.status === 'being_helped',
    )

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/teacher"
                            className="hover:opacity-80 transition-opacity"
                        >
                            <h1 className="text-2xl font-bold">HelpQue</h1>
                        </Link>
                        <Text variant="muted" className="text-sm">
                            / {queue.name}
                        </Text>
                    </div>
                    <SignOutButton />
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Queue Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">
                                        {queue.name}
                                    </CardTitle>
                                    {queue.description && (
                                        <CardDescription className="mt-1">
                                            {queue.description}
                                        </CardDescription>
                                    )}
                                </div>
                                <Badge
                                    variant={
                                        queue.isActive ? 'default' : 'outline'
                                    }
                                >
                                    {queue.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Statistics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-accent/50 rounded-lg">
                                    <div className="text-2xl font-bold">
                                        {queue.waitingCount}
                                    </div>
                                    <Text variant="muted" className="text-xs">
                                        Waiting
                                    </Text>
                                </div>
                                <div className="text-center p-3 bg-accent/50 rounded-lg">
                                    <div className="text-2xl font-bold">
                                        {queue.totalCount}
                                    </div>
                                    <Text variant="muted" className="text-xs">
                                        Total Served
                                    </Text>
                                </div>
                                <div className="text-center p-3 bg-accent/50 rounded-lg">
                                    <div className="text-2xl font-bold">
                                        {formatWaitTime(queue.averageWaitTime)}
                                    </div>
                                    <Text variant="muted" className="text-xs">
                                        Avg Wait
                                    </Text>
                                </div>
                            </div>

                            {/* Copy Link Button */}
                            <Button
                                onClick={copyLink}
                                variant="outline"
                                className="w-full mt-4"
                            >
                                {copied ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Link Copied!
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Copy Student Link
                                    </span>
                                )}
                            </Button>

                            {/* Call Next Button */}
                            <Button
                                onClick={handleCallNext}
                                disabled={waitingEntries.length === 0}
                                className="w-full mt-2"
                                size="lg"
                            >
                                Call Next Student
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Currently Being Helped */}
                    {beingHelpedEntries.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Currently Being Helped
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {beingHelpedEntries.map((entry) => (
                                    <div
                                        key={entry._id}
                                        className="flex items-center justify-between p-3 bg-primary/10 rounded-lg"
                                    >
                                        <div>
                                            <Text className="font-medium">
                                                {entry.userName}
                                            </Text>
                                            {entry.notes && (
                                                <Text
                                                    variant="muted"
                                                    className="text-sm"
                                                >
                                                    {entry.notes}
                                                </Text>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() =>
                                                handleMarkHelped(entry._id)
                                            }
                                            size="sm"
                                        >
                                            Mark as Helped
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Waiting Queue */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Waiting ({waitingEntries.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {waitingEntries.length === 0 ? (
                                <Text
                                    variant="muted"
                                    className="text-center py-8"
                                >
                                    No students waiting
                                </Text>
                            ) : (
                                <div className="space-y-2">
                                    {waitingEntries.map((entry, index) => (
                                        <div
                                            key={entry._id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">
                                                    #{index + 1}
                                                </Badge>
                                                <div>
                                                    <Text className="font-medium">
                                                        {entry.userName}
                                                    </Text>
                                                    {entry.notes && (
                                                        <Text
                                                            variant="muted"
                                                            className="text-sm"
                                                        >
                                                            {entry.notes}
                                                        </Text>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    handleRemoveEntry(entry._id)
                                                }
                                                size="sm"
                                                variant="ghost"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
