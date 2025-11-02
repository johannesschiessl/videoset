import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ManagementPanel } from "@/components/ManagementPanel";
import { ChapterNavigation } from "@/components/ChapterNavigation";
import { QuestionOverlay } from "@/components/QuestionOverlay";
import { ResultsSummary } from "@/components/ResultsSummary";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/video/$videoId")({
  component: VideoPage,
});

function VideoPage() {
  const { videoId } = Route.useParams();
  const videoIdTyped = videoId as Id<"videos">;

  // Queries
  const video = useQuery(api.videos.getVideo, { videoId: videoIdTyped });
  const questionsData = useQuery(api.questions.getQuestionsByVideo, {
    videoId: videoIdTyped,
  });
  const chaptersData = useQuery(api.chapters.getChaptersByVideo, {
    videoId: videoIdTyped,
  });

  // Mutations
  const addQuestion = useMutation(api.questions.addQuestion);
  const updateQuestion = useMutation(api.questions.updateQuestion);
  const deleteQuestion = useMutation(api.questions.deleteQuestion);
  const addChapter = useMutation(api.chapters.addChapter);
  const updateChapter = useMutation(api.chapters.updateChapter);
  const deleteChapter = useMutation(api.chapters.deleteChapter);

  // Video state
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // UI state
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [showQuestionOverlay, setShowQuestionOverlay] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Map<string, number>>(
    new Map()
  );
  const [showResults, setShowResults] = useState(false);

  // Refs
  const triggeredQuestionsRef = useRef<Set<string>>(new Set());

  // Convert Convex data to component format
  const questions =
    questionsData?.map((q) => ({
      id: q._id,
      timestamp: q.timestamp,
      questionText: q.questionText,
      options: q.options,
    })) || [];

  const chapters =
    chaptersData?.map((c) => ({
      id: c._id,
      timestamp: c.timestamp,
      title: c.title,
    })) || [];

  // Handle video load
  const handleVideoLoad = (url: string, duration: number) => {
    setVideoDuration(duration);
  };

  // Handle time update
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);

    // Check if we should trigger a question
    if (!showQuestionOverlay && !showResults && isPlaying) {
      for (const question of questions) {
        if (
          !triggeredQuestionsRef.current.has(question.id) &&
          Math.abs(time - question.timestamp) < 0.5
        ) {
          setCurrentQuestion(question);
          setShowQuestionOverlay(true);
          setIsPlaying(false);
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
      const newAnswers = new Map(answeredQuestions);
      newAnswers.set(currentQuestion.id, optionIndex);
      setAnsweredQuestions(newAnswers);

      setShowQuestionOverlay(false);
      setCurrentQuestion(null);
      setCurrentTime(jumpToTimestamp);

      setTimeout(() => {
        setIsPlaying(true);
      }, 300);
    }
  };

  // Question management
  const handleAddQuestion = async (questionData: any) => {
    await addQuestion({
      videoId: videoIdTyped,
      timestamp: questionData.timestamp,
      questionText: questionData.questionText,
      options: questionData.options,
    });
  };

  const handleEditQuestion = async (id: string, questionData: any) => {
    await updateQuestion({
      questionId: id as Id<"questions">,
      timestamp: questionData.timestamp,
      questionText: questionData.questionText,
      options: questionData.options,
    });
  };

  const handleDeleteQuestion = async (id: string) => {
    await deleteQuestion({ questionId: id as Id<"questions"> });
    triggeredQuestionsRef.current.delete(id);
    const newAnswers = new Map(answeredQuestions);
    newAnswers.delete(id);
    setAnsweredQuestions(newAnswers);
  };

  // Chapter management
  const handleAddChapter = async (chapterData: any) => {
    await addChapter({
      videoId: videoIdTyped,
      timestamp: chapterData.timestamp,
      title: chapterData.title,
    });
  };

  const handleEditChapter = async (id: string, chapterData: any) => {
    await updateChapter({
      chapterId: id as Id<"chapters">,
      timestamp: chapterData.timestamp,
      title: chapterData.title,
    });
  };

  const handleDeleteChapter = async (id: string) => {
    await deleteChapter({ chapterId: id as Id<"chapters"> });
  };

  // Handle chapter click
  const handleChapterClick = (timestamp: number) => {
    setCurrentTime(timestamp);
    setIsPlaying(true);
  };

  // Handle video ended
  useEffect(() => {
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

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading video...</p>
      </div>
    );
  }

  if (!video.url) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Video not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <p className="text-muted-foreground text-sm">
              {questions.length} question{questions.length !== 1 ? "s" : ""} •{" "}
              {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            New Video
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Video Player - 2 columns on large screens */}
          <div className="space-y-4 lg:col-span-2">
            <VideoPlayer
              videoFile={null}
              videoUrl={video.url}
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
