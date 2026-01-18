"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ExternalLink,
  MoreHorizontal,
  Copy,
  Trash2,
  ArchiveX,
  ArchiveRestore,
  Check,
} from "lucide-react";
import { updateBranch, deleteBranch } from "@/actions/branches";
import { toast } from "sonner";
import type { Branch } from "@/db/schema";
import { BranchEditDialog } from "./branch-edit-dialog";

interface BranchItemProps {
  branch: Branch;
  projectId: number;
  featureId: number;
  position: number;
  isLast: boolean;
  isDeprecated?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  pr_raised: { label: "PR Raised", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  merged: { label: "Merged", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  deprecated: { label: "Deprecated", className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
  blocked: { label: "Blocked", className: "bg-red-500/10 text-red-500 border-red-500/20" },
};

export function BranchItem({
  branch,
  projectId,
  featureId,
  position,
  isDeprecated = false,
}: BranchItemProps) {
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const statusConfig = STATUS_CONFIG[branch.status] || STATUS_CONFIG.active;

  async function copyBranchName() {
    await navigator.clipboard.writeText(branch.name);
    setCopied(true);
    toast.success("Branch name copied");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleToggleStack() {
    const result = await updateBranch(branch.id, {
      projectId,
      featureId,
      isPartOfStack: !branch.isPartOfStack,
      status: !branch.isPartOfStack ? "active" : "deprecated",
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(branch.isPartOfStack ? "Marked as deprecated" : "Restored to stack");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete branch "${branch.name}"?`)) return;

    const result = await deleteBranch(branch.id, projectId, featureId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Branch deleted");
    }
  }

  return (
    <>
      <Card className={`relative ${isDeprecated ? "opacity-60" : ""}`}>
        {/* Position indicator */}
        {!isDeprecated && (
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-background border-2 border-border text-xs font-medium">
            {position}
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm font-medium truncate">{branch.name}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={copyBranchName}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {branch.shortName && (
                <p className="text-xs text-muted-foreground mb-2">
                  {branch.shortName}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>

                {branch.prUrl && (
                  <a
                    href={branch.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {branch.prNumber ? `PR #${branch.prNumber}` : "View PR"}
                  </a>
                )}
              </div>

              {branch.notes && (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {branch.notes}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyBranchName}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy name
                </DropdownMenuItem>
                {branch.prUrl && (
                  <DropdownMenuItem asChild>
                    <a href={branch.prUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open PR
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleStack}>
                  {branch.isPartOfStack ? (
                    <>
                      <ArchiveX className="mr-2 h-4 w-4" />
                      Mark as deprecated
                    </>
                  ) : (
                    <>
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Restore to stack
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <BranchEditDialog
        branch={branch}
        projectId={projectId}
        featureId={featureId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

