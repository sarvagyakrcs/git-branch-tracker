import { getProjects } from "@/actions/projects";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectCreateDialog } from "@/components/projects/project-create-dialog";
import { EmptyState } from "@/components/projects/empty-state";
import { AppShell } from "@/components/app-shell";
import { GitBranch } from "lucide-react";

export default async function HomePage() {
  const { data: projects, error } = await getProjects();

  return (
    <AppShell projects={projects || []}>
      <div className="min-h-screen">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
                  <GitBranch className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Branch Tracker</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your stacked diffs
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">⌘K</kbd> for quick actions
              </div>
            </div>
          </header>

          {/* Projects Section */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium">Projects</h2>
                {projects && projects.length > 0 && (
                  <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                    {projects.length}
                  </span>
                )}
              </div>
              {projects && projects.length > 0 && <ProjectCreateDialog />}
            </div>

            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
                <p className="font-medium text-destructive">Failed to load projects</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Make sure DATABASE_URL is set in your .env file
                </p>
              </div>
            ) : !projects || projects.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
