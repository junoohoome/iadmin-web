import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { OperLogPage } from '../pages/system/OperLogPage';

test.describe('操作日志', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin123');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示操作日志列表', async ({ page }) => {
    const operLogPage = new OperLogPage(page);
    await operLogPage.goto();
    await expect(page.locator('.el-table')).toBeVisible();
  });
});
