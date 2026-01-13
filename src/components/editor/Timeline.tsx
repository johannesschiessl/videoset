import { useRef, useCallback, useState, useEffect } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Chapter {
  _id: Id<"chapters">;
  label: string;
  timestamp: number;
}

interface InteractionPoint {
  _id: Id<"interactionPoints">;
  timestamp: number;
  questionId: Id<"questions">;
}

interface TimelineProps {
  duration: number;
  currentTime: number;
  chapters: Chapter[];
  interactionPoints: InteractionPoint[];
  onSeek: (time: number) => void;
  onChapterClick?: (chapter: Chapter) => void;
  onInteractionClick?: (interaction: InteractionPoint) => void;
  selectedChapterId?: Id<"chapters">;
  selectedInteractionId?: Id<"interactionPoints">;
}

export function Timeline({
  duration,
  currentTime,
  chapters,
  interactionPoints,
  onSeek,
  onChapterClick,
  onInteractionClick,
  selectedChapterId,
  selectedInteractionId,
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current || duration === 0) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return (x / rect.width) * duration;
    },
    [duration],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const time = getTimeFromPosition(e.clientX);
      setHoverTime(time);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setHoverPosition(e.clientX - rect.left);
      }
      if (isDragging) {
        onSeek(time);
      }
    },
    [getTimeFromPosition, isDragging, onSeek],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      const time = getTimeFromPosition(e.clientX);
      onSeek(time);
    },
    [getTimeFromPosition, onSeek],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      window.addEventListener("mouseup", handleGlobalMouseUp);
      return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isDragging]);

  // Generate time markers
  const timeMarkers = [];
  if (duration > 0) {
    const interval = duration > 300 ? 60 : duration > 60 ? 15 : 5;
    for (let t = 0; t <= duration; t += interval) {
      timeMarkers.push(t);
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col bg-zinc-950">
        {/* Time markers */}
        <div className="relative h-6 border-b border-zinc-800 px-4">
          <div className="relative h-full">
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="absolute top-0 flex h-full flex-col items-center"
                style={{ left: `${(time / duration) * 100}%` }}
              >
                <div className="h-2 w-px bg-zinc-600" />
                <span className="mt-0.5 text-[10px] text-zinc-500">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main timeline track */}
        <div className="relative flex-1 px-4 py-3">
          <div
            ref={containerRef}
            className="relative h-12 cursor-crosshair rounded-lg bg-zinc-900"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-l-lg bg-zinc-800"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Chapter markers */}
            {chapters.map((chapter) => {
              const position = (chapter.timestamp / duration) * 100;
              const isSelected = chapter._id === selectedChapterId;
              return (
                <Tooltip key={chapter._id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChapterClick?.(chapter);
                      }}
                      className={cn(
                        "absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all",
                        isSelected && "scale-125",
                      )}
                      style={{ left: `${position}%` }}
                    >
                      <div
                        className={cn(
                          "h-8 w-1.5 rounded-full transition-all",
                          isSelected
                            ? "bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                            : "bg-blue-500 hover:bg-blue-400 hover:shadow-[0_0_8px_rgba(59,130,246,0.4)]",
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  >
                    <p className="font-medium">{chapter.label}</p>
                    <p className="text-xs text-zinc-400">
                      {formatTime(chapter.timestamp)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Interaction point markers */}
            {interactionPoints.map((point) => {
              const position = (point.timestamp / duration) * 100;
              const isSelected = point._id === selectedInteractionId;
              return (
                <Tooltip key={point._id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInteractionClick?.(point);
                      }}
                      className={cn(
                        "absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all",
                        isSelected && "scale-125",
                      )}
                      style={{ left: `${position}%` }}
                    >
                      <div
                        className={cn(
                          "h-5 w-5 rotate-45 rounded-sm transition-all",
                          isSelected
                            ? "bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                            : "bg-amber-500 hover:bg-amber-400 hover:shadow-[0_0_8px_rgba(245,158,11,0.4)]",
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  >
                    <p className="font-medium">Interaction Point</p>
                    <p className="text-xs text-zinc-400">
                      {formatTime(point.timestamp)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Playhead */}
            <div
              className="absolute top-0 z-20 h-full w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              style={{ left: `${progressPercent}%` }}
            >
              <div className="absolute -top-1 -left-1.5 h-3 w-3 rounded-full border-2 border-white bg-zinc-900" />
            </div>

            {/* Hover indicator */}
            {hoverTime !== null && !isDragging && (
              <div
                className="pointer-events-none absolute top-0 h-full"
                style={{ left: hoverPosition }}
              >
                <div className="h-full w-px bg-zinc-500/50" />
                <div className="absolute -top-6 -left-6 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                  {formatTime(hoverTime)}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="h-3 w-1 rounded-full bg-blue-500" />
              <span>Chapter</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rotate-45 rounded-sm bg-amber-500" />
              <span>Interaction</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
