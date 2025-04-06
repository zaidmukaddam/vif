"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { format } from "date-fns";
import {
  List,
  DotsThree,
  CaretDown,
  Smiley,
  Check,
  X,
  Robot,
  Question
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
import { useMicrophonePermission } from "@/hooks/use-microphone-permission";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { determineAction } from "@/app/actions";
import {
  TodoItem,
  SortOption,
  Model
} from "@/types";
import {
  filterTodosByDate,
  sortTodos,
  calculateProgress,
  formatDate,
  serializeTodo
} from "@/lib/utils/todo";

// custom components
import { CircularProgress } from "./CircularProgress";
import { TodoSkeleton } from "./TodoSkeleton";
import { TodoList } from "./TodoList";
import { InputLoadingIndicator } from "./InputLoadingIndicator";
import { MicButton } from "./MicButton";
import { FaqContent } from "./FaqContent";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { ThemeToggleButton } from "@/components/theme-toggle";

// Add these interfaces before the main component
interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  selected?: boolean;
  variant?: "default" | "danger";
  endIcon?: React.ReactNode;
}

interface MenuSectionProps {
  title: string;
  children: React.ReactNode;
}

// Add these components before the main component
const MenuItem = ({ icon: Icon, label, onClick, selected, variant = "default", endIcon }: MenuItemProps) => (
  <DropdownMenuItem
    onClick={onClick}
    className={cn(
      "rounded-lg cursor-pointer flex items-center group h-8 px-2",
      selected && "bg-muted",
      variant === "danger" && "text-red-600 focus:text-red-600 focus:bg-red-100 dark:hover:bg-red-900/50 dark:hover:text-red-400 hover:text-red-600"
    )}
  >
    <Icon 
      className={cn(
        "w-3.5 h-3.5 mr-2",
        variant === "danger" && "group-hover:text-red-600 dark:group-hover:text-red-400"
      )} 
    />
    <span className="text-sm">{label}</span>
    {endIcon && (
      <span className={cn(
        "ml-auto",
        typeof selected === 'boolean' && !selected && "text-muted-foreground/50",
        variant === "danger" && "group-hover:text-red-600 dark:group-hover:text-red-400"
      )}>
        {endIcon}
      </span>
    )}
  </DropdownMenuItem>
);

const MenuSection = ({ title, children }: MenuSectionProps) => (
  <div className="space-y-0.5">
    <div className="px-2 py-1 text-xs font-medium text-muted-foreground/70">
      {title}
    </div>
    {children}
  </div>
);

