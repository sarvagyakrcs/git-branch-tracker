"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check, ArrowRight } from "lucide-react";
import { getProjectBranches } from "@/actions/branches";
import { toast } from "sonner";

// Generate git commands for comparison (pure function, no server needed)
function generateCompareCommands(parentBranch: string, childBranch: string) {
  return {
    mergeBase: `echo "merge-base: $(git merge-base ${parentBranch} ${childBranch})"`,
    isAncestor: `git merge-base --is-ancestor ${parentBranch} ${childBranch} && echo "✅ ${childBranch} is based on ${parentBranch}" || echo "❌ NOT based on ${parentBranch}"`,
    diff: `git diff ${parentBranch}...${childBranch}`,
    log: `git log ${parentBranch}..${childBranch} --oneline`,
    rebase: `git rebase ${parentBranch} ${childBranch}`,
    cherry: `git cherry -v ${parentBranch} ${childBranch}`,
  };
}

interface Project {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
  featureId: number;
  featureIdentifier: string;
  featureName: string;
}

interface CompareFormProps {
  projects: Project[];
  defaultProjectId?: number;
}

export function CompareForm({ projects, defaultProjectId }: CompareFormProps) {
  const [projectId, setProjectId] = useState<string>(
    defaultProjectId?.toString() || ""
  );
  const [branches, setBranches] = useState<Branch[]>([]);
  const [parentBranch, setParentBranch] = useState<string>("");
  const [childBranch, setChildBranch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  // Fetch branches when project changes
  useEffect(() => {
    if (!projectId) {
      setBranches([]);
      return;
    }

    async function fetchBranches() {
      setLoading(true);
      const result = await getProjectBranches(parseInt(projectId));
      setBranches(result.data || []);
      setParentBranch("");
      setChildBranch("");
      setLoading(false);
    }

    fetchBranches();
  }, [projectId]);

  const commands = parentBranch && childBranch
    ? generateCompareCommands(parentBranch, childBranch)
    : null;

  async function copyCommand(key: string, command: string) {
    await navigator.clipboard.writeText(command);
    setCopiedCommand(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedCommand(null), 2000);
  }

  // Group branches by feature
  const branchesByFeature = branches.reduce((acc, branch) => {
    const key = `${branch.featureIdentifier} - ${branch.featureName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(branch);
    return acc;
  }, {} as Record<string, Branch[]>);

  return (
    <div className="space-y-6">
      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Branches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project selector */}
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {projectId && (
            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
              {/* Parent branch */}
              <div className="space-y-2">
                <Label>Parent Branch</Label>
                <Select
                  value={parentBranch}
                  onValueChange={setParentBranch}
                  disabled={loading || branches.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(branchesByFeature).map(([feature, featureBranches]) => (
                      <div key={feature}>
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          {feature}
                        </div>
                        {featureBranches.map((b) => (
                          <SelectItem key={b.id} value={b.name}>
                            <span className="font-mono text-xs">{b.name}</span>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground mb-2" />

              {/* Child branch */}
              <div className="space-y-2">
                <Label>Child Branch</Label>
                <Select
                  value={childBranch}
                  onValueChange={setChildBranch}
                  disabled={loading || branches.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select child" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(branchesByFeature).map(([feature, featureBranches]) => (
                      <div key={feature}>
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          {feature}
                        </div>
                        {featureBranches.map((b) => (
                          <SelectItem key={b.id} value={b.name}>
                            <span className="font-mono text-xs">{b.name}</span>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {branches.length === 0 && projectId && !loading && (
            <p className="text-sm text-muted-foreground">
              No branches found. Add branches to your features first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Generated Commands */}
      {commands && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Git Commands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CommandBlock
              title="Check merge base"
              command={commands.mergeBase}
              copied={copiedCommand === "mergeBase"}
              onCopy={() => copyCommand("mergeBase", commands.mergeBase)}
            />

            <CommandBlock
              title="Check if child is based on parent"
              command={commands.isAncestor}
              copied={copiedCommand === "isAncestor"}
              onCopy={() => copyCommand("isAncestor", commands.isAncestor)}
            />

            <CommandBlock
              title="View diff"
              command={commands.diff}
              copied={copiedCommand === "diff"}
              onCopy={() => copyCommand("diff", commands.diff)}
            />

            <CommandBlock
              title="View commits"
              command={commands.log}
              copied={copiedCommand === "log"}
              onCopy={() => copyCommand("log", commands.log)}
            />

            <CommandBlock
              title="Cherry-pick check (commits in child not in parent)"
              command={commands.cherry}
              copied={copiedCommand === "cherry"}
              onCopy={() => copyCommand("cherry", commands.cherry)}
            />

            <CommandBlock
              title="Rebase child onto parent"
              command={commands.rebase}
              copied={copiedCommand === "rebase"}
              onCopy={() => copyCommand("rebase", commands.rebase)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CommandBlock({
  title,
  command,
  copied,
  onCopy,
}: {
  title: string;
  command: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">{title}</Label>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={onCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      <pre className="p-3 rounded-lg bg-muted font-mono text-sm overflow-x-auto">
        {command}
      </pre>
    </div>
  );
}

