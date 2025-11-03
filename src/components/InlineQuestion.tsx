import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Question } from "./VideoPlayer";

interface InlineQuestionProps {
  question: Question | null;
  isVisible: boolean;
  onAnswer: (optionIndex: number, jumpToTimestamp: number) => void;
}

export function InlineQuestion({
  question,
  isVisible,
  onAnswer,
}: InlineQuestionProps) {
  if (!question || !isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 p-4">
      <Card className="w-full max-w-2xl space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold">{question.questionText}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Choose an option to continue
          </p>
        </div>

        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto justify-start p-4 text-left"
              onClick={() => onAnswer(index, option.jumpTo)}
            >
              <div className="flex w-full items-start gap-3">
                <span className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-base">{option.text}</span>
              </div>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
