import { format } from "date-fns";
import { NotePencil, Sparkle, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  selectedDate: Date;
  focusInput: () => void;
}

export function EmptyState({ selectedDate, focusInput }: EmptyStateProps) {
  return (
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
        onClick={focusInput}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add a task
      </Button>
    </div>
  );
} 