"use client";

import { cn } from "@/lib/utils";

export const LIFECYCLE_STAGES = [
  { key: "active", label: "Active" },
  { key: "pr_raised", label: "PR Raised" },
  { key: "merged", label: "Merged" },
] as const;

const STATUS_MAP: Record<string, string> = {
  blocked: "active",
};

function getStageIndex(status: string): number {
  const mappedStatus = STATUS_MAP[status] || status;
  const index = LIFECYCLE_STAGES.findIndex((s) => s.key === mappedStatus);
  return index >= 0 ? index : 1;
}

interface BranchLifecycleProps {
  status: string;
  compact?: boolean;
}

export function BranchLifecycle({ status, compact }: BranchLifecycleProps) {
  const currentIndex = getStageIndex(status);
  const isDeprecated = status === "deprecated";
  const isBlocked = status === "blocked";
  const isMerged = status === "merged";
  const isPlanned = status === "planned";

  if (isDeprecated) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span>Deprecated</span>
      </div>
    );
  }

  if (isPlanned) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-400">
        <div className="h-2 w-2 rounded-full bg-amber-400" />
        <span>Planned</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {LIFECYCLE_STAGES.map((stage, idx) => (
            <div
              key={stage.key}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                idx < currentIndex && "bg-teal-400",
                idx === currentIndex && (isMerged ? "bg-teal-400" : isBlocked ? "bg-red-400" : "bg-primary"),
                idx > currentIndex && "bg-muted-foreground/25"
              )}
            />
          ))}
        </div>
        <span className={cn(
          "text-xs",
          isMerged && "text-teal-400",
          isBlocked && "text-red-400",
          !isMerged && !isBlocked && "text-muted-foreground"
        )}>
          {isBlocked ? "Blocked" : LIFECYCLE_STAGES[currentIndex]?.label}
        </span>
      </div>
    );
  }

  // Full view - clean segmented bar
  return (
    <div className="space-y-3">
      {isBlocked && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
          ⚠️ Blocked — resolve issues to continue
        </div>
      )}

      {/* Segmented progress bar */}
      <div className="flex gap-1">
        {LIFECYCLE_STAGES.map((stage, idx) => {
          const isComplete = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.key} className="flex-1 space-y-1.5">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  isComplete && "bg-teal-400",
                  isCurrent && (isMerged ? "bg-teal-400" : isBlocked ? "bg-red-400" : "bg-primary"),
                  !isComplete && !isCurrent && "bg-muted"
                )}
              />
              <p className={cn(
                "text-[10px] text-center",
                isComplete && "text-teal-400",
                isCurrent && (isMerged ? "text-teal-400" : isBlocked ? "text-red-400" : "text-foreground font-medium"),
                !isComplete && !isCurrent && "text-muted-foreground/50"
              )}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type LifecycleStage = typeof LIFECYCLE_STAGES[number]["key"];
