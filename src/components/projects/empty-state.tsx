"use client";

import { FolderGit2 } from "lucide-react";
import { ProjectCreateDialog } from "./project-create-dialog";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/30 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <FolderGit2 className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Create your first project to start tracking your stacked diffs and branch chains.
      </p>
      <ProjectCreateDialog />
    </div>
  );
}

