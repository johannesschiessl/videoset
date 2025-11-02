import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all survey questions for a video
export const getSurveyQuestionsByVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("surveyQuestions")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .order("asc")
      .collect();
  },
});

// Add a survey question
export const addSurveyQuestion = mutation({
  args: {
    videoId: v.id("videos"),
    questionText: v.string(),
    questionType: v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("radio")
    ),
    options: v.optional(v.array(v.string())),
    required: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("surveyQuestions", {
      videoId: args.videoId,
      questionText: args.questionText,
      questionType: args.questionType,
      options: args.options,
      required: args.required,
      order: args.order,
    });
  },
});

// Update a survey question
export const updateSurveyQuestion = mutation({
  args: {
    surveyQuestionId: v.id("surveyQuestions"),
    questionText: v.string(),
    questionType: v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("radio")
    ),
    options: v.optional(v.array(v.string())),
    required: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const { surveyQuestionId, ...updates } = args;
    await ctx.db.patch(surveyQuestionId, updates);
  },
});

// Delete a survey question
export const deleteSurveyQuestion = mutation({
  args: { surveyQuestionId: v.id("surveyQuestions") },
  handler: async (ctx, args) => {
    // Delete associated responses
    const responses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_question", (q) => q.eq("surveyQuestionId", args.surveyQuestionId))
      .collect();

    for (const response of responses) {
      await ctx.db.delete(response._id);
    }

    // Delete survey question
    await ctx.db.delete(args.surveyQuestionId);
  },
});

// Submit survey responses
export const submitSurveyResponses = mutation({
  args: {
    videoId: v.id("videos"),
    responses: v.array(
      v.object({
        surveyQuestionId: v.id("surveyQuestions"),
        response: v.string(),
      })
    ),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const responseIds = [];
    for (const response of args.responses) {
      const id = await ctx.db.insert("surveyResponses", {
        videoId: args.videoId,
        surveyQuestionId: response.surveyQuestionId,
        response: response.response,
        sessionId: args.sessionId,
      });
      responseIds.push(id);
    }
    return responseIds;
  },
});

// Get all responses for a video
export const getSurveyResponsesByVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("surveyResponses")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
  },
});
