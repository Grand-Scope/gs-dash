import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createNotification, notifyAllTeamMembers } from "@/lib/notifications";

// GET all tasks (access filters removed)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const whereClause = projectId ? { projectId } : {};

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, projectId, assigneeId, startDate, dueDate, priority, status } = body;

    if (!title || !projectId) {
      return NextResponse.json(
        { error: "Title and project are required" },
        { status: 400 }
      );
    }

    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, ownerId: true, members: { select: { id: true } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Access check still applies for CREATION - you should probably still own/be member to create?
    // User requested "seeing" data. Creating data might still be restricted?
    // Existing code restricted it. I'll keep restriction for creation.
    const hasAccess =
      project.ownerId === session.user.id ||
      project.members.some((m) => m.id === session.user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        creatorId: session.user.id,
        assigneeId: assigneeId || null,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "MEDIUM",
        status: status || "TODO",
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, image: true } },
      },
    });

    // Notify assignee if assigned
    if (task.assigneeId && task.assigneeId !== session.user.id) {
      await createNotification(
        task.assigneeId,
        "TASK_ASSIGNED",
        "New Task Assigned",
        `You have been assigned to task "${task.title}"`,
        `/dashboard/projects/${projectId}?task=${task.id}`
      );
    }

    // Notify team about new task
    await notifyAllTeamMembers(
      session.user.id,
      "TASK_CREATED",
      "New Task Created",
      `${session.user.name} created task "${task.title}" in ${project.name}`,
      `/dashboard/projects/${projectId}?task=${task.id}`
    );

    revalidatePath(`/dashboard/projects/${projectId}`);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
