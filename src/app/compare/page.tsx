import { Suspense } from "react";
import Link from "next/link";
import { getProjects } from "@/actions/projects";
import { CompareForm } from "@/components/compare/compare-form";
import { ChevronLeft, GitCompare } from "lucide-react";

interface Props {
  searchParams: Promise<{ project?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const projectId = params.project ? parseInt(params.project) : undefined;
  const { data: projects } = await getProjects();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="text-foreground">Compare Branches</span>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GitCompare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Compare Branches
              </h1>
              <p className="text-sm text-muted-foreground">
                Generate git commands to compare branches
              </p>
            </div>
          </div>
        </header>

        <Suspense fallback={<div>Loading...</div>}>
          <CompareForm
            projects={projects || []}
            defaultProjectId={projectId}
          />
        </Suspense>
      </div>
    </div>
  );
}

