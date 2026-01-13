import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";

// Generate an upload URL for video files
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return ctx.storage.generateUploadUrl();
  },
});

// Save the uploaded video file to a video record
export const saveVideoFile = mutation({
  args: {
    videoId: v.id("videos"),
    storageId: v.id("_storage"),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const video = await ctx.db.get(args.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    // Delete old video file if exists
    if (video.storageId) {
      await ctx.storage.delete(video.storageId);
    }

    await ctx.db.patch(args.videoId, {
      storageId: args.storageId,
      duration: args.duration,
      updatedAt: Date.now(),
    });
  },
});

// Save thumbnail
export const saveThumbnail = mutation({
  args: {
    videoId: v.id("videos"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const video = await ctx.db.get(args.videoId);
    if (!video || video.ownerId !== user._id) throw new Error("Not found");

    // Delete old thumbnail if exists
    if (video.thumbnailStorageId) {
      await ctx.storage.delete(video.thumbnailStorageId);
    }

    await ctx.db.patch(args.videoId, {
      thumbnailStorageId: args.storageId,
      updatedAt: Date.now(),
    });
  },
});
