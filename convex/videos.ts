import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate upload URL for video
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Create a new video
export const createVideo = mutation({
  args: {
    title: v.string(),
    storageId: v.id("_storage"),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const videoId = await ctx.db.insert("videos", {
      title: args.title,
      storageId: args.storageId,
      duration: args.duration,
    });
    return videoId;
  },
});

// Get video by ID
export const getVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) return null;

    const url = await ctx.storage.getUrl(video.storageId);
    return { ...video, url };
  },
});

// Get all videos
export const listVideos = query({
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").order("desc").collect();
    return Promise.all(
      videos.map(async (video) => ({
        ...video,
        url: await ctx.storage.getUrl(video.storageId),
      }))
    );
  },
});

// Delete video
export const deleteVideo = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    // Delete associated questions
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();

    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    // Delete associated chapters
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();

    for (const chapter of chapters) {
      await ctx.db.delete(chapter._id);
    }

    // Delete associated answers
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();

    for (const answer of answers) {
      await ctx.db.delete(answer._id);
    }

    // Delete video
    const video = await ctx.db.get(args.videoId);
    if (video) {
      await ctx.storage.delete(video.storageId);
      await ctx.db.delete(args.videoId);
    }
  },
});
