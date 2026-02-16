import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { UserPage } from '../pages/system/UserPage';

test.describe('用户管理', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin123');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示用户列表', async ({ page }) => {
    const userPage = new UserPage(page);
    await userPage.goto();
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能搜索用户', async ({ page }) => {
    const userPage = new UserPage(page);
    await userPage.goto();
    await userPage.searchByUsername('admin');
    await expect(page.locator('tr:has-text("admin")').first()).toBeVisible();
  });

  test('应该能点击新增按钮打开表单', async ({ page }) => {
    const userPage = new UserPage(page);
    await userPage.goto();
    await userPage.clickAdd();
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.getByText('新增用户')).toBeVisible();
  });

  test('应该能取消新增用户', async ({ page }) => {
    const userPage = new UserPage(page);
    await userPage.goto();
    await userPage.clickAdd();
    await userPage.waitForDialog();
    await userPage.cancel();
    await userPage.waitForOverlaysGone();
    await expect(page.locator('.el-dialog')).not.toBeVisible();
  });

  test('应该验证必填字段', async ({ page }) => {
    const userPage = new UserPage(page);
    await userPage.goto();
    await userPage.clickAdd();
    await userPage.waitForDialog();

    // 不填写任何字段，直接提交
    await userPage.submit();

    // 验证表单验证提示
    await expect(page.getByText('请输入用户账号')).toBeVisible();
  });

});
