import { NextResponse } from "next/server";
import { db } from "@/db";
import { features, branches } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId]/features - List all features for a project
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

    const result = await db
      .select({
        id: features.id,
        projectId: features.projectId,
        identifier: features.identifier,
        name: features.name,
        description: features.description,
        color: features.color,
        createdAt: features.createdAt,
        updatedAt: features.updatedAt,
        branchCount: sql<number>`(
          SELECT COUNT(*) FROM ${branches} 
          WHERE ${branches.featureId} = ${features.id}
        )`.mapWith(Number),
        activeBranchCount: sql<number>`(
          SELECT COUNT(*) FROM ${branches} 
          WHERE ${branches.featureId} = ${features.id} 
          AND ${branches.isPartOfStack} = true
        )`.mapWith(Number),
      })
      .from(features)
      .where(eq(features.projectId, id))
      .orderBy(asc(features.identifier));

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/features - Create a new feature
export async function POST(request: Request, { params }: RouteParams) {
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

    const { identifier, name, description, color } = body;

    if (!identifier || !name) {
      return NextResponse.json(
        { data: null, error: "Identifier and name are required" },
        { status: 400 }
      );
    }

    const [feature] = await db
      .insert(features)
      .values({
        projectId: id,
        identifier,
        name,
        description: description || null,
        color: color || "#6366f1",
      })
      .returning();

    return NextResponse.json({ data: feature, error: null }, { status: 201 });
  } catch (error) {
    console.error("Error creating feature:", error);
    return NextResponse.json(
      { data: null, error: "Failed to create feature" },
      { status: 500 }
    );
  }
}

