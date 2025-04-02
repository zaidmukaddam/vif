import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CircleCheckboxProps } from "@/types";

export function CircleCheckbox({
  checked,
  onCheckedChange,
  className,
}: CircleCheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "h-[18px] w-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-transparent hover:border-muted-foreground/50",
        className
      )}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current transition-transform duration-200 ease-in-out scale-100 origin-center">
        <div className="h-[8px] w-[8px] rounded-full bg-white animate-in zoom-in-50 duration-200" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
} 