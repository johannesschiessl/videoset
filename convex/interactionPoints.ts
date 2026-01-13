import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Get interaction points for a video
export const getInteractionPoints = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("interactionPoints")
      .withIndex("by_video_timestamp", (q) => q.eq("videoId", args.videoId))
      .collect();
  },
});

// Get interaction points with their questions and answer options (for viewer)
export const getInteractionPointsWithQuestions = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const interactionPoints = await ctx.db
      .query("interactionPoints")
      .withIndex("by_video_timestamp", (q) => q.eq("videoId", args.videoId))
      .collect();

    const result = await Promise.all(
      interactionPoints.map(async (ip) => {
        const question = await ctx.db.get(ip.questionId);
        if (!question) return null;

        const answerOptions = await ctx.db
          .query("answerOptions")
          .withIndex("by_question_order", (q) =>
            q.eq("questionId", ip.questionId),
          )
          .collect();

        return {
          ...ip,
          question: {
            ...question,
            answerOptions,
          },
        };
      }),
    );

    return result.filter((r): r is NonNullable<typeof r> => r !== null);
  },
});

// Create an interaction point
export const createInteractionPoint = mutation({
  args: {
    videoId: v.id("videos"),
    timestamp: v.number(),
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const video = await ctx.db.get(args.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    // Verify question belongs to this video
    const question = await ctx.db.get(args.questionId);
    if (!question || question.videoId !== args.videoId) {
      throw new Error("Question not found for this video");
    }

    return ctx.db.insert("interactionPoints", {
      videoId: args.videoId,
      timestamp: args.timestamp,
      questionId: args.questionId,
    });
  },
});

// Update an interaction point
export const updateInteractionPoint = mutation({
  args: {
    interactionPointId: v.id("interactionPoints"),
    timestamp: v.optional(v.number()),
    questionId: v.optional(v.id("questions")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const interactionPoint = await ctx.db.get(args.interactionPointId);
    if (!interactionPoint) throw new Error("Not found");

    const video = await ctx.db.get(interactionPoint.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    const updates: Partial<typeof interactionPoint> = {};
    if (args.timestamp !== undefined) updates.timestamp = args.timestamp;
    if (args.questionId !== undefined) {
      // Verify question belongs to this video
      const question = await ctx.db.get(args.questionId);
      if (!question || question.videoId !== interactionPoint.videoId) {
        throw new Error("Question not found for this video");
      }
      updates.questionId = args.questionId;
    }

    await ctx.db.patch(args.interactionPointId, updates);
  },
});

// Delete an interaction point
export const deleteInteractionPoint = mutation({
  args: { interactionPointId: v.id("interactionPoints") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const interactionPoint = await ctx.db.get(args.interactionPointId);
    if (!interactionPoint) throw new Error("Not found");

    const video = await ctx.db.get(interactionPoint.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    await ctx.db.delete(args.interactionPointId);
  },
});
