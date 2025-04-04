import { Skeleton } from "@/components/ui/skeleton";
import { MagicWand, Sparkle } from "@phosphor-icons/react";

export function LoadingState() {
  return (
    <div className="space-y-1">
      <div className="flex items-center px-4 py-3 gap-3 mb-3 bg-muted/50 rounded-md">
        <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center relative">
          <MagicWand className="w-5 h-5 text-muted-foreground" weight="light" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center">
            <Sparkle className="w-3 h-3 text-muted-foreground" weight="fill" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground mb-1">Generating your first tasks</h3>
          <p className="text-xs text-muted-foreground">Vif is thinking...</p>
        </div>
      </div>
      
      {/* Skeleton items that match the todo list structure */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center px-4 py-2.5 gap-3 animate-pulse">
          <Skeleton className="h-[18px] w-[18px] rounded-[4px]" />
          <div className="flex items-center flex-1">
            <Skeleton className="h-5 w-5 mr-2 rounded-md" />
            <Skeleton className="h-5 flex-1" />
          </div>
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      ))}
    </div>
  );
} 