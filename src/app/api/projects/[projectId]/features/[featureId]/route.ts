import { NextResponse } from "next/server";
import { db } from "@/db";
import { features, branches, projects } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ projectId: string; featureId: string }>;
}

// GET /api/projects/[projectId]/features/[featureId] - Get a single feature with branches
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

    // Get feature with project info
    const [feature] = await db
      .select({
        id: features.id,
        projectId: features.projectId,
        identifier: features.identifier,
        name: features.name,
        description: features.description,
        color: features.color,
        createdAt: features.createdAt,
        updatedAt: features.updatedAt,
        projectName: projects.name,
        masterBranch: projects.masterBranch,
      })
      .from(features)
      .innerJoin(projects, eq(features.projectId, projects.id))
      .where(eq(features.id, fId));

    if (!feature) {
      return NextResponse.json(
        { data: null, error: "Feature not found" },
        { status: 404 }
      );
    }

    // Get branches for this feature
    const featureBranches = await db
      .select()
      .from(branches)
      .where(eq(branches.featureId, fId))
      .orderBy(asc(branches.position));

    return NextResponse.json({
      data: {
        ...feature,
        branches: featureBranches,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error fetching feature:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch feature" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId]/features/[featureId] - Update a feature
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { featureId } = await params;
    const fId = parseInt(featureId);
    const body = await request.json();

    if (isNaN(fId)) {
      return NextResponse.json(
        { data: null, error: "Invalid feature ID" },
        { status: 400 }
      );
    }

    const { identifier, name, description, color } = body;

    const [updated] = await db
      .update(features)
      .set({
        ...(identifier !== undefined && { identifier }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        updatedAt: new Date(),
      })
      .where(eq(features.id, fId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { data: null, error: "Feature not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated, error: null });
  } catch (error) {
    console.error("Error updating feature:", error);
    return NextResponse.json(
      { data: null, error: "Failed to update feature" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/features/[featureId] - Delete a feature
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { featureId } = await params;
    const fId = parseInt(featureId);

    if (isNaN(fId)) {
      return NextResponse.json(
        { data: null, error: "Invalid feature ID" },
        { status: 400 }
      );
    }

    const [deleted] = await db
      .delete(features)
      .where(eq(features.id, fId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { data: null, error: "Feature not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error("Error deleting feature:", error);
    return NextResponse.json(
      { data: null, error: "Failed to delete feature" },
      { status: 500 }
    );
  }
}

