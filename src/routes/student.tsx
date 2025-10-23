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
import { useState, useEffect } from 'react'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/student')({
    component: StudentView,
})

function StudentView() {
    const [studentId, setStudentId] = useState<string>('')
    const [studentName, setStudentName] = useState<string>('')
    const [showSetup, setShowSetup] = useState(false)

    // Load student info from localStorage
    useEffect(() => {
        const savedId = localStorage.getItem('studentId')
        const savedName = localStorage.getItem('studentName')

        if (savedId && savedName) {
            setStudentId(savedId)
            setStudentName(savedName)
        } else {
            // Generate a random ID if none exists
            const newId = `student_${Math.random().toString(36).substr(2, 9)}`
            setStudentId(newId)
            setShowSetup(true)
        }
    }, [])

    const saveStudentInfo = (name: string) => {
        localStorage.setItem('studentId', studentId)
        localStorage.setItem('studentName', name)
        setStudentName(name)
        setShowSetup(false)
    }

    const { data: queues } = useSuspenseQuery(
        convexQuery(api.queues.listQueues, { activeOnly: true }),
    )

    const { data: myQueues } = useSuspenseQuery(
        convexQuery(api.queues.getUserQueues, { userId: studentId }),
    )

    if (showSetup || !studentName) {
        return <StudentSetup onSave={saveStudentInfo} />
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="hover:opacity-80 transition-opacity">
                            <h1 className="text-2xl font-bold">HelpQue</h1>
                        </Link>
                        <Badge variant="outline">Student View</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Text variant="muted" className="text-sm">
                            {studentName}
                        </Text>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowSetup(true)}
                        >
                            Change Name
                        </Button>
                    </div>
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
                                    <Text variant="muted" className="text-lg">
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
                                            studentId={studentId}
                                            studentName={studentName}
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
    )
}

function StudentSetup({ onSave }: { onSave: (name: string) => void }) {
    const [name, setName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSave(name.trim())
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to HelpQue</CardTitle>
                    <CardDescription>
                        Enter your name to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                Your Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Alex Smith"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                autoFocus
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Continue
                        </Button>
                        <div className="text-center">
                            <Link
                                to="/"
                                className="text-sm text-muted-foreground hover:underline"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
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
            await leaveQueue.mutateAsync({ entryId: entry._id })
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
    studentId,
    studentName,
    isInQueue,
}: {
    queue: {
        _id: Id<'queues'>
        name: string
        description?: string
        waitingCount: number
    }
    studentId: string
    studentName: string
    isInQueue: boolean
}) {
    const [notes, setNotes] = useState('')
    const [showNotes, setShowNotes] = useState(false)
    const joinQueue = useMutation(api.queues.joinQueue)

    const handleJoin = async () => {
        await joinQueue.mutateAsync({
            queueId: queue._id,
            userId: studentId,
            userName: studentName,
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
