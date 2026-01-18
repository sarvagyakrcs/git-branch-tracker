import { getFeature } from "@/actions/features";
import { BranchStack } from "@/components/branches/branch-stack";
import { BranchCreateDialog } from "@/components/branches/branch-create-dialog";
import { EmptyBranches } from "@/components/branches/empty-branches";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GitBranch } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ projectId: string; featureId: string }>;
}

export default async function FeaturePage({ params }: Props) {
  const { projectId, featureId } = await params;
  const projId = parseInt(projectId);
  const featId = parseInt(featureId);

  const { data: feature, error } = await getFeature(featId);

  if (!feature || error) {
    notFound();
  }

  const activeBranches = feature.branches.filter((b) => b.isPartOfStack);
  const deprecatedBranches = feature.branches.filter((b) => !b.isPartOfStack);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-4">
            <Link href={`/projects/${projId}`}>
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                {feature.project.name}
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: `${feature.color}20`,
                    color: feature.color || "#6366f1",
                  }}
                >
                  {feature.identifier.slice(0, 4)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {feature.name}
                  </h1>
                  <p className="text-sm text-muted-foreground font-mono">
                    #{feature.identifier}
                  </p>
                </div>
              </div>
              {feature.description && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              )}
            </div>
            <BranchCreateDialog projectId={projId} featureId={featId} />
          </div>
        </header>

        {/* Branch Stack */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-medium">Branch Stack</h2>
            {activeBranches.length > 0 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {activeBranches.length}
              </span>
            )}
          </div>

          {feature.branches.length === 0 ? (
            <EmptyBranches projectId={projId} featureId={featId} />
          ) : (
            <div className="space-y-6">
              {/* Base branch indicator */}
              <div className="flex items-center gap-3 pl-4">
                <Badge variant="outline" className="font-mono text-xs">
                  {feature.project.masterBranch}
                </Badge>
                <span className="text-xs text-muted-foreground">base branch</span>
              </div>

              {/* Stack connector */}
              {activeBranches.length > 0 && (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                  <BranchStack
                    branches={activeBranches}
                    projectId={projId}
                    featureId={featId}
                  />
                </div>
              )}

              {/* Deprecated branches */}
              {deprecatedBranches.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                    Deprecated ({deprecatedBranches.length})
                  </h3>
                  <div className="space-y-2 opacity-60">
                    <BranchStack
                      branches={deprecatedBranches}
                      projectId={projId}
                      featureId={featId}
                      isDeprecated
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

