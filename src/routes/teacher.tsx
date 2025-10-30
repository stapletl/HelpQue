import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
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

export const Route = createFileRoute('/teacher')({
    component: TeacherPage,
})

function TeacherPage() {
    return (
        <>
            <AuthLoading>{<AuthLoadingSpinner />}</AuthLoading>
            <Unauthenticated>
                <SignInPage redirectTo="/teacher" />
            </Unauthenticated>
            <Authenticated>
                <TeacherView />
            </Authenticated>
        </>
    )
}

function TeacherView() {
    const [showCreateQueue, setShowCreateQueue] = useState(false)
    const router = useRouter()

    const { data: queues } = useSuspenseQuery(
        convexQuery(api.queues.listQueues, {}),
    )

    const handleQueueCreated = (queueId: Id<'queues'>) => {
        setShowCreateQueue(false)
        router.navigate({ to: `/queues-admin/${queueId}` })
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="hover:opacity-80 transition-opacity"
                        >
                            <h1 className="text-2xl font-bold">HelpQue</h1>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setShowCreateQueue(!showCreateQueue)}
                        >
                            {showCreateQueue ? 'Cancel' : '+ New Queue'}
                        </Button>
                        <SignOutButton />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Create Queue Form */}
                {showCreateQueue && (
                    <CreateQueueForm onSuccess={handleQueueCreated} />
                )}

                {/* Queue List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Text className="text-lg font-semibold">
                            Queues ({queues.length})
                        </Text>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {queues.length === 0 ? (
                            <Card className="md:col-span-2 lg:col-span-3">
                                <CardContent className="py-8 text-center">
                                    <Text variant="muted">
                                        No queues yet. Create your first queue
                                        to get started.
                                    </Text>
                                </CardContent>
                            </Card>
                        ) : (
                            queues.map((queue) => (
                                <QueueCard key={queue._id} queue={queue} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CreateQueueForm({
    onSuccess,
}: {
    onSuccess: (queueId: Id<'queues'>) => void
}) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const createQueue = useMutation(api.queues.createQueue)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        const queueId = await createQueue({
            name: name.trim(),
            description: description.trim() || undefined,
        })

        setName('')
        setDescription('')
        onSuccess(queueId)
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Create New Queue</CardTitle>
                <CardDescription>
                    Add a new help queue for students to join
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">
                            Queue Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Lab Help, Office Hours"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this queue for?"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={2}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Create Queue
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

function QueueCard({
    queue,
}: {
    queue: {
        _id: Id<'queues'>
        name: string
        description?: string
        isActive: boolean
        waitingCount: number
    }
}) {
    const updateQueue = useMutation(api.queues.updateQueue)
    const [copied, setCopied] = useState(false)

    const toggleActive = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        await updateQueue({
            queueId: queue._id,
            isActive: !queue.isActive,
        })
    }

    const copyLink = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const url = `${window.location.origin}/queues/${queue._id}`
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Link
            to="/queues-admin/$id"
            params={{ id: queue._id }}
            className="block"
        >
            <Card className="cursor-pointer transition-all hover:shadow-md h-full">
                <CardContent className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <Text className="font-semibold truncate">
                                {queue.name}
                            </Text>
                            {queue.description && (
                                <Text
                                    variant="muted"
                                    className="text-xs truncate mt-0.5"
                                >
                                    {queue.description}
                                </Text>
                            )}
                        </div>
                        <Badge
                            variant={queue.isActive ? 'default' : 'outline'}
                            className="shrink-0"
                        >
                            {queue.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="shrink-0">
                            {queue.waitingCount}{' '}
                            {queue.waitingCount === 1 ? 'student' : 'students'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={copyLink}
                            className="h-7 px-2 text-xs flex-1"
                            title="Copy student link"
                        >
                            {copied ? (
                                <span className="flex items-center gap-1">
                                    <svg
                                        className="w-3 h-3"
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
                                    Copied
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <svg
                                        className="w-3 h-3"
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
                                    Copy Link
                                </span>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={toggleActive}
                            className="h-7 px-2 text-xs"
                        >
                            {queue.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
