import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ChapterNavigation } from "@/components/ChapterNavigation";
import { InlineQuestion } from "@/components/InlineQuestion";
import { InlineResults } from "@/components/InlineResults";
import { FullScreenSurvey } from "@/components/FullScreenSurvey";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/video/$videoId/")({
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
  const surveyQuestionsData = useQuery(api.surveys.getSurveyQuestionsByVideo, {
    videoId: videoIdTyped,
  });

  // Mutations
  const submitSurveyResponses = useMutation(api.surveys.submitSurveyResponses);

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
  const [showSurvey, setShowSurvey] = useState(false);

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

  const surveyQuestions =
    surveyQuestionsData?.map((sq) => ({
      id: sq._id,
      questionText: sq.questionText,
      questionType: sq.questionType,
      options: sq.options,
      required: sq.required,
      order: sq.order,
    })) || [];

  // Handle video load
  const handleVideoLoad = (url: string, duration: number) => {
    setVideoDuration(duration);
  };

  // Handle time update
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);

    // Check if we should trigger a question
    if (!showQuestionOverlay && !showResults && !showSurvey && isPlaying) {
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

  // Handle chapter click
  const handleChapterClick = (timestamp: number) => {
    setCurrentTime(timestamp);
    setIsPlaying(true);
  };

  // Handle survey submission
  const handleSurveySubmit = async (responses: Map<string, string>) => {
    const responsesArray = Array.from(responses.entries()).map(([questionId, response]) => ({
      surveyQuestionId: questionId as Id<"surveyQuestions">,
      response,
    }));

    await submitSurveyResponses({
      videoId: videoIdTyped,
      responses: responsesArray,
      sessionId: `session-${Date.now()}`,
    });

    setShowSurvey(false);
    // Optionally redirect or show a thank you message
    alert("Thank you for completing the survey!");
  };

  // Handle continue to survey
  const handleContinueToSurvey = () => {
    setShowResults(false);
    setShowSurvey(true);
  };

  // Handle video ended
  useEffect(() => {
    if (
      videoDuration > 0 &&
      currentTime >= videoDuration - 1 &&
      !showResults &&
      !showSurvey &&
      questions.length > 0
    ) {
      setShowResults(true);
      setIsPlaying(false);
    }
  }, [currentTime, videoDuration, showResults, showSurvey, questions.length]);

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

  // Show survey full screen
  if (showSurvey && surveyQuestions.length > 0) {
    return (
      <FullScreenSurvey
        surveyQuestions={surveyQuestions}
        onSubmit={handleSurveySubmit}
      />
    );
  }

  // Show results full screen
  if (showResults) {
    return (
      <div className="min-h-screen p-4">
        <InlineResults
          questions={questions}
          answers={answeredQuestions}
          hasSurvey={surveyQuestions.length > 0}
          onContinue={handleContinueToSurvey}
        />
      </div>
    );
  }

  // Main player view
  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <p className="text-muted-foreground text-sm">
              {questions.length} question{questions.length !== 1 ? "s" : ""} •{" "}
              {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = `/video/${videoId}/edit`}>
            Edit Mode
          </Button>
        </div>

        <div className="space-y-4">
          {/* Video Player with inline question overlay */}
          <div className="relative">
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

            {/* Inline Question Overlay */}
            <InlineQuestion
              question={currentQuestion}
              isVisible={showQuestionOverlay}
              onAnswer={handleAnswer}
            />
          </div>

          {/* Chapter Navigation */}
          <ChapterNavigation
            chapters={chapters}
            currentTime={currentTime}
            onChapterClick={handleChapterClick}
          />
        </div>
      </div>
    </div>
  );
}
