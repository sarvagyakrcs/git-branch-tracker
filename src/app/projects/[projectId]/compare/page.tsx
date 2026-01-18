import { getProject } from "@/actions/projects";
import { getAllBranchesForProject } from "@/actions/branches";
import { ComparisonTool } from "@/components/compare/comparison-tool";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GitCompare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ComparePage({ params }: Props) {
  const { projectId } = await params;
  const id = parseInt(projectId);

  const [projectResult, branchesResult] = await Promise.all([
    getProject(id),
    getAllBranchesForProject(id),
  ]);

  if (!projectResult.data) {
    notFound();
  }

  const project = projectResult.data;
  const branches = branchesResult.data || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-4">
            <Link href={`/projects/${id}`}>
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                {project.name}
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GitCompare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Branch Comparison
              </h1>
              <p className="text-sm text-muted-foreground">
                Check ancestry and generate git commands
              </p>
            </div>
          </div>
        </header>

        {/* Comparison Tool */}
        <ComparisonTool
          branches={branches}
          masterBranch={project.masterBranch}
        />
      </div>
    </div>
  );
}

