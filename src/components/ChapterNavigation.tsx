import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chapter } from "./ChapterManager";
import { cn } from "@/lib/utils";

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentTime: number;
  onChapterClick: (timestamp: number) => void;
}

export function ChapterNavigation({
  chapters,
  currentTime,
  onChapterClick,
}: ChapterNavigationProps) {
  if (chapters.length === 0) {
    return null;
  }

  // Sort chapters by timestamp
  const sortedChapters = [...chapters].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  // Find current chapter based on currentTime
  const getCurrentChapterIndex = () => {
    for (let i = sortedChapters.length - 1; i >= 0; i--) {
      if (currentTime >= sortedChapters[i].timestamp) {
        return i;
      }
    }
    return -1;
  };

  const currentChapterIndex = getCurrentChapterIndex();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Chapters</h3>
          {currentChapterIndex >= 0 && (
            <span className="text-muted-foreground text-xs">
              Now playing: {sortedChapters[currentChapterIndex].title}
            </span>
          )}
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {sortedChapters.map((chapter, index) => {
              const isCurrent = index === currentChapterIndex;

              return (
                <Button
                  key={chapter.id}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChapterClick(chapter.timestamp)}
                  className={cn(
                    "flex h-auto flex-shrink-0 flex-col items-start gap-1 px-3 py-2",
                    isCurrent && "ring-ring ring-2 ring-offset-2",
                  )}
                >
                  <span className="text-xs opacity-70">
                    Chapter {index + 1}
                  </span>
                  <span className="text-sm font-medium">{chapter.title}</span>
                  <span className="text-xs opacity-70">
                    {formatTime(chapter.timestamp)}
                  </span>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
