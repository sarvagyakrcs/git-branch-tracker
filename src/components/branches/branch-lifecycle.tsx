"use client";

import { cn } from "@/lib/utils";

export const LIFECYCLE_STAGES = [
  { key: "created", label: "Created" },
  { key: "wip", label: "WIP" },
  { key: "pr_created", label: "PR" },
  { key: "in_review", label: "Review" },
  { key: "approved", label: "Approved" },
  { key: "merged", label: "Merged" },
] as const;

const STATUS_MAP: Record<string, string> = {
  active: "wip",
  pr_raised: "pr_created",
  blocked: "wip",
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
  const isChangesRequested = status === "changes_requested";
  const isMerged = status === "merged";

  if (isDeprecated) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span>Deprecated</span>
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
                idx < currentIndex && "bg-emerald-500",
                idx === currentIndex && (isMerged ? "bg-emerald-500" : "bg-primary"),
                idx > currentIndex && "bg-muted-foreground/25"
              )}
            />
          ))}
        </div>
        <span className={cn(
          "text-xs",
          isMerged && "text-emerald-500",
          isChangesRequested && "text-amber-500",
          !isMerged && !isChangesRequested && "text-muted-foreground"
        )}>
          {isChangesRequested ? "Changes requested" : LIFECYCLE_STAGES[currentIndex]?.label}
        </span>
      </div>
    );
  }

  // Full view - clean segmented bar
  return (
    <div className="space-y-3">
      {isChangesRequested && (
        <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
          Changes requested — address feedback
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
                  "h-2 rounded-full transition-colors",
                  isComplete && "bg-emerald-500",
                  isCurrent && (isMerged ? "bg-emerald-500" : "bg-primary"),
                  !isComplete && !isCurrent && "bg-muted"
                )}
              />
              <p className={cn(
                "text-[10px] text-center",
                isComplete && "text-emerald-500",
                isCurrent && (isMerged ? "text-emerald-500" : "text-foreground font-medium"),
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
