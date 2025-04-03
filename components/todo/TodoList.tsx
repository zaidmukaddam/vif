import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, PencilSimple, Check, Smiley } from "@phosphor-icons/react";
import { CircleCheckbox } from "./CircleCheckbox";
import { TodoListProps } from "@/types";
import { useRef, useCallback, useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";

export function TodoList({
  todos,
  onToggle,
  onDelete,
  onEdit,
  editingTodoId,
  editText,
  editEmoji,
  setEditText,
  setEditEmoji,
  handleEditTodo,
  cancelEditing
}: TodoListProps) {
  // Create a reference for the edit input
  const editInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Effect to detect mobile screens
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
  }, [setEditText]);

  return (
    <>
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={cn(
            "group flex items-center px-4 py-2.5 gap-3",
            todo.completed ? "text-muted-foreground/50" : "hover:bg-muted/50",
            editingTodoId === todo.id && "bg-muted/50",
            editingTodoId !== todo.id && "cursor-pointer",
            "transition-colors"
          )}
          onClick={(e: React.MouseEvent) => {
            // Only toggle if not in edit mode and if not clicking on buttons
            if (editingTodoId !== todo.id && 
                e.target === e.currentTarget) {
              onToggle(todo.id);
            }
          }}
        >
          {editingTodoId === todo.id ? (
            <>
              <div className="flex-1 flex items-center gap-3 bg-transparent px-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 hover:bg-muted"
                    >
                      {editEmoji ? (
                        <span>{editEmoji}</span>
                      ) : (
                        <Smiley className="w-5 h-5 text-muted-foreground" weight="fill" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[280px] p-0"
                    side="top"
                    align="start"
                    sideOffset={12}
                  >
                    <div className="flex h-[300px] w-full items-center justify-center p-0">
                      <EmojiPicker
                        onEmojiSelect={(emoji: any) => {
                          setEditEmoji(emoji.emoji);
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
                  className="flex-1 h-9 py-0 text-sm bg-transparent border-0 shadow-none focus-visible:ring-0 px-2 rounded-none"
                  placeholder="Edit todo..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground rounded-none hover:bg-muted"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleEditTodo(todo.id);
                  }}
                >
                  <Check className="w-4 h-4" weight="bold" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <CircleCheckbox
                  checked={todo.completed}
                  onCheckedChange={() => onToggle(todo.id)}
                  className={cn(
                    todo.completed
                      ? "border-muted-foreground/50 bg-muted-foreground/20"
                      : "hover:border-muted-foreground/70"
                  )}
                />
              </div>
              <div 
                className="flex-1 flex items-center min-w-0 cursor-pointer" 
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation(); // Prevent parent click handler
                  onToggle(todo.id);
                }}
              >
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
                className={cn(
                  "h-7 w-7 text-muted-foreground hover:text-foreground",
                  isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation(); // Prevent toggle when clicking edit
                  onEdit(todo.id, todo.text, todo.emoji);
                }}
              >
                <PencilSimple className="w-4 h-4" weight="bold" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 text-muted-foreground hover:text-destructive",
                  isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation(); // Prevent toggle when clicking delete
                  onDelete(todo.id);
                }}
              >
                <X className="w-4 h-4" weight="bold" />
              </Button>
            </>
          )}
        </div>
      ))}
    </>
  );
} 