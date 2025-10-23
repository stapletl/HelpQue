import { v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all queues, optionally filtered by active status
 * Includes count of waiting entries for each queue
 */
export const listQueues = query({
    args: {
        activeOnly: v.optional(v.boolean()),
    },
    returns: v.array(
        v.object({
            _id: v.id('queues'),
            _creationTime: v.number(),
            name: v.string(),
            description: v.optional(v.string()),
            isActive: v.boolean(),
            createdBy: v.optional(v.string()),
            createdAt: v.number(),
            waitingCount: v.number(),
        }),
    ),
    handler: async (ctx, args) => {
        let queues

        if (args.activeOnly) {
            queues = await ctx.db
                .query('queues')
                .withIndex('by_active', (q) => q.eq('isActive', true))
                .collect()
        } else {
            queues = await ctx.db.query('queues').collect()
        }

        // Get waiting count for each queue
        const queuesWithCounts = await Promise.all(
            queues.map(async (queue) => {
                const waitingCount = await ctx.db
                    .query('queueEntries')
                    .withIndex('by_queue_and_status', (q) =>
                        q.eq('queueId', queue._id).eq('status', 'waiting'),
                    )
                    .collect()

                return {
                    ...queue,
                    waitingCount: waitingCount.length,
                }
            }),
        )

        return queuesWithCounts
    },
})

/**
 * Get detailed information about a specific queue
 * Includes waiting count, total count, and average wait time
 */
export const getQueue = query({
    args: {
        queueId: v.id('queues'),
    },
    returns: v.union(
        v.object({
            _id: v.id('queues'),
            _creationTime: v.number(),
            name: v.string(),
            description: v.optional(v.string()),
            isActive: v.boolean(),
            createdBy: v.optional(v.string()),
            createdAt: v.number(),
            waitingCount: v.number(),
            totalCount: v.number(),
            averageWaitTime: v.union(v.number(), v.null()),
        }),
        v.null(),
    ),
    handler: async (ctx, args) => {
        const queue = await ctx.db.get(args.queueId)

        if (!queue) {
            return null
        }

        // Get all entries for this queue
        const allEntries = await ctx.db
            .query('queueEntries')
            .withIndex('by_queue', (q) => q.eq('queueId', args.queueId))
            .collect()

        // Count waiting entries
        const waitingEntries = allEntries.filter((e) => e.status === 'waiting')

        // Calculate average wait time from helped entries
        const helpedEntries = allEntries.filter(
            (e) => e.status === 'helped' && e.helpedAt,
        )
        let averageWaitTime: number | null = null

        if (helpedEntries.length > 0) {
            const totalWaitTime = helpedEntries.reduce((sum, entry) => {
                return sum + ((entry.helpedAt ?? entry.joinedAt) - entry.joinedAt)
            }, 0)
            averageWaitTime = totalWaitTime / helpedEntries.length
        }

        return {
            ...queue,
            waitingCount: waitingEntries.length,
            totalCount: allEntries.length,
            averageWaitTime,
        }
    },
})

/**
 * List entries in a queue, optionally filtered by status
 * Ordered by position (ascending)
 */
export const listQueueEntries = query({
    args: {
        queueId: v.id('queues'),
        status: v.optional(
            v.union(
                v.literal('waiting'),
                v.literal('being_helped'),
                v.literal('helped'),
                v.literal('cancelled'),
            ),
        ),
    },
    returns: v.array(
        v.object({
            _id: v.id('queueEntries'),
            _creationTime: v.number(),
            queueId: v.id('queues'),
            userId: v.string(),
            userName: v.string(),
            status: v.union(
                v.literal('waiting'),
                v.literal('being_helped'),
                v.literal('helped'),
                v.literal('cancelled'),
            ),
            position: v.number(),
            joinedAt: v.number(),
            helpedAt: v.optional(v.number()),
            notes: v.optional(v.string()),
        }),
    ),
    handler: async (ctx, args) => {
        let entries

        if (args.status) {
            entries = await ctx.db
                .query('queueEntries')
                .withIndex('by_queue_and_status', (q) =>
                    q.eq('queueId', args.queueId).eq('status', args.status!),
                )
                .order('asc')
                .collect()
        } else {
            entries = await ctx.db
                .query('queueEntries')
                .withIndex('by_queue', (q) => q.eq('queueId', args.queueId))
                .order('asc')
                .collect()
        }

        // Sort by position for waiting entries, otherwise by creation time
        entries.sort((a, b) => {
            if (a.status === 'waiting' && b.status === 'waiting') {
                return a.position - b.position
            }
            return a._creationTime - b._creationTime
        })

        return entries
    },
})

/**
 * Get a specific user's current position and status in a queue
 */
export const getUserPosition = query({
    args: {
        queueId: v.id('queues'),
        userId: v.string(),
    },
    returns: v.union(
        v.object({
            _id: v.id('queueEntries'),
            _creationTime: v.number(),
            queueId: v.id('queues'),
            userId: v.string(),
            userName: v.string(),
            status: v.union(
                v.literal('waiting'),
                v.literal('being_helped'),
                v.literal('helped'),
                v.literal('cancelled'),
            ),
            position: v.number(),
            joinedAt: v.number(),
            helpedAt: v.optional(v.number()),
            notes: v.optional(v.string()),
            entriesAhead: v.number(),
        }),
        v.null(),
    ),
    handler: async (ctx, args) => {
        // Find user's entry in this queue with active status
        const userEntries = await ctx.db
            .query('queueEntries')
            .withIndex('by_queue', (q) => q.eq('queueId', args.queueId))
            .collect()

        const userEntry = userEntries.find(
            (e) =>
                e.userId === args.userId &&
                (e.status === 'waiting' || e.status === 'being_helped'),
        )

        if (!userEntry) {
            return null
        }

        // Calculate entries ahead (only for waiting status)
        let entriesAhead = 0
        if (userEntry.status === 'waiting') {
            entriesAhead = userEntry.position
        }

        return {
            ...userEntry,
            entriesAhead,
        }
    },
})

/**
 * Get all queues a user is currently in
 * Only returns entries with status "waiting" or "being_helped"
 */
export const getUserQueues = query({
    args: {
        userId: v.string(),
    },
    returns: v.array(
        v.object({
            entry: v.object({
                _id: v.id('queueEntries'),
                _creationTime: v.number(),
                queueId: v.id('queues'),
                userId: v.string(),
                userName: v.string(),
                status: v.union(
                    v.literal('waiting'),
                    v.literal('being_helped'),
                    v.literal('helped'),
                    v.literal('cancelled'),
                ),
                position: v.number(),
                joinedAt: v.number(),
                helpedAt: v.optional(v.number()),
                notes: v.optional(v.string()),
            }),
            queue: v.object({
                _id: v.id('queues'),
                _creationTime: v.number(),
                name: v.string(),
                description: v.optional(v.string()),
                isActive: v.boolean(),
                createdBy: v.optional(v.string()),
                createdAt: v.number(),
            }),
        }),
    ),
    handler: async (ctx, args) => {
        const entries = await ctx.db
            .query('queueEntries')
            .withIndex('by_user', (q) => q.eq('userId', args.userId))
            .collect()

        // Filter for active entries only
        const activeEntries = entries.filter(
            (e) => e.status === 'waiting' || e.status === 'being_helped',
        )

        // Get queue information for each entry
        const entriesWithQueues = await Promise.all(
            activeEntries.map(async (entry) => {
                const queue = await ctx.db.get(entry.queueId)
                if (!queue) {
                    throw new Error(`Queue ${entry.queueId} not found`)
                }
                return {
                    entry,
                    queue,
                }
            }),
        )

        return entriesWithQueues
    },
})

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new queue (starts as active by default)
 */
export const createQueue = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        createdBy: v.optional(v.string()),
    },
    returns: v.id('queues'),
    handler: async (ctx, args) => {
        const queueId: Id<'queues'> = await ctx.db.insert('queues', {
            name: args.name,
            description: args.description,
            isActive: true,
            createdBy: args.createdBy,
            createdAt: Date.now(),
        })

        return queueId
    },
})

