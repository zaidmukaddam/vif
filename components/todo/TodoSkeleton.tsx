import { Skeleton } from "@/components/ui/skeleton";

export function TodoSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center px-4 py-2.5 gap-3">
          <Skeleton className="h-[18px] w-[18px] rounded-[4px]" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
