"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { format } from "date-fns";
import {
  List,
  DotsThree,
  CaretDown,
  Clock,
  TextAa,
  CheckCircle,
  Trash,
  Broom,
  Smiley,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Robot
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

export default function Todo() {
  const [isLoading, setIsLoading] = useState(false);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [todos, setTodos] = useLocalStorage<TodoItem[]>("todos", []);
  const [newTodo, setNewTodo] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmoji, setSelectedEmoji] = useState<string>("😊");
  const [selectedModel, setSelectedModel] = useLocalStorage<Model>("selectedModel", "llama-3.3-70b-versatile");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const micPermission = useMicrophonePermission();
  const {
    isRecording,
    isProcessingSpeech,
    startRecording,
    stopRecording
  } = useSpeechRecognition();

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

    try {
      const actions = (await determineAction(text, selectedEmoji || "", filteredTodos, selectedModel)).actions;
      actions.forEach((action) => {
        switch (action.action) {
          case "add":
            newTodos.push(
              serializeTodo({
                id: Math.random().toString(36).substring(7),
                text: action.text || text,
                completed: false,
                emoji: action.emoji || selectedEmoji,
                date: selectedDate,
              })
            )
            break;

          case "delete":
            const todoToDelete = todos.find(
              todo => todo.text.toLowerCase().includes(action.text?.toLowerCase() || "")
            );
            if (todoToDelete) {
              newTodos = newTodos.filter(todo => todo.id !== todoToDelete.id);
            }
            break;

          case "complete":
            const todoToComplete = todos.find(
              todo => todo.text.toLowerCase().includes(action.text?.toLowerCase() || "")
            );
            if (todoToComplete) {
              newTodos = newTodos.map(todo =>
                todo.id === todoToComplete.id ? { ...todo, completed: !todo.completed } : todo
              )
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
                newTodos = newTodos.map(todo => {
                  if (todo.id === todoToEdit.id) {
                    const updatedTodo = serializeTodo({ ...todo, text: action.text || "" });
                    console.log("AI updated todo:", updatedTodo);
                    return updatedTodo;
                  }
                  return todo;
                })
              }
            }
            break;

          case "clear":
            if (action.listToClear) {
              switch (action.listToClear) {
                case "all":
                  // Clear all todos for the selected date
                  setTodos(todos.filter(todo =>
                    format(todo.date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")
                  ));
                  break;
                case "completed":
                  // Clear completed todos for the selected date
                  setTodos(todos.filter(todo =>
                    !(todo.completed && format(todo.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
                  ));
                  break;
                case "incomplete":
                  // Clear incomplete todos for the selected date
                  setTodos(todos.filter(todo =>
                    !((!todo.completed) && format(todo.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
                  ));
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
                  onClick={() => clearAllTodos()}
                  className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  <span>Clear All</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => clearCompletedTodos()}
                  className="rounded-lg cursor-pointer"
                >
                  <Broom className="w-4 h-4 mr-2" />
                  <span>Clear Completed</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => clearIncompleteTodos()}
                  className="rounded-lg cursor-pointer"
                >
                  <Broom className="w-4 h-4 mr-2" />
                  <span>Clear Incomplete</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-1.5" />
              <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                AI Model
              </div>
              <DropdownMenuItem
                onClick={() => setSelectedModel("llama-3.3-70b-versatile")}
                className={cn(
                  "rounded-lg cursor-pointer flex items-center",
                  selectedModel === "llama-3.3-70b-versatile" && "bg-muted"
                )}
              >
                <Robot className="w-4 h-4 mr-2" />
                <span>Llama 3.3 70B</span>
                {selectedModel === "llama-3.3-70b-versatile" && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedModel("qwen-qwq-32b")}
                className={cn(
                  "rounded-lg cursor-pointer flex items-center",
                  selectedModel === "qwen-qwq-32b" && "bg-muted"
                )}
              >
                <Robot className="w-4 h-4 mr-2" />
                <span>Qwen QWQ 32B</span>
                {selectedModel === "qwen-qwq-32b" && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedModel("qwen-2.5-32b")}
                className={cn(
                  "rounded-lg cursor-pointer flex items-center",
                  selectedModel === "qwen-2.5-32b" && "bg-muted"
                )}
              >
                <Robot className="w-4 h-4 mr-2" />
                <span>Qwen 2.5 32B</span>
                {selectedModel === "qwen-2.5-32b" && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedModel("deepseek-r1-distill-llama-70b")}
                className={cn(
                  "rounded-lg cursor-pointer flex items-center",
                  selectedModel === "deepseek-r1-distill-llama-70b" && "bg-muted"
                )}
              >
                <Robot className="w-4 h-4 mr-2" />
                <span>DeepSeek R1 70B</span>
                {selectedModel === "deepseek-r1-distill-llama-70b" && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </DropdownMenuItem>
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
              className={cn(
                "flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9 rounded-none shadow-none px-2",
                isLoading && "text-muted-foreground"
              )}
              disabled={isLoading || isProcessingSpeech}
            />

            {isLoading && <InputLoadingIndicator />}
            {isProcessingSpeech && <InputLoadingIndicator />}

            <MicButton
              isRecording={isRecording}
              isProcessingSpeech={isProcessingSpeech}
              micPermission={micPermission}
              startRecording={startRecording}
              stopRecording={handleSpeechResult}
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