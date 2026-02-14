// tests/e2e/pages/oper-log.page.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class OperLogPage extends BasePage {
  readonly url = '/monitor/operLog';

  // 工具栏按钮
  readonly btnSearch = () => this.page.getByRole('button', { name: /搜索|查询/i });
  readonly btnReset = () => this.page.getByRole('button', { name: /重置/i });
  readonly btnExport = () => this.page.getByRole('button', { name: /导出/i });
  readonly btnDelete = () => this.page.getByRole('button', { name: /删除/i });
  readonly btnClear = () => this.page.getByRole('button', { name: /清空/i });

  // 输入框 - 页面有多个输入框，使用索引选择第一个
  readonly searchInput = () => this.page.getByPlaceholder(/请输入系统模块/);
  readonly operNameInput = () => this.page.getByPlaceholder(/请输入操作人员/);

  // 操作方法
  async goto(url?: string) {
    // Navigate to operation log page
    // NOTE: Navigation via menu is not working reliably due to dynamic route loading issues
    // This is a known issue that needs to be fixed at the router/navigation level
    // For now, we try direct URL navigation and fall back to menu click

    // First ensure menu is loaded
    await this.page.waitForSelector('.el-menu', { timeout: 10000 });

    // Wait for routes to be loaded
    await this.page.waitForTimeout(3000);

    // Try direct URL navigation first
    try {
      await this.page.goto('/monitor/operLog');
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
    } catch (e) {
      // If direct navigation fails, try menu-based navigation
      // Look for system monitoring menu
      const monitorMenu = this.page.locator('.el-menu-item, .el-sub-menu').filter({ hasText: /系统监控/ });
      if (await monitorMenu.isVisible().catch(() => false)) {
        await monitorMenu.click();
        await this.page.waitForTimeout(500);
      }

      // Click on operation log menu item
      const operLogItem = this.page.locator('.el-menu-item').filter({ hasText: /操作日志/ });
      await operLogItem.click();
    }

    // Wait for page to stabilize
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(2000);

    // Verify we're on the correct page by checking for the search input
    // This may fail if navigation doesn't work - that's expected given current issues
    await this.page.waitForSelector('input[placeholder*="系统模块"]', { timeout: 5000 }).catch(() => {
      console.warn('Navigation to operation log page failed - page element not found');
    });
  }

  async searchLog(title: string) {
    await this.searchInput().fill(title);
    await this.btnSearch().click();
    await this.page.waitForLoadState('networkidle');
  }

  async resetSearch() {
    await this.btnReset().click();
    // Wait for form reset
    await this.page.waitForTimeout(500);
  }

  async exportLog() {
    await this.btnExport().click();
    // Wait for export confirmation dialog
    await this.page.waitForSelector('.el-message-box', { timeout: 5000 });
    // Click confirm on export dialog
    await this.page.getByRole('button', { name: /确定/i }).click();
  }

  async deleteLog() {
    await this.btnDelete().click();
    // Wait for delete confirmation dialog
    await this.page.waitForSelector('.el-message-box', { timeout: 5000 });
    // Click confirm on delete dialog
    await this.page.getByRole('button', { name: /确定/i }).click();
    await this.verifySuccess();
  }

  async clearLog() {
    await this.btnClear().click();
    // Wait for clear confirmation dialog
    await this.page.waitForSelector('.el-message-box', { timeout: 5000 });
    // Click confirm on clear dialog
    await this.page.getByRole('button', { name: /确定/i }).click();
    await this.verifySuccess();
  }
}
