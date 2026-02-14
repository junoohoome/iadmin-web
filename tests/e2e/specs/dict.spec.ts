// tests/e2e/specs/dict.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { DictPage } from '../pages/dict.page';

test.describe('字典管理 - 工具栏按钮', () => {
  let dictPage: DictPage;

  test.beforeEach(async ({ page, authenticated }) => {
    dictPage = new DictPage(page);
    await dictPage.goto();
  });

  test('新增按钮 - 打开对话框', async ({ page }) => {
    await dictPage.btnAdd().click();
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.locator('.el-dialog')).toContainText(/新增字典/);
  });

  test('搜索按钮 - 过滤数据', async ({ page }) => {
    await dictPage.searchInput().fill('test');
    await dictPage.btnSearch().click();
    await page.waitForLoadState('networkidle');
  });
});
