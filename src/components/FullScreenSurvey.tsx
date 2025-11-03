import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { SurveyQuestion } from "./SurveyManager";

interface FullScreenSurveyProps {
  surveyQuestions: SurveyQuestion[];
  onSubmit: (responses: Map<string, string>) => void;
}

export function FullScreenSurvey({
  surveyQuestions,
  onSubmit,
}: FullScreenSurveyProps) {
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
  };

  const sortedQuestions = [...surveyQuestions].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Survey</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Please answer the following questions
          </p>
        </div>

        <div className="space-y-6">
          {sortedQuestions.map((question, index) => (
            <Card key={question.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    Question {index + 1}
                  </Badge>
                  {question.required && (
                    <Badge variant="outline" className="text-sm">
                      Required
                    </Badge>
                  )}
                </div>

                <Label htmlFor={`survey-q-${question.id}`} className="text-xl font-medium">
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
                    className="text-base"
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
                    className="text-base"
                  />
                )}

                {question.questionType === "radio" && question.options && (
                  <div className="space-y-3">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
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
                          className="h-5 w-5 cursor-pointer"
                        />
                        <Label
                          htmlFor={`survey-q-${question.id}-opt-${optIndex}`}
                          className="flex-1 cursor-pointer text-base font-normal"
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

        <div className="flex justify-center pt-4">
          <Button onClick={handleSubmit} size="lg" className="min-w-64">
            <Send className="mr-2 h-5 w-5" />
            Submit Survey
          </Button>
        </div>
      </div>
    </div>
  );
}
