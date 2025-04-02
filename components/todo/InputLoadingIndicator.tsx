import { Loader2 } from "lucide-react";

export function InputLoadingIndicator() {
  return (
    <div className="flex items-center justify-center p-1">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    </div>
  );
} 