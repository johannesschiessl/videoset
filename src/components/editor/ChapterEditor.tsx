import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Clock, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chapter {
  _id: Id<"chapters">;
  label: string;
  timestamp: number;
  order: number;
}

interface ChapterEditorProps {
  videoId: Id<"videos">;
  chapters: Chapter[];
  currentTime: number;
  selectedChapterId?: Id<"chapters">;
  onSelectChapter: (chapter: Chapter | null) => void;
  onSeekToChapter: (timestamp: number) => void;
}

export function ChapterEditor({
  videoId,
  chapters,
  currentTime,
  selectedChapterId,
  onSelectChapter,
  onSeekToChapter,
}: ChapterEditorProps) {
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<Id<"chapters"> | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  const createChapter = useMutation(api.chapters.createChapter);
  const updateChapter = useMutation(api.chapters.updateChapter);
  const deleteChapter = useMutation(api.chapters.deleteChapter);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    await createChapter({
      videoId,
      label: newLabel.trim(),
      timestamp: currentTime,
    });
    setNewLabel("");
  };

  const handleStartEdit = (chapter: Chapter) => {
    setEditingId(chapter._id);
    setEditingLabel(chapter.label);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingLabel.trim()) return;
    await updateChapter({
      chapterId: editingId,
      label: editingLabel.trim(),
    });
    setEditingId(null);
    setEditingLabel("");
  };

  const handleDelete = async (chapterId: Id<"chapters">) => {
    await deleteChapter({ chapterId });
    if (selectedChapterId === chapterId) {
      onSelectChapter(null);
    }
  };

  const sortedChapters = [...chapters].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  return (
    <div className="flex h-full flex-col">
      {/* Add new chapter */}
      <div className="border-b border-zinc-800 p-4">
        <Label className="mb-2 block text-xs font-medium text-zinc-400">
          Add chapter at current time ({formatTime(currentTime)})
        </Label>
        <div className="flex gap-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Chapter name..."
            className="flex-1 border-zinc-700 bg-zinc-800/50 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button
            onClick={handleCreate}
            size="sm"
            disabled={!newLabel.trim()}
            className="bg-blue-600 hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chapter list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedChapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 rounded-full bg-zinc-800 p-3">
                <Clock className="h-6 w-6 text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-500">No chapters yet</p>
              <p className="mt-1 text-xs text-zinc-600">
                Add chapters to help viewers navigate
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedChapters.map((chapter) => {
                const isSelected = chapter._id === selectedChapterId;
                const isEditing = chapter._id === editingId;

                return (
                  <div
                    key={chapter._id}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg p-2 transition-all",
                      isSelected
                        ? "bg-blue-500/20 ring-1 ring-blue-500/50"
                        : "hover:bg-zinc-800/50",
                    )}
                  >
                    <div className="cursor-grab text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <button
                      onClick={() => onSeekToChapter(chapter.timestamp)}
                      className="flex h-7 w-14 items-center justify-center rounded bg-zinc-800 font-mono text-xs text-blue-400 transition-colors hover:bg-zinc-700"
                    >
                      {formatTime(chapter.timestamp)}
                    </button>

                    {isEditing ? (
                      <Input
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditingLabel("");
                          }
                        }}
                        className="h-7 flex-1 border-zinc-600 bg-zinc-800 text-sm"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => onSelectChapter(chapter)}
                        onDoubleClick={() => handleStartEdit(chapter)}
                        className="flex-1 truncate text-left text-sm text-zinc-200"
                      >
                        {chapter.label}
                      </button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(chapter._id)}
                      className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
