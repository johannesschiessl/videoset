import { useState, useRef, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  List,
  X,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/video/$videoId")({
  component: ViewerPage,
});

type InteractionPointWithQuestion = NonNullable<
  ReturnType<
    typeof useQuery<
      typeof api.interactionPoints.getInteractionPointsWithQuestions
    >
  >
>[number];

function ViewerPage() {
  const { videoId } = Route.useParams();

  const video = useQuery(api.videos.getPublishedVideo, {
    videoId: videoId as Id<"videos">,
  });
  const videoUrl = useQuery(
    api.videos.getVideoUrl,
    video?.storageId ? { storageId: video.storageId } : "skip",
  );
  const chapters = useQuery(api.chapters.getChapters, {
    videoId: videoId as Id<"videos">,
  });
  const interactionPointsWithQuestions = useQuery(
    api.interactionPoints.getInteractionPointsWithQuestions,
    { videoId: videoId as Id<"videos"> },
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [activeInteraction, setActiveInteraction] =
    useState<InteractionPointWithQuestion | null>(null);
  const triggeredInteractionsRef = useRef<Set<string>>(new Set());
  const allowedJump = useRef(false);
  const lastAuthorizedTime = useRef(0);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Prevent unauthorized seeking
  const handleSeeking = useCallback(() => {
    if (!videoRef.current) return;
    if (!allowedJump.current) {
      videoRef.current.currentTime = lastAuthorizedTime.current;
    }
    allowedJump.current = false;
  }, []);

  // Check for interaction points during time update
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    lastAuthorizedTime.current = time;

    // Check for interaction points
    if (!interactionPointsWithQuestions || activeInteraction) return;

    const point = interactionPointsWithQuestions.find(
      (p) =>
        Math.abs(p.timestamp - time) < 0.5 &&
        !triggeredInteractionsRef.current.has(p._id),
    );

    if (point) {
      videoRef.current.pause();
      triggeredInteractionsRef.current.add(point._id);
      setActiveInteraction(point);
    }
  }, [interactionPointsWithQuestions, activeInteraction]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const jumpToChapter = useCallback((timestamp: number) => {
    if (videoRef.current) {
      allowedJump.current = true;
      videoRef.current.currentTime = timestamp;
      lastAuthorizedTime.current = timestamp;
      setCurrentTime(timestamp);
      setShowChapters(false);
    }
  }, []);

  const handleAnswerSelect = useCallback((jumpToTimestamp: number) => {
    if (videoRef.current) {
      allowedJump.current = true;
      videoRef.current.currentTime = jumpToTimestamp;
      lastAuthorizedTime.current = jumpToTimestamp;
      setCurrentTime(jumpToTimestamp);
      setActiveInteraction(null);
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
          <p className="text-sm text-zinc-500">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video.storageId || !videoUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <p className="text-lg text-zinc-400">Video not available</p>
          <p className="mt-2 text-sm text-zinc-600">
            This video may have been removed or is still processing
          </p>
        </div>
      </div>
    );
  }

  const sortedChapters = [...(chapters || [])].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950">
      {/* Video container */}
      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-5xl">
          <video
            ref={videoRef}
            src={videoUrl}
            className="aspect-video w-full rounded-lg"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onSeeking={handleSeeking}
          />

          {/* Custom controls */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16">
            {/* Time display (no scrubber) */}
            <div className="mb-3 flex items-center justify-between text-sm text-zinc-400">
              <span className="font-mono">{formatTime(currentTime)}</span>
              <div className="mx-4 h-1 flex-1 rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-white/30"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span className="font-mono">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-10 w-10 text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              <div className="flex-1" />

              {sortedChapters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChapters(true)}
                  className="text-white hover:bg-white/20"
                >
                  <List className="mr-2 h-4 w-4" />
                  Chapters
                </Button>
              )}
            </div>
          </div>

          {/* Center play button when paused */}
          {!isPlaying && !activeInteraction && (
            <button
              onClick={togglePlay}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 p-6 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30"
            >
              <Play className="h-12 w-12 text-white" fill="white" />
            </button>
          )}
        </div>
      </div>

      {/* Chapter sidebar */}
      {showChapters && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-zinc-900 shadow-2xl">
          <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
            <h2 className="font-semibold text-zinc-100">Chapters</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChapters(false)}
              className="text-zinc-400 hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-2">
            {sortedChapters.map((chapter) => (
              <button
                key={chapter._id}
                onClick={() => jumpToChapter(chapter.timestamp)}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-zinc-800"
              >
                <span className="font-mono text-sm text-blue-400">
                  {formatTime(chapter.timestamp)}
                </span>
                <span className="flex-1 text-sm text-zinc-200">
                  {chapter.label}
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interaction overlay */}
      {activeInteraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 p-8 shadow-2xl">
            <h2 className="mb-6 text-center text-2xl font-semibold text-zinc-100">
              {activeInteraction.question.text}
            </h2>
            <div className="space-y-3">
              {activeInteraction.question.answerOptions.map((option, index) => (
                <button
                  key={option._id}
                  onClick={() => handleAnswerSelect(option.jumpToTimestamp)}
                  className="flex w-full items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 text-left transition-all hover:border-amber-500/50 hover:bg-amber-500/10"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-medium text-zinc-300">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-lg text-zinc-200">{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video title */}
      <div className="p-4">
        <h1 className="text-xl font-semibold text-zinc-100">{video.title}</h1>
        {video.description && (
          <p className="mt-2 text-sm text-zinc-400">{video.description}</p>
        )}
      </div>
    </div>
  );
}
