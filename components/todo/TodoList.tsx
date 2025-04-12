import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, PencilSimple, Check, Smiley, Clock, CaretDown } from "@phosphor-icons/react";
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
import { TimePicker, formatTimeDisplay } from "./TimePicker";

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
    const editInputRef = useRef<HTMLInputElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [editTime, setEditTime] = useState<string>("");
    const [isOverflowing, setIsOverflowing] = useState<Record<string, boolean>>({});
    const [hoveredOverflowTodoId, setHoveredOverflowTodoId] = useState<string | null>(null);
    const textRefs = useRef<Record<string, HTMLSpanElement | null>>({});

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    useEffect(() => {
        const checkOverflow = () => {
            const newOverflowState: Record<string, boolean> = {};
            todos.forEach(todo => {
                const textElement = textRefs.current[todo.id];
                if (textElement) {
                    newOverflowState[todo.id] = textElement.scrollWidth > textElement.clientWidth;
                } else {
                    newOverflowState[todo.id] = false;
                }
            });

            if (JSON.stringify(newOverflowState) !== JSON.stringify(isOverflowing)) {
                setIsOverflowing(newOverflowState);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);

    }, [todos, isOverflowing]); 


    const handleEditInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const newValue = input.value;
        const newPosition = input.selectionStart;
        setEditText(newValue);
        requestAnimationFrame(() => {
            if (input && newPosition !== null) {
                input.setSelectionRange(newPosition, newPosition);
            }
        });
    }, [setEditText]);

    useEffect(() => {
        if (editingTodoId) {
            const todo = todos.find(t => t.id === editingTodoId);
            setEditTime(todo?.time || "");
        }
    }, [editingTodoId, todos]);

    return (
        <>
            {todos.map((todo) => (
                <div
                    key={todo.id}
                    className={cn(
                        "group flex items-start px-4 py-2.5 gap-3 relative", 
                        todo.completed ? "text-muted-foreground/50" : "hover:bg-muted/50",
                        editingTodoId === todo.id && "bg-muted/80 rounded-lg",
                        editingTodoId !== todo.id && "cursor-pointer",
                        "transition-colors"
                    )}
                    onClick={(e: React.MouseEvent) => {
                        if (editingTodoId !== todo.id && e.target === e.currentTarget) {
                            onToggle(todo.id);
                        }
                    }}
                >
                    {editingTodoId === todo.id ? (
                        <>
                            <div className="flex-1 flex items-center gap-2 py-0.5">
                                <div className="flex items-center gap-2 rounded-lg bg-background p-1 flex-1 border shadow-sm">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0 rounded-md hover:bg-muted"
                                            >
                                                {editEmoji ? (
                                                    <span className="text-base">{editEmoji}</span>
                                                ) : (
                                                    <Smiley className="w-4 h-4 text-muted-foreground" weight="fill" />
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-[280px] p-0 rounded-xl"
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
                                                handleEditTodo({ ...todo, text: editText, emoji: editEmoji, time: editTime });
                                            } else if (e.key === "Escape") {
                                                cancelEditing();
                                            }
                                        }}
                                        autoFocus
                                        className="flex-1 h-8 py-0 text-sm bg-transparent border-0 shadow-none focus-visible:ring-0 px-2 rounded-none"
                                        placeholder="Edit todo..."
                                    />

                                    <TimePicker
                                        time={editTime}
                                        onChange={setEditTime}
                                    />
                                </div>

                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted"
                                        onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            cancelEditing();
                                        }}
                                    >
                                        <X className="w-4 h-4" weight="bold" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 rounded-md"
                                        onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            const updatedTodo = { ...todo, text: editText, emoji: editEmoji, time: editTime };
                                            handleEditTodo(updatedTodo);
                                        }}
                                    >
                                        <Check className="w-4 h-4" weight="bold" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="pt-px" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                <CircleCheckbox
                                    checked={todo.completed}
                                    onCheckedChange={() => onToggle(todo.id)}
                                    className={cn(
                                        "mt-[1px]",
                                        todo.completed
                                            ? "border-muted-foreground/50 bg-muted-foreground/20"
                                            : "hover:border-muted-foreground/70"
                                    )}
                                />
                            </div>

                            <div
                                className="flex-1 flex items-start min-w-0 cursor-pointer"
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    onToggle(todo.id);
                                }}
                            >
                                {todo.emoji && (
                                    <span className="mr-2 text-base flex-shrink-0 pt-px">{todo.emoji}</span> 
                                )}
                                <div className="flex flex-col min-w-0 flex-1">
                                   
                                    <span
                                        className={cn(
                                            "text-[15px] transition-all duration-200 ease-in-out", 
                                            todo.completed && "line-through",
                                        
                                            hoveredOverflowTodoId === todo.id
                                                ? "whitespace-normal overflow-visible h-auto" 
                                                : "truncate" 
                                        )}
                                    >
                                        {todo.text}
                                    </span>
                                    {/* --- End Text Span --- */}

                                    {/* Time Display */}
                                    {todo.time && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <Clock className="w-3 h-3" weight="fill" />
                                            <span>{formatTimeDisplay(todo.time)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                               
                                {isOverflowing[todo.id] && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-7 w-7 text-muted-foreground hover:text-foreground",
                                            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                            "transition-opacity"
                                        )}
                                        onMouseEnter={(e: React.MouseEvent) => {
                                            e.stopPropagation(); 
                                            setHoveredOverflowTodoId(todo.id);
                                        }}
                                        onMouseLeave={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            setHoveredOverflowTodoId(null);
                                        }}
                                        
                                    >
                                        <CaretDown className="w-4 h-4" weight="bold" />
                                    </Button>
                                )}
                                

                                
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-7 w-7 text-muted-foreground hover:text-foreground",
                                        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                                    )}
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        onEdit(todo.id, todo.text, todo.emoji || ''); 
                                    }}
                                >
                                    <PencilSimple className="w-4 h-4" weight="bold" />
                                </Button>

                                {/* Delete Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-7 w-7 text-muted-foreground hover:text-destructive",
                                        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                                    )}
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        onDelete(todo.id);
                                    }}
                                >
                                    <X className="w-4 h-4" weight="bold" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </>
    );
}