// This file contains example Convex functions.
// The actual application functions are in queues.ts

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// Example Query:
// export const listNumbers = query({
//     args: {
//         count: v.number(),
//     },
//     handler: async (ctx, args) => {
//         const numbers = await ctx.db
//             .query('numbers')
//             .order('desc')
//             .take(args.count)
//         return numbers
//     },
// })

// Example Mutation:
// export const addNumber = mutation({
//     args: {
//         value: v.number(),
//     },
//     handler: async (ctx, args) => {
//         const id = await ctx.db.insert('numbers', { value: args.value })
//         return id
//     },
// })

// Example Action:
// export const myAction = action({
//     args: {
//         first: v.number(),
//     },
//     handler: async (ctx, args) => {
//         const data = await ctx.runQuery(api.myFunctions.listNumbers, {
//             count: 10,
//         })
//         console.log(data)
//     },
// })
