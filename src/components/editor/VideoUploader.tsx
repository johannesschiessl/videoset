import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Upload, Film, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploaderProps {
  videoId: Id<"videos">;
  onUploadComplete?: () => void;
}

export function VideoUploader({
  videoId,
  onUploadComplete,
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveVideoFile = useMutation(api.storage.saveVideoFile);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        alert("Please upload a video file");
        return;
      }

      setIsUploading(true);
      setProgress(0);

      try {
        const uploadUrl = await generateUploadUrl();

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        await new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error("Upload failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("POST", uploadUrl);
          xhr.send(file);
        });

        const response = JSON.parse(xhr.responseText);
        const storageId = response.storageId;

        // Get video duration
        const duration = await new Promise<number>((resolve) => {
          const video = document.createElement("video");
          video.preload = "metadata";
          video.onloadedmetadata = () => {
            resolve(video.duration);
            URL.revokeObjectURL(video.src);
          };
          video.src = URL.createObjectURL(file);
        });

        await saveVideoFile({ videoId, storageId, duration });
        onUploadComplete?.();
      } catch (error) {
        console.error("Upload error:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [generateUploadUrl, saveVideoFile, videoId, onUploadComplete],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300",
        isDragging
          ? "border-blue-500 bg-blue-500/10"
          : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/80",
        isUploading && "pointer-events-none",
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {isUploading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-zinc-300">
                {progress}%
              </span>
            </div>
          </div>
          <p className="text-sm text-zinc-400">Uploading video...</p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-4 p-8">
          <div
            className={cn(
              "rounded-2xl p-4 transition-all duration-300",
              isDragging
                ? "bg-blue-500/20 text-blue-400"
                : "bg-zinc-800 text-zinc-400",
            )}
          >
            {isDragging ? (
              <Film className="h-12 w-12" />
            ) : (
              <Upload className="h-12 w-12" />
            )}
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-zinc-200">
              {isDragging
                ? "Drop your video here"
                : "Drop video or click to upload"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              MP4, WebM, or MOV up to 500MB
            </p>
          </div>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
