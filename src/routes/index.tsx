import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.videos.generateUploadUrl);
  const createVideo = useMutation(api.videos.createVideo);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      if (!videoTitle) {
        // Auto-set title from filename
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoTitle.trim()) return;

    setIsUploading(true);
    setUploadProgress("Preparing upload...");

    try {
      // Step 1: Generate upload URL
      setUploadProgress("Generating upload URL...");
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload file to Convex storage
      setUploadProgress("Uploading video...");
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      const { storageId } = await result.json();

      // Step 3: Get video duration
      setUploadProgress("Processing video...");
      const videoDuration = await getVideoDuration(selectedFile);

      // Step 4: Create video entry in database
      setUploadProgress("Saving video...");
      const videoId = await createVideo({
        title: videoTitle,
        storageId,
        duration: videoDuration,
      });

      // Step 5: Navigate to video edit page
      setUploadProgress("Done!");
      navigate({ to: `/video/$videoId/edit`, params: { videoId } });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  // Helper function to get video duration
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-6">
              <Upload className="text-primary h-12 w-12" />
            </div>
          </div>
          <div>
            <h1 className="mb-2 text-2xl font-bold">Interactive Video Player</h1>
            <p className="text-muted-foreground">
              Upload a video to create interactive questions and chapters
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="text-left space-y-2">
              <Label htmlFor="video-title">Video Title</Label>
              <Input
                id="video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter video title..."
                disabled={isUploading}
              />
            </div>

            <div className="text-left space-y-2">
              <Label htmlFor="video-file">Video File</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-file"
                disabled={isUploading}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {selectedFile ? "Change File" : "Select File"}
                </Button>
                {selectedFile && (
                  <div className="flex-1 flex items-center text-sm text-muted-foreground truncate">
                    {selectedFile.name}
                  </div>
                )}
              </div>
            </div>

            {uploadProgress && (
              <p className="text-sm text-muted-foreground">{uploadProgress}</p>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !videoTitle.trim() || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload & Continue"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
