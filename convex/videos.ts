import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Get all videos for the current user
export const getMyVideos = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    return ctx.db
      .query("videos")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();
  },
});

// Get a single video by ID (for editing - owner only)
export const getVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return null;

    const video = await ctx.db.get(args.videoId);
    if (!video || video.ownerId !== user._id) return null;

    return video;
  },
});

// Get a published video (public - for viewer)
export const getPublishedVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video || video.status !== "published") return null;
    return video;
  },
});

// Create a new video
export const createVideo = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const now = Date.now();
    return ctx.db.insert("videos", {
      title: args.title,
      ownerId: user._id,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update video metadata
export const updateVideo = mutation({
  args: {
    videoId: v.id("videos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("processing"),
        v.literal("published"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const video = await ctx.db.get(args.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    const updates: Partial<typeof video> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.videoId, updates);
  },
});

// Delete a video and all related data
export const deleteVideo = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const video = await ctx.db.get(args.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    // Delete related chapters
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
    for (const chapter of chapters) {
      await ctx.db.delete(chapter._id);
    }

    // Delete related questions, answer options, and interaction points
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
    for (const question of questions) {
      // Delete answer options
      const options = await ctx.db
        .query("answerOptions")
        .withIndex("by_question", (q) => q.eq("questionId", question._id))
        .collect();
      for (const option of options) {
        await ctx.db.delete(option._id);
      }
      await ctx.db.delete(question._id);
    }

    // Delete interaction points
    const interactions = await ctx.db
      .query("interactionPoints")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
    for (const interaction of interactions) {
      await ctx.db.delete(interaction._id);
    }

    // Delete viewer sessions
    const sessions = await ctx.db
      .query("viewerSessions")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete video file from storage if exists
    if (video.storageId) {
      await ctx.storage.delete(video.storageId);
    }
    if (video.thumbnailStorageId) {
      await ctx.storage.delete(video.thumbnailStorageId);
    }

    // Delete the video itself
    await ctx.db.delete(args.videoId);
  },
});

// Get video file URL
export const getVideoUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return ctx.storage.getUrl(args.storageId);
  },
});
