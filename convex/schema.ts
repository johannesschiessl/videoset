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
});
