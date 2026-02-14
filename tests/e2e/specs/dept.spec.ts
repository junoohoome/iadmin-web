// tests/e2e/specs/dept.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { DeptPage } from '../pages/dept.page';

test.describe('部门管理 - 工具栏按钮', () => {
  let deptPage: DeptPage;

  test.beforeEach(async ({ page, authenticated }) => {
    deptPage = new DeptPage(page);
    await deptPage.goto();
  });

  test('新增按钮 - 打开对话框', async ({ page }) => {
    await deptPage.btnAdd().click();
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.locator('.el-dialog')).toContainText(/新增部门/);
  });

  test('搜索按钮 - 搜索部门', async ({ page }) => {
    await deptPage.deptNameInput().fill('iAdmin科技');
    await deptPage.btnSearch().click();
  });
});
