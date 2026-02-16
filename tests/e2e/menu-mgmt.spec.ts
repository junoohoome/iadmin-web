import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { MenuPage } from '../pages/system/MenuPage';

test.describe('菜单管理', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin123');
    await page.waitForURL('**/index', { timeout: 10000 });
  });

  test('应该显示菜单列表', async ({ page }) => {
    const menuPage = new MenuPage(page);
    await menuPage.goto();
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能搜索菜单', async ({ page }) => {
    const menuPage = new MenuPage(page);
    await menuPage.goto();
    await menuPage.searchByMenuName('用户管理');
    await expect(page.locator('tr:has-text("用户管理")')).toBeVisible();
  });

  test('应该能点击新增按钮打开表单', async ({ page }) => {
    const menuPage = new MenuPage(page);
    await menuPage.goto();
    await menuPage.clickAdd();
    await expect(page.getByText('菜单名称')).toBeVisible();
  });
});
