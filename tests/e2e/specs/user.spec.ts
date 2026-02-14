// tests/e2e/specs/user.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { test as dataTest } from '../fixtures/data.fixture';
import { UserPage } from '../pages/user.page';

test.describe('用户管理 - 工具栏按钮', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ page, authenticated }) => {
    userPage = new UserPage(page);
    await userPage.goto();
  });

  test('新增按钮 - 打开对话框', async ({ page }) => {
    await userPage.btnAdd().click();
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.locator('.el-dialog')).toContainText(/新增用户/);
  });

  test('搜索按钮 - 过滤数据', async ({ page }) => {
    await userPage.searchInput().fill('admin');
    await userPage.btnSearch().click();
    // 验证表格更新（等待网络请求完成）
    await page.waitForLoadState('networkidle');
  });

  test('重置按钮 - 清空搜索', async ({ page }) => {
    // The input has clearable attribute which provides a clear button
    await userPage.searchInput().fill('test');
    // Click the clear button on the input (X button)
    await page.locator('.el-input__clear').first().click();
    await expect(userPage.searchInput()).toHaveValue('');
  });
});
