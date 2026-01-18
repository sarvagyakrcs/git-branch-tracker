"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Layers, ChevronRight } from "lucide-react";
import Link from "next/link";

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
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group h-full transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-semibold">
              {project.name}
            </CardTitle>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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

          <Badge variant="secondary" className="font-mono text-xs">
            {project.masterBranch}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
