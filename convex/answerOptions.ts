import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Get answer options for a question
export const getAnswerOptions = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("answerOptions")
      .withIndex("by_question_order", (q) =>
        q.eq("questionId", args.questionId),
      )
      .collect();
  },
});

// Create an answer option
export const createAnswerOption = mutation({
  args: {
    questionId: v.id("questions"),
    text: v.string(),
    jumpToTimestamp: v.number(),
    isCorrect: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    const video = await ctx.db.get(question.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    // Get the highest order number
    const options = await ctx.db
      .query("answerOptions")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();
    const maxOrder = options.reduce((max, o) => Math.max(max, o.order), -1);

    return ctx.db.insert("answerOptions", {
      questionId: args.questionId,
      text: args.text,
      jumpToTimestamp: args.jumpToTimestamp,
      isCorrect: args.isCorrect,
      order: maxOrder + 1,
    });
  },
});

// Update an answer option
export const updateAnswerOption = mutation({
  args: {
    answerOptionId: v.id("answerOptions"),
    text: v.optional(v.string()),
    jumpToTimestamp: v.optional(v.number()),
    isCorrect: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const answerOption = await ctx.db.get(args.answerOptionId);
    if (!answerOption) throw new Error("Not found");

    const question = await ctx.db.get(answerOption.questionId);
    if (!question) throw new Error("Question not found");

    const video = await ctx.db.get(question.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    const updates: Partial<typeof answerOption> = {};
    if (args.text !== undefined) updates.text = args.text;
    if (args.jumpToTimestamp !== undefined)
      updates.jumpToTimestamp = args.jumpToTimestamp;
    if (args.isCorrect !== undefined) updates.isCorrect = args.isCorrect;

    await ctx.db.patch(args.answerOptionId, updates);
  },
});

// Delete an answer option
export const deleteAnswerOption = mutation({
  args: { answerOptionId: v.id("answerOptions") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const answerOption = await ctx.db.get(args.answerOptionId);
    if (!answerOption) throw new Error("Not found");

    const question = await ctx.db.get(answerOption.questionId);
    if (!question) throw new Error("Question not found");

    const video = await ctx.db.get(question.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    await ctx.db.delete(args.answerOptionId);
  },
});

// Reorder answer options
export const reorderAnswerOptions = mutation({
  args: {
    answerOptionIds: v.array(v.id("answerOptions")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    for (let i = 0; i < args.answerOptionIds.length; i++) {
      const answerOption = await ctx.db.get(args.answerOptionIds[i]);
      if (!answerOption) throw new Error("Answer option not found");

      const question = await ctx.db.get(answerOption.questionId);
      if (!question) throw new Error("Question not found");

      const video = await ctx.db.get(question.videoId);
      if (!video || video.ownerId !== user._id) throw new Error("Unauthorized");

      await ctx.db.patch(args.answerOptionIds[i], { order: i });
    }
  },
});
