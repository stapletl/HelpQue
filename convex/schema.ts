import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    ...authTables,

    queues: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        isActive: v.boolean(),
        createdByUserId: v.id('users'),
        createdByUserName: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index('by_active', ['isActive'])
        .index('by_creator', ['createdByUserId']),

    queueEntries: defineTable({
        queueId: v.id('queues'),
        userId: v.id('users'),
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
    })
        .index('by_queue', ['queueId'])
        .index('by_queue_and_status', ['queueId', 'status'])
        .index('by_user', ['userId']),
})
