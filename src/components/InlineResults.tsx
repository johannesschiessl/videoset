import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Question } from "./VideoPlayer";

interface InlineResultsProps {
  questions: Question[];
  answers: Map<string, number>;
  hasSurvey: boolean;
  onContinue: () => void;
}

export function InlineResults({
  questions,
  answers,
  hasSurvey,
  onContinue,
}: InlineResultsProps) {
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
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Results Summary</h1>
        <p className="text-muted-foreground mt-2">
          You answered {answeredCount} of {questions.length} question
          {questions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4">
        {sortedQuestions.map((question, qIndex) => {
          const answerIndex = answers.get(question.id);
          const selectedOption =
            answerIndex !== undefined
              ? question.options[answerIndex]
              : null;

          return (
            <Card key={question.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Question {qIndex + 1}</Badge>
                    <Badge variant="outline">
                      {formatTime(question.timestamp)}
                    </Badge>
                  </div>
                </div>

                <p className="text-lg font-medium">{question.questionText}</p>

                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isSelected = answerIndex === optIndex;

                    return (
                      <div
                        key={optIndex}
                        className={`flex items-start gap-3 rounded-lg p-3 ${
                          isSelected
                            ? "bg-primary/10 border-primary/20 border-2"
                            : "bg-muted/50"
                        }`}
                      >
                        <span className="font-mono font-semibold">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <span className="flex-1">{option.text}</span>
                        {isSelected && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                {answerIndex === undefined && (
                  <p className="text-muted-foreground italic">
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

      {hasSurvey && (
        <div className="flex justify-center pt-4">
          <Button onClick={onContinue} size="lg" className="min-w-64">
            <ArrowRight className="mr-2 h-5 w-5" />
            Continue to Survey
          </Button>
        </div>
      )}
    </div>
  );
}
