"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GitBranch, ArrowRight, MoreHorizontal, Trash2 } from "lucide-react";
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
  index?: number;
}

export function FeatureCard({ feature, projectId, index = 0 }: FeatureCardProps) {
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
    <Link href={`/projects/${projectId}/features/${feature.id}`} className="block group">
      <Card 
        className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-card/80"
        style={{ 
          animationDelay: `${index * 50}ms`,
          animation: 'fadeIn 0.3s ease-out forwards',
          opacity: 0,
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Color indicator */}
              <div
                className="h-8 w-1 rounded-full shrink-0"
                style={{ backgroundColor: feature.color || "#5eead4" }}
              />
              
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm font-medium text-primary">
                    {feature.identifier}
                  </code>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="font-medium truncate">{feature.name}</span>
                </div>
                {feature.description && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {feature.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Branch count */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <GitBranch className="h-3.5 w-3.5" />
                <span>{feature.branchCount}</span>
              </div>

              {/* PR count badge */}
              {feature.prRaisedCount > 0 && (
                <div className="text-xs bg-teal-400/10 text-teal-400 px-2 py-0.5 rounded-full">
                  {feature.prRaisedCount} PR{feature.prRaisedCount !== 1 && "s"}
                </div>
              )}

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
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

              {/* Arrow */}
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Link>
  );
}
