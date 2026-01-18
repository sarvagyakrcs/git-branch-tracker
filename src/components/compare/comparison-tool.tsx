"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Copy, Check, ArrowDown, Terminal } from "lucide-react";
import { toast } from "sonner";

interface Branch {
  id: number;
  name: string;
  shortName: string | null;
  featureId: number;
  featureIdentifier: string;
  featureName: string;
  status: string;
  position: number;
}

interface ComparisonToolProps {
  branches: Branch[];
  masterBranch: string;
}

export function ComparisonTool({ branches, masterBranch }: ComparisonToolProps) {
  const [parentBranch, setParentBranch] = useState<string>("");
  const [childBranch, setChildBranch] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);

  // Group branches by feature
  const branchesByFeature = branches.reduce((acc, branch) => {
    const key = `${branch.featureIdentifier} - ${branch.featureName}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(branch);
    return acc;
  }, {} as Record<string, Branch[]>);

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  }

  const commands = parentBranch && childBranch ? [
    {
      id: "merge-base",
      title: "Get merge base",
      description: "Find the common ancestor commit",
      command: `echo "merge-base: $(git merge-base ${parentBranch} ${childBranch})"`,
    },
    {
      id: "is-ancestor",
      title: "Check ancestry",
      description: "Verify if child is based on parent",
      command: `git merge-base --is-ancestor ${parentBranch} ${childBranch} && echo "✅ ${childBranch} is based on ${parentBranch}" || echo "❌ NOT a child"`,
    },
    {
      id: "diff",
      title: "Show diff",
      description: "Compare changes between branches",
      command: `git diff ${parentBranch}...${childBranch}`,
    },
    {
      id: "log",
      title: "Show commits",
      description: "List commits unique to child branch",
      command: `git log ${parentBranch}..${childBranch} --oneline`,
    },
    {
      id: "rebase",
      title: "Rebase command",
      description: "Rebase child onto parent (use with caution)",
      command: `git checkout ${childBranch} && git rebase ${parentBranch}`,
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Branch Selectors */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Select Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Parent Branch</Label>
              <Select value={parentBranch} onValueChange={setParentBranch}>
                <SelectTrigger className="font-mono text-sm">
                  <SelectValue placeholder="Select parent..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={masterBranch} className="font-mono text-sm">
                    {masterBranch} (base)
                  </SelectItem>
                  {Object.entries(branchesByFeature).map(([feature, featureBranches]) => (
                    <div key={feature}>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {feature}
                      </div>
                      {featureBranches.map((branch) => (
                        <SelectItem
                          key={branch.id}
                          value={branch.name}
                          className="font-mono text-sm"
                        >
                          {branch.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Child Branch</Label>
              <Select value={childBranch} onValueChange={setChildBranch}>
                <SelectTrigger className="font-mono text-sm">
                  <SelectValue placeholder="Select child..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(branchesByFeature).map(([feature, featureBranches]) => (
                    <div key={feature}>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {feature}
                      </div>
                      {featureBranches.map((branch) => (
                        <SelectItem
                          key={branch.id}
                          value={branch.name}
                          className="font-mono text-sm"
                        >
                          {branch.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {parentBranch && childBranch && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="font-mono text-xs">
                {parentBranch}
              </Badge>
              <ArrowDown className="h-4 w-4" />
              <Badge variant="secondary" className="font-mono text-xs">
                {childBranch}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Commands */}
      {commands.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Git Commands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {commands.map((cmd) => (
              <div key={cmd.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{cmd.title}</p>
                    <p className="text-xs text-muted-foreground">{cmd.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => copyToClipboard(cmd.command, cmd.id)}
                  >
                    {copied === cmd.id ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copy
                  </Button>
                </div>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono">
                  {cmd.command}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!parentBranch || !childBranch ? (
        <div className="rounded-lg border border-dashed border-border/50 bg-card/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Select two branches to generate comparison commands
          </p>
        </div>
      ) : null}
    </div>
  );
}

