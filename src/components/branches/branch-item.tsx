"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    toast.success("Copied to clipboard", {
      description: branch.name,
    });
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
    <TooltipProvider delayDuration={300}>
      <div className="relative flex items-start gap-3 py-1.5 group/item">
        {/* Selection dot */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onSelect}
              className={`relative z-10 mt-3.5 h-4 w-4 rounded-full border-2 transition-all cursor-pointer hover:scale-110 ${
                isSelected
                  ? "border-primary bg-primary shadow-md shadow-primary/30"
                  : isDeprecated
                  ? "border-muted-foreground/30 bg-background hover:border-primary/50"
                  : "border-primary/60 bg-background hover:border-primary hover:bg-primary/10"
              }`}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                  {selectionOrder}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            {isSelected 
              ? `Selected as ${selectionOrder === 1 ? "parent" : "child"}`
              : "Click to select for compare"
            }
          </TooltipContent>
        </Tooltip>

        {/* Branch card */}
        <Card
          className={`flex-1 border-border/50 transition-all duration-150 ${
            isDeprecated 
              ? "opacity-50 bg-card/30" 
              : "bg-card/50 hover:bg-card/80 hover:border-border"
          } ${isSelected ? "ring-1 ring-primary/40 bg-primary/5" : ""}`}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {/* Branch name row */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/70 font-mono tabular-nums w-5">
                    {position}.
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleCopy}
                        className={`font-mono text-xs hover:text-primary transition-colors text-left break-all ${
                          isDeprecated ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {branch.name}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Click to copy</TooltipContent>
                  </Tooltip>
                  {copied && (
                    <Check className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  )}
                </div>

                {/* Status row */}
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <BranchLifecycle status={branch.status} compact />

                  {branch.prUrl && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={branch.prUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {branch.prNumber ? `#${branch.prNumber}` : "PR"}
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Open PR in new tab</TooltipContent>
                    </Tooltip>
                  )}

                  {!branch.isPartOfStack && (
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
                      removed from stack
                    </span>
                  )}
                </div>

                {branch.notes && (
                  <p className="mt-2 text-xs text-muted-foreground/70 line-clamp-1">
                    {branch.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Stage
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-44">
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
                              {isActive && <Check className="h-3 w-3 ml-auto text-primary" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
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
    </TooltipProvider>
  );
}
