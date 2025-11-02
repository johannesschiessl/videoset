import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, ArrowRight } from "lucide-react";
import { Question } from "./VideoPlayer";

interface ResultsSummaryProps {
  isOpen: boolean;
  questions: Question[];
  answers: Map<string, number>;
  onReplay: () => void;
  onClose: () => void;
  onContinue?: () => void;
  hasSurvey?: boolean;
}

export function ResultsSummary({
  isOpen,
  questions,
  answers,
  onReplay,
  onClose,
  onContinue,
  hasSurvey = false,
}: ResultsSummaryProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sortedQuestions = [...questions].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  const answeredCount = Array.from(answers.keys()).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Results Summary</DialogTitle>
          <DialogDescription>
            You answered {answeredCount} of {questions.length} question
            {questions.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 py-4">
            {sortedQuestions.map((question, qIndex) => {
              const answerIndex = answers.get(question.id);
              const selectedOption =
                answerIndex !== undefined
                  ? question.options[answerIndex]
                  : null;

              return (
                <Card key={question.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Question {qIndex + 1}</Badge>
                        <Badge variant="outline">
                          {formatTime(question.timestamp)}
                        </Badge>
                      </div>
                    </div>

                    <p className="font-medium">{question.questionText}</p>

                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => {
                        const isSelected = answerIndex === optIndex;

                        return (
                          <div
                            key={optIndex}
                            className={`flex items-start gap-2 rounded-md p-2 text-sm ${
                              isSelected
                                ? "bg-primary/10 border-primary/20 border"
                                : "bg-muted/50"
                            }`}
                          >
                            <span className="font-mono font-semibold">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className="flex-1">{option.text}</span>
                            {isSelected && (
                              <Badge variant="default" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {answerIndex === undefined && (
                      <p className="text-muted-foreground text-sm italic">
                        Not answered
                      </p>
                    )}

                    {selectedOption && (
                      <p className="text-muted-foreground text-sm">
                        Jumped to {formatTime(selectedOption.jumpTo)}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4">
          {hasSurvey && onContinue ? (
            <>
              <Button onClick={onContinue} className="flex-1">
                <ArrowRight className="mr-2 h-4 w-4" />
                Continue to Survey
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Skip
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onReplay} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Replay Video
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
