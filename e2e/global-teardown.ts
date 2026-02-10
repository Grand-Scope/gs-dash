import { PrismaClient } from '@prisma/client';

/**
 * Global teardown that runs after all Playwright tests complete.
 * Cleans up test users (user*@example.com with name "Test User")
 * and any associated data they created.
 */
async function globalTeardown() {
  const prisma = new PrismaClient();

  try {
    const testUserFilter = {
      email: { startsWith: 'user' },
      name: 'Test User',
    };

    const testUsers = await prisma.user.findMany({
      where: testUserFilter,
      select: { id: true },
    });

    if (testUsers.length === 0) {
      console.log('[Teardown] No test users to clean up.');
      return;
    }

    const testUserIds = testUsers.map((u) => u.id);
    console.log(`[Teardown] Cleaning up ${testUserIds.length} test user(s)...`);

    // Delete in dependency order
    await prisma.task.deleteMany({
      where: {
        OR: [
          { creatorId: { in: testUserIds } },
          { assigneeId: { in: testUserIds } },
        ],
      },
    });

    await prisma.milestone.deleteMany({
      where: {
        project: { ownerId: { in: testUserIds } },
      },
    });

    await prisma.project.deleteMany({
      where: { ownerId: { in: testUserIds } },
    });

    await prisma.session.deleteMany({
      where: { userId: { in: testUserIds } },
    });

    await prisma.account.deleteMany({
      where: { userId: { in: testUserIds } },
    });

    await prisma.user.deleteMany({
      where: testUserFilter,
    });

    console.log(`[Teardown] Successfully cleaned up ${testUserIds.length} test user(s).`);
  } catch (error) {
    console.error('[Teardown] Error cleaning up test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
