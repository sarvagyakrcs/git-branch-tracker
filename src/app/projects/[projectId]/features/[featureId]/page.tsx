import { notFound } from "next/navigation";
import Link from "next/link";
import { getFeature } from "@/actions/features";
import { BranchStack } from "@/components/branches/branch-stack";
import { BranchCreateDialog } from "@/components/branches/branch-create-dialog";
import { ChevronLeft, GitBranch } from "lucide-react";

interface Props {
  params: Promise<{ projectId: string; featureId: string }>;
}

export default async function FeaturePage({ params }: Props) {
  const { projectId, featureId } = await params;
  const pId = parseInt(projectId);
  const fId = parseInt(featureId);

  const { data: feature, error } = await getFeature(fId);

  if (error || !feature) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <Link
            href={`/projects/${pId}`}
            className="hover:text-foreground transition-colors"
          >
            {feature.project.name}
          </Link>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="text-foreground">{feature.identifier}</span>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: feature.color || "#6366f1" }}
              />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  <span className="font-mono">{feature.identifier}</span>
                  <span className="text-muted-foreground mx-2">•</span>
                  {feature.name}
                </h1>
                {feature.description && (
                  <p className="mt-1 text-muted-foreground">
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
          <div className="mb-4 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-medium">Branch Stack</h2>
            {feature.branches.length > 0 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {feature.branches.length}
              </span>
            )}
          </div>

          {/* Master branch indicator */}
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground pl-4">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="font-mono">{feature.project.masterBranch}</span>
            <span className="text-xs">(base)</span>
          </div>

          {feature.branches.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center ml-4">
              <GitBranch className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No branches in this stack</p>
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
  );
}

