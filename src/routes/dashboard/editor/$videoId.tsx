import { useState, useCallback } from "react";
import {
  createFileRoute,
  redirect,
  useNavigate,
  Link,
} from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { VideoUploader } from "@/components/editor/VideoUploader";
import { VideoPreview } from "@/components/editor/VideoPreview";
import { Timeline } from "@/components/editor/Timeline";
import { ChapterEditor } from "@/components/editor/ChapterEditor";
import { InteractionEditor } from "@/components/editor/InteractionEditor";
import {
  ArrowLeft,
  Save,
  Send,
  Layers,
  MessageCircleQuestion,
  Settings,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/editor/$videoId")({
  beforeLoad: async ({ context }) => {
    const session = await context.authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/auth" });
    }
  },
  component: EditorPage,
});

function EditorPage() {
  const { videoId } = Route.useParams();
  const navigate = useNavigate();

  const video = useQuery(api.videos.getVideo, {
    videoId: videoId as Id<"videos">,
  });
  const videoUrl = useQuery(
    api.videos.getVideoUrl,
    video?.storageId ? { storageId: video.storageId } : "skip",
  );
  const chapters = useQuery(api.chapters.getChapters, {
    videoId: videoId as Id<"videos">,
  });
  const interactionPoints = useQuery(
    api.interactionPoints.getInteractionPoints,
    {
      videoId: videoId as Id<"videos">,
    },
  );

  const updateVideo = useMutation(api.videos.updateVideo);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState<Id<"chapters">>();
  const [selectedInteractionId, setSelectedInteractionId] =
    useState<Id<"interactionPoints">>();
  const [activeTab, setActiveTab] = useState("chapters");

  // Initialize title when video loads
  useState(() => {
    if (video?.title && !title) {
      setTitle(video.title);
    }
  });

  const handleSave = async () => {
    await updateVideo({
      videoId: videoId as Id<"videos">,
      title: title || video?.title,
    });
  };

  const handlePublish = async () => {
    await updateVideo({
      videoId: videoId as Id<"videos">,
      status: "published",
    });
    navigate({ to: "/video/$videoId", params: { videoId } });
  };

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleDurationChange = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Separator orientation="vertical" className="h-6 bg-zinc-800" />
          <Input
            value={title || video.title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 w-64 border-transparent bg-transparent text-lg font-medium hover:border-zinc-700 focus:border-zinc-600"
            placeholder="Video title"
          />
          <Badge
            variant="outline"
            className={
              video.status === "published"
                ? "border-green-500/50 text-green-400"
                : "border-zinc-700 text-zinc-500"
            }
          >
            {video.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          {video.storageId && (
            <Button
              size="sm"
              onClick={handlePublish}
              className="bg-green-600 hover:bg-green-500"
            >
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video preview area */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex-1 overflow-hidden rounded-xl bg-zinc-900">
            {video.storageId && videoUrl ? (
              <VideoPreview
                src={videoUrl}
                currentTime={currentTime}
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={handleDurationChange}
                onSeek={handleSeek}
              />
            ) : (
              <VideoUploader
                videoId={videoId as Id<"videos">}
                onUploadComplete={() => {}}
              />
            )}
          </div>
        </div>

        {/* Properties panel */}
        <div className="w-80 shrink-0 border-l border-zinc-800 bg-zinc-900/50">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full flex-col"
          >
            <TabsList className="h-12 w-full justify-start gap-1 rounded-none border-b border-zinc-800 bg-transparent px-2">
              <TabsTrigger
                value="chapters"
                className="gap-2 data-[state=active]:bg-zinc-800"
              >
                <Layers className="h-4 w-4" />
                Chapters
              </TabsTrigger>
              <TabsTrigger
                value="interactions"
                className="gap-2 data-[state=active]:bg-zinc-800"
              >
                <MessageCircleQuestion className="h-4 w-4" />
                Interactions
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="gap-2 data-[state=active]:bg-zinc-800"
              >
                <Settings className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="chapters"
              className="mt-0 flex-1 overflow-hidden"
            >
              <ChapterEditor
                videoId={videoId as Id<"videos">}
                chapters={chapters || []}
                currentTime={currentTime}
                selectedChapterId={selectedChapterId}
                onSelectChapter={(chapter) =>
                  setSelectedChapterId(chapter?._id)
                }
                onSeekToChapter={handleSeek}
              />
            </TabsContent>

            <TabsContent
              value="interactions"
              className="mt-0 flex-1 overflow-hidden"
            >
              <InteractionEditor
                videoId={videoId as Id<"videos">}
                interactionPoints={interactionPoints || []}
                currentTime={currentTime}
                duration={duration}
                selectedInteractionId={selectedInteractionId}
                onSelectInteraction={(interaction) =>
                  setSelectedInteractionId(interaction?._id)
                }
                onSeekToInteraction={handleSeek}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">
                    Description
                  </label>
                  <textarea
                    className="h-24 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800/50 p-2 text-sm focus:border-zinc-600 focus:outline-none"
                    placeholder="Add a description..."
                    defaultValue={video.description || ""}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Timeline */}
      <div className="h-36 shrink-0 border-t border-zinc-800">
        {video.storageId ? (
          <Timeline
            duration={duration}
            currentTime={currentTime}
            chapters={chapters || []}
            interactionPoints={interactionPoints || []}
            onSeek={handleSeek}
            onChapterClick={(chapter) => {
              setSelectedChapterId(chapter._id);
              setActiveTab("chapters");
            }}
            onInteractionClick={(interaction) => {
              setSelectedInteractionId(interaction._id);
              setActiveTab("interactions");
            }}
            selectedChapterId={selectedChapterId}
            selectedInteractionId={selectedInteractionId}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            Upload a video to see the timeline
          </div>
        )}
      </div>
    </div>
  );
}
