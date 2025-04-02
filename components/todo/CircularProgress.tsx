import { cn } from "@/lib/utils";
import { CircularProgressProps } from "@/types";

export function CircularProgress({ progress, size = 20 }: CircularProgressProps) {
  const strokeWidth = 1.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const getProgressColor = () => {
    if (progress === 100) return "text-green-500";
    if (progress > 0) return "text-blue-500";
    return "text-muted-foreground";
  };

  // Get color values for conic gradient
  const getColorValue = () => {
    if (progress === 100) return "#22c55e"; // green-500
    if (progress > 0) return "#3b82f6";     // blue-500
    return "#a1a1aa";                       // muted foreground default
  };
  
  // Use consistent transition for both elements
  const transitionTiming = "transition-all duration-200 ease-out";
  
  return (
    <div 
      className="relative" 
      style={{ width: size, height: size }}
    >
      {/* Pie background using conic-gradient for smooth transitions */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full",
          transitionTiming
        )}
        style={{
          background: `conic-gradient(${getColorValue()} ${progress}%, transparent ${progress}%)`,
          opacity: progress > 0 ? 0.25 : 0
        }}
      />
      
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          className="text-muted-foreground/15"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Progress ring */}
        <circle
          className={cn(
            getProgressColor(),
            transitionTiming
          )}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
    </div>
  );
} 