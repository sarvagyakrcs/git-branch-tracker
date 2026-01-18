"use client";

import { GitBranch } from "lucide-react";
import { BranchCreateDialog } from "./branch-create-dialog";

export function EmptyBranches({
  projectId,
  featureId,
}: {
  projectId: number;
  featureId: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/30 px-6 py-12 text-center">
      <div className="mb-3 rounded-full bg-muted p-3">
        <GitBranch className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-medium">No branches yet</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Add branches to build your stack
      </p>
      <BranchCreateDialog projectId={projectId} featureId={featureId} />
    </div>
  );
}

