// tests/e2e/pages/oper-log.page.ts
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class OperLogPage extends BasePage {
  readonly url = '/monitor/operLog';

  // 工具栏按钮
  readonly btnSearch = () => this.page.getByRole('button', { name: /搜索|查询/i });
  readonly btnReset = () => this.page.getByRole('button', { name: /重置/i });
  readonly btnExport = () => this.page.getByRole('button', { name: /导出/i });

  // 输入框 - 页面有多个输入框，使用索引选择第一个
  readonly searchInput = () => this.page.getByPlaceholder(/请输入系统模块/);

  // 操作方法
  async searchLog(title: string) {
    await this.searchInput().fill(title);
    await this.btnSearch().click();
    await this.page.waitForLoadState('networkidle');
  }

  async goto(url?: string) {
    // Navigate directly to the operation log page URL
    // Note: This route needs to be available in the router
    await this.page.goto('/monitor/operLog');

    // Wait for the page to load - use networkidle as fallback
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Additional wait for dynamic content
    await this.page.waitForTimeout(2000);
  }
}
