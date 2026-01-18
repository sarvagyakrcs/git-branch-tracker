import { Suspense } from "react";
import Link from "next/link";
import { getProjects } from "@/actions/projects";
import { CompareForm } from "@/components/compare/compare-form";
import { AppShell } from "@/components/app-shell";
import { ChevronRight, GitCompare, Home } from "lucide-react";

interface Props {
  searchParams: Promise<{ project?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const projectId = params.project ? parseInt(params.project) : undefined;
  const { data: projects } = await getProjects();

  return (
    <AppShell projects={(projects || []).map(p => ({ id: p.id, name: p.name }))}>
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span>Projects</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Compare</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
                <GitCompare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Compare Branches
                </h1>
                <p className="text-sm text-muted-foreground">
                  Generate git commands for ancestry checks
                </p>
              </div>
            </div>
          </header>

          <Suspense fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded-lg w-full"></div>
              <div className="h-10 bg-muted rounded-lg w-full"></div>
            </div>
          }>
            <CompareForm
              projects={projects || []}
              defaultProjectId={projectId}
            />
          </Suspense>
        </div>
      </div>
    </AppShell>
  );
}
