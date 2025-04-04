import React from "react";

export function InputLoadingIndicator({ showText = false }: { showText?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 px-2 py-1">
      <div className="relative flex">
        <div className="h-2 w-2 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.15s] mx-1"></div>
        <div className="h-2 w-2 rounded-full bg-primary/80 animate-bounce"></div>
      </div>
      {showText && (
        <span className="text-xs font-medium text-muted-foreground">
          <span className="inline-block animate-pulse">Vif{" "}</span>
          <span className="inline-block"> is thinking...</span>
        </span>
      )}
    </div>
  );
} 