/**
 * Update queue properties
 */
export const updateQueue = mutation({
    args: {
        queueId: v.id('queues'),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const queue = await ctx.db.get(args.queueId)

        if (!queue) {
            throw new Error('Queue not found')
        }

        const updates: Partial<{
            name: string
            description: string | undefined
            isActive: boolean
        }> = {}

        if (args.name !== undefined) updates.name = args.name
        if (args.description !== undefined) updates.description = args.description
        if (args.isActive !== undefined) updates.isActive = args.isActive

        await ctx.db.patch(args.queueId, updates)

        return null
    },
})

/**
 * Add a user to a queue
 */
export const joinQueue = mutation({
    args: {
        queueId: v.id('queues'),
        userId: v.string(),
        userName: v.string(),
        notes: v.optional(v.string()),
    },
    returns: v.object({
        entryId: v.id('queueEntries'),
        position: v.number(),
    }),
    handler: async (ctx, args) => {
        // Verify queue exists and is active
        const queue = await ctx.db.get(args.queueId)

        if (!queue) {
            throw new Error('Queue not found')
        }

        if (!queue.isActive) {
            throw new Error('Queue is not accepting new entries')
        }

        // Check user isn't already in queue with active status
        const existingEntries = await ctx.db
            .query('queueEntries')
            .withIndex('by_queue', (q) => q.eq('queueId', args.queueId))
            .collect()

        const userInQueue = existingEntries.find(
            (e) =>
                e.userId === args.userId &&
                (e.status === 'waiting' || e.status === 'being_helped'),
        )

        if (userInQueue) {
            throw new Error('User is already in this queue')
        }

        // Calculate position (count of waiting entries)
        const waitingEntries = existingEntries.filter((e) => e.status === 'waiting')
        const position = waitingEntries.length

        // Insert entry
        const entryId: Id<'queueEntries'> = await ctx.db.insert('queueEntries', {
            queueId: args.queueId,
            userId: args.userId,
            userName: args.userName,
            status: 'waiting',
            position,
            joinedAt: Date.now(),
            notes: args.notes,
        })

        return {
            entryId,
            position,
        }
    },
})

