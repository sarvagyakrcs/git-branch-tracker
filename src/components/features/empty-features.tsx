"use client";

import { Layers } from "lucide-react";
import { FeatureCreateDialog } from "./feature-create-dialog";

export function EmptyFeatures({ projectId }: { projectId: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/30 px-6 py-12 text-center">
      <div className="mb-3 rounded-full bg-muted p-3">
        <Layers className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-medium">No features yet</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Create a feature to start tracking branches
      </p>
      <FeatureCreateDialog projectId={projectId} />
    </div>
  );
}

