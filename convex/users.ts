import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'
import { mutation, query } from './_generated/server'

/**
 * Get the current user's information
 */
export const getCurrentUser = query({
    args: {},
    returns: v.union(
        v.object({
            _id: v.id('users'),
            _creationTime: v.number(),
            name: v.optional(v.string()),
            email: v.optional(v.string()),
            emailVerificationTime: v.optional(v.number()),
            phone: v.optional(v.string()),
            phoneVerificationTime: v.optional(v.number()),
            image: v.optional(v.string()),
            isAnonymous: v.optional(v.boolean()),
        }),
        v.null(),
    ),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            return null
        }

        const user = await ctx.db.get(userId)

        return user
    },
})

/**
 * Update the current user's name
 */
export const updateName = mutation({
    args: {
        name: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            throw new Error('Not authenticated')
        }

        await ctx.db.patch(userId, {
            name: args.name,
        })

        return null
    },
})
