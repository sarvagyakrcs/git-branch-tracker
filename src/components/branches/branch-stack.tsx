"use client";

import { useState } from "react";
import { BranchItem } from "./branch-item";
import { Button } from "@/components/ui/button";
import { Check, Copy, X, GitCompare } from "lucide-react";
import { toast } from "sonner";
import type { Branch } from "@/db/schema";

interface BranchStackProps {
  branches: Branch[];
  projectId: number;
  featureId: number;
}

export function BranchStack({ branches, projectId, featureId }: BranchStackProps) {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  function toggleSelect(branchName: string) {
    setSelectedBranches((prev) => {
      if (prev.includes(branchName)) {
        return prev.filter((b) => b !== branchName);
      }
      if (prev.length >= 2) {
        // Replace the second one
        return [prev[0], branchName];
      }
      return [...prev, branchName];
    });
  }

  function clearSelection() {
    setSelectedBranches([]);
  }

  async function copyCommand(type: string) {
    if (selectedBranches.length !== 2) return;
    
    const [parent, child] = selectedBranches;
    let command = "";
    
    switch (type) {
      case "ancestor":
        command = `git merge-base --is-ancestor ${parent} ${child} && echo "✅ ${child} is based on ${parent}" || echo "❌ NOT based on ${parent}"`;
        break;
      case "mergeBase":
        command = `echo "merge-base: $(git merge-base ${parent} ${child})"`;
        break;
      case "diff":
        command = `git diff ${parent}...${child}`;
        break;
      case "log":
        command = `git log ${parent}..${child} --oneline`;
        break;
    }
    
    await navigator.clipboard.writeText(command);
    setCopied(type);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  }

  const hasSelection = selectedBranches.length === 2;

  return (
    <div className="relative">
      {/* Selection hint */}
      {selectedBranches.length > 0 && selectedBranches.length < 2 && (
        <div className="mb-3 ml-4 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
          <GitCompare className="h-4 w-4 inline mr-2" />
          Select another branch to compare (1st = parent, 2nd = child)
        </div>
      )}

      {/* Quick actions bar */}
      {hasSelection && (
        <div className="mb-4 ml-4 flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              <span className="text-muted-foreground">Parent:</span>{" "}
              <code className="text-xs bg-muted px-1 rounded">{selectedBranches[0]}</code>
            </p>
            <p className="text-sm font-medium truncate mt-1">
              <span className="text-muted-foreground">Child:</span>{" "}
              <code className="text-xs bg-muted px-1 rounded">{selectedBranches[1]}</code>
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm"
              variant={copied === "ancestor" ? "default" : "secondary"}
              onClick={() => copyCommand("ancestor")}
              className="h-8 text-xs"
            >
              {copied === "ancestor" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              Ancestry
            </Button>
            <Button
              size="sm"
              variant={copied === "mergeBase" ? "default" : "secondary"}
              onClick={() => copyCommand("mergeBase")}
              className="h-8 text-xs"
            >
              {copied === "mergeBase" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              Merge-base
            </Button>
            <Button
              size="sm"
              variant={copied === "log" ? "default" : "secondary"}
              onClick={() => copyCommand("log")}
              className="h-8 text-xs"
            >
              {copied === "log" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              Log
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Branch list */}
      <div className="relative ml-4">
        {/* Vertical connector line */}
        <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-0">
          {branches.map((branch, index) => (
            <BranchItem
              key={branch.id}
              branch={branch}
              projectId={projectId}
              featureId={featureId}
              isFirst={index === 0}
              isLast={index === branches.length - 1}
              position={index + 1}
              isSelected={selectedBranches.includes(branch.name)}
              selectionOrder={selectedBranches.indexOf(branch.name) + 1}
              onSelect={() => toggleSelect(branch.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
