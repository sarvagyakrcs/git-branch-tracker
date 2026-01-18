"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GitBranch, ChevronRight, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { deleteFeature } from "@/actions/features";
import { toast } from "sonner";

interface FeatureCardProps {
  feature: {
    id: number;
    identifier: string;
    name: string;
    description: string | null;
    color: string | null;
    branchCount: number;
    prRaisedCount: number;
  };
  projectId: number;
}

export function FeatureCard({ feature, projectId }: FeatureCardProps) {
  async function handleDelete() {
    if (!confirm(`Delete feature "${feature.identifier}"? This will delete all branches.`)) {
      return;
    }

    const result = await deleteFeature(feature.id, projectId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Feature deleted");
    }
  }

  return (
    <Link href={`/projects/${projectId}/features/${feature.id}`}>
      <Card className="group transition-colors hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: feature.color || "#6366f1" }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">
                    {feature.identifier}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium truncate">{feature.name}</span>
                </div>
                {feature.description && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {feature.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GitBranch className="h-4 w-4" />
                  <span>{feature.branchCount}</span>
                </div>
                {feature.prRaisedCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {feature.prRaisedCount} PR{feature.prRaisedCount !== 1 && "s"}
                  </Badge>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

