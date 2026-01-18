"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Layers, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteProject } from "@/actions/projects";
import { toast } from "sonner";

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    description: string | null;
    masterBranch: string;
    repoUrl: string | null;
    createdAt: Date;
    featureCount: number;
    branchCount: number;
  };
  index: number;
}

export function ProjectCard({ project }: ProjectCardProps) {
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Delete project "${project.name}"? This will delete all features and branches.`)) {
      return;
    }

    const result = await deleteProject(project.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Project deleted");
    }
  }

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group h-full transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-semibold">
              {project.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive -mr-2 -mt-1"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              <span>{project.featureCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitBranch className="h-4 w-4" />
              <span>{project.branchCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="font-mono text-xs">
              {project.masterBranch}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
