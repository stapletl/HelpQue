import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Card, CardAction, CardFooter, CardHeader } from '~/components/ui/card'
import { Heading } from '~/components/ui/typography'

export const Route = createFileRoute('/student')({
    component: StudentPage,
})

function StudentPage() {
    const [queueId, setQueueId] = useState('')
    const [isValidating, setIsValidating] = useState(false)
    const router = useRouter()

    const queue = useQuery(
        api.queues.getQueue,
        isValidating
            ? {
                  queueId: queueId.trim() as Id<'queues'>,
              }
            : 'skip',
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!queueId.trim()) {
            toast.error('Please enter a queue ID')
            return
        }

        setIsValidating(true)

        try {
            // Try to fetch the queue to validate it exists

            if (queue) {
                // Queue exists, navigate to it
                router.navigate({ to: `/queues/${queueId.trim()}` })
            } else {
                // Queue doesn't exist
                toast.error(
                    'Queue not found. Please check the ID and try again.',
                )
            }
        } catch (error) {
            // Error occurred (likely invalid ID format or queue doesn't exist)
            toast.error('Invalid queue ID. Please check and try again.')
        } finally {
            setIsValidating(false)
        }
    }

    return (
        <div className="w-full h-screen flex items-center justify-center">
            <Card className="w-96 gap-6 py-6">
                <CardHeader>
                    <Heading variant="h3" className="text-center">
                        Join a Queue
                    </Heading>
                    <p className="text-sm text-center text-muted-foreground mt-2">
                        Enter the queue ID provided by your instructor
                    </p>
                </CardHeader>
                <CardAction className="w-full px-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="queueId"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Queue ID
                            </label>
                            <input
                                id="queueId"
                                type="text"
                                value={queueId}
                                onChange={(e) => setQueueId(e.target.value)}
                                placeholder="Enter queue ID"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                                autoFocus
                                disabled={isValidating}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isValidating || !queueId.trim()}
                        >
                            {isValidating ? 'Validating...' : 'Continue'}
                        </Button>
                    </form>
                </CardAction>
                <CardFooter className="justify-center">
                    <p className="text-xs text-center text-muted-foreground">
                        Don't have a queue ID?{' '}
                        <Link
                            to="/"
                            className="underline hover:text-foreground transition-colors"
                        >
                            Go back home
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
