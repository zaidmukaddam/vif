import { useState, useEffect } from "react";
import { Clock } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface TimePickerProps {
  time: string;
  onChange: (time: string) => void;
  className?: string;
}

export function formatTimeDisplay(time: string) {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function TimePicker({ time, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Initialize period based on current time
  useEffect(() => {
    if (time) {
      const hour = parseInt(time.split(":")[0]);
      setPeriod(hour >= 12 ? "PM" : "AM");
    }
  }, [time]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleHourChange = (value: string) => {
    let hour = parseInt(value);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    const mins = time ? time.split(":")[1] : "00";
    onChange(`${hour.toString().padStart(2, "0")}:${mins}`);
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    if (!time) return;
    
    let [hours, minutes] = time.split(":");
    let hour = parseInt(hours);
    
    if (newPeriod === "PM" && hour < 12) hour += 12;
    if (newPeriod === "AM" && hour >= 12) hour -= 12;
    
    onChange(`${hour.toString().padStart(2, "0")}:${minutes}`);
  };

  const TimePickerContent = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <div className={cn(
      "flex flex-col",
      inDrawer ? "gap-6 px-4" : "gap-3"
    )}>
      <div className={cn(
        "grid grid-cols-3 gap-2",
        inDrawer ? "gap-3" : "gap-2"
      )}>
        <Select
          value={time ? (parseInt(time.split(":")[0]) % 12 || 12).toString() : ""}
          onValueChange={handleHourChange}
        >
          <SelectTrigger className={cn(
            "w-full px-3 text-sm border rounded-lg bg-background hover:bg-accent focus:ring-1 focus:ring-ring",
            inDrawer ? "h-12" : "h-9"
          )}>
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent
            className={cn("p-0 rounded-lg", inDrawer ? "h-[280px]" : "h-[200px]")}
            position="popper"
          >
            {hours.map((hour) => (
              <SelectItem
                key={hour}
                value={hour.toString()}
                className={cn(
                  "cursor-pointer text-sm justify-center",
                  inDrawer ? "py-2.5" : "py-1.5"
                )}
              >
                {hour.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={time ? time.split(":")[1] : ""}
          onValueChange={(value) => {
            const hrs = time ? time.split(":")[0] : "00";
            onChange(`${hrs}:${value}`);
          }}
        >
          <SelectTrigger className={cn(
            "w-full px-3 text-sm border rounded-lg bg-background hover:bg-accent focus:ring-1 focus:ring-ring",
            inDrawer ? "h-12" : "h-9"
          )}>
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent
            className={cn("p-0 rounded-lg", inDrawer ? "h-[280px]" : "h-[200px]")}
            position="popper"
          >
            {minutes.map((minute) => (
              <SelectItem
                key={minute}
                value={minute.toString().padStart(2, "0")}
                className={cn(
                  "cursor-pointer text-sm justify-center",
                  inDrawer ? "py-2.5" : "py-1.5"
                )}
              >
                {minute.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={period}
          onValueChange={(value: "AM" | "PM") => handlePeriodChange(value)}
        >
          <SelectTrigger className={cn(
            "w-full px-3 text-sm border rounded-lg bg-background hover:bg-accent focus:ring-1 focus:ring-ring",
            inDrawer ? "h-12" : "h-9"
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            className="p-0 rounded-lg"
            position="popper"
          >
            {["AM", "PM"].map((p) => (
              <SelectItem
                key={p}
                value={p}
                className={cn(
                  "cursor-pointer text-sm justify-center",
                  inDrawer ? "py-2.5" : "py-1.5"
                )}
              >
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn(
        "grid grid-cols-2 gap-2",
        inDrawer ? "mt-2" : "mt-1"
      )}>
        <Button
          variant="outline"
          size={inDrawer ? "lg" : "default"}
          className="w-full rounded-lg font-medium"
          onClick={() => {
            onChange("");
            setIsOpen(false);
          }}
        >
          Clear
        </Button>
        <Button
          size={inDrawer ? "lg" : "default"}
          className="w-full rounded-lg font-medium"
          onClick={() => setIsOpen(false)}
        >
          Set time
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button 
              variant={time ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-9 text-sm flex items-center gap-2 px-3 rounded-lg transition-colors",
                className
              )}
            >
              <Clock className="w-4 h-4" weight="fill" />
              {time ? formatTimeDisplay(time) : "Set time"}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="px-4 pb-6">
            <DrawerHeader className="text-center pt-6 pb-6">
              <DrawerTitle className="text-xl font-semibold mb-1">Choose time</DrawerTitle>
              <p className="text-sm text-muted-foreground">
                {time ? formatTimeDisplay(time) : "No time selected"}
              </p>
            </DrawerHeader>
            <TimePickerContent inDrawer={true} />
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant={time ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-9 text-sm flex items-center gap-2 px-3 rounded-lg transition-colors",
                className
              )}
            >
              <Clock className="w-4 h-4" weight="fill" />
              {time ? formatTimeDisplay(time) : "Set time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-3 rounded-xl" align="start">
            <TimePickerContent />
          </PopoverContent>
        </Popover>
      )}
    </>
  );
} 