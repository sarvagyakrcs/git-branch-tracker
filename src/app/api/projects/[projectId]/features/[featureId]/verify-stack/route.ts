import { NextResponse } from "next/server";
import { db } from "@/db";
import { features, branches, projects } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ projectId: string; featureId: string }>;
}

// GET /api/projects/[projectId]/features/[featureId]/verify-stack
// Returns git commands to verify the branch stack ancestry
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { projectId, featureId } = await params;
    const pId = parseInt(projectId);
    const fId = parseInt(featureId);

    if (isNaN(pId) || isNaN(fId)) {
      return NextResponse.json(
        { data: null, error: "Invalid project or feature ID" },
        { status: 400 }
      );
    }

    // Get project info for master branch
    const [project] = await db
      .select({ masterBranch: projects.masterBranch })
      .from(projects)
      .where(eq(projects.id, pId));

    if (!project) {
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    // Get feature branches in order
    const featureBranches = await db
      .select()
      .from(branches)
      .where(eq(branches.featureId, fId))
      .orderBy(asc(branches.position));

    // Filter to active branches only
    const activeBranches = featureBranches.filter((b) => b.isPartOfStack);

    if (activeBranches.length === 0) {
      return NextResponse.json({
        data: {
          branchCount: 0,
          branches: [],
          baseBranch: project.masterBranch,
          oneLiner: "# No branches to verify",
          script: "# No branches to verify",
        },
        error: null,
      });
    }

    const baseBranch = project.masterBranch;

    // Generate one-liner
    const checks: string[] = [];
    checks.push(
      `(git merge-base --is-ancestor ${baseBranch} ${activeBranches[0].name} && echo "✅ 1. ${activeBranches[0].name} ← ${baseBranch}" || echo "❌ 1. NOT OK")`
    );
    for (let i = 1; i < activeBranches.length; i++) {
      const parent = activeBranches[i - 1].name;
      const child = activeBranches[i].name;
      checks.push(
        `(git merge-base --is-ancestor ${parent} ${child} && echo "✅ ${i + 1}. ${child} ← ${parent}" || echo "❌ ${i + 1}. NOT OK")`
      );
    }
    const oneLiner = checks.join("; ");

    // Generate full script
    const scriptLines: string[] = [
      "#!/bin/bash",
      "# Stack Verification Script (read-only)",
      "# Checks each branch is properly rebased on its parent",
      "# NOTE: Uses local refs only - no remote operations",
      "",
      "echo '🔍 Verifying branch stack (local refs)...'",
      "echo ''",
      "ERRORS=0",
      "",
    ];

    // First branch vs base
    scriptLines.push(`# Check 1: ${activeBranches[0].name} is based on ${baseBranch}`);
    scriptLines.push(`if git merge-base --is-ancestor ${baseBranch} ${activeBranches[0].name} 2>/dev/null; then`);
    scriptLines.push(`  echo "✅ 1. ${activeBranches[0].name}"`);
    scriptLines.push(`  echo "   └─ based on ${baseBranch}"`);
    scriptLines.push(`else`);
    scriptLines.push(`  echo "❌ 1. ${activeBranches[0].name}"`);
    scriptLines.push(`  echo "   └─ NOT based on ${baseBranch}"`);
    scriptLines.push(`  ERRORS=$((ERRORS + 1))`);
    scriptLines.push(`fi`);
    scriptLines.push("echo ''");

    // Subsequent branches
    for (let i = 1; i < activeBranches.length; i++) {
      const parent = activeBranches[i - 1].name;
      const child = activeBranches[i].name;
      scriptLines.push(`# Check ${i + 1}: ${child} is based on ${parent}`);
      scriptLines.push(`if git merge-base --is-ancestor ${parent} ${child} 2>/dev/null; then`);
      scriptLines.push(`  echo "✅ ${i + 1}. ${child}"`);
      scriptLines.push(`  echo "   └─ based on ${parent}"`);
      scriptLines.push(`else`);
      scriptLines.push(`  echo "❌ ${i + 1}. ${child}"`);
      scriptLines.push(`  echo "   └─ NOT based on ${parent}"`);
      scriptLines.push(`  ERRORS=$((ERRORS + 1))`);
      scriptLines.push(`fi`);
      scriptLines.push("echo ''");
    }

    scriptLines.push(`if [ $ERRORS -eq 0 ]; then`);
    scriptLines.push(`  echo "🎉 All ${activeBranches.length} branches are properly stacked!"`);
    scriptLines.push(`else`);
    scriptLines.push(`  echo "⚠️  Found $ERRORS issue(s) in the stack"`);
    scriptLines.push(`  exit 1`);
    scriptLines.push(`fi`);

    return NextResponse.json({
      data: {
        branchCount: activeBranches.length,
        branches: activeBranches.map((b) => ({
          id: b.id,
          name: b.name,
          position: b.position,
          status: b.status,
        })),
        baseBranch,
        oneLiner,
        script: scriptLines.join("\n"),
      },
      error: null,
    });
  } catch (error) {
    console.error("Error generating verify script:", error);
    return NextResponse.json(
      { data: null, error: "Failed to generate verification script" },
      { status: 500 }
    );
  }
}

