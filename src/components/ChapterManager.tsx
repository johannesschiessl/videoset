import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export interface Chapter {
  id: string;
  timestamp: number;
  title: string;
}

interface ChapterManagerProps {
  chapters: Chapter[];
  currentTime: number;
  videoDuration: number;
  onAddChapter: (chapter: Omit<Chapter, "id">) => void;
  onEditChapter: (id: string, chapter: Omit<Chapter, "id">) => void;
  onDeleteChapter: (id: string) => void;
}

export function ChapterManager({
  chapters,
  currentTime,
  videoDuration,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
}: ChapterManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    timestamp: 0,
    title: "",
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startAdding = () => {
    setFormData({
      timestamp: Math.floor(currentTime),
      title: "",
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const startEditing = (chapter: Chapter) => {
    setFormData({
      timestamp: chapter.timestamp,
      title: chapter.title,
    });
    setEditingId(chapter.id);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      timestamp: 0,
      title: "",
    });
  };

  const saveChapter = () => {
    if (!formData.title.trim()) return;

    if (editingId) {
      onEditChapter(editingId, formData);
    } else {
      onAddChapter(formData);
    }

    cancelForm();
  };

  const sortedChapters = [...chapters].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  return (
    <>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Chapters</h2>
          <Button
            size="sm"
            onClick={startAdding}
            disabled={isAdding || editingId !== null}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Chapter
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {chapters.length} chapter{chapters.length !== 1 ? "s" : ""} added
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Chapter Form */}
        {(isAdding || editingId) && (
          <Card className="p-4 mb-4 border-primary">
            <div className="space-y-4">
              <div>
                <Label htmlFor="chapter-timestamp">Timestamp (seconds)</Label>
                <Input
                  id="chapter-timestamp"
                  type="number"
                  min={0}
                  max={videoDuration}
                  value={formData.timestamp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timestamp: parseFloat(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(formData.timestamp)}
                </p>
              </div>

              <div>
                <Label htmlFor="chapter-title">Chapter Title</Label>
                <Input
                  id="chapter-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter chapter title..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={saveChapter} className="flex-1">
                  <Check className="h-4 w-4 mr-1" />
                  {editingId ? "Update" : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelForm}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Chapters List */}
        {sortedChapters.length === 0 && !isAdding && !editingId && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No chapters yet</p>
            <p className="text-sm">Click "Add Chapter" to get started</p>
          </div>
        )}

        <div className="space-y-3">
          {sortedChapters.map((chapter, index) => (
            <Card
              key={chapter.id}
              className="p-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">
                      {formatTime(chapter.timestamp)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Chapter {index + 1}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{chapter.title}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEditing(chapter)}
                    disabled={isAdding || editingId !== null}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteChapter(chapter.id)}
                    disabled={isAdding || editingId !== null}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
