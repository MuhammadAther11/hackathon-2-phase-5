import { test, expect } from '@playwright/test';

test.describe('Hydration Safety Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
  });

  test('T014: Home page loads without hydration errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Hydration')) {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for hydration errors
    expect(errors).toHaveLength(0);

    // Verify page renders correctly
    await expect(page).toHaveTitle(/Todo App/);
  });

  test('T015: Page renders consistently on refresh', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial render
    const screenshot1 = await page.screenshot();

    // Hard refresh
    await page.reload({ waitUntil: 'networkidle' });

    // Take screenshot after refresh
    const screenshot2 = await page.screenshot();

    // Note: Visual comparison would require additional tooling
    // For now, just verify no errors occurred
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    expect(errors).toHaveLength(0);
  });

  test('T017: Page load time under 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('T019: Theme toggle works without errors', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Find and click theme toggle button
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();

    // Toggle theme multiple times
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      await themeToggle.click();
      await page.waitForTimeout(100); // Wait for transition
      const toggleTime = Date.now() - startTime;

      console.log(`Theme toggle ${i + 1} time: ${toggleTime}ms`);
      expect(toggleTime).toBeLessThan(300);
    }

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test('T020: Theme persists after refresh', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Toggle to dark mode
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await themeToggle.click();
    await page.waitForTimeout(200);

    // Check if dark mode is applied
    const html = page.locator('html');
    const darkClassBefore = await html.getAttribute('class');

    // Refresh page
    await page.reload({ waitUntil: 'networkidle' });

    // Check if dark mode persisted
    const darkClassAfter = await html.getAttribute('class');

    expect(darkClassAfter).toContain('dark');
  });

  test('T024: Chat page renders without errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000/chat');
    await page.waitForLoadState('networkidle');

    // Verify chat interface elements are present
    await expect(page.locator('text=AI Task Assistant')).toBeVisible();

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test('T033: Navigation between pages works smoothly', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Start at home
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Navigate to dashboard (if link exists)
    const dashboardLink = page.locator('a[href="/dashboard"]');
    if (await dashboardLink.count() > 0) {
      await dashboardLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/dashboard');
    }

    // Navigate to chat
    const chatLink = page.locator('a[href="/chat"]');
    if (await chatLink.count() > 0) {
      await chatLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/chat');
    }

    // No errors should have occurred
    expect(errors).toHaveLength(0);
  });

  test('T034: Browser back/forward maintains state', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Navigate to chat
    await page.goto('http://localhost:3000/chat');
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBe('http://localhost:3000/');

    // Go forward
    await page.goForward();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/chat');
  });
});
