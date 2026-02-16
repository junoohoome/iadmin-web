import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

// 已登录状态的 fixture（开发环境禁用验证码后可用）
export const testWithAuth = test.extend<{
  authenticatedDashboard: DashboardPage;
}>({
  authenticatedDashboard: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const username = process.env.TEST_USERNAME || 'admin';
    const password = process.env.TEST_PASSWORD || 'admin123';

    await loginPage.login(username, password);

    await page.waitForURL('**/index', { timeout: 10000 });

    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});
