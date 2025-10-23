import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
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
import { useState } from 'react'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/teacher')({
    component: TeacherView,
})

function TeacherView() {
    const [selectedQueueId, setSelectedQueueId] = useState<Id<'queues'> | null>(
        null,
    )
    const [showCreateQueue, setShowCreateQueue] = useState(false)

    const { data: queues } = useSuspenseQuery(
        convexQuery(api.queues.listQueues, {}),
    )

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="hover:opacity-80 transition-opacity">
                            <h1 className="text-2xl font-bold">HelpQue</h1>
                        </Link>
                        <Badge variant="outline">Teacher View</Badge>
                    </div>
                    <Button
                        onClick={() => setShowCreateQueue(!showCreateQueue)}
                        size="sm"
                    >
                        {showCreateQueue ? 'Cancel' : '+ New Queue'}
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Create Queue Form */}
                {showCreateQueue && (
                    <CreateQueueForm
                        onSuccess={() => setShowCreateQueue(false)}
                    />
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Queue List */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <Text className="text-lg font-semibold">
                                Queues ({queues.length})
                            </Text>
                        </div>

                        <div className="space-y-3">
                            {queues.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 text-center">
                                        <Text variant="muted">
                                            No queues yet. Create your first
                                            queue to get started.
                                        </Text>
                                    </CardContent>
                                </Card>
                            ) : (
                                queues.map((queue) => (
                                    <QueueCard
                                        key={queue._id}
                                        queue={queue}
                                        isSelected={
                                            selectedQueueId === queue._id
                                        }
                                        onSelect={() =>
                                            setSelectedQueueId(queue._id)
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Queue Details */}
                    <div className="lg:col-span-2">
                        {selectedQueueId ? (
                            <QueueDetails queueId={selectedQueueId} />
                        ) : (
                            <Card>
                                <CardContent className="py-20 text-center">
                                    <Text variant="muted" className="text-lg">
                                        Select a queue to view details
                                    </Text>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CreateQueueForm({ onSuccess }: { onSuccess: () => void }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const createQueue = useMutation(api.queues.createQueue)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        await createQueue.mutateAsync({
            name: name.trim(),
            description: description.trim() || undefined,
            createdBy: 'Teacher',
        })

        setName('')
        setDescription('')
        onSuccess()
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
    isSelected,
    onSelect,
}: {
    queue: {
        _id: Id<'queues'>
        name: string
        description?: string
        isActive: boolean
        waitingCount: number
    }
    isSelected: boolean
    onSelect: () => void
}) {
    const updateQueue = useMutation(api.queues.updateQueue)

    const toggleActive = async (e: React.MouseEvent) => {
        e.stopPropagation()
        await updateQueue.mutateAsync({
            queueId: queue._id,
            isActive: !queue.isActive,
        })
    }

    return (
        <Card
            className={`cursor-pointer transition-all ${
                isSelected
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'hover:shadow-md'
            }`}
            onClick={onSelect}
        >
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

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            {queue.waitingCount}{' '}
                            {queue.waitingCount === 1 ? 'student' : 'students'}
                        </Badge>
                    </div>
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
    )
}

function QueueDetails({ queueId }: { queueId: Id<'queues'> }) {
    const { data: queue } = useSuspenseQuery(
        convexQuery(api.queues.getQueue, { queueId }),
    )

    const { data: entries } = useSuspenseQuery(
        convexQuery(api.queues.listQueueEntries, { queueId }),
    )

    const callNext = useMutation(api.queues.callNext)
    const markAsHelped = useMutation(api.queues.markAsHelped)
    const removeEntry = useMutation(api.queues.removeEntry)

    if (!queue) {
        return (
            <Card>
                <CardContent className="py-20 text-center">
                    <Text variant="muted">Queue not found</Text>
                </CardContent>
            </Card>
        )
    }

    const handleCallNext = async () => {
        await callNext.mutateAsync({ queueId })
    }

    const handleMarkHelped = async (entryId: Id<'queueEntries'>) => {
        await markAsHelped.mutateAsync({ entryId })
    }

    const handleRemoveEntry = async (entryId: Id<'queueEntries'>) => {
        if (confirm('Are you sure you want to remove this student?')) {
            await removeEntry.mutateAsync({ entryId })
        }
    }

    const formatWaitTime = (ms: number | null) => {
        if (!ms) return 'N/A'
        const minutes = Math.floor(ms / 60000)
        if (minutes < 1) return '< 1 min'
        return `${minutes} min`
    }

    const waitingEntries = entries.filter((e) => e.status === 'waiting')
    const beingHelpedEntries = entries.filter((e) => e.status === 'being_helped')

    return (
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
                            variant={queue.isActive ? 'default' : 'outline'}
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

                    {/* Call Next Button */}
                    <Button
                        onClick={handleCallNext}
                        disabled={waitingEntries.length === 0}
                        className="w-full mt-4"
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
                                    onClick={() => handleMarkHelped(entry._id)}
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
                        <Text variant="muted" className="text-center py-8">
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
    )
}
