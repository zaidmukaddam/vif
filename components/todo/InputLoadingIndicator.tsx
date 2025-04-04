import { Loader2 } from "lucide-react";

export function InputLoadingIndicator({ showText = false }: { showText?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5 p-1">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      {showText && (
        <span className="text-xs text-muted-foreground/70 animate-pulse">
          Vif is thinking...
        </span>
      )}
    </div>
  );
} 