import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Microphone,
  MicrophoneSlash,
  Warning,
  ArrowUp,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { MicButtonProps } from "@/types";

export function MicButton({
  isRecording,
  isProcessingSpeech,
  micPermission,
  startRecording,
  stopRecording,
  hasText,
  onSend,
}: MicButtonProps) {
  // If checking permissions
  if (micPermission === "checking") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-none hover:bg-muted-foreground/10"
        disabled={true}
      >
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </Button>
    );
  }

  // If permission is denied and no text
  if (micPermission === "denied" && !hasText) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-none hover:bg-muted-foreground/10 group relative"
        onClick={() => {
          alert(
            "Microphone access is blocked. To enable voice input:\n\n1. Click the lock/site settings icon in your browser's address bar\n2. Allow microphone access\n3. Refresh this page"
          );
        }}
        title="Microphone access denied. Click for help."
      >
        <MicrophoneSlash className="w-5 h-5 text-red-500" weight="fill" />
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Warning className="w-3 h-3 text-white" weight="bold" />
        </span>
      </Button>
    );
  }

  // If there's text, show send button
  if (hasText) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-none hover:bg-muted-foreground/10"
        onClick={onSend}
        disabled={isProcessingSpeech}
      >
        <ArrowUp className="w-5 h-5 text-foreground" weight="bold" />
      </Button>
    );
  }

  // If recording is in progress
  if (isRecording) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-none hover:bg-muted-foreground/10"
        onClick={stopRecording}
        disabled={isProcessingSpeech}
      >
        <MicrophoneSlash
          className="w-5 h-5 text-red-500 animate-pulse"
          weight="fill"
        />
      </Button>
    );
  }

  // Default microphone button (prompt or granted)
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 shrink-0 rounded-none hover:bg-muted-foreground/10",
        micPermission === "granted" && "text-green-500 hover:text-green-600"
      )}
      onClick={startRecording}
      disabled={isProcessingSpeech}
      title={
        isProcessingSpeech ? "Processing speech..." : "Start voice recording"
      }
    >
      <Microphone className="w-5 h-5" weight="fill" />
    </Button>
  );
}
