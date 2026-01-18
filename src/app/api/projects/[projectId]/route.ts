import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, features, branches } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId] - Get a single project with details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const id = parseInt(projectId);

    if (isNaN(id)) {
      return NextResponse.json(
        { data: null, error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const [project] = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        masterBranch: projects.masterBranch,
        repoUrl: projects.repoUrl,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        featureCount: sql<number>`(
          SELECT COUNT(*) FROM ${features} 
          WHERE ${features.projectId} = ${projects.id}
        )`.mapWith(Number),
        branchCount: sql<number>`(
          SELECT COUNT(*) FROM ${branches} b
          JOIN ${features} f ON b.feature_id = f.id
          WHERE f.project_id = ${projects.id}
        )`.mapWith(Number),
      })
      .from(projects)
      .where(eq(projects.id, id));

    if (!project) {
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: project, error: null });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId] - Update a project
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const id = parseInt(projectId);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { data: null, error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const { name, description, masterBranch, repoUrl } = body;

    const [updated] = await db
      .update(projects)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(masterBranch !== undefined && { masterBranch }),
        ...(repoUrl !== undefined && { repoUrl }),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated, error: null });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { data: null, error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId] - Delete a project
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const id = parseInt(projectId);

    if (isNaN(id)) {
      return NextResponse.json(
        { data: null, error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { data: null, error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

