import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject } from "@/actions/projects";
import { getFeatures } from "@/actions/features";
import { FeatureCard } from "@/components/features/feature-card";
import { FeatureCreateDialog } from "@/components/features/feature-create-dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, GitCompare, Layers } from "lucide-react";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const id = parseInt(projectId);

  const [projectResult, featuresResult] = await Promise.all([
    getProject(id),
    getFeatures(id),
  ]);

  if (projectResult.error || !projectResult.data) {
    notFound();
  }

  const project = projectResult.data;
  const features = featuresResult.data || [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-foreground">{project.name}</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-1 text-muted-foreground">
                  {project.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-mono bg-muted px-2 py-0.5 rounded">
                  {project.masterBranch}
                </span>
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    View Repository →
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/compare?project=${id}`}>
                <Button variant="outline" size="sm">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </Link>
              <FeatureCreateDialog projectId={id} />
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-medium">Features</h2>
            {features.length > 0 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {features.length}
              </span>
            )}
          </div>

          {features.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No features yet</p>
              <FeatureCreateDialog projectId={id} />
            </div>
          ) : (
            <div className="space-y-3">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  projectId={id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

