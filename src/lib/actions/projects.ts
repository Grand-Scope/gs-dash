'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function getProjectById(id: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        tasks: {
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        },
        milestones: {
            orderBy: {
                date: 'asc'
            }
        },
      },
    });

    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) {
    throw new Error('Name is required');
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: session.user.id,
        status: 'PLANNING',
      },
    });
    return { success: true, projectId: project.id };
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error: 'Failed to create project' };
  }
}

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const projectId = formData.get('projectId') as string;
  const priority = formData.get('priority') as string || 'MEDIUM';

  if (!title || !projectId) {
    throw new Error('Title and Project ID are required');
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        projectId,
        priority: priority as any,
        status: 'TODO',
        creatorId: session.user.id,
      },
    });
    return { success: true, taskId: task.id };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}
