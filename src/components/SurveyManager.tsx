import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export interface SurveyQuestion {
  id: string;
  questionText: string;
  questionType: "text" | "number" | "radio";
  options?: string[];
  required: boolean;
  order: number;
}

interface SurveyManagerProps {
  surveyQuestions: SurveyQuestion[];
  onAddSurveyQuestion: (question: Omit<SurveyQuestion, "id">) => void;
  onEditSurveyQuestion: (id: string, question: Omit<SurveyQuestion, "id">) => void;
  onDeleteSurveyQuestion: (id: string) => void;
}

export function SurveyManager({
  surveyQuestions,
  onAddSurveyQuestion,
  onEditSurveyQuestion,
  onDeleteSurveyQuestion,
}: SurveyManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<SurveyQuestion, "id">>({
    questionText: "",
    questionType: "text",
    options: [],
    required: false,
    order: 0,
  });

  const startAdding = () => {
    setFormData({
      questionText: "",
      questionType: "text",
      options: [],
      required: false,
      order: surveyQuestions.length,
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const startEditing = (question: SurveyQuestion) => {
    setFormData({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || [],
      required: question.required,
      order: question.order,
    });
    setEditingId(question.id);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      questionText: "",
      questionType: "text",
      options: [],
      required: false,
      order: 0,
    });
  };

  const saveSurveyQuestion = () => {
    if (!formData.questionText.trim()) return;
    if (formData.questionType === "radio" && (!formData.options || formData.options.length < 2)) {
      return;
    }

    const dataToSave = {
      ...formData,
      options: formData.questionType === "radio" ? formData.options : undefined,
    };

    if (editingId) {
      onEditSurveyQuestion(editingId, dataToSave);
    } else {
      onAddSurveyQuestion(dataToSave);
    }

    cancelForm();
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...(formData.options || []), ""],
    });
  };

  const removeOption = (index: number) => {
    if ((formData.options?.length || 0) <= 2) return;
    setFormData({
      ...formData,
      options: formData.options?.filter((_, i) => i !== index) || [],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const sortedQuestions = [...surveyQuestions].sort((a, b) => a.order - b.order);

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Text";
      case "number":
        return "Number";
      case "radio":
        return "Radio";
      default:
        return type;
    }
  };

  return (
    <>
      <div className="border-b p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Survey Questions</h2>
          <Button
            size="sm"
            onClick={startAdding}
            disabled={isAdding || editingId !== null}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Question
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          {surveyQuestions.length} question{surveyQuestions.length !== 1 ? "s" : ""} added
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Survey Question Form */}
        {(isAdding || editingId) && (
          <Card className="border-primary mb-4 p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="survey-question">Question</Label>
                <Input
                  id="survey-question"
                  value={formData.questionText}
                  onChange={(e) =>
                    setFormData({ ...formData, questionText: e.target.value })
                  }
                  placeholder="Enter your question..."
                />
              </div>

              <div>
                <Label htmlFor="question-type">Question Type</Label>
                <select
                  id="question-type"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.questionType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questionType: e.target.value as "text" | "number" | "radio",
                      options: e.target.value === "radio" ? ["", ""] : [],
                    })
                  }
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="radio">Radio</option>
                </select>
              </div>

              {formData.questionType === "radio" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Options</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addOption}
                      disabled={(formData.options?.length || 0) >= 6}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Option
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeOption(index)}
                          disabled={(formData.options?.length || 0) <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required}
                  onChange={(e) =>
                    setFormData({ ...formData, required: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="required" className="cursor-pointer">
                  Required
                </Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={saveSurveyQuestion} className="flex-1">
                  <Check className="mr-1 h-4 w-4" />
                  {editingId ? "Update" : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelForm}
                  className="flex-1"
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Survey Questions List */}
        {sortedQuestions.length === 0 && !isAdding && !editingId && (
          <div className="text-muted-foreground py-8 text-center">
            <p>No survey questions yet</p>
            <p className="text-sm">Click "Add Question" to get started</p>
          </div>
        )}

        <div className="space-y-3">
          {sortedQuestions.map((question, index) => (
            <Card
              key={question.id}
              className="hover:border-primary/50 p-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary">
                      {getQuestionTypeLabel(question.questionType)}
                    </Badge>
                    {question.required && (
                      <Badge variant="outline">Required</Badge>
                    )}
                    <span className="text-muted-foreground text-xs">
                      Question {index + 1}
                    </span>
                  </div>
                  <p className="mb-2 text-sm font-medium">
                    {question.questionText}
                  </p>
                  {question.questionType === "radio" && question.options && (
                    <div className="space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className="text-muted-foreground flex items-center gap-2 text-xs"
                        >
                          <span className="font-mono">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className="flex-1 truncate">{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                    onClick={() => onDeleteSurveyQuestion(question.id)}
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