export default function Todo() {
  const [isLoading, setIsLoading] = useState(false);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [todos, setTodos] = useLocalStorage<TodoItem[]>("todos", []);
  const [newTodo, setNewTodo] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmoji, setSelectedEmoji] = useState<string>("😊");
  const [selectedModel, setSelectedModel] = useLocalStorage<Model>("selectedModel", "vif-llama");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const micPermission = useMicrophonePermission();
  const {
    isRecording,
    isProcessingSpeech,
    startRecording,
    stopRecording
  } = useSpeechRecognition();

  const modelOptions: { id: Model; name: string }[] = [
    { id: "vif-llama-4-scout", name: "Llama 4 Scout" },
    { id: "vif-llama-4-maverick", name: "Llama 4 Maverick" },
    { id: "vif-llama", name: "Llama 3.3 70B" },
    { id: "vif-claude", name: "Claude 3.7 Sonnet" },
    { id: "vif-qwq", name: "Qwen QWQ 32B" },
    { id: "vif-qwen", name: "Qwen 2.5 32B" },
    { id: "vif-r1", name: "DeepSeek R1 70B" },
    { id: "vif-quasar-alpha", name: "Quasar Alpha" },
  ];

  // Add effect to indicate client-side hydration is complete
  useEffect(() => {
    setIsClientLoaded(true);
  }, []);

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

  // Add effect to detect standalone PWA mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if the app is running in standalone mode (PWA)
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://');
      
      setIsStandalone(isInStandaloneMode);
      
      // Listen for changes in display mode
      const mediaQueryList = window.matchMedia('(display-mode: standalone)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsStandalone(e.matches || (window.navigator as any).standalone || false);
      };
      
      // Modern browsers use addEventListener, older ones use addListener
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', handleChange);
      } else if (mediaQueryList.addListener) {
        // For Safari < 14
        mediaQueryList.addListener(handleChange);
      }
      
      return () => {
        if (mediaQueryList.removeEventListener) {
          mediaQueryList.removeEventListener('change', handleChange);
        } else if (mediaQueryList.removeListener) {
          mediaQueryList.removeListener(handleChange);
        }
      };
    }
  }, []);

  // Only process todos after client-side hydration
  const filteredTodos = isClientLoaded ? filterTodosByDate(todos, selectedDate) : [];
  const sortedTodos = isClientLoaded ? sortTodos(filteredTodos, sortBy) : [];

  // Get statistics only after client-side hydration
  const completedCount = isClientLoaded ? filteredTodos.filter((todo) => todo.completed).length : 0;
  const remainingCount = isClientLoaded ? filteredTodos.filter((todo) => !todo.completed).length : 0;
  const progress = isClientLoaded ? calculateProgress(filteredTodos) : 0;

  const handleAction = async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setNewTodo("");

    let newTodos = [...todos];
    let clearActionExecuted = false;

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const actions = (await determineAction(text, selectedEmoji || "", filteredTodos, selectedModel, timezone)).actions;
      actions.forEach((action) => {
        switch (action.action) {
          case "add":
            let todoDate = selectedDate;
            if (action.targetDate) {
              todoDate = new Date(action.targetDate);
            }
            newTodos.push(
              serializeTodo({
                id: Math.random().toString(36).substring(7),
                text: action.text || text,
                completed: false,
                emoji: action.emoji || selectedEmoji,
                date: todoDate,
              })
            )
            break;

          case "delete":
            if (action.todoId) {
              newTodos = newTodos.filter(todo => todo.id !== action.todoId);
            }
            break;

          case "mark":
            if (action.todoId) {
              newTodos = newTodos.map(todo => {
                if (todo.id === action.todoId) {
                  // If status is provided, set to that specific status
                  if (action.status === "complete") {
                    return { ...todo, completed: true };
                  } else if (action.status === "incomplete") {
                    return { ...todo, completed: false };
                  } else {
                    // If no status provided, toggle the current status
                    return { ...todo, completed: !todo.completed };
                  }
                }
                return todo;
              });
            }
            break;

          case "sort":
            if (action.sortBy) {
              setSortBy(action.sortBy);
            }
            break;

          case "edit":
            if (action.todoId && action.text) {
              console.log("AI editing todo:", {
                todoId: action.todoId,
                newText: action.text,
                newDate: action.targetDate,
                newEmoji: action.emoji
              });
              
              newTodos = newTodos.map(todo => {
                if (todo.id === action.todoId) {
                  const updatedTodo = serializeTodo({
                    ...todo,
                    text: action.text || todo.text,
                    emoji: action.emoji || todo.emoji,
                    date: action.targetDate ? new Date(action.targetDate) : todo.date,
                  });
                  console.log("AI updated todo:", updatedTodo);
                  return updatedTodo;
                }
                return todo;
              });
            }
            break;

          case "clear":
            clearActionExecuted = true;
            if (action.listToClear) {
              switch (action.listToClear) {
                case "all":
                  // Clear all todos for the selected date
                  newTodos = todos.filter(todo =>
                    format(todo.date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")
                  );
                  break;
                case "completed":
                  // Clear completed todos for the selected date
                  newTodos = todos.filter(todo =>
                    !(todo.completed && format(todo.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
                  );
                  break;
                case "incomplete":
                  // Clear incomplete todos for the selected date
                  newTodos = todos.filter(todo =>
                    !((!todo.completed) && format(todo.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
                  );
                  break;
              }
            }
            break;
        }
      })

      setTodos(newTodos);

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

  const startEditing = (id: string, text: string, emoji?: string) => {
    setEditingTodoId(id);
    setEditText(text);
    setEditEmoji(emoji || "");
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditText("");
    setEditEmoji("");
  };

  const handleEditTodo = (id: string) => {
    if (editText.trim()) {
      const originalTodo = todos.find(todo => todo.id === id);
      console.log("Editing todo:", { originalTodo, newText: editText, newEmoji: editEmoji });

      setTodos(
        todos.map((todo) => {
          if (todo.id === id) {
            const updatedTodo = serializeTodo({
              ...todo,
              text: editText,
              emoji: editEmoji
            });
            console.log("Updated todo:", updatedTodo);
            return updatedTodo;
          }
          return todo;
        })
      );
    }
    setEditingTodoId(null);
    setEditText("");
    setEditEmoji("");
  };

  const clearAllTodos = () => {
    setTodos(todos.filter(todo =>
      format(todo.date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")
    ));
  };

  const clearCompletedTodos = () => {
    setTodos(todos.filter(todo =>
      !(todo.completed && format(todo.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    ));
  };

  const clearIncompleteTodos = () => {
    setTodos(todos.filter(todo =>
      !(!todo.completed && format(todo.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    ));
  };

  const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleAction(newTodo);
    }
  };

  const handleSpeechResult = async () => {
    if (isRecording) {
      const text = await stopRecording();
      if (text) {
        setNewTodo(text);
      }
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-4 space-y-4 pb-24 flex flex-col">
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
          {!isClientLoaded ? (
            <TodoSkeleton />
          ) : sortedTodos.length === 0 && isLoading ? (
            <LoadingState />
          ) : sortedTodos.length === 0 && !isLoading ? (
            <EmptyState
              selectedDate={selectedDate}
              focusInput={focusInput}
            />
          ) : (
            <TodoList
              todos={sortedTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={startEditing}
              editingTodoId={editingTodoId}
              editText={editText}
              editEmoji={editEmoji}
              setEditText={setEditText}
              setEditEmoji={setEditEmoji}
              handleEditTodo={handleEditTodo}
              cancelEditing={cancelEditing}
            />
          )}
        </Suspense>
      </div>

      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-4 bg-background border-t transition-all duration-200 ease-in-out",
        isStandalone && "pb-8",
        isInputFocused && "pb-4"
      )}>
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
              className="w-52 rounded-xl p-1"
              align="start"
              sideOffset={8}
            >
              <MenuSection title="Appearance">
                <div className="px-2 py-1 flex justify-start">
                  <ThemeToggleButton />
                </div>
              </MenuSection>

              <DropdownMenuSeparator className="my-1" />

              <MenuSection title="AI Model">
                {modelOptions.map((model) => (
                  <MenuItem
                    key={model.id}
                    icon={Robot}
                    label={model.name}
                    onClick={() => setSelectedModel(model.id)}
                    selected={selectedModel === model.id}
                    endIcon={selectedModel === model.id ? <Check className="w-3 h-3" /> : undefined}
                  />
                ))}
              </MenuSection>

              <DropdownMenuSeparator className="my-1" />

              <MenuSection title="Help">
                <MenuItem
                  icon={Question}
                  label="View Commands"
                  onClick={() => setShowFaqDialog(true)}
                />
              </MenuSection>
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
              ref={inputRef}
              type="text"
              placeholder={isLoading ? "Processing..." : "insert or send action"}
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyUp={handleInputKeyUp}
              onKeyDown={handleInputKeyUp}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className={cn(
                "flex-1 border-0 !bg-transparent focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 h-9 rounded-none shadow-none px-2",
                isLoading && "text-muted-foreground"
              )}
              disabled={isLoading || isProcessingSpeech}
            />

            {isLoading && <InputLoadingIndicator showText={true} />}
            {isProcessingSpeech && <InputLoadingIndicator />}

            <MicButton
              isRecording={isRecording}
              isProcessingSpeech={isProcessingSpeech}
              micPermission={micPermission}
              startRecording={startRecording}
              stopRecording={handleSpeechResult}
              hasText={!!newTodo.trim()}
              onSend={() => handleAction(newTodo)}
            />
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

                <div className="overflow-auto max-h-[calc(80vh-140px)] rounded-xl border border-muted p-1 bg-background scrollbar-hide">
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

                <div className="overflow-auto max-h-[calc(80vh-140px)] my-3 pr-1 rounded-xl border border-muted/50 p-1 bg-background/50 scrollbar-hide">
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