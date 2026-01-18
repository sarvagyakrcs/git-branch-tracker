"use server";

import { db } from "@/db";
import { branches, features, type NewBranch } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getBranches(featureId: number) {
  try {
    const result = await db
      .select()
      .from(branches)
      .where(eq(branches.featureId, featureId))
      .orderBy(asc(branches.position));

    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching branches:", error);
    return { data: null, error: "Failed to fetch branches" };
  }
}

export async function getBranch(id: number) {
  try {
    const result = await db.query.branches.findFirst({
      where: eq(branches.id, id),
      with: {
        feature: {
          with: {
            project: true,
          },
        },
      },
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching branch:", error);
    return { data: null, error: "Failed to fetch branch" };
  }
}

export async function createBranch(data: NewBranch & { projectId: number }) {
  try {
    // Get the max position for this feature
    const maxPosition = await db
      .select({ max: sql<number>`COALESCE(MAX(${branches.position}), 0)` })
      .from(branches)
      .where(eq(branches.featureId, data.featureId));

    const newPosition = (maxPosition[0]?.max || 0) + 1;

    // Determine default status based on isPlanned
    const defaultStatus = data.isPlanned ? "planned" : "active";

    const [newBranch] = await db
      .insert(branches)
      .values({
        featureId: data.featureId,
        name: data.name,
        shortName: data.shortName || null,
        position: newPosition,
        status: data.status || defaultStatus,
        prUrl: data.prUrl || null,
        prNumber: data.prNumber || null,
        notes: data.notes || null,
        isPartOfStack: data.isPartOfStack ?? true,
        isPlanned: data.isPlanned ?? false,
      })
      .returning();

    revalidatePath(`/projects/${data.projectId}/features/${data.featureId}`);
    return { data: newBranch, error: null };
  } catch (error) {
    console.error("Error creating branch:", error);
    return { data: null, error: "Failed to create branch" };
  }
}

export async function updateBranch(
  id: number,
  data: Partial<NewBranch> & { projectId: number; featureId: number }
) {
  try {
    const [updated] = await db
      .update(branches)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(branches.id, id))
      .returning();

    revalidatePath(`/projects/${data.projectId}/features/${data.featureId}`);
    return { data: updated, error: null };
  } catch (error) {
    console.error("Error updating branch:", error);
    return { data: null, error: "Failed to update branch" };
  }
}

export async function deleteBranch(
  id: number,
  projectId: number,
  featureId: number
) {
  try {
    await db.delete(branches).where(eq(branches.id, id));
    revalidatePath(`/projects/${projectId}/features/${featureId}`);
    return { error: null };
  } catch (error) {
    console.error("Error deleting branch:", error);
    return { error: "Failed to delete branch" };
  }
}

export async function reorderBranches(
  featureId: number,
  projectId: number,
  branchIds: number[]
) {
  try {
    // Update positions based on array order
    await Promise.all(
      branchIds.map((id, index) =>
        db
          .update(branches)
          .set({ position: index + 1, updatedAt: new Date() })
          .where(eq(branches.id, id))
      )
    );

    revalidatePath(`/projects/${projectId}/features/${featureId}`);
    return { error: null };
  } catch (error) {
    console.error("Error reordering branches:", error);
    return { error: "Failed to reorder branches" };
  }
}

// Get all branches for a project (for compare tool)
export async function getProjectBranches(projectId: number) {
  try {
    const result = await db
      .select({
        id: branches.id,
        name: branches.name,
        featureId: branches.featureId,
        featureIdentifier: features.identifier,
        featureName: features.name,
      })
      .from(branches)
      .innerJoin(features, eq(branches.featureId, features.id))
      .where(eq(features.projectId, projectId))
      .orderBy(asc(features.identifier), asc(branches.position));

    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching project branches:", error);
    return { data: null, error: "Failed to fetch branches" };
  }
}

