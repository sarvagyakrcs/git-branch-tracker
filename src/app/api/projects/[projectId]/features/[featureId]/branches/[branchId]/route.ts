import { NextResponse } from "next/server";
import { db } from "@/db";
import { branches } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ projectId: string; featureId: string; branchId: string }>;
}

// GET /api/projects/.../branches/[branchId] - Get a single branch
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { branchId } = await params;
    const bId = parseInt(branchId);

    if (isNaN(bId)) {
      return NextResponse.json(
        { data: null, error: "Invalid branch ID" },
        { status: 400 }
      );
    }

    const [branch] = await db
      .select()
      .from(branches)
      .where(eq(branches.id, bId));

    if (!branch) {
      return NextResponse.json(
        { data: null, error: "Branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: branch, error: null });
  } catch (error) {
    console.error("Error fetching branch:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch branch" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/.../branches/[branchId] - Update a branch
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { branchId } = await params;
    const bId = parseInt(branchId);
    const body = await request.json();

    if (isNaN(bId)) {
      return NextResponse.json(
        { data: null, error: "Invalid branch ID" },
        { status: 400 }
      );
    }

    const { name, shortName, position, status, prUrl, prNumber, notes, isPartOfStack } = body;

    const [updated] = await db
      .update(branches)
      .set({
        ...(name !== undefined && { name }),
        ...(shortName !== undefined && { shortName }),
        ...(position !== undefined && { position }),
        ...(status !== undefined && { status }),
        ...(prUrl !== undefined && { prUrl }),
        ...(prNumber !== undefined && { prNumber }),
        ...(notes !== undefined && { notes }),
        ...(isPartOfStack !== undefined && { isPartOfStack }),
        updatedAt: new Date(),
      })
      .where(eq(branches.id, bId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { data: null, error: "Branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated, error: null });
  } catch (error) {
    console.error("Error updating branch:", error);
    return NextResponse.json(
      { data: null, error: "Failed to update branch" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/.../branches/[branchId] - Delete a branch
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { branchId } = await params;
    const bId = parseInt(branchId);

    if (isNaN(bId)) {
      return NextResponse.json(
        { data: null, error: "Invalid branch ID" },
        { status: 400 }
      );
    }

    const [deleted] = await db
      .delete(branches)
      .where(eq(branches.id, bId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { data: null, error: "Branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error("Error deleting branch:", error);
    return NextResponse.json(
      { data: null, error: "Failed to delete branch" },
      { status: 500 }
    );
  }
}

