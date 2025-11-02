import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all chapters for a video
export const getChaptersByVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chapters")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
  },
});

// Add a chapter
export const addChapter = mutation({
  args: {
    videoId: v.id("videos"),
    timestamp: v.number(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chapters", {
      videoId: args.videoId,
      timestamp: args.timestamp,
      title: args.title,
    });
  },
});

// Update a chapter
export const updateChapter = mutation({
  args: {
    chapterId: v.id("chapters"),
    timestamp: v.number(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { chapterId, ...updates } = args;
    await ctx.db.patch(chapterId, updates);
  },
});

// Delete a chapter
export const deleteChapter = mutation({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.chapterId);
  },
});
