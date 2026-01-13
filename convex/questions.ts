import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Get questions for a video
export const getQuestions = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("questions")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
  },
});

// Get a single question with its answer options
export const getQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) return null;

    const answerOptions = await ctx.db
      .query("answerOptions")
      .withIndex("by_question_order", (q) =>
        q.eq("questionId", args.questionId),
      )
      .collect();

    return { ...question, answerOptions };
  },
});

// Create a question
export const createQuestion = mutation({
  args: {
    videoId: v.id("videos"),
    type: v.union(
      v.literal("multiple_choice"),
      v.literal("true_false"),
      v.literal("text_input"),
    ),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const video = await ctx.db.get(args.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    return ctx.db.insert("questions", {
      videoId: args.videoId,
      type: args.type,
      text: args.text,
    });
  },
});

// Update a question
export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    text: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("multiple_choice"),
        v.literal("true_false"),
        v.literal("text_input"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Not found");

    const video = await ctx.db.get(question.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    const updates: Partial<typeof question> = {};
    if (args.text !== undefined) updates.text = args.text;
    if (args.type !== undefined) updates.type = args.type;

    await ctx.db.patch(args.questionId, updates);
  },
});

// Delete a question and its answer options
export const deleteQuestion = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Not found");

    const video = await ctx.db.get(question.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    // Delete answer options
    const options = await ctx.db
      .query("answerOptions")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();
    for (const option of options) {
      await ctx.db.delete(option._id);
    }

    // Delete interaction points referencing this question
    const interactions = await ctx.db
      .query("interactionPoints")
      .withIndex("by_video", (q) => q.eq("videoId", question.videoId))
      .collect();
    for (const interaction of interactions) {
      if (interaction.questionId === args.questionId) {
        await ctx.db.delete(interaction._id);
      }
    }

    await ctx.db.delete(args.questionId);
  },
});
