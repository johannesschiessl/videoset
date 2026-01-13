import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  MessageCircleQuestion,
  Target,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractionPoint {
  _id: Id<"interactionPoints">;
  timestamp: number;
  questionId: Id<"questions">;
}

interface InteractionEditorProps {
  videoId: Id<"videos">;
  interactionPoints: InteractionPoint[];
  currentTime: number;
  duration: number;
  selectedInteractionId?: Id<"interactionPoints">;
  onSelectInteraction: (interaction: InteractionPoint | null) => void;
  onSeekToInteraction: (timestamp: number) => void;
}

export function InteractionEditor({
  videoId,
  interactionPoints,
  currentTime,
  duration,
  selectedInteractionId,
  onSelectInteraction,
  onSeekToInteraction,
}: InteractionEditorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [answers, setAnswers] = useState<
    { text: string; jumpToTimestamp: number; isCorrect: boolean }[]
  >([
    { text: "", jumpToTimestamp: 0, isCorrect: true },
    { text: "", jumpToTimestamp: 0, isCorrect: false },
  ]);

  const questions = useQuery(api.questions.getQuestions, { videoId });

  const createQuestion = useMutation(api.questions.createQuestion);
  const createInteractionPoint = useMutation(
    api.interactionPoints.createInteractionPoint,
  );
  const createAnswerOption = useMutation(api.answerOptions.createAnswerOption);
  const deleteInteractionPoint = useMutation(
    api.interactionPoints.deleteInteractionPoint,
  );
  const deleteQuestion = useMutation(api.questions.deleteQuestion);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCreateInteraction = async () => {
    if (!newQuestion.trim()) return;
    if (answers.filter((a) => a.text.trim()).length < 2) return;

    // Create question
    const questionId = await createQuestion({
      videoId,
      type: "multiple_choice",
      text: newQuestion.trim(),
    });

    // Create answer options
    for (const answer of answers) {
      if (answer.text.trim()) {
        await createAnswerOption({
          questionId,
          text: answer.text.trim(),
          jumpToTimestamp: answer.jumpToTimestamp,
          isCorrect: answer.isCorrect,
        });
      }
    }

    // Create interaction point
    await createInteractionPoint({
      videoId,
      timestamp: currentTime,
      questionId,
    });

    // Reset form
    setNewQuestion("");
    setAnswers([
      { text: "", jumpToTimestamp: 0, isCorrect: true },
      { text: "", jumpToTimestamp: 0, isCorrect: false },
    ]);
    setIsCreating(false);
  };

  const handleDeleteInteraction = async (
    interactionId: Id<"interactionPoints">,
    questionId: Id<"questions">,
  ) => {
    await deleteInteractionPoint({ interactionPointId: interactionId });
    await deleteQuestion({ questionId });
    if (selectedInteractionId === interactionId) {
      onSelectInteraction(null);
    }
  };

  const addAnswer = () => {
    setAnswers([
      ...answers,
      { text: "", jumpToTimestamp: 0, isCorrect: false },
    ]);
  };

  const removeAnswer = (index: number) => {
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const updateAnswer = (
    index: number,
    field: keyof (typeof answers)[0],
    value: string | number | boolean,
  ) => {
    setAnswers(
      answers.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  };

  const setCorrectAnswer = (index: number) => {
    setAnswers(answers.map((a, i) => ({ ...a, isCorrect: i === index })));
  };

  const sortedInteractions = [...interactionPoints].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  const getQuestionForInteraction = (questionId: Id<"questions">) => {
    return questions?.find((q) => q._id === questionId);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4">
        {isCreating ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-zinc-400">
                New interaction at {formatTime(currentTime)}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs text-zinc-500">
                Question
              </Label>
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What should the viewer choose?"
                className="min-h-[60px] resize-none border-zinc-700 bg-zinc-800/50 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Answer Options</Label>
              {answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    onClick={() => setCorrectAnswer(index)}
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      answer.isCorrect
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : "border-zinc-600 text-zinc-600 hover:border-zinc-500",
                    )}
                  >
                    {answer.isCorrect && <Check className="h-3 w-3" />}
                  </button>
                  <Input
                    value={answer.text}
                    onChange={(e) =>
                      updateAnswer(index, "text", e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border-zinc-700 bg-zinc-800/50 text-sm"
                  />
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-zinc-500" />
                    <Input
                      type="number"
                      value={answer.jumpToTimestamp}
                      onChange={(e) =>
                        updateAnswer(
                          index,
                          "jumpToTimestamp",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-16 border-zinc-700 bg-zinc-800/50 text-center text-xs"
                      min={0}
                      max={duration}
                      step={1}
                    />
                  </div>
                  {answers.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAnswer(index)}
                      className="h-6 w-6 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={addAnswer}
                className="h-7 w-full text-xs text-zinc-500 hover:text-zinc-300"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add option
              </Button>
            </div>

            <Button
              onClick={handleCreateInteraction}
              disabled={
                !newQuestion.trim() ||
                answers.filter((a) => a.text.trim()).length < 2
              }
              className="w-full bg-amber-600 hover:bg-amber-500"
            >
              Create Interaction
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full bg-amber-600 hover:bg-amber-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Interaction at {formatTime(currentTime)}
          </Button>
        )}
      </div>

      {/* Interaction list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedInteractions.length === 0 && !isCreating ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 rounded-full bg-zinc-800 p-3">
                <MessageCircleQuestion className="h-6 w-6 text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-500">No interactions yet</p>
              <p className="mt-1 text-xs text-zinc-600">
                Add interactive questions for viewers
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedInteractions.map((interaction) => {
                const question = getQuestionForInteraction(
                  interaction.questionId,
                );
                const isSelected = interaction._id === selectedInteractionId;

                return (
                  <div
                    key={interaction._id}
                    className={cn(
                      "group rounded-lg border p-3 transition-all",
                      isSelected
                        ? "border-amber-500/50 bg-amber-500/10"
                        : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          onSeekToInteraction(interaction.timestamp)
                        }
                        className="flex h-8 items-center gap-1 rounded bg-zinc-800 px-2 font-mono text-xs text-amber-400 transition-colors hover:bg-zinc-700"
                      >
                        <div className="h-2 w-2 rotate-45 rounded-sm bg-amber-500" />
                        {formatTime(interaction.timestamp)}
                      </button>

                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => onSelectInteraction(interaction)}
                          className="w-full text-left"
                        >
                          <p className="truncate text-sm text-zinc-200">
                            {question?.text || "Loading..."}
                          </p>
                          <div className="mt-1 flex items-center gap-1">
                            <Badge
                              variant="secondary"
                              className="h-5 bg-zinc-800 text-[10px]"
                            >
                              Multiple choice
                            </Badge>
                          </div>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteInteraction(
                              interaction._id,
                              interaction.questionId,
                            )
                          }
                          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-zinc-600" />
                      </div>
                    </div>
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
