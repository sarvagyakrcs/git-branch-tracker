import { getProjects } from "@/actions/projects";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectCreateDialog } from "@/components/projects/project-create-dialog";
import { EmptyState } from "@/components/projects/empty-state";
import { GitBranch, Sparkles } from "lucide-react";

export default async function HomePage() {
  const { data: projects, error } = await getProjects();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Branch Tracker</h1>
              <p className="text-sm text-muted-foreground">
                Manage your stacked diffs
              </p>
            </div>
          </div>
        </header>

        {/* Projects Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-medium">Projects</h2>
              {projects && projects.length > 0 && (
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {projects.length}
                </span>
              )}
            </div>
            {projects && projects.length > 0 && <ProjectCreateDialog />}
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
              <p className="font-medium text-destructive">Failed to load projects</p>
              <p className="mt-1 text-destructive/80">
                Check your DATABASE_URL in .env file
              </p>
            </div>
          ) : !projects || projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
