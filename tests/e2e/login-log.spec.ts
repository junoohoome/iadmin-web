import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginLogPage } from '../pages/system/LoginLogPage';

test.describe('登录日志', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin123');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示登录日志列表', async ({ page }) => {
    const loginLogPage = new LoginLogPage(page);
    await loginLogPage.goto();
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能导出日志', async ({ page }) => {
    const loginLogPage = new LoginLogPage(page);
    await loginLogPage.goto();

    // 点击导出按钮
    await page.locator('.filter-container').getByRole('button', { name: '导出' }).click({ force: true });

    // 验证确认弹窗显示
    await expect(page.locator('.el-message-box')).toBeVisible();

    // 取消导出
    await page.locator('.el-message-box').getByRole('button', { name: '取消' }).click({ force: true });
  });
});
