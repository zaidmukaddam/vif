"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { format } from "date-fns";
import {
  List,
  DotsThree,
  Plus,
  NotePencil,
  Sparkle,
  X,
  CaretDown,
  Clock,
  TextAa,
  CheckCircle,
  Trash,
  Broom,
  SmileySad,
  Smiley,
  Check,
  ArrowUp,
  ArrowDown,
  PencilSimple,
  Microphone,
  MicrophoneSlash,
  Warning
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { determineAction, convertSpeechToText } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { useMicrophonePermission } from "@/hooks/use-microphone-permission";

// Custom circular checkbox component
function CircleCheckbox({
  checked,
  onCheckedChange,
  className,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "h-[18px] w-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-transparent hover:border-muted-foreground/50",
        className
      )}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current transition-transform duration-200 ease-in-out scale-100 origin-center">
        <div className="h-[8px] w-[8px] rounded-full bg-white animate-in zoom-in-50 duration-200" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  emoji?: string;
  date: Date;
}

// Helper function to ensure Date objects are properly serialized
const serializeTodo = (todo: TodoItem): TodoItem => {
  // If date is already a Date object, return the todo as is
  if (todo.date instanceof Date) {
    return todo;
  }

  // If date is a string, convert it to a Date object
  return {
    ...todo,
    date: new Date(todo.date)
  };
};

type SortOption = "newest" | "oldest" | "alphabetical" | "completed";

interface CircularProgressProps {
  progress: number;
  size?: number;
}

function CircularProgress({ progress, size = 20 }: CircularProgressProps) {
  const strokeWidth = 1.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getProgressColor = () => {
    if (progress === 100) return "text-green-500";
    if (progress > 0) return "text-blue-500";
    return "text-muted-foreground";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          className="text-muted-foreground/15"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn(
            getProgressColor(),
            "transition-all duration-300 ease-in-out"
          )}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
    </div>
  );
}

function TodoSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center px-4 py-2.5 gap-3">
          <Skeleton className="h-[18px] w-[18px] rounded-[4px]" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function InputLoadingIndicator() {
  return (
    <div className="flex items-center justify-center p-1">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    </div>
  );
}

// Custom hook for localStorage sync
function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with stored value or initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item, (key, value) => {
        if (key === "date") return new Date(value);
        return value;
      });
      return parsed.map((item: any) => serializeTodo(item));
    } catch (error) {
      console.error("Failed to parse localStorage:", error);
      return initialValue;
    }
  });

  // Return wrapped version of useState's setter function
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(valueToStore, (key, value) => {
          if (key === "date" && value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }));
      }
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

