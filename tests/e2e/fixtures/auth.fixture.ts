// tests/e2e/fixtures/auth.fixture.ts
import { test as base, expect as baseExpect } from '@playwright/test';

/**
 * Authentication fixture for E2E tests
 * Uses testLogin API (dev mode only) to bypass captcha and RSA encryption
 */
export const test = base.extend<{
  authenticated: boolean;
}>({
  authenticated: async ({ page, request }, use) => {
    // Step 1: Use testLogin API (only works in dev profile)
    const loginResponse = await request.post('/dev-api/auth/testLogin', {
      data: {
        username: 'admin',
        password: 'admin123'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const loginData = await loginResponse.json();

    if (loginData.code !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}. Make sure backend is running in dev profile.`);
    }

    const token = loginData.data;

    // Step 2: Add init script to set token in COOKIES before page loads
    // The frontend uses Cookies.get('IADMIN-TOKEN'), not localStorage!
    await page.addInitScript((authToken) => {
      // Set cookie with the token (includes Bearer prefix)
      document.cookie = `IADMIN-TOKEN=${encodeURIComponent(authToken)}; path=/; max-age=86400`;
    }, token);

    // Step 3: Navigate to index page - token will be set before page loads
    await page.goto('/index');
    await page.waitForLoadState('networkidle');

    // Step 4: Wait for the sidebar menu to appear
    try {
      await baseExpect(page.locator('.el-menu')).toBeVisible({ timeout: 15000 });
    } catch {
      // Debug: check what's on the page
      const currentUrl = page.url();
      await page.screenshot({ path: 'test-results/debug-auth-failure.png' });
      throw new Error(`Auth verification failed. URL: ${currentUrl}. Screenshot saved to test-results/debug-auth-failure.png`);
    }

    // Step 5: Wait for routes to stabilize
    await page.waitForTimeout(1000);

    await use(true);
  }
});

export const expect = baseExpect;
