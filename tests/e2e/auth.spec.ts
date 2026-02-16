import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('用户认证', () => {
  test('应该显示登录页面', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page).toHaveTitle(/iAdmin/);
    await expect(page.getByPlaceholder('账号')).toBeVisible();
  });

  test('应该成功登录', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin123');
    await expect(page).toHaveURL(/.*index/);
  });

  test('登录失败应该显示错误提示', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong', 'wrong');
    await expect(page.locator('.el-message--error')).toBeVisible({ timeout: 3000 });
  });
});
