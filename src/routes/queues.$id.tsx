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

export const Route = createFileRoute('/queues/$id')({
    component: QueuePage,
})

function QueuePage() {
    return (
        <>
            <AuthLoading>{<AuthLoadingSpinner />}</AuthLoading>
            <Unauthenticated>
                <ContinueAnonymouslyPage />
            </Unauthenticated>
            <Authenticated>
                <StudentQueueView />
            </Authenticated>
        </>
    )
}

function StudentQueueView() {
    const { id } = Route.useParams()
    const queueId = id as Id<'queues'>

    const { data: queue } = useSuspenseQuery(
        convexQuery(api.queues.getQueue, { queueId }),
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

    const [notes, setNotes] = useState('')
    const [showNotesInput, setShowNotesInput] = useState(false)
    const joinQueue = useMutation(api.queues.joinQueue)
    const leaveQueue = useMutation(api.queues.leaveQueue)

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

    const handleJoinQueue = async () => {
        await joinQueue({
            queueId,
            notes: notes.trim() || undefined,
        })
        setNotes('')
        setShowNotesInput(false)
    }

    const handleLeaveQueue = async (entryId: Id<'queueEntries'>) => {
        if (confirm('Are you sure you want to leave this queue?')) {
            await leaveQueue({ entryId })
        }
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
                                to="/"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <h1 className="text-2xl font-bold">HelpQue</h1>
                            </Link>
                        </div>
                        <SignOutButton redirectTo="/" />
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

    // Check if user is in this queue
    const myEntry = myQueues.find((mq) => mq.queue._id === queueId)

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
                        </div>
                        <SignOutButton redirectTo="/" />
                    </div>
                </header>

                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    <div className="space-y-6">
                        {/* Queue Info */}
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
                                            queue.isActive
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {queue.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Statistics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-accent/50 rounded-lg">
                                        <div className="text-2xl font-bold">
                                            {queue.waitingCount}
                                        </div>
                                        <Text
                                            variant="muted"
                                            className="text-xs"
                                        >
                                            Waiting
                                        </Text>
                                    </div>
                                    <div className="text-center p-3 bg-accent/50 rounded-lg">
                                        <div className="text-2xl font-bold">
                                            {formatWaitTime(
                                                queue.averageWaitTime,
                                            )}
                                        </div>
                                        <Text
                                            variant="muted"
                                            className="text-xs"
                                        >
                                            Avg Wait
                                        </Text>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User's Position Card */}
                        {myEntry ? (
                            <Card
                                className={
                                    myEntry.entry.status === 'being_helped'
                                        ? 'ring-2 ring-primary animate-pulse'
                                        : ''
                                }
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Your Position
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-center">
                                        <Badge
                                            variant={
                                                myEntry.entry.status ===
                                                'being_helped'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="text-lg px-4 py-2"
                                        >
                                            {myEntry.entry.status ===
                                            'being_helped'
                                                ? "It's your turn!"
                                                : `Position: ${myEntry.entry.position + 1}`}
                                        </Badge>
                                    </div>

                                    {myEntry.entry.status === 'being_helped' ? (
                                        <div className="p-4 bg-primary/10 rounded-lg">
                                            <Text className="text-center font-medium">
                                                You're being helped now!
                                            </Text>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <svg
                                                className="w-5 h-5"
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
                                            <Text>
                                                {myEntry.entry.position === 0
                                                    ? "You're next!"
                                                    : `${myEntry.entry.position} ${myEntry.entry.position === 1 ? 'person' : 'people'} ahead of you`}
                                            </Text>
                                        </div>
                                    )}

                                    {myEntry.entry.notes && (
                                        <div className="p-3 bg-accent/50 rounded-lg">
                                            <Text
                                                variant="muted"
                                                className="text-xs mb-1"
                                            >
                                                Your note:
                                            </Text>
                                            <Text className="text-sm">
                                                {myEntry.entry.notes}
                                            </Text>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() =>
                                            handleLeaveQueue(myEntry.entry._id)
                                        }
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Leave Queue
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Join Queue
                                    </CardTitle>
                                    <CardDescription>
                                        {queue.isActive
                                            ? 'Enter the queue to get help'
                                            : 'This queue is currently inactive'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                            {queue.waitingCount === 1
                                                ? 'person'
                                                : 'people'}{' '}
                                            waiting
                                        </Text>
                                    </div>

                                    {showNotesInput && (
                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">
                                                What do you need help with?
                                                (optional)
                                            </label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) =>
                                                    setNotes(e.target.value)
                                                }
                                                placeholder="Brief description..."
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                                rows={3}
                                            />
                                        </div>
                                    )}

                                    {showNotesInput ? (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() =>
                                                    setShowNotesInput(false)
                                                }
                                                variant="ghost"
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleJoinQueue}
                                                className="flex-1"
                                                disabled={!queue.isActive}
                                            >
                                                Join Queue
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() =>
                                                setShowNotesInput(true)
                                            }
                                            className="w-full"
                                            disabled={!queue.isActive}
                                        >
                                            Join Queue
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
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
