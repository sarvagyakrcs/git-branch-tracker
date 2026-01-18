import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, getProjects } from "@/actions/projects";
import { getFeatures } from "@/actions/features";
import { FeatureCard } from "@/components/features/feature-card";
import { FeatureCreateDialog } from "@/components/features/feature-create-dialog";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ChevronRight, GitCompare, Layers, Home } from "lucide-react";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const id = parseInt(projectId);

  const [projectResult, featuresResult, projectsResult] = await Promise.all([
    getProject(id),
    getFeatures(id),
    getProjects(),
  ]);

  if (projectResult.error || !projectResult.data) {
    notFound();
  }

  const project = projectResult.data;
  const features = featuresResult.data || [];
  const projects = projectsResult.data || [];

  return (
    <AppShell 
      projects={projects.map(p => ({ id: p.id, name: p.name }))}
      features={features.map(f => ({ 
        id: f.id, 
        identifier: f.identifier, 
        name: f.name, 
        projectId: id 
      }))}
    >
      <div className="min-h-screen">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span>Projects</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{project.name}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="mt-2 text-muted-foreground max-w-2xl">
                    {project.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded border border-border/50">
                    {project.masterBranch}
                  </code>
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      View repo →
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/compare?project=${id}`}>
                  <Button variant="outline" size="sm" className="h-9">
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
            <div className="mb-6 flex items-center gap-3">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-medium">Features</h2>
              {features.length > 0 && (
                <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                  {features.length}
                </span>
              )}
            </div>

            {features.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-10 text-center">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No features yet</p>
                <p className="text-sm text-muted-foreground/70 mb-6 max-w-sm mx-auto">
                  Features group related branches together. E.g., "11627" could group all branches for ticket #11627.
                </p>
                <FeatureCreateDialog projectId={id} />
              </div>
            ) : (
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    projectId={id}
                    index={index}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
