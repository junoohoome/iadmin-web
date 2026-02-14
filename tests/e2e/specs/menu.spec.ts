// tests/e2e/specs/menu.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { MenuPage } from '../pages/menu.page';

test.describe('菜单管理 - 工具栏按钮', () => {
  let menuPage: MenuPage;

  test.beforeEach(async ({ page, authenticated }) => {
    menuPage = new MenuPage(page);
    await menuPage.goto();
  });

  test('新增按钮 - 打开对话框', async ({ page }) => {
    await menuPage.btnAdd().click();
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.locator('.el-dialog')).toContainText(/新增菜单/);
  });

  test('展开全部按钮 - 展开树形菜单', async ({ page }) => {
    await menuPage.btnExpandAll().click();
  });

  test('折叠全部按钮 - 折叠树形菜单', async ({ page }) => {
    await menuPage.btnCollapseAll().click();
  });
});
