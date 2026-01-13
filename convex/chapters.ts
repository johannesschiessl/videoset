import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Get chapters for a video
export const getChapters = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("chapters")
      .withIndex("by_video_order", (q) => q.eq("videoId", args.videoId))
      .collect();
  },
});

// Create a chapter
export const createChapter = mutation({
  args: {
    videoId: v.id("videos"),
    label: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const video = await ctx.db.get(args.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    // Get the highest order number
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
    const maxOrder = chapters.reduce((max, c) => Math.max(max, c.order), -1);

    return ctx.db.insert("chapters", {
      videoId: args.videoId,
      label: args.label,
      timestamp: args.timestamp,
      order: maxOrder + 1,
    });
  },
});

// Update a chapter
export const updateChapter = mutation({
  args: {
    chapterId: v.id("chapters"),
    label: v.optional(v.string()),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) throw new Error("Not found");

    const video = await ctx.db.get(chapter.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    const updates: Partial<typeof chapter> = {};
    if (args.label !== undefined) updates.label = args.label;
    if (args.timestamp !== undefined) updates.timestamp = args.timestamp;

    await ctx.db.patch(args.chapterId, updates);
  },
});

// Delete a chapter
export const deleteChapter = mutation({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) throw new Error("Not found");

    const video = await ctx.db.get(chapter.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    await ctx.db.delete(args.chapterId);
  },
});

// Reorder chapters
export const reorderChapters = mutation({
  args: {
    chapterIds: v.array(v.id("chapters")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Verify ownership of all chapters
    for (let i = 0; i < args.chapterIds.length; i++) {
      const chapter = await ctx.db.get(args.chapterIds[i]);
      if (!chapter) throw new Error("Chapter not found");

      const video = await ctx.db.get(chapter.videoId);
      if (!video || video.ownerId !== user._id) throw new Error("Unauthorized");

      await ctx.db.patch(args.chapterIds[i], { order: i });
    }
  },
});
