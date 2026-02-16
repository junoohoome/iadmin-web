import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('菜单导航', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin123');
    await page.waitForURL('**/index', { timeout: 10000 });
  });

  test('应该显示所有系统管理菜单', async ({ page }) => {
    const expectedMenus = [
      '用户管理', '角色管理', '菜单管理',
      '部门管理', '字典管理'
    ];

    for (const menu of expectedMenus) {
      await expect(page.getByText(menu)).toBeVisible();
    }
  });

  test('应该能展开和收起子菜单', async ({ page }) => {
    const systemMenu = page.getByText('系统管理');

    // 展开子菜单
    await systemMenu.click();
    await expect(page.getByText('用户管理')).toBeVisible();

    // 收起子菜单
    await systemMenu.click();
  });

  test('点击菜单应该正确导航', async ({ page }) => {
    await page.getByText('系统管理').click();
    await page.getByText('用户管理').click();
    await expect(page).toHaveURL(/.*user.*/);
  });
});
