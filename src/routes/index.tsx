import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { VideoPlayer, Question } from "@/components/VideoPlayer";
import { ManagementPanel } from "@/components/ManagementPanel";
import { ChapterNavigation } from "@/components/ChapterNavigation";
import { Chapter } from "@/components/ChapterManager";
import { QuestionOverlay } from "@/components/QuestionOverlay";
import { ResultsSummary } from "@/components/ResultsSummary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Map<string, number>
  >(new Map());

  // Chapters state
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // UI state
  const [showQuestionOverlay, setShowQuestionOverlay] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggeredQuestionsRef = useRef<Set<string>>(new Set());

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      // Reset state
      setQuestions([]);
      setChapters([]);
      setAnsweredQuestions(new Map());
      setCurrentTime(0);
      setShowResults(false);
      triggeredQuestionsRef.current.clear();
    }
  };

  // Handle video load
  const handleVideoLoad = (url: string, duration: number) => {
    setVideoUrl(url);
    setVideoDuration(duration);
  };

  // Handle time update
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);

    // Check if we should trigger a question
    if (!showQuestionOverlay && !showResults && isPlaying) {
      for (const question of questions) {
        // Check if we've reached a question timestamp (within 0.5 second tolerance)
        if (
          !triggeredQuestionsRef.current.has(question.id) &&
          Math.abs(time - question.timestamp) < 0.5
        ) {
          // Trigger the question
          setCurrentQuestion(question);
          setShowQuestionOverlay(true);
          setIsPlaying(false); // Pause the video
          triggeredQuestionsRef.current.add(question.id);
          break;
        }
      }
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle seek
  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  // Handle answer selection
  const handleAnswer = (optionIndex: number, jumpToTimestamp: number) => {
    if (currentQuestion) {
      // Record the answer
      const newAnswers = new Map(answeredQuestions);
      newAnswers.set(currentQuestion.id, optionIndex);
      setAnsweredQuestions(newAnswers);

      // Close overlay
      setShowQuestionOverlay(false);
      setCurrentQuestion(null);

      // Jump to timestamp
      setCurrentTime(jumpToTimestamp);

      // Resume playback after a short delay
      setTimeout(() => {
        setIsPlaying(true);
      }, 300);
    }
  };

  // Question management functions
  const handleAddQuestion = (questionData: Omit<Question, "id">) => {
    const newQuestion: Question = {
      ...questionData,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleEditQuestion = (
    id: string,
    questionData: Omit<Question, "id">,
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...questionData, id } : q)),
    );
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    // Remove from triggered set if present
    triggeredQuestionsRef.current.delete(id);
    // Remove from answers if present
    const newAnswers = new Map(answeredQuestions);
    newAnswers.delete(id);
    setAnsweredQuestions(newAnswers);
  };

  // Chapter management functions
  const handleAddChapter = (chapterData: Omit<Chapter, "id">) => {
    const newChapter: Chapter = {
      ...chapterData,
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setChapters([...chapters, newChapter]);
  };

  const handleEditChapter = (id: string, chapterData: Omit<Chapter, "id">) => {
    setChapters(
      chapters.map((c) => (c.id === id ? { ...chapterData, id } : c)),
    );
  };

  const handleDeleteChapter = (id: string) => {
    setChapters(chapters.filter((c) => c.id !== id));
  };

  // Handle chapter click
  const handleChapterClick = (timestamp: number) => {
    setCurrentTime(timestamp);
    setIsPlaying(true);
  };

  // Handle video ended
  useEffect(() => {
    // Check if video has ended (within 1 second of duration)
    if (
      videoDuration > 0 &&
      currentTime >= videoDuration - 1 &&
      !showResults &&
      questions.length > 0
    ) {
      setShowResults(true);
      setIsPlaying(false);
    }
  }, [currentTime, videoDuration, showResults, questions.length]);

  // Handle replay
  const handleReplay = () => {
    setCurrentTime(0);
    setShowResults(false);
    setAnsweredQuestions(new Map());
    triggeredQuestionsRef.current.clear();
    setIsPlaying(true);
  };

  // Handle close results
  const handleCloseResults = () => {
    setShowResults(false);
  };

  // Render file selection screen
  if (!videoFile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="bg-primary/10 rounded-full p-6">
                <Upload className="text-primary h-12 w-12" />
              </div>
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-bold">
                Interactive Video Player
              </h1>
              <p className="text-muted-foreground">
                Select a video file to create interactive questions
              </p>
            </div>
            <div className="pt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
              />
              <Label htmlFor="video-upload" className="cursor-pointer">
                <Button asChild className="w-full">
                  <span>Select Video File</span>
                </Button>
              </Label>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Main app layout
  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Interactive Video Player</h1>
            <p className="text-muted-foreground text-sm">{videoFile.name}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setVideoFile(null);
              setQuestions([]);
              setChapters([]);
              setAnsweredQuestions(new Map());
              setCurrentTime(0);
              setIsPlaying(false);
              setShowResults(false);
              triggeredQuestionsRef.current.clear();
            }}
          >
            Change Video
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Video Player - 2 columns on large screens */}
          <div className="space-y-4 lg:col-span-2">
            <VideoPlayer
              videoFile={videoFile}
              onVideoLoad={handleVideoLoad}
              questions={questions}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
            />

            {/* Chapter Navigation */}
            <ChapterNavigation
              chapters={chapters}
              currentTime={currentTime}
              onChapterClick={handleChapterClick}
            />
          </div>

          {/* Management Panel - 1 column on large screens */}
          <div className="lg:col-span-1">
            <ManagementPanel
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onEditQuestion={handleEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              chapters={chapters}
              onAddChapter={handleAddChapter}
              onEditChapter={handleEditChapter}
              onDeleteChapter={handleDeleteChapter}
              currentTime={currentTime}
              videoDuration={videoDuration}
            />
          </div>
        </div>
      </div>

      {/* Question Overlay */}
      <QuestionOverlay
        question={currentQuestion}
        isOpen={showQuestionOverlay}
        onAnswer={handleAnswer}
      />

      {/* Results Summary */}
      <ResultsSummary
        isOpen={showResults}
        questions={questions}
        answers={answeredQuestions}
        onReplay={handleReplay}
        onClose={handleCloseResults}
      />
    </div>
  );
}
