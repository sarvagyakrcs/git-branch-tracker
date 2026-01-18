"use client";

import { useState } from "react";
import { BranchItem } from "./branch-item";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Copy, X, GitCompare, ListChecks, Terminal } from "lucide-react";
import { toast } from "sonner";
import type { Branch } from "@/db/schema";

interface BranchStackProps {
  branches: Branch[];
  projectId: number;
  featureId: number;
  baseBranch?: string;
}

export function BranchStack({ branches, projectId, featureId, baseBranch = "main" }: BranchStackProps) {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);

  // Filter only active branches for verification
  const activeBranches = branches.filter(b => b.isPartOfStack && b.status !== "deprecated");

  function toggleSelect(branchName: string) {
    setSelectedBranches((prev) => {
      if (prev.includes(branchName)) {
        return prev.filter((b) => b !== branchName);
      }
      if (prev.length >= 2) {
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

  // Generate batch verification script (read-only, no fetch/pull)
  function generateVerifyScript(): string {
    if (activeBranches.length === 0) return "# No branches to verify";

    const lines: string[] = [
      "#!/bin/bash",
      "# Stack Verification Script (read-only)",
      "# Checks each branch is properly rebased on its parent",
      "# NOTE: Uses local refs only - no remote operations",
      "",
      "echo '🔍 Verifying branch stack (local refs)...'",
      "echo ''",
      "ERRORS=0",
      "",
    ];

    // First branch should be based on the base branch (main/master)
    const firstBranch = activeBranches[0].name;
    lines.push(`# Check 1: ${firstBranch} is based on ${baseBranch}`);
    lines.push(`if git merge-base --is-ancestor ${baseBranch} ${firstBranch} 2>/dev/null; then`);
    lines.push(`  echo "✅ 1. ${firstBranch}"`);
    lines.push(`  echo "   └─ based on ${baseBranch}"`);
    lines.push(`else`);
    lines.push(`  echo "❌ 1. ${firstBranch}"`);
    lines.push(`  echo "   └─ NOT based on ${baseBranch}"`);
    lines.push(`  ERRORS=$((ERRORS + 1))`);
    lines.push(`fi`);
    lines.push("echo ''");

    // Check each subsequent branch
    for (let i = 1; i < activeBranches.length; i++) {
      const parent = activeBranches[i - 1].name;
      const child = activeBranches[i].name;
      
      lines.push(`# Check ${i + 1}: ${child} is based on ${parent}`);
      lines.push(`if git merge-base --is-ancestor ${parent} ${child} 2>/dev/null; then`);
      lines.push(`  echo "✅ ${i + 1}. ${child}"`);
      lines.push(`  echo "   └─ based on ${parent}"`);
      lines.push(`else`);
      lines.push(`  echo "❌ ${i + 1}. ${child}"`);
      lines.push(`  echo "   └─ NOT based on ${parent}"`);
      lines.push(`  ERRORS=$((ERRORS + 1))`);
      lines.push(`fi`);
      lines.push("echo ''");
    }

    lines.push(`if [ $ERRORS -eq 0 ]; then`);
    lines.push(`  echo "🎉 All ${activeBranches.length} branches are properly stacked!"`);
    lines.push(`else`);
    lines.push(`  echo "⚠️  Found $ERRORS issue(s) in the stack"`);
    lines.push(`  exit 1`);
    lines.push(`fi`);

    return lines.join("\n");
  }

  // Generate one-liner for quick check (read-only, local refs only)
  function generateOneLiner(): string {
    if (activeBranches.length === 0) return "# No branches to verify";

    const checks: string[] = [];
    
    // First branch vs base
    checks.push(
      `(git merge-base --is-ancestor ${baseBranch} ${activeBranches[0].name} && echo "✅ 1. ${activeBranches[0].name} ← ${baseBranch}" || echo "❌ 1. NOT OK")`
    );

    // Subsequent branches
    for (let i = 1; i < activeBranches.length; i++) {
      const parent = activeBranches[i - 1].name;
      const child = activeBranches[i].name;
      checks.push(
        `(git merge-base --is-ancestor ${parent} ${child} && echo "✅ ${i + 1}. ${child} ← ${parent}" || echo "❌ ${i + 1}. NOT OK")`
      );
    }

    return checks.join("; ");
  }

  async function copyVerifyScript(type: "full" | "oneliner") {
    const script = type === "full" ? generateVerifyScript() : generateOneLiner();
    await navigator.clipboard.writeText(script);
    setCopied(type);
    toast.success("Copied to clipboard", {
      description: type === "full" ? "Full bash script" : "One-liner command",
    });
    setTimeout(() => setCopied(null), 2000);
  }

  const hasSelection = selectedBranches.length === 2;

  return (
    <div className="relative">
      {/* Stack actions toolbar */}
      {activeBranches.length > 1 && (
        <div className="mb-4 ml-4 flex items-center gap-2">
          <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <ListChecks className="h-3.5 w-3.5 mr-1.5" />
                Verify Stack
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Verify Stack Ancestry
                </DialogTitle>
                <DialogDescription>
                  Check that each branch is properly rebased on the previous one.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 flex-1 overflow-y-auto">
                {/* Stack visualization */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground mb-3">Will verify {activeBranches.length} branches (local refs, read-only):</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{baseBranch}</code>
                      <span className="text-muted-foreground text-xs">(base)</span>
                    </div>
                    {activeBranches.map((branch, idx) => (
                      <div key={branch.id} className="flex items-center gap-2 text-sm pl-4">
                        <span className="text-muted-foreground">↳</span>
                        <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                        <code className="font-mono text-xs">{branch.name}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {/* One-liner */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Quick Check (one-liner)</p>
                    <Button
                      size="sm"
                      variant={copied === "oneliner" ? "default" : "secondary"}
                      onClick={() => copyVerifyScript("oneliner")}
                      className="h-7 text-xs"
                    >
                      {copied === "oneliner" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                    {generateOneLiner()}
                  </pre>
                </div>

                {/* Full script */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Full Bash Script</p>
                    <Button
                      size="sm"
                      variant={copied === "full" ? "default" : "secondary"}
                      onClick={() => copyVerifyScript("full")}
                      className="h-7 text-xs"
                    >
                      {copied === "full" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 overflow-x-auto max-h-64">
                    {generateVerifyScript()}
                  </pre>
                </div>

                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <Terminal className="h-3.5 w-3.5 inline mr-1.5" />
                    <strong>Run in your repo directory.</strong> Read-only check:
                  </p>
                  <ul className="text-xs text-muted-foreground ml-5 list-disc space-y-0.5">
                    <li>Uses local branch refs only (no fetch/pull)</li>
                    <li>Does NOT modify any branches</li>
                    <li>Checks each branch is an ancestor of the next</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <span className="text-xs text-muted-foreground">
            or click dots to select 2 branches
          </span>
        </div>
      )}

      {/* Selection hint */}
      {selectedBranches.length > 0 && selectedBranches.length < 2 && (
        <div className="mb-3 ml-4 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
          <GitCompare className="h-4 w-4 inline mr-2" />
          Select another branch to compare (1st = parent, 2nd = child)
        </div>
      )}

      {/* Quick actions bar for 2 selected branches */}
      {hasSelection && (
        <div className="mb-4 ml-4 flex flex-col gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Parent:</span>{" "}
              <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded break-all">{selectedBranches[0]}</code>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Child:</span>{" "}
              <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded break-all">{selectedBranches[1]}</code>
            </p>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
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
              className="h-8 w-8 p-0 ml-auto"
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
