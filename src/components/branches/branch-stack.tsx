"use client";

import { BranchItem } from "./branch-item";
import type { Branch } from "@/db/schema";

interface BranchStackProps {
  branches: Branch[];
  projectId: number;
  featureId: number;
  isDeprecated?: boolean;
}

export function BranchStack({
  branches,
  projectId,
  featureId,
  isDeprecated = false,
}: BranchStackProps) {
  return (
    <div className="space-y-2">
      {branches.map((branch, index) => (
        <BranchItem
          key={branch.id}
          branch={branch}
          projectId={projectId}
          featureId={featureId}
          position={index + 1}
          isLast={index === branches.length - 1}
          isDeprecated={isDeprecated}
        />
      ))}
    </div>
  );
}

