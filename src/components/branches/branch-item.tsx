"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Copy,
  ExternalLink,
  Trash2,
  Edit,
  Check,
  Circle,
  RotateCcw,
  GitPullRequest,
  Eye,
  MessageSquare,
  CheckCircle2,
  GitMerge,
  Ban,
} from "lucide-react";
import { deleteBranch, updateBranch } from "@/actions/branches";
import { toast } from "sonner";
import { BranchEditSheet } from "./branch-edit-sheet";
import { BranchLifecycle } from "./branch-lifecycle";
import type { Branch } from "@/db/schema";

interface BranchItemProps {
  branch: Branch;
  projectId: number;
  featureId: number;
  isFirst: boolean;
  isLast: boolean;
  position: number;
  isSelected?: boolean;
  selectionOrder?: number;
  onSelect?: () => void;
}

// Lifecycle stage menu items
const STAGE_MENU_ITEMS = [
  { key: "created", label: "Created", icon: Circle },
  { key: "wip", label: "WIP", icon: RotateCcw },
  { key: "pr_created", label: "PR Created", icon: GitPullRequest },
  { key: "in_review", label: "In Review", icon: Eye },
  { key: "changes_requested", label: "Changes Requested", icon: MessageSquare },
  { key: "approved", label: "Approved", icon: CheckCircle2 },
  { key: "merged", label: "Merged", icon: GitMerge },
  { key: "deprecated", label: "Deprecated", icon: Ban },
];

export function BranchItem({
  branch,
  projectId,
  featureId,
  isFirst,
  isLast,
  position,
  isSelected,
  selectionOrder,
  onSelect,
}: BranchItemProps) {
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const isDeprecated = branch.status === "deprecated" || !branch.isPartOfStack;

  async function handleCopy() {
    await navigator.clipboard.writeText(branch.name);
    setCopied(true);
    toast.success("Branch name copied");
    setTimeout(() => setCopied(false), 2000);
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

  async function handleStatusChange(status: string) {
    const result = await updateBranch(branch.id, {
      status,
      projectId,
      featureId,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Status updated");
    }
  }

  return (
    <>
      <div className="relative flex items-start gap-3 py-2">
        {/* Connector dot - clickable for selection */}
        <button
          onClick={onSelect}
          className={`relative z-10 mt-4 h-4 w-4 rounded-full border-2 transition-all cursor-pointer hover:scale-125 ${
            isSelected
              ? "border-primary bg-primary"
              : isDeprecated
              ? "border-muted-foreground/30 bg-background hover:border-primary/50"
              : "border-primary bg-background hover:bg-primary/20"
          }`}
          title={isSelected ? `Selected as ${selectionOrder === 1 ? "parent" : "child"}` : "Click to select for comparison"}
        >
          {isSelected && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              {selectionOrder}
            </span>
          )}
        </button>

        {/* Branch card */}
        <Card
          className={`flex-1 transition-all ${
            isDeprecated ? "opacity-50" : "hover:bg-accent/50"
          } ${isSelected ? "ring-2 ring-primary/50" : ""}`}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-mono">
                    {position}.
                  </span>
                  <button
                    onClick={handleCopy}
                    className={`font-mono text-sm hover:text-primary transition-colors text-left truncate ${
                      isDeprecated ? "line-through" : ""
                    }`}
                    title="Click to copy"
                  >
                    {branch.name}
                  </button>
                  {copied && (
                    <Check className="h-3 w-3 text-emerald-500" />
                  )}
                </div>

                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <BranchLifecycle status={branch.status} compact />

                  {branch.prUrl && (
                    <a
                      href={branch.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {branch.prNumber ? `PR #${branch.prNumber}` : "View PR"}
                    </a>
                  )}

                  {!branch.isPartOfStack && (
                    <span className="text-xs text-muted-foreground">
                      (not in stack)
                    </span>
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
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Set stage
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-48">
                        {STAGE_MENU_ITEMS.map((item) => {
                          const Icon = item.icon;
                          const isActive = branch.status === item.key;
                          return (
                            <DropdownMenuItem
                              key={item.key}
                              onClick={() => handleStatusChange(item.key)}
                              className={isActive ? "bg-accent" : ""}
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {item.label}
                              {isActive && <Check className="h-3 w-3 ml-auto" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </div>

      <BranchEditSheet
        branch={branch}
        projectId={projectId}
        featureId={featureId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

