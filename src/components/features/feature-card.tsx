"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
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
    activeBranchCount: number;
  };
  projectId: number;
}

export function FeatureCard({ feature, projectId }: FeatureCardProps) {
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

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
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ 
                backgroundColor: `${feature.color}20`,
                color: feature.color || '#6366f1'
              }}
            >
              {feature.identifier.slice(0, 4)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">
                  #{feature.identifier}
                </span>
                <span className="font-medium">{feature.name}</span>
              </div>
              {feature.description && (
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                  {feature.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>
                {feature.activeBranchCount}
                {feature.branchCount !== feature.activeBranchCount && (
                  <span className="text-muted-foreground/60">
                    /{feature.branchCount}
                  </span>
                )}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

