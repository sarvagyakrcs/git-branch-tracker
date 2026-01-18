"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, Layers, ArrowRight } from "lucide-react";
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

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <Card 
        className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
        style={{ 
          animationDelay: `${index * 50}ms`,
          animation: 'fadeIn 0.3s ease-out forwards',
          opacity: 0,
        }}
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {project.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              <span className="text-sm">{project.featureCount} features</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <GitBranch className="h-3.5 w-3.5" />
              <span className="text-sm">{project.branchCount} branches</span>
            </div>
          </div>

          {/* Base branch */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Base:</span>
            <code className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">
              {project.masterBranch}
            </code>
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
