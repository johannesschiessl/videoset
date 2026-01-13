import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Videos - main project entity
  videos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(), // Better-Auth user ID
    storageId: v.optional(v.id("_storage")),
    duration: v.optional(v.number()), // seconds
    thumbnailStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("draft"),
      v.literal("processing"),
      v.literal("published"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"]),

  // Chapters - navigation points in video
  chapters: defineTable({
    videoId: v.id("videos"),
    label: v.string(),
    timestamp: v.number(), // seconds from start
    order: v.number(),
  })
    .index("by_video", ["videoId"])
    .index("by_video_order", ["videoId", "order"]),

  // Questions
  questions: defineTable({
    videoId: v.id("videos"),
    type: v.union(
      v.literal("multiple_choice"),
      v.literal("true_false"),
      v.literal("text_input"),
    ),
    text: v.string(),
    mediaStorageId: v.optional(v.id("_storage")),
  }).index("by_video", ["videoId"]),

  // Interaction points - where video pauses for questions
  interactionPoints: defineTable({
    videoId: v.id("videos"),
    timestamp: v.number(), // when to pause (seconds)
    questionId: v.id("questions"),
  })
    .index("by_video", ["videoId"])
    .index("by_video_timestamp", ["videoId", "timestamp"]),

  // Answer options for multiple choice questions
  answerOptions: defineTable({
    questionId: v.id("questions"),
    text: v.string(),
    isCorrect: v.optional(v.boolean()),
    jumpToTimestamp: v.number(), // where to jump after selection
    order: v.number(),
  })
    .index("by_question", ["questionId"])
    .index("by_question_order", ["questionId", "order"]),

  // Viewer sessions for tracking progress
  viewerSessions: defineTable({
    videoId: v.id("videos"),
    viewerId: v.optional(v.string()), // Better-Auth user ID (null for anonymous)
    startedAt: v.number(),
    lastPosition: v.number(),
    completed: v.boolean(),
    answers: v.array(
      v.object({
        questionId: v.id("questions"),
        answerOptionId: v.id("answerOptions"),
        answeredAt: v.number(),
      }),
    ),
  })
    .index("by_video", ["videoId"])
    .index("by_viewer", ["viewerId"]),
});
