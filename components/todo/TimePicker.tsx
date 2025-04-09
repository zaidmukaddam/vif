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
  DrawerDescription,
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
  
  // Check if we're on mobile on component mount
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const TimePickerContent = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <div className={cn("flex flex-col", inDrawer ? "gap-4 px-1" : "gap-2")}>
      <div className={cn("flex", inDrawer ? "gap-3" : "gap-1")}>
        <Select
          value={time ? time.split(":")[0] : ""}
          onValueChange={(value) => {
            const mins = time ? time.split(":")[1] : "00";
            onChange(`${value.padStart(2, "0")}:${mins}`);
          }}
        >
          <SelectTrigger className={cn(
            "flex-1 px-2 text-sm border rounded-md bg-muted/30 hover:bg-muted focus:ring-0",
            inDrawer ? "h-10" : "h-8"
          )}>
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent
            className={cn("p-0 rounded-lg", inDrawer ? "h-[240px] w-full" : "h-[180px] w-[80px]")}
            position="popper"
          >
            <div className="flex flex-col py-1">
              {hours.map((hour) => (
                <SelectItem
                  key={hour}
                  value={hour.toString()}
                  className={cn("cursor-pointer text-sm", inDrawer ? "py-2 px-3" : "py-1.5 px-2")}
                >
                  {hour.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </div>
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
            "flex-1 px-2 text-sm border rounded-md bg-muted/30 hover:bg-muted focus:ring-0",
            inDrawer ? "h-10" : "h-8"
          )}>
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent
            className={cn("p-0 rounded-lg", inDrawer ? "h-[240px] w-full" : "h-[180px] w-[80px]")}
            position="popper"
          >
            <div className="flex flex-col py-1">
              {minutes.map((minute) => (
                <SelectItem
                  key={minute}
                  value={minute.toString().padStart(2, "0")}
                  className={cn("cursor-pointer text-sm", inDrawer ? "py-2 px-3" : "py-1.5 px-2")}
                >
                  {minute.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>
      <div className={cn("flex justify-between", inDrawer ? "gap-3 mt-2" : "gap-1 mt-1")}>
        <Button
          variant="ghost"
          size={inDrawer ? "default" : "sm"}
          className={cn(
            "flex-1 text-muted-foreground hover:text-foreground rounded-md",
            inDrawer ? "h-10 text-sm" : "h-7 text-xs"
          )}
          onClick={() => {
            onChange("");
            setIsOpen(false);
          }}
        >
          Clear
        </Button>
        <Button
          size={inDrawer ? "default" : "sm"}
          className={cn(
            "flex-1 rounded-md",
            inDrawer ? "h-10 text-sm" : "h-7 text-xs"
          )}
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
              className={cn("h-8 text-xs flex items-center gap-1.5 px-2.5 rounded-md", className)}
            >
              <Clock className="w-3.5 h-3.5" weight="fill" />
              {time ? formatTimeDisplay(time) : "Add time"}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="px-4 [&>div:first-child]:hidden">
            <DrawerHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-1 bg-muted-foreground/20 rounded-full mb-4" />
              <DrawerTitle className="text-lg font-medium">Set Time</DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                {time ? formatTimeDisplay(time) : "No time set"}
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4">
              <TimePickerContent inDrawer={true} />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant={time ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-8 text-xs flex items-center gap-1.5 px-2.5 rounded-md", className)}
            >
              <Clock className="w-3.5 h-3.5" weight="fill" />
              {time ? formatTimeDisplay(time) : "Add time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2 rounded-xl" align="start">
            <TimePickerContent />
          </PopoverContent>
        </Popover>
      )}
    </>
  );
} 