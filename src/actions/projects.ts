"use server";

import { db } from "@/db";
import { projects, features, branches, type NewProject } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  try {
    const result = await db
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
        )`.as("feature_count"),
        branchCount: sql<number>`(
          SELECT COUNT(*) FROM ${branches} 
          WHERE ${branches.featureId} IN (
            SELECT ${features.id} FROM ${features} 
            WHERE ${features.projectId} = ${projects.id}
          )
        )`.as("branch_count"),
      })
      .from(projects)
      .orderBy(desc(projects.updatedAt));

    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { data: null, error: "Failed to fetch projects" };
  }
}

export async function getProject(id: number) {
  try {
    const result = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        features: {
          with: {
            branches: true,
          },
        },
      },
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching project:", error);
    return { data: null, error: "Failed to fetch project" };
  }
}

export async function createProject(data: NewProject) {
  try {
    const [newProject] = await db
      .insert(projects)
      .values({
        name: data.name,
        description: data.description || null,
        masterBranch: data.masterBranch || "main",
        repoUrl: data.repoUrl || null,
      })
      .returning();

    revalidatePath("/");
    return { data: newProject, error: null };
  } catch (error) {
    console.error("Error creating project:", error);
    return { data: null, error: "Failed to create project" };
  }
}

export async function updateProject(id: number, data: Partial<NewProject>) {
  try {
    const [updated] = await db
      .update(projects)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    revalidatePath("/");
    return { data: updated, error: null };
  } catch (error) {
    console.error("Error updating project:", error);
    return { data: null, error: "Failed to update project" };
  }
}

export async function deleteProject(id: number) {
  try {
    await db.delete(projects).where(eq(projects.id, id));
    revalidatePath("/");
    return { error: null };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: "Failed to delete project" };
  }
}

