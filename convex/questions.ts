import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all questions for a video
export const getQuestionsByVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
  },
});

// Add a question
export const addQuestion = mutation({
  args: {
    videoId: v.id("videos"),
    timestamp: v.number(),
    questionText: v.string(),
    options: v.array(
      v.object({
        text: v.string(),
        jumpTo: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("questions", {
      videoId: args.videoId,
      timestamp: args.timestamp,
      questionText: args.questionText,
      options: args.options,
    });
  },
});

// Update a question
export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    timestamp: v.number(),
    questionText: v.string(),
    options: v.array(
      v.object({
        text: v.string(),
        jumpTo: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { questionId, ...updates } = args;
    await ctx.db.patch(questionId, updates);
  },
});

// Delete a question
export const deleteQuestion = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    // Delete associated answers
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();

    for (const answer of answers) {
      await ctx.db.delete(answer._id);
    }

    // Delete question
    await ctx.db.delete(args.questionId);
  },
});
