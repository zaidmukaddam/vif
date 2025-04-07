import { format } from "date-fns";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface EmptyStateProps {
  selectedDate: Date;
  focusInput: () => void;
}

export function EmptyState({ selectedDate, focusInput }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] px-4">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
          <Image
            src="/vif-icon.png"
            alt="Vif"
            width={128}
            height={128}
            className="size-10 object-contain"
            priority
            unoptimized
            quality={100}
          />
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
        <ArrowRight className="w-4 h-4 mr-2" weight="bold" />
        Send action
      </Button>
    </div>
  );
} 