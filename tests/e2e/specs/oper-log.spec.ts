// tests/e2e/specs/oper-log.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { OperLogPage } from '../pages/oper-log.page';

test.describe('操作日志 - 工具栏按钮', () => {
  let operLogPage: OperLogPage;

  test.beforeEach(async ({ page, authenticated }) => {
    operLogPage = new OperLogPage(page);
    await operLogPage.goto();
  });

  test('搜索按钮 - 过滤日志', async ({ page }) => {
    await operLogPage.searchInput().fill('用户管理');
    await operLogPage.btnSearch().click();
    await page.waitForLoadState('networkidle');
  });

  test('重置按钮 - 清空搜索', async ({ page }) => {
    await operLogPage.searchInput().fill('test');
    await operLogPage.btnReset().click();
  });

  test('导出按钮 - 导出数据', async ({ page }) => {
    await operLogPage.btnExport().click();
    // 验证：导出功能（可能触发下载）
  });
});
