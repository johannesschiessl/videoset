import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Question } from "./VideoPlayer";

interface QuestionOverlayProps {
  question: Question | null;
  isOpen: boolean;
  onAnswer: (optionIndex: number, jumpToTimestamp: number) => void;
}

export function QuestionOverlay({
  question,
  isOpen,
  onAnswer,
}: QuestionOverlayProps) {
  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[500px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Question</DialogTitle>
          <DialogDescription className="sr-only">
            Answer the question to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-lg font-medium leading-relaxed">
            {question.questionText}
          </p>

          <div className="space-y-2">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onAnswer(index, option.jumpTo)}
              >
                <span className="font-mono mr-3 text-sm font-semibold">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="flex-1">{option.text}</span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
