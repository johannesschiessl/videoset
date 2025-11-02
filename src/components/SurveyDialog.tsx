import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { SurveyQuestion } from "./SurveyManager";

interface SurveyDialogProps {
  isOpen: boolean;
  surveyQuestions: SurveyQuestion[];
  onSubmit: (responses: Map<string, string>) => void;
  onClose: () => void;
}

export function SurveyDialog({
  isOpen,
  surveyQuestions,
  onSubmit,
  onClose,
}: SurveyDialogProps) {
  const [responses, setResponses] = useState<Map<string, string>>(new Map());

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => {
      const newMap = new Map(prev);
      newMap.set(questionId, value);
      return newMap;
    });
  };

  const handleSubmit = () => {
    // Validate required fields
    const allRequiredAnswered = surveyQuestions
      .filter((q) => q.required)
      .every((q) => {
        const response = responses.get(q.id);
        return response && response.trim() !== "";
      });

    if (!allRequiredAnswered) {
      alert("Please answer all required questions");
      return;
    }

    onSubmit(responses);
    setResponses(new Map());
  };

  const sortedQuestions = [...surveyQuestions].sort((a, b) => a.order - b.order);

  if (surveyQuestions.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Survey</DialogTitle>
          <DialogDescription>
            Please answer the following questions
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 py-4">
            {sortedQuestions.map((question, index) => (
              <Card key={question.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Question {index + 1}</Badge>
                    {question.required && (
                      <Badge variant="outline">Required</Badge>
                    )}
                  </div>

                  <Label htmlFor={`survey-q-${question.id}`} className="text-base">
                    {question.questionText}
                  </Label>

                  {question.questionType === "text" && (
                    <Input
                      id={`survey-q-${question.id}`}
                      type="text"
                      value={responses.get(question.id) || ""}
                      onChange={(e) =>
                        handleResponseChange(question.id, e.target.value)
                      }
                      placeholder="Enter your answer..."
                      required={question.required}
                    />
                  )}

                  {question.questionType === "number" && (
                    <Input
                      id={`survey-q-${question.id}`}
                      type="number"
                      value={responses.get(question.id) || ""}
                      onChange={(e) =>
                        handleResponseChange(question.id, e.target.value)
                      }
                      placeholder="Enter a number..."
                      required={question.required}
                    />
                  )}

                  {question.questionType === "radio" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={`survey-q-${question.id}-opt-${optIndex}`}
                            name={`survey-q-${question.id}`}
                            value={option}
                            checked={responses.get(question.id) === option}
                            onChange={(e) =>
                              handleResponseChange(question.id, e.target.value)
                            }
                            required={question.required}
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor={`survey-q-${question.id}-opt-${optIndex}`}
                            className="cursor-pointer font-normal"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            <Send className="mr-2 h-4 w-4" />
            Submit Survey
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Skip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
