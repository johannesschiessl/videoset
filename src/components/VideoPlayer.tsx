import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Question {
  id: string;
  timestamp: number;
  questionText: string;
  options: Array<{
    text: string;
    jumpTo: number;
  }>;
}

interface VideoPlayerProps {
  videoFile: File | null;
  onVideoLoad: (url: string, duration: number) => void;
  questions: Question[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

export function VideoPlayer({
  videoFile,
  onVideoLoad,
  questions,
  currentTime,
  onTimeUpdate,
  isPlaying,
  onPlayPause,
  onSeek,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Handle video file change
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);

      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    }
  }, [videoFile]);

  // Handle video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      if (videoUrl) {
        onVideoLoad(videoUrl, dur);
      }
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  // Sync playing state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Sync currentTime from props to video element
  useEffect(() => {
    if (videoRef.current) {
      const videoCurrent = videoRef.current.currentTime;
      // Only update if there's a significant difference (more than 0.5 seconds)
      // This prevents interference with normal playback
      if (Math.abs(videoCurrent - currentTime) > 0.5) {
        videoRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime]);

  // Handle seek
  const handleSliderChange = (values: number[]) => {
    const newTime = values[0];
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      onSeek(newTime);
    }
  };

  // Handle volume change
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
      if (newMuted) {
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = volume;
      }
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate marker positions
  const getMarkerPosition = (timestamp: number) => {
    if (duration === 0) return 0;
    return (timestamp / duration) * 100;
  };

  if (!videoFile) {
    return (
      <Card className="flex h-full min-h-[400px] items-center justify-center border-dashed">
        <p className="text-muted-foreground">No video selected</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoUrl || undefined}
          className="h-full w-full"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      {/* Controls */}
      <div className="space-y-3 p-4">
        {/* Timeline with markers */}
        <div className="relative">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSliderChange}
            className="cursor-pointer"
          />
          {/* Question markers */}
          <div className="pointer-events-none absolute top-0 left-0 h-2 w-full">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-primary absolute h-2 w-1 -translate-x-1/2 transform rounded-full"
                style={{ left: `${getMarkerPosition(question.timestamp)}%` }}
                title={`Question at ${formatTime(question.timestamp)}`}
              />
            ))}
          </div>
        </div>

        {/* Time display */}
        <div className="text-muted-foreground flex justify-between text-sm">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlayPause}
            className="h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <div className="ml-auto flex w-32 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
