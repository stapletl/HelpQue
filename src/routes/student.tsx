import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useEffect, useState } from 'react'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog'
import { ContinueAnonymouslyPage } from '~/auth/ContinueAnonymouslyPage'
import { AuthLoadingSpinner } from '~/auth/AuthLoadingSpinner'
import { SignOutButton } from '~/auth/SignOutButton'

export const Route = createFileRoute('/student')({
    component: StudentPage,
})

function StudentPage() {
    return (
        <>
            <AuthLoading>{<AuthLoadingSpinner />}</AuthLoading>
            <Unauthenticated>
                <ContinueAnonymouslyPage />
            </Unauthenticated>
            <Authenticated>
                <StudentView />
            </Authenticated>
        </>
    )
}

function StudentView() {
    const { data: queues } = useSuspenseQuery(
        convexQuery(api.queues.listQueues, { activeOnly: true }),
    )

    const { data: myQueues } = useSuspenseQuery(
        convexQuery(api.queues.getUserQueues, {}),
    )

    const { data: currentUser } = useSuspenseQuery(
        convexQuery(api.users.getCurrentUser, {}),
    )

    const [showNameDialog, setShowNameDialog] = useState(false)
    const [name, setName] = useState('')
    const [isSavingName, setIsSavingName] = useState(false)
    const updateName = useMutation(api.users.updateName)

    // Check if user has a name, if not show dialog
    useEffect(() => {
        if (currentUser && !currentUser.name) {
            setShowNameDialog(true)
        }
    }, [currentUser])

    const handleSaveName = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsSavingName(true)
        try {
            await updateName({ name: name.trim() })
            setShowNameDialog(false)
            setName('')
        } catch (error) {
            console.error('Failed to update name:', error)
        } finally {
            setIsSavingName(false)
        }
    }

    return (
        <>
            <NameDialog
                open={showNameDialog}
                name={name}
                onNameChange={setName}
                onSubmit={handleSaveName}
                isLoading={isSavingName}
            />
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
                            <Badge variant="outline">Student View</Badge>
                        </div>
                        <SignOutButton redirectTo="/" />
                    </div>
                </header>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* My Queues */}
                        <div className="lg:col-span-1 space-y-4">
                            <Text className="text-lg font-semibold">
                                My Queues ({myQueues.length})
                            </Text>

                            {myQueues.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 text-center">
                                        <Text variant="muted">
                                            You're not in any queues yet.
                                        </Text>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {myQueues.map(({ entry, queue }) => (
                                        <MyQueueCard
                                            key={entry._id}
                                            entry={entry}
                                            queue={queue}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Available Queues */}
                        <div className="lg:col-span-2 space-y-4">
                            <Text className="text-lg font-semibold">
                                Available Queues ({queues.length})
                            </Text>

                            {queues.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <Text
                                            variant="muted"
                                            className="text-lg"
                                        >
                                            No active queues available
                                        </Text>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {queues.map((queue) => {
                                        const isInQueue = myQueues.some(
                                            (mq) => mq.queue._id === queue._id,
                                        )
                                        return (
                                            <AvailableQueueCard
                                                key={queue._id}
                                                queue={queue}
                                                isInQueue={isInQueue}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function NameDialog({
    open,
    name,
    onNameChange,
    onSubmit,
    isLoading,
}: {
    open: boolean
    name: string
    onNameChange: (name: string) => void
    onSubmit: (e: React.FormEvent) => void
    isLoading: boolean
}) {
    return (
        <Dialog open={open}>
            <DialogContent
                className="sm:max-w-md"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Welcome to HelpQue!</DialogTitle>
                    <DialogDescription>
                        Please enter your name to continue
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="name"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Your Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            placeholder="e.g., Alex Smith"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                            autoFocus
                            disabled={isLoading}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? 'Saving...' : 'Continue'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function MyQueueCard({
    entry,
    queue,
}: {
    entry: {
        _id: Id<'queueEntries'>
        position: number
        status: 'waiting' | 'being_helped' | 'helped' | 'cancelled'
        notes?: string
    }
    queue: {
        _id: Id<'queues'>
        name: string
        description?: string
    }
}) {
    const leaveQueue = useMutation(api.queues.leaveQueue)

    const handleLeave = async () => {
        if (confirm('Are you sure you want to leave this queue?')) {
            await leaveQueue({ entryId: entry._id })
        }
    }

    return (
        <Card
            className={
                entry.status === 'being_helped'
                    ? 'ring-2 ring-primary animate-pulse'
                    : ''
            }
        >
            <CardContent className="py-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <Text className="font-semibold">{queue.name}</Text>
                        {queue.description && (
                            <Text variant="muted" className="text-xs mt-0.5">
                                {queue.description}
                            </Text>
                        )}
                    </div>
                    <Badge
                        variant={
                            entry.status === 'being_helped'
                                ? 'default'
                                : 'secondary'
                        }
                    >
                        {entry.status === 'being_helped'
                            ? 'Your Turn!'
                            : `Position: ${entry.position + 1}`}
                    </Badge>
                </div>

                {entry.status === 'being_helped' ? (
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Text className="text-sm font-medium text-center">
                            You're being helped now!
                        </Text>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>
                            {entry.position === 0
                                ? "You're next!"
                                : `${entry.position} ${entry.position === 1 ? 'person' : 'people'} ahead`}
                        </span>
                    </div>
                )}

                <Button
                    onClick={handleLeave}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                >
                    Leave Queue
                </Button>
            </CardContent>
        </Card>
    )
}

function AvailableQueueCard({
    queue,
    isInQueue,
}: {
    queue: {
        _id: Id<'queues'>
        name: string
        description?: string
        waitingCount: number
    }
    isInQueue: boolean
}) {
    const [notes, setNotes] = useState('')
    const [showNotes, setShowNotes] = useState(false)
    const joinQueue = useMutation(api.queues.joinQueue)

    const handleJoin = async () => {
        await joinQueue({
            queueId: queue._id,
            notes: notes.trim() || undefined,
        })
        setNotes('')
        setShowNotes(false)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{queue.name}</CardTitle>
                        {queue.description && (
                            <CardDescription className="mt-1">
                                {queue.description}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <svg
                        className="w-4 h-4 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <Text variant="muted">
                        {queue.waitingCount}{' '}
                        {queue.waitingCount === 1 ? 'person' : 'people'} waiting
                    </Text>
                </div>

                {showNotes && !isInQueue && (
                    <div>
                        <label className="text-xs font-medium mb-1 block">
                            What do you need help with? (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Brief description..."
                            className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={2}
                        />
                    </div>
                )}

                {isInQueue ? (
                    <Button disabled variant="outline" className="w-full">
                        Already in Queue
                    </Button>
                ) : showNotes ? (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowNotes(false)}
                            variant="ghost"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleJoin} className="flex-1">
                            Join
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={() => setShowNotes(true)}
                        className="w-full"
                    >
                        Join Queue
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
