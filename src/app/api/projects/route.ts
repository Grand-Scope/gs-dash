import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notifyAllTeamMembers } from "@/lib/notifications";

// GET all projects (access filters removed)
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        members: { select: { id: true, name: true, image: true } },
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, startDate, endDate, status } = body;

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || "PLANNING",
        ownerId: session.user.id,
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        _count: { select: { tasks: true } },
      },
    });

    // Notify team
    await notifyAllTeamMembers(
      session.user.id,
      "PROJECT_CREATED",
      "New Project Created",
      `${session.user.name} created project "${project.name}"`,
      `/dashboard/projects/${project.id}`
    );

    revalidatePath("/dashboard/projects");
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