/**
 * Remove user from queue (mark as cancelled)
 */
export const leaveQueue = mutation({
    args: {
        entryId: v.id('queueEntries'),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const entry = await ctx.db.get(args.entryId)

        if (!entry) {
            throw new Error('Queue entry not found')
        }

        // Update status to cancelled
        await ctx.db.patch(args.entryId, {
            status: 'cancelled',
        })

        // Schedule position recalculation
        await ctx.scheduler.runAfter(
            0,
            internal.queues.recalculatePositions,
            {
                queueId: entry.queueId,
            },
        )

        return null
    },
})

/**
 * Mark the next waiting person as being helped
 */
export const callNext = mutation({
    args: {
        queueId: v.id('queues'),
    },
    returns: v.union(v.id('queueEntries'), v.null()),
    handler: async (ctx, args) => {
        // Find entry with lowest position and status "waiting"
        const waitingEntries = await ctx.db
            .query('queueEntries')
            .withIndex('by_queue_and_status', (q) =>
                q.eq('queueId', args.queueId).eq('status', 'waiting'),
            )
            .collect()

        if (waitingEntries.length === 0) {
            return null
        }

        // Sort by position to get the first one
        waitingEntries.sort((a, b) => a.position - b.position)
        const nextEntry = waitingEntries[0]

        // Update status to being_helped
        await ctx.db.patch(nextEntry._id, {
            status: 'being_helped',
        })

        return nextEntry._id
    },
})

/**
 * Mark an entry as helped and complete
 */
export const markAsHelped = mutation({
    args: {
        entryId: v.id('queueEntries'),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const entry = await ctx.db.get(args.entryId)

        if (!entry) {
            throw new Error('Queue entry not found')
        }

        // Update status to helped and set helpedAt timestamp
        await ctx.db.patch(args.entryId, {
            status: 'helped',
            helpedAt: Date.now(),
        })

        // Schedule position recalculation
        await ctx.scheduler.runAfter(
            0,
            internal.queues.recalculatePositions,
            {
                queueId: entry.queueId,
            },
        )

        return null
    },
})

/**
 * Admin removal of an entry
 */
export const removeEntry = mutation({
    args: {
        entryId: v.id('queueEntries'),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const entry = await ctx.db.get(args.entryId)

        if (!entry) {
            throw new Error('Queue entry not found')
        }

        // Update status to cancelled
        await ctx.db.patch(args.entryId, {
            status: 'cancelled',
        })

        // Schedule position recalculation
        await ctx.scheduler.runAfter(
            0,
            internal.queues.recalculatePositions,
            {
                queueId: entry.queueId,
            },
        )

        return null
    },
})

// ============================================================================
// INTERNAL FUNCTIONS
// ============================================================================

/**
 * Recalculate position numbers for all waiting entries
 * This ensures positions are always sequential after removals
 */
export const recalculatePositions = internalMutation({
    args: {
        queueId: v.id('queues'),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        // Query all entries with status "waiting" ordered by joinedAt
        const waitingEntries = await ctx.db
            .query('queueEntries')
            .withIndex('by_queue_and_status', (q) =>
                q.eq('queueId', args.queueId).eq('status', 'waiting'),
            )
            .collect()

        // Sort by joinedAt to maintain FIFO order
        waitingEntries.sort((a, b) => a.joinedAt - b.joinedAt)

        // Update each entry's position to match array index
        await Promise.all(
            waitingEntries.map((entry, index) =>
                ctx.db.patch(entry._id, { position: index }),
            ),
        )

        return null
    },
})