export default function Todo() {
  const [isLoading, setIsLoading] = useState(false);
  const [todos, setTodos] = useLocalStorage<TodoItem[]>("todos", []);
  const [newTodo, setNewTodo] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmoji, setSelectedEmoji] = useState<string>("😊");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const micPermission = useMicrophonePermission();

  // Add effect to detect mobile screens
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Simplified startRecording function
  const startRecording = async () => {
    // Don't try to record if we're already recording or processing
    if (isRecording || isProcessingSpeech) return;
    
    // Always clean up any existing recorder first
    if (mediaRecorder) {
      try {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      } catch (e) {
        console.error("Error cleaning up previous recorder:", e);
      }
    }
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Find best supported audio format
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', ''];
      let recorder = null;
      
      for (const type of mimeTypes) {
        if (!type || MediaRecorder.isTypeSupported(type)) {
          try {
            recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
            break;
          } catch (e) {
            console.warn(`Failed to create recorder with mime type ${type}:`, e);
          }
        }
      }
      
      if (!recorder) {
        throw new Error("Could not create MediaRecorder with any supported format");
      }
      
      // Set up the new recorder
      setMediaRecorder(recorder);
      setAudioChunks([]);
      
      // Set up data handling
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(chunks => [...chunks, e.data]);
        }
      };
      
      // Set up error handling
      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      recorder.start(250); // Collect data in small chunks
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      
      // Show help for denied permission 
      if (error instanceof DOMException && 
          (error.name === "NotAllowedError" || error.name === "PermissionDeniedError")) {
        alert("Microphone access was denied. Please enable microphone access in your browser settings to use voice input.");
      } else {
        // Other type of error
        alert("Could not start recording. Please check your microphone or try a different browser.");
      }
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder || !isRecording) return;
    
    try {
      // Ensure we've collected some audio data
      if (audioChunks.length === 0) {
        mediaRecorder.requestData();
        // Small delay to allow data to be collected
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Set up the onstop handler
      mediaRecorder.onstop = async () => {
        try {
          // Process the collected audio
          if (audioChunks.length === 0) {
            console.warn("No audio data collected");
            return;
          }
          
          const audioBlob = new Blob(audioChunks, { 
            type: mediaRecorder.mimeType || "audio/webm" 
          });
          
          if (audioBlob.size > 0) {
            setIsProcessingSpeech(true);
            await processSpeechToText(audioBlob);
          } else {
            console.warn("Empty audio blob");
          }
        } catch (error) {
          console.error("Error processing recording:", error);
        } finally {
          setIsProcessingSpeech(false);
        }
      };
      
      // Stop recording and tracks
      mediaRecorder.stop();
      // Don't stop tracks until after processing is complete
      
      // Update UI state immediately
      setIsRecording(false);
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
      setIsProcessingSpeech(false);
      
      // Clean up tracks if there was an error
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const processSpeechToText = async (audioBlob: Blob) => {
    setIsProcessingSpeech(true);
    
    try {
      console.log("Processing audio:", {
        type: audioBlob.type,
        size: audioBlob.size
      });
      
      // Create a file with the appropriate extension based on MIME type
      let filename = "recording.webm";
      let fileType = audioBlob.type || "audio/webm";
      
      if (fileType.includes("mp4")) {
        filename = "recording.mp4";
      } else if (fileType.includes("ogg")) {
        filename = "recording.ogg";
      } else if (fileType.includes("wav")) {
        filename = "recording.wav";
      }
      
      // Create File object to be serialized over the network
      // This becomes a plain object during the server action call
      const audioFile = new File([audioBlob], filename, { 
        type: fileType
      });
      
      console.log("Audio file prepared:", {
        name: audioFile.name,
        type: audioFile.type,
        size: audioFile.size
      });
      
      // Call the server action with the File object
      const text = await convertSpeechToText(audioFile);
      console.log("Got text response:", text);
      
      if (text) {
        setNewTodo(text);
      } else {
        alert("Sorry, no speech was detected. Please try again.");
      }
    } catch (error) {
      console.error("Error converting speech to text:", error);
      alert("Sorry, we couldn't convert your speech to text. Please try again.");
    } finally {
      setIsProcessingSpeech(false);
    }
  };

  // Create a memoized handler for input changes
  const handleEditInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const newValue = input.value;
    const newPosition = input.selectionStart;

    setEditText(newValue);
    // Schedule cursor position update after state change
    requestAnimationFrame(() => {
      if (input && newPosition !== null) {
        input.setSelectionRange(newPosition, newPosition);
      }
    });
  }, []);

  const filteredTodos = todos.filter(
    (todo) => format(todo.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.id.localeCompare(a.id);
      case "oldest":
        return a.id.localeCompare(b.id);
      case "alphabetical":
        return a.text.localeCompare(b.text);
      case "completed":
        return Number(b.completed) - Number(a.completed);
      default:
        return 0;
    }
  });

  const completedCount = filteredTodos.filter((todo) => todo.completed).length;
  const remainingCount = filteredTodos.filter((todo) => !todo.completed).length;

  const progress = filteredTodos.length > 0
    ? Math.round((completedCount / filteredTodos.length) * 100)
    : 0;

  const handleAction = async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setNewTodo("");

    try {
      const action = await determineAction(text, selectedEmoji || "", filteredTodos);

      switch (action.action) {
        case "add":
          setTodos([
            ...todos,
            serializeTodo({
              id: Math.random().toString(36).substring(7),
              text: action.text || text,
              completed: false,
              emoji: action.emoji || selectedEmoji,
              date: selectedDate,
            }),
          ]);
          break;

        case "delete":
          const todoToDelete = todos.find(
            todo => todo.text.toLowerCase().includes(action.text?.toLowerCase() || "")
          );
          if (todoToDelete) {
            setTodos(todos.filter(todo => todo.id !== todoToDelete.id));
          }
          break;

        case "complete":
          const todoToComplete = todos.find(
            todo => todo.text.toLowerCase().includes(action.text?.toLowerCase() || "")
          );
          if (todoToComplete) {
            setTodos(
              todos.map(todo =>
                todo.id === todoToComplete.id ? { ...todo, completed: !todo.completed } : todo
              )
            );
          }
          break;

        case "sort":
          if (action.sortBy) {
            setSortBy(action.sortBy);
          }
          break;

        case "edit":
          if (action.targetText && action.text) {
            const todoToEdit = todos.find(
              todo => todo.text.toLowerCase().includes(action.targetText?.toLowerCase() || "")
            );
            console.log("AI editing todo:", {
              targetText: action.targetText,
              newText: action.text,
              foundTodo: todoToEdit
            });

            if (todoToEdit) {
              setTodos(
                todos.map(todo => {
                  if (todo.id === todoToEdit.id) {
                    const updatedTodo = serializeTodo({ ...todo, text: action.text || "" });
                    console.log("AI updated todo:", updatedTodo);
                    return updatedTodo;
                  }
                  return todo;
                })
              );
            }
          }
          break;
      }
    } catch (error) {
      console.error("AI Action failed:", error);
      setTodos([
        ...todos,
        serializeTodo({
          id: Math.random().toString(36).substring(7),
          text,
          completed: false,
          emoji: selectedEmoji,
          date: selectedDate,
        }),
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${format(date, "EEE, d MMM")}`;
    } else {
      return format(date, "EEE, d MMM");
    }
  };

  const startEditing = (id: string, text: string) => {
    setEditingTodoId(id);
    setEditText(text);
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditText("");
  };

  const handleEditTodo = (id: string) => {
    if (editText.trim()) {
      const originalTodo = todos.find(todo => todo.id === id);
      console.log("Editing todo:", { originalTodo, newText: editText });

      setTodos(
        todos.map((todo) => {
          if (todo.id === id) {
            const updatedTodo = serializeTodo({ ...todo, text: editText });
            console.log("Updated todo:", updatedTodo);
            return updatedTodo;
          }
          return todo;
        })
      );
    }
    setEditingTodoId(null);
    setEditText("");
  };

  const TodoList = ({ todos }: { todos: TodoItem[] }) => {
    return todos.map((todo) => (
      <div
        key={todo.id}
        className={cn(
          "group flex items-center px-4 py-2.5 gap-3",
          todo.completed ? "text-muted-foreground/50" : "hover:bg-muted/50",
          editingTodoId === todo.id && "bg-muted/50",
          "transition-colors"
        )}
      >
        {editingTodoId === todo.id ? (
          <>
            <div className="flex-1 flex items-center gap-2">
              <Input
                ref={editInputRef}
                value={editText}
                onChange={handleEditInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditTodo(todo.id);
                  } else if (e.key === "Escape") {
                    cancelEditing();
                  }
                }}
                autoFocus
                className="flex-1 h-9 py-0 text-sm bg-transparent border-0 shadow-none focus-visible:ring-0 px-0"
                placeholder="Edit todo..."
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted-foreground/10"
                onClick={() => handleEditTodo(todo.id)}
              >
                <Check className="w-4 h-4" weight="bold" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <CircleCheckbox
              checked={todo.completed}
              onCheckedChange={() => toggleTodo(todo.id)}
              className={cn(
                todo.completed
                  ? "border-muted-foreground/50 bg-muted-foreground/20"
                  : "hover:border-muted-foreground/70"
              )}
            />
            <div className="flex-1 flex items-center min-w-0">
              {todo.emoji && (
                <span className="mr-2 text-base flex-shrink-0">{todo.emoji}</span>
              )}
              <span className={cn(
                "truncate text-[15px]",
                todo.completed && "line-through"
              )}>
                {todo.text}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => startEditing(todo.id, todo.text)}
            >
              <PencilSimple className="w-4 h-4" weight="bold" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => deleteTodo(todo.id)}
            >
              <X className="w-4 h-4" weight="bold" />
            </Button>
          </>
        )}
      </div>
    ));
  };

  // Common FAQ content component to reuse in both Dialog and Drawer
  const FaqContent = () => (
    <div className="space-y-6 p-2">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basics</h3>
        <div className="space-y-4">
          <div className="space-y-1.5 bg-muted/50 p-3 rounded-xl">
            <h4 className="font-medium text-[15px]">How do I create a new todo?</h4>
            <p className="text-sm text-muted-foreground">
              Type your todo in the input field at the bottom and press Enter. You can also use voice input by clicking the microphone icon.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3 rounded-xl">
            <h4 className="font-medium text-[15px]">How do I edit a task?</h4>
            <p className="text-sm text-muted-foreground">
              Hover over any task and click the pencil icon that appears to edit it.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3 rounded-xl">
            <h4 className="font-medium text-[15px]">What happens to completed tasks?</h4>
            <p className="text-sm text-muted-foreground">
              They remain in your list but are marked as complete. You can clear all completed tasks from the list menu.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Features</h3>
        <div className="space-y-4">
          <div className="space-y-1.5 bg-muted/50 p-3 rounded-xl">
            <h4 className="font-medium text-[15px]">Can I add emojis to my todos?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! Click the emoji button next to the input field to open the emoji picker.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3 rounded-xl">
            <h4 className="font-medium text-[15px]">How do I sort my todos?</h4>
            <p className="text-sm text-muted-foreground">
              Click the list icon on the left side of the input field to access sorting options.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3 rounded-xl">
            <h4 className="font-medium text-[15px]">How do I set a due date?</h4>
            <p className="text-sm text-muted-foreground">
              Click on the date at the top of the screen to open the calendar, then select your desired date.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Voice & AI</h3>
        <div className="space-y-4">
          <div className="space-y-1.5 bg-muted/50 p-3 rounded-xl">
            <h4 className="font-medium text-[15px]">Can I use voice commands?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! Try saying "Add buy groceries" or "Complete buy milk" to automatically perform those actions.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3 rounded-xl">
            <h4 className="font-medium text-[15px]">What voice commands are supported?</h4>
            <p className="text-sm text-muted-foreground">
              You can say "Add [task]", "Complete [task]", "Delete [task]", "Edit [task] to [new task]", and "Sort by [criterion]".
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3 rounded-xl">
            <h4 className="font-medium text-[15px]">Why isn't my microphone working?</h4>
            <p className="text-sm text-muted-foreground">
              Make sure you've granted microphone permissions to the app in your browser settings. If the icon is red, it means permission was denied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Get the appropriate microphone button based on state
  const MicButton = () => {
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
          <MicrophoneSlash className="w-5 h-5 text-red-500 animate-pulse" weight="fill" />
        </Button>
      );
    }
    
    // If permission is denied
    if (micPermission === "denied") {
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-none hover:bg-muted-foreground/10 group relative"
          onClick={() => {
            alert("Microphone access is blocked. To enable voice input:\n\n1. Click the lock/site settings icon in your browser's address bar\n2. Allow microphone access\n3. Refresh this page");
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
        title={isProcessingSpeech ? "Processing speech..." : "Start voice recording"}
      >
        <Microphone className="w-5 h-5" weight="fill" />
      </Button>
    );
  };

  return (
    <div className="max-w-md w-full mx-auto p-4 space-y-4 pb-24">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="!p-1 font-semibold text-2xl hover:no-underline flex items-center gap-1">
                {formatDate(selectedDate)}
                <CaretDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <CircularProgress progress={progress} />
        </div>
        <div className="!ml-1.5 text-sm text-muted-foreground flex items-center gap-1">
          <span>{remainingCount} To Dos</span>
          {completedCount > 0 && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground/50">{completedCount} Completed</span>
            </>
          )}
        </div>
      </div>
      
      <div className="-mx-4">
        <Suspense fallback={<TodoSkeleton />}>
          {sortedTodos.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] px-4">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center">
                  <NotePencil className="w-8 h-8 text-muted-foreground" weight="light" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Sparkle className="w-4 h-4 text-muted-foreground" weight="light" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1.5">Vif is all clear!</h3>
              <p className="text-sm text-muted-foreground text-center max-w-[260px]">
                Your {format(selectedDate, "EEEE")} is looking empty. Add your first task to get started with Vif!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6 text-sm font-normal"
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input) {
                    input.focus();
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add a task
              </Button>
            </div>
          ) : (
            <TodoList
              todos={sortedTodos}
            />
          )}
        </Suspense>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-md mx-auto flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="!outline-0 !ring-0 focus:!outline-0 focus:!ring-0">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9 rounded-lg hover:bg-muted"
              >
                <List className="w-5 h-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-xl p-1"
              align="start"
              sideOffset={8}
            >
              <div className="space-y-0.5">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  Sort by
                </div>
                <DropdownMenuItem
                  onClick={() => setSortBy("newest")}
                  className={cn(
                    "rounded-lg cursor-pointer flex items-center",
                    sortBy === "newest" && "bg-muted"
                  )}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Newest First</span>
                  <ArrowUp className={cn(
                    "w-4 h-4 ml-auto",
                    sortBy === "newest" ? "text-foreground" : "text-muted-foreground/50"
                  )} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("oldest")}
                  className={cn(
                    "rounded-lg cursor-pointer flex items-center",
                    sortBy === "oldest" && "bg-muted"
                  )}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Oldest First</span>
                  <ArrowDown className={cn(
                    "w-4 h-4 ml-auto",
                    sortBy === "oldest" ? "text-foreground" : "text-muted-foreground/50"
                  )} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("alphabetical")}
                  className={cn(
                    "rounded-lg cursor-pointer flex items-center",
                    sortBy === "alphabetical" && "bg-muted"
                  )}
                >
                  <TextAa className="w-4 h-4 mr-2" />
                  <span>Alphabetically</span>
                  {sortBy === "alphabetical" && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("completed")}
                  className={cn(
                    "rounded-lg cursor-pointer flex items-center",
                    sortBy === "completed" && "bg-muted"
                  )}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Completion Status</span>
                  {sortBy === "completed" && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-1.5" />

              <div className="space-y-0.5">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  Actions
                </div>
                <DropdownMenuItem
                  onClick={() => setTodos([])}
                  className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  <span>Clear All</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTodos(todos.filter((todo) => !todo.completed))}
                  className="rounded-lg cursor-pointer"
                >
                  <Broom className="w-4 h-4 mr-2" />
                  <span>Clear Completed</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1 flex items-center bg-muted/80 rounded-lg overflow-hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-none hover:bg-muted-foreground/10"
                  disabled={isLoading}
                >
                  {selectedEmoji ? (
                    <span>{selectedEmoji}</span>
                  ) : (
                    <Smiley className="w-5 h-5 text-muted-foreground" weight="fill" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[280px] p-0 rounded-lg"
                side="top"
                align="start"
                sideOffset={12}
              >
                <div className="flex h-[300px] w-full items-center justify-center p-0">
                  <EmojiPicker
                    onEmojiSelect={(emoji: any) => {
                      setSelectedEmoji(emoji.emoji);
                    }}
                    className="h-full"
                  >
                    <EmojiPickerSearch
                      placeholder="Search emoji..."
                    />
                    <EmojiPickerContent className="h-[220px]" />
                    <EmojiPickerFooter className="border-t-0 p-1.5" />
                  </EmojiPicker>
                </div>
              </PopoverContent>
            </Popover>

            <Input
              type="text"
              placeholder={isLoading ? "Processing..." : "Insert or send action"}
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleAction(newTodo);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleAction(newTodo);
                }
              }}
              className={cn(
                "flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9 rounded-none shadow-none px-2",
                isLoading && "text-muted-foreground"
              )}
              disabled={isLoading || isProcessingSpeech}
            />

            {isLoading && <InputLoadingIndicator />}
            {isProcessingSpeech && <InputLoadingIndicator />}

            <MicButton />
          </div>

          {isMobile ? (
            <Drawer open={showFaqDialog} onOpenChange={setShowFaqDialog}>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-9 w-9 rounded-lg hover:bg-muted"
                  disabled={isLoading || isProcessingSpeech}
                >
                  <DotsThree className="w-5 h-5 text-muted-foreground" weight="bold" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-4 [&>div:first-child]:hidden">
                <DrawerHeader className="text-center pb-1">
                  <div className="mx-auto w-12 h-1 bg-muted-foreground/20 rounded-full mb-4" />
                  <DrawerTitle className="text-xl font-semibold">Help & FAQ</DrawerTitle>
                  <DrawerDescription className="text-muted-foreground text-sm">
                    Frequently asked questions about Vif
                  </DrawerDescription>
                </DrawerHeader>
                
                <div className="overflow-auto max-h-[calc(80vh-140px)] rounded-lg scrollbar-hide">
                  <FaqContent />
                </div>
                
                <DrawerFooter className="mt-2 pb-6">
                  <div className="flex justify-end">
                    <DrawerClose asChild>
                      <Button variant="secondary" className="rounded-full px-6 h-9 w-full">
                        Done
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={showFaqDialog} onOpenChange={setShowFaqDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-9 w-9 rounded-lg hover:bg-muted"
                  disabled={isLoading || isProcessingSpeech}
                >
                  <DotsThree className="w-5 h-5 text-muted-foreground" weight="bold" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl border shadow-lg gap-2 p-3 [&>button]:hidden">
                <div className="absolute right-4 top-4">
                  <DialogClose asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-full bg-muted hover:bg-muted/80 focus:ring-0"
                    >
                      <X className="w-3.5 h-3.5" weight="bold" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </DialogClose>
                </div>
                
                <DialogHeader className="pb-1 space-y-1">
                  <DialogTitle className="text-lg font-semibold">Help & FAQ</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm">
                    Frequently asked questions about Vif
                  </DialogDescription>
                </DialogHeader>
                
                <div className="overflow-auto max-h-[calc(80vh-140px)] my-3 pr-1 rounded-lg scrollbar-hide">
                  <FaqContent />
                </div>
                
                <DialogFooter className="flex items-center justify-end !mt-0 !pt-0">
                  <DialogClose asChild>
                    <Button variant="secondary" className="rounded-full px-5 h-9 w-full">
                      Done
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
} 