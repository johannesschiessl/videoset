import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Question } from "./VideoPlayer";

interface QuestionManagerProps {
  questions: Question[];
  currentTime: number;
  videoDuration: number;
  onAddQuestion: (question: Omit<Question, "id">) => void;
  onEditQuestion: (id: string, question: Omit<Question, "id">) => void;
  onDeleteQuestion: (id: string) => void;
}

export function QuestionManager({
  questions,
  currentTime,
  videoDuration,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: QuestionManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    timestamp: 0,
    questionText: "",
    options: [
      { text: "", jumpTo: 0 },
      { text: "", jumpTo: 0 },
    ],
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startAdding = () => {
    setFormData({
      timestamp: Math.floor(currentTime),
      questionText: "",
      options: [
        { text: "", jumpTo: 0 },
        { text: "", jumpTo: 0 },
      ],
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const startEditing = (question: Question) => {
    setFormData({
      timestamp: question.timestamp,
      questionText: question.questionText,
      options: question.options,
    });
    setEditingId(question.id);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      timestamp: 0,
      questionText: "",
      options: [
        { text: "", jumpTo: 0 },
        { text: "", jumpTo: 0 },
      ],
    });
  };

  const saveQuestion = () => {
    if (!formData.questionText.trim()) return;
    if (formData.options.some((opt) => !opt.text.trim())) return;

    if (editingId) {
      onEditQuestion(editingId, formData);
    } else {
      onAddQuestion(formData);
    }

    cancelForm();
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: "", jumpTo: 0 }],
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return; // Minimum 2 options
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (
    index: number,
    field: "text" | "jumpTo",
    value: string | number
  ) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    setFormData({ ...formData, options: newOptions });
  };

  const sortedQuestions = [...questions].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Questions</h2>
          <Button
            size="sm"
            onClick={startAdding}
            disabled={isAdding || editingId !== null}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""} added
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Question Form */}
        {(isAdding || editingId) && (
          <Card className="p-4 mb-4 border-primary">
            <div className="space-y-4">
              <div>
                <Label htmlFor="timestamp">Timestamp (seconds)</Label>
                <Input
                  id="timestamp"
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
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.questionText}
                  onChange={(e) =>
                    setFormData({ ...formData, questionText: e.target.value })
                  }
                  placeholder="Enter your question..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Answer Options</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addOption}
                    disabled={formData.options.length >= 6}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option.text}
                          onChange={(e) =>
                            updateOption(index, "text", e.target.value)
                          }
                        />
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            placeholder="Jump to (seconds)"
                            min={0}
                            max={videoDuration}
                            value={option.jumpTo}
                            onChange={(e) =>
                              updateOption(
                                index,
                                "jumpTo",
                                parseFloat(e.target.value)
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(option.jumpTo)}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                        disabled={formData.options.length <= 2}
                        className="mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={saveQuestion} className="flex-1">
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

        {/* Questions List */}
        {sortedQuestions.length === 0 && !isAdding && !editingId && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No questions yet</p>
            <p className="text-sm">Click "Add Question" to get started</p>
          </div>
        )}

        <div className="space-y-3">
          {sortedQuestions.map((question) => (
            <Card
              key={question.id}
              className="p-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {formatTime(question.timestamp)}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm mb-2">
                    {question.questionText}
                  </p>
                  <div className="space-y-1">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className="text-xs text-muted-foreground flex items-center gap-2"
                      >
                        <span className="font-mono">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="flex-1 truncate">{option.text}</span>
                        <span className="text-xs">
                          → {formatTime(option.jumpTo)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEditing(question)}
                    disabled={isAdding || editingId !== null}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteQuestion(question.id)}
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
    </Card>
  );
}
