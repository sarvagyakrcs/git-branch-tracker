import { getProject } from "@/actions/projects";
import { getFeatures } from "@/actions/features";
import { FeatureCard } from "@/components/features/feature-card";
import { FeatureCreateDialog } from "@/components/features/feature-create-dialog";
import { EmptyFeatures } from "@/components/features/empty-features";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GitBranch, Layers, Settings } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  if (!projectResult.data) {
    notFound();
  }

  const project = projectResult.data;
  const features = featuresResult.data || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                Projects
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              {project.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <Badge variant="secondary" className="font-mono text-xs gap-1.5">
                  <GitBranch className="h-3 w-3" />
                  {project.masterBranch}
                </Badge>
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    View Repository →
                  </a>
                )}
              </div>
            </div>
            <Link href={`/projects/${id}/compare`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Compare Branches
              </Button>
            </Link>
          </div>
        </header>

        {/* Features Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-medium">Features</h2>
              {features.length > 0 && (
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {features.length}
                </span>
              )}
            </div>
            {features.length > 0 && (
              <FeatureCreateDialog projectId={id} />
            )}
          </div>

          {features.length === 0 ? (
            <EmptyFeatures projectId={id} />
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

