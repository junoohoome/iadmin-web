// tests/e2e/pages/dept.page.ts
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DeptPage extends BasePage {
  readonly url = '/system/dept';

  // 工具栏按钮
  readonly btnAdd = () => this.page.getByRole('button', { name: /新增|添加/i });
  readonly btnSearch = () => this.page.getByRole('button', { name: /搜索/i });

  readonly deptNameInput = () => this.page.getByPlaceholder(/请输入部门名称/);

  // 操作方法
  async goto(url?: string) {
    // For SPA with dynamic routes, navigate using menu link
    // Click on the "部门管理" menu item text instead of link
    const menuItem = this.page.getByText('部门管理').first();
    await menuItem.click();

    // Wait for department management page content to load
    await this.page.waitForSelector('button:has-text("新增")', { timeout: 10000 });
  }

  async openAddDialog() {
    await this.btnAdd().click();
    await this.verifyDialogVisible(/新增部门/);
  }

  async fillDeptForm(data: { deptName: string }) {
    await this.deptNameInput().fill(data.deptName);
  }

  async saveDept() {
    await this.page.getByRole('button', { name: /确定|保存/ }).click();
    await this.verifySuccess();
  }

  async searchDept(deptName: string) {
    await this.deptNameInput().fill(deptName);
    await this.btnSearch().click();
  }
}
