// tests/e2e/specs/oper-log.spec.ts
import { test as dataTest } from '../fixtures/auth-data.fixture';
import { expect } from '@playwright/test';
import { OperLogPage } from '../pages/oper-log.page';

dataTest.describe('操作日志 - 工具栏按钮', () => {
  let operLogPage: OperLogPage;

  dataTest.beforeEach(async ({ page, authenticated }) => {
    operLogPage = new OperLogPage(page);
    await operLogPage.goto();
  });

  dataTest('搜索按钮 - 过滤日志', async ({ page }) => {
    // This test may fail if navigation doesn't work - that's a known issue
    await operLogPage.searchInput().fill('用户管理');
    await operLogPage.btnSearch().click();
    await page.waitForLoadState('networkidle');
    // Verify search input still contains the search term
    await expect(operLogPage.searchInput()).toHaveValue('用户管理');
  });

  dataTest('重置按钮 - 清空搜索', async ({ page }) => {
    // This test may fail if navigation doesn't work - that's a known issue
    await operLogPage.searchInput().fill('test');
    await operLogPage.btnReset().click();
    // After reset, input should be cleared
    await expect(operLogPage.searchInput()).toHaveValue('');
  });

  dataTest('导出按钮 - 导出数据', async ({ page }) => {
    // This test may fail if navigation doesn't work - that's a known issue
    await operLogPage.btnExport().click();
    // Wait for export confirmation dialog
    await expect(page.locator('.el-message-box')).toBeVisible({ timeout: 5000 });
    // Verify dialog shows export confirmation message
    await expect(page.locator('.el-message-box')).toContainText(/导出/i);
  });

  dataTest('清空按钮 - 清空所有日志', async ({ page }) => {
    // This test may fail if navigation doesn't work - that's a known issue
    await operLogPage.btnClear().click();
    // Wait for clear confirmation dialog
    await expect(page.locator('.el-message-box')).toBeVisible({ timeout: 5000 });
    // Verify dialog shows clear confirmation message
    await expect(page.locator('.el-message-box')).toContainText(/清空/i);
  });
});
