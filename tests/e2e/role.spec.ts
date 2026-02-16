import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RolePage } from '../pages/system/RolePage';

test.describe('角色管理', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin123');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示角色列表', async ({ page }) => {
    const rolePage = new RolePage(page);
    await rolePage.goto();
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能点击新增按钮打开表单', async ({ page }) => {
    const rolePage = new RolePage(page);
    await rolePage.goto();
    await rolePage.clickAdd();
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.getByText('新增角色')).toBeVisible();
  });

  test('应该能取消新增角色', async ({ page }) => {
    const rolePage = new RolePage(page);
    await rolePage.goto();
    await rolePage.clickAdd();
    await rolePage.waitForDialog();
    await rolePage.cancel();
    await rolePage.waitForOverlaysGone();
    await expect(page.locator('.el-dialog')).not.toBeVisible();
  });

  test('应该验证必填字段', async ({ page }) => {
    const rolePage = new RolePage(page);
    await rolePage.goto();
    await rolePage.clickAdd();
    await rolePage.waitForDialog();

    // 不填写任何字段，直接提交
    await rolePage.submit();

    // 验证表单验证提示
    await expect(page.getByText('请输入名称')).toBeVisible();
  });

});
