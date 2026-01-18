"use server";

import { db } from "@/db";
import { features, branches, type NewFeature } from "@/db/schema";
import { eq, desc, sql, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getFeatures(projectId: number) {
  try {
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
        )`.as("branch_count"),
        activeBranchCount: sql<number>`(
          SELECT COUNT(*) FROM ${branches} 
          WHERE ${branches.featureId} = ${features.id}
          AND ${branches.isPartOfStack} = true
        )`.as("active_branch_count"),
      })
      .from(features)
      .where(eq(features.projectId, projectId))
      .orderBy(desc(features.updatedAt));

    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching features:", error);
    return { data: null, error: "Failed to fetch features" };
  }
}

export async function getFeature(id: number) {
  try {
    const result = await db.query.features.findFirst({
      where: eq(features.id, id),
      with: {
        project: true,
        branches: {
          orderBy: [asc(branches.position)],
        },
      },
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching feature:", error);
    return { data: null, error: "Failed to fetch feature" };
  }
}

export async function createFeature(data: NewFeature) {
  try {
    const [newFeature] = await db
      .insert(features)
      .values({
        projectId: data.projectId,
        identifier: data.identifier,
        name: data.name,
        description: data.description || null,
        color: data.color || "#6366f1",
      })
      .returning();

    revalidatePath(`/projects/${data.projectId}`);
    return { data: newFeature, error: null };
  } catch (error) {
    console.error("Error creating feature:", error);
    return { data: null, error: "Failed to create feature" };
  }
}

export async function updateFeature(id: number, data: Partial<NewFeature>) {
  try {
    const [updated] = await db
      .update(features)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(features.id, id))
      .returning();

    revalidatePath(`/projects/${updated.projectId}`);
    return { data: updated, error: null };
  } catch (error) {
    console.error("Error updating feature:", error);
    return { data: null, error: "Failed to update feature" };
  }
}

export async function deleteFeature(id: number, projectId: number) {
  try {
    await db.delete(features).where(eq(features.id, id));
    revalidatePath(`/projects/${projectId}`);
    return { error: null };
  } catch (error) {
    console.error("Error deleting feature:", error);
    return { error: "Failed to delete feature" };
  }
}

