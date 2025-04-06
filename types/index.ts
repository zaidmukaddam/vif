export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  emoji?: string;
  date: Date;
}

export type SortOption = "newest" | "oldest" | "alphabetical" | "completed";

export interface CircularProgressProps {
  progress: number;
  size?: number;
}

export interface TodoListProps {
  todos: TodoItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string, emoji?: string) => void;
  editingTodoId: string | null;
  editText: string;
  editEmoji: string;
  setEditText: (text: string) => void;
  setEditEmoji: (emoji: string) => void;
  handleEditTodo: (id: string) => void;
  cancelEditing: () => void;
}

export interface FaqContentProps {
  // Empty interface for now, can be extended if needed
}

export interface MicButtonProps {
  isRecording: boolean;
  isProcessingSpeech: boolean;
  micPermission: "checking" | "granted" | "denied" | "prompt";
  startRecording: () => void;
  stopRecording: () => void;
  hasText: boolean;
  onSend: () => void;
}

export interface CircleCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
} 

export type Model = "vif-llama-4-scout" |"vif-llama-4-maverick" | "vif-llama" | "vif-claude" | "vif-qwq" | "vif-qwen" | "vif-r1" | "vif-quasar-alpha";