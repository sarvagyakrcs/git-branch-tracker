import { notFound } from "next/navigation";
import Link from "next/link";
import { getFeature } from "@/actions/features";
import { getProjects } from "@/actions/projects";
import { BranchStack } from "@/components/branches/branch-stack";
import { BranchCreateDialog } from "@/components/branches/branch-create-dialog";
import { AppShell } from "@/components/app-shell";
import { ChevronRight, GitBranch, Home } from "lucide-react";

interface Props {
  params: Promise<{ projectId: string; featureId: string }>;
}

export default async function FeaturePage({ params }: Props) {
  const { projectId, featureId } = await params;
  const pId = parseInt(projectId);
  const fId = parseInt(featureId);

  const [featureResult, projectsResult] = await Promise.all([
    getFeature(fId),
    getProjects(),
  ]);

  if (featureResult.error || !featureResult.data) {
    notFound();
  }

  const feature = featureResult.data;
  const projects = projectsResult.data || [];

  return (
    <AppShell projects={projects.map(p => ({ id: p.id, name: p.name }))}>
      <div className="min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span>Projects</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/projects/${pId}`}
              className="hover:text-foreground transition-colors"
            >
              {feature.project.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{feature.identifier}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="h-1.5 w-1.5 rounded-full mt-3 shrink-0"
                  style={{ backgroundColor: feature.color || "#5eead4" }}
                />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    <code className="font-mono text-primary">{feature.identifier}</code>
                    <span className="text-muted-foreground/50 mx-2">·</span>
                    {feature.name}
                  </h1>
                  {feature.description && (
                    <p className="mt-2 text-muted-foreground max-w-2xl">
                      {feature.description}
                    </p>
                  )}
                </div>
              </div>
              <BranchCreateDialog
                featureId={fId}
                projectId={pId}
                featureIdentifier={feature.identifier}
              />
            </div>
          </header>

          {/* Branch Stack */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-medium">Branch Stack</h2>
              {feature.branches.length > 0 && (
                <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                  {feature.branches.length}
                </span>
              )}
            </div>

            {/* Base branch indicator */}
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground ml-4">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
              <code className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">
                {feature.project.masterBranch}
              </code>
              <span className="text-xs text-muted-foreground/60">(base branch)</span>
            </div>

            {feature.branches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-10 text-center ml-4">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">No branches yet</p>
                <p className="text-sm text-muted-foreground/70 mb-6 max-w-sm mx-auto">
                  Add branches to build your stack. Click the dots to select branches for comparison.
                </p>
                <BranchCreateDialog
                  featureId={fId}
                  projectId={pId}
                  featureIdentifier={feature.identifier}
                />
              </div>
            ) : (
              <BranchStack
                branches={feature.branches}
                projectId={pId}
                featureId={fId}
              />
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
