import { Skeleton } from "@/components/ui/skeleton";

export function ModuleSkeleton() {
  return (
    <div className="space-y-8" aria-hidden="true">
      <div className="grid overflow-hidden border border-[#DDE2DB] bg-[#FCFBF7] lg:grid-cols-[1fr_286px]">
        <div className="space-y-4 p-6 sm:p-7">
          <Skeleton className="h-3 w-24 bg-[#E3E8E0]" />
          <Skeleton className="h-9 w-3/4 max-w-sm bg-[#E3E8E0]" />
          <Skeleton className="h-4 w-1/2 max-w-xs bg-[#E3E8E0]" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-32 bg-[#E3E8E0]" />
            <Skeleton className="h-10 w-24 bg-[#E3E8E0]" />
          </div>
        </div>
        <div className="hidden bg-[#173F34]/20 p-6 lg:block">
          <Skeleton className="h-40 w-full bg-white/40" />
        </div>
      </div>
      <div className="grid border-l border-t border-[#DDE2DB] sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 border-b border-r border-[#DDE2DB] bg-[#FCFBF7] p-5">
            <Skeleton className="h-3 w-20 bg-[#E3E8E0]" />
            <Skeleton className="h-8 w-16 bg-[#E3E8E0]" />
            <Skeleton className="h-3 w-24 bg-[#E3E8E0]" />
          </div>
        ))}
      </div>
      <div className="grid gap-8 xl:grid-cols-[1.55fr_0.8fr]">
        <Skeleton className="h-[240px] w-full bg-[#E8EBE4]" />
        <Skeleton className="h-[240px] w-full bg-[#E8EBE4]" />
      </div>
    </div>
  );
}
