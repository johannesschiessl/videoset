import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionManager } from "./QuestionManager";
import { ChapterManager, Chapter } from "./ChapterManager";
import { Question } from "./VideoPlayer";

interface ManagementPanelProps {
  // Questions props
  questions: Question[];
  onAddQuestion: (question: Omit<Question, "id">) => void;
  onEditQuestion: (id: string, question: Omit<Question, "id">) => void;
  onDeleteQuestion: (id: string) => void;

  // Chapters props
  chapters: Chapter[];
  onAddChapter: (chapter: Omit<Chapter, "id">) => void;
  onEditChapter: (id: string, chapter: Omit<Chapter, "id">) => void;
  onDeleteChapter: (id: string) => void;

  // Shared props
  currentTime: number;
  videoDuration: number;
}

export function ManagementPanel({
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  chapters,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  currentTime,
  videoDuration,
}: ManagementPanelProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Tabs defaultValue="questions" className="flex flex-col h-full">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="questions" className="flex-1">
            Questions
          </TabsTrigger>
          <TabsTrigger value="chapters" className="flex-1">
            Chapters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="flex-1 flex flex-col m-0 overflow-hidden">
          <QuestionManager
            questions={questions}
            currentTime={currentTime}
            videoDuration={videoDuration}
            onAddQuestion={onAddQuestion}
            onEditQuestion={onEditQuestion}
            onDeleteQuestion={onDeleteQuestion}
          />
        </TabsContent>

        <TabsContent value="chapters" className="flex-1 flex flex-col m-0 overflow-hidden">
          <ChapterManager
            chapters={chapters}
            currentTime={currentTime}
            videoDuration={videoDuration}
            onAddChapter={onAddChapter}
            onEditChapter={onEditChapter}
            onDeleteChapter={onDeleteChapter}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
