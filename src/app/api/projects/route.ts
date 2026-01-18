import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, features, branches } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

// GET /api/projects - List all projects
export async function GET() {
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
        )`.mapWith(Number),
        branchCount: sql<number>`(
          SELECT COUNT(*) FROM ${branches} b
          JOIN ${features} f ON b.feature_id = f.id
          WHERE f.project_id = ${projects.id}
        )`.mapWith(Number),
      })
      .from(projects)
      .orderBy(desc(projects.updatedAt));

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, masterBranch, repoUrl } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { data: null, error: "Name is required" },
        { status: 400 }
      );
    }

    const [project] = await db
      .insert(projects)
      .values({
        name,
        description: description || null,
        masterBranch: masterBranch || "main",
        repoUrl: repoUrl || null,
      })
      .returning();

    return NextResponse.json({ data: project, error: null }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { data: null, error: "Failed to create project" },
      { status: 500 }
    );
  }
}

