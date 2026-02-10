import prisma from "@/lib/prisma";

/**
 * Create a notification for a specific user
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  linkUrl?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        linkUrl,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

/**
 * Notify all team members (all users except the sender/actor)
 * Useful for "New Project" or broad announcements
 */
export async function notifyAllTeamMembers(
  actorId: string,
  type: string,
  title: string,
  message: string,
  linkUrl?: string
) {
  try {
    // Get all users except the actor
    const users = await prisma.user.findMany({
      where: {
        id: { not: actorId },
      },
      select: { id: true },
    });

    if (users.length === 0) return;

    // Create notifications in batch
    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type,
        title,
        message,
        linkUrl,
      })),
    });
  } catch (error) {
    console.error("Error creating team notifications:", error);
  }
}
