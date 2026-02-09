import { test, expect } from '@playwright/test';

test.describe('Project Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and Login before each test
    const timestamp = Date.now();
    const username = `user${timestamp}`;
    const email = `user${timestamp}@example.com`;
    const password = 'Password@123';

    await page.goto('/register');
    await page.getByPlaceholder('John Doe').fill('Test User');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();
    
    // Auto-redirects to login? Or manual? 
    // Auth spec says it redirects to login. 
    // Let's assume we need to login manually as per auth spec.
    await page.waitForURL(/.*login/);
    
    await page.getByLabel('Email or Username').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*dashboard/);
  });

  test('should create a new project and add a task', async ({ page }) => {
    // 1. Create Project
    await page.getByRole('link', { name: /new project/i }).click();
    
    const projectName = 'Test Project ' + Date.now();
    const projectDesc = 'This is a test project description';
    
    await page.getByLabel(/project name/i).fill(projectName);
    await page.getByLabel(/description/i).fill(projectDesc);
    await page.getByRole('button', { name: /create/i }).click();

    // Verify we are redirected to project details
    await expect(page).toHaveURL(/.*dashboard\/projects\/.+/);
    await expect(page.getByText(projectName)).toBeVisible();
    await expect(page.getByText('Overview')).toBeVisible();

    // 3. Create Task
    
    // 3. Create Task
    await page.locator('button').filter({ hasText: 'Tasks' }).click();
    await page.getByRole('button', { name: /new task/i }).click();
    
    const taskTitle = 'Test Task ' + Date.now();
    await page.getByLabel(/title/i).fill(taskTitle);
    await page.getByLabel(/assignee/i).click(); 
    // Select first option if available, or skip if it's a select
    // Assuming simple form for now.
    
    await page.getByRole('button', { name: /create/i }).click();

    // Verify task appears
    await expect(page.getByText(taskTitle)).toBeVisible();
  });
});
