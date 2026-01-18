"use server";

import { db } from "@/db";
import { branchComparisons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveComparison(data: {
  projectId: number;
  parentBranch: string;
  childBranch: string;
  isAncestor?: boolean;
  mergeBase?: string;
}) {
  try {
    const [comparison] = await db
      .insert(branchComparisons)
      .values({
        projectId: data.projectId,
        parentBranch: data.parentBranch,
        childBranch: data.childBranch,
        isAncestor: data.isAncestor ?? null,
        mergeBase: data.mergeBase ?? null,
      })
      .returning();

    revalidatePath("/compare");
    return { data: comparison, error: null };
  } catch (error) {
    console.error("Error saving comparison:", error);
    return { data: null, error: "Failed to save comparison" };
  }
}

export async function getRecentComparisons(projectId?: number, limit = 10) {
  try {
    const result = projectId
      ? await db
          .select()
          .from(branchComparisons)
          .where(eq(branchComparisons.projectId, projectId))
          .orderBy(desc(branchComparisons.checkedAt))
          .limit(limit)
      : await db
          .select()
          .from(branchComparisons)
          .orderBy(desc(branchComparisons.checkedAt))
          .limit(limit);

    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching comparisons:", error);
    return { data: null, error: "Failed to fetch comparisons" };
  }
}


