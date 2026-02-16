import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DictPage } from '../pages/system/DictPage';

test.describe('字典管理', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin123');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示字典列表', async ({ page }) => {
    const dictPage = new DictPage(page);
    await dictPage.goto();
    await expect(page.locator('.el-table')).toBeVisible();
    await expect(page.getByText('字典列表')).toBeVisible();
  });

  test('应该能点击新增按钮打开表单', async ({ page }) => {
    const dictPage = new DictPage(page);
    await dictPage.goto();
    await dictPage.clickAdd();
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.getByText('新增字典')).toBeVisible();
  });

  test('应该能取消新增字典', async ({ page }) => {
    const dictPage = new DictPage(page);
    await dictPage.goto();
    await dictPage.clickAdd();
    await dictPage.waitForDialog();
    await dictPage.cancel();
    await dictPage.waitForOverlaysGone();
    await expect(page.locator('.el-dialog')).not.toBeVisible();
  });

  test('应该能新增字典', async ({ page }) => {
    const dictPage = new DictPage(page);
    const timestamp = Date.now();
    const dictName = `测试字典_${timestamp}`;
    const dictType = `test_dict_${timestamp}`;

    await dictPage.goto();
    await dictPage.clickAdd();
    await dictPage.waitForDialog();

    await dictPage.fillDictForm({
      dictName,
      dictType,
      remark: '测试字典描述',
    });

    await dictPage.submit();

    // 等待成功消息或对话框关闭
    await dictPage.waitForNotification('success');
    await dictPage.waitForOverlaysGone();

    // 验证对话框已关闭
    await expect(page.locator('.el-dialog')).not.toBeVisible();
  });
});
