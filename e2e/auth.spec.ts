import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const testEmails: string[] = [];

test.afterAll(async () => {
  if (testEmails.length === 0) return;
  const prisma = new PrismaClient();
  try {
    const testUsers = await prisma.user.findMany({
      where: { email: { in: testEmails } },
      select: { id: true },
    });
    const ids = testUsers.map((u) => u.id);
    if (ids.length > 0) {
      await prisma.task.deleteMany({ where: { OR: [{ creatorId: { in: ids } }, { assigneeId: { in: ids } }] } });
      await prisma.milestone.deleteMany({ where: { project: { ownerId: { in: ids } } } });
      await prisma.project.deleteMany({ where: { ownerId: { in: ids } } });
      await prisma.session.deleteMany({ where: { userId: { in: ids } } });
      await prisma.account.deleteMany({ where: { userId: { in: ids } } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
  } finally {
    await prisma.$disconnect();
  }
});

test.describe('Authentication Flow', () => {
  test('should allow a user to register and login', async ({ page }) => {
    // Capture console logs from the browser page
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));

    // Generate a unique user for this test
    const timestamp = Date.now();
    const username = `user${timestamp}`;
    const email = `user${timestamp}@example.com`;
    testEmails.push(email);
    const password = 'Password@123';

    // 1. Register
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();

    await page.getByPlaceholder('John Doe').fill('Test User');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    
    await page.getByRole('button', { name: 'Create account' }).click();

    // Verify redirection to login with success message
    try {
      await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    } catch (e) {
      if (await page.locator('.login-error').isVisible()) {
        const error = await page.locator('.login-error').textContent();
        console.log('Registration Error Message:', error);
      }
      throw e;
    }
    await expect(page.getByText('Account created successfully')).toBeVisible();

    // 2. Login
    await page.getByLabel('Email or Username').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify redirection to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByRole('heading', { name: 'Recent Projects' })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email or Username').fill('invalid@example.com');
    await page.getByLabel('Password', { exact: true }).fill('WrongPassword');
    
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });
});
