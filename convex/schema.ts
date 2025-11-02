import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  videos: defineTable({
    title: v.string(),
    storageId: v.id("_storage"),
    duration: v.number(),
  }),

  questions: defineTable({
    videoId: v.id("videos"),
    timestamp: v.number(),
    questionText: v.string(),
    options: v.array(
      v.object({
        text: v.string(),
        jumpTo: v.number(),
      })
    ),
  }).index("by_video", ["videoId"]),

  chapters: defineTable({
    videoId: v.id("videos"),
    timestamp: v.number(),
    title: v.string(),
  })
    .index("by_video", ["videoId"])
    .index("by_video_timestamp", ["videoId", "timestamp"]),

  answers: defineTable({
    videoId: v.id("videos"),
    questionId: v.id("questions"),
    selectedOptionIndex: v.number(),
  })
    .index("by_video", ["videoId"])
    .index("by_question", ["questionId"]),

  surveyQuestions: defineTable({
    videoId: v.id("videos"),
    questionText: v.string(),
    questionType: v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("radio")
    ),
    options: v.optional(v.array(v.string())), // For radio type
    required: v.boolean(),
    order: v.number(),
  }).index("by_video", ["videoId"]),

  surveyResponses: defineTable({
    videoId: v.id("videos"),
    surveyQuestionId: v.id("surveyQuestions"),
    response: v.string(),
    sessionId: v.optional(v.string()), // To group responses from same session
  })
    .index("by_video", ["videoId"])
    .index("by_question", ["surveyQuestionId"])
    .index("by_session", ["sessionId"]),
});
