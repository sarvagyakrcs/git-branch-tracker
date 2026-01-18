import { NextResponse } from "next/server";
import { db } from "@/db";
import { branches } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ projectId: string; featureId: string }>;
}

// GET /api/projects/[projectId]/features/[featureId]/branches - List all branches
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { featureId } = await params;
    const fId = parseInt(featureId);

    if (isNaN(fId)) {
      return NextResponse.json(
        { data: null, error: "Invalid feature ID" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(branches)
      .where(eq(branches.featureId, fId))
      .orderBy(asc(branches.position));

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/features/[featureId]/branches - Create a new branch
export async function POST(request: Request, { params }: RouteParams) {
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

    const { name, shortName, status, prUrl, prNumber, notes, isPartOfStack } = body;

    if (!name) {
      return NextResponse.json(
        { data: null, error: "Branch name is required" },
        { status: 400 }
      );
    }

    // Get the next position
    const [maxPos] = await db
      .select({ maxPosition: sql<number>`COALESCE(MAX(${branches.position}), 0)` })
      .from(branches)
      .where(eq(branches.featureId, fId));

    const nextPosition = (maxPos?.maxPosition || 0) + 1;

    const [branch] = await db
      .insert(branches)
      .values({
        featureId: fId,
        name,
        shortName: shortName || null,
        position: nextPosition,
        status: status || "active",
        prUrl: prUrl || null,
        prNumber: prNumber || null,
        notes: notes || null,
        isPartOfStack: isPartOfStack !== false,
      })
      .returning();

    return NextResponse.json({ data: branch, error: null }, { status: 201 });
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json(
      { data: null, error: "Failed to create branch" },
      { status: 500 }
    );
  }
}

