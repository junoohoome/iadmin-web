// tests/e2e/pages/user.page.ts
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class UserPage extends BasePage {
  readonly url = '/system/user/';

  // 工具栏按钮
  readonly btnAdd = () => this.page.getByRole('button', { name: /新增|添加/i });
  readonly btnSearch = () => this.page.getByRole('button', { name: /搜索|查询/i });
  readonly btnReset = () => this.page.getByRole('button', { name: /重置/i });
  readonly btnExport = () => this.page.getByRole('button', { name: /导出/i });

  // 输入框
  readonly searchInput = () => this.page.getByPlaceholder(/请输入用户账号/);
  readonly usernameInput = () => this.page.getByLabel(/用户名/);
  readonly passwordInput = () => this.page.getByLabel(/密码/);

  // 表格操作按钮（需要行定位）
  btnRowAction(rowId: number, action: 'edit' | 'delete' | 'resetPwd') {
    const actionMap = {
      edit: /编辑|修改/i,
      delete: /删除/i,
      resetPwd: /重置密码|reset/i
    };
    // 定位包含用户ID的行，然后点击操作按钮
    const row = this.page.locator(`tr:has-text("${rowId}")`);
    return row.getByRole('button', { name: actionMap[action] });
  }

  // 操作方法
  async goto(url?: string) {
    // Navigate directly to the user management URL
    // The auth fixture already loaded the routes
    await this.page.goto(url || this.url);

    // Wait for page to load
    await this.page.waitForLoadState('networkidle');

    // Wait for table to be attached (not necessarily visible)
    await this.page.locator('.el-table').waitFor({ state: 'attached', timeout: 10000 });
  }

  async openAddDialog() {
    await this.btnAdd().click();
    await this.verifyDialogVisible(/新增用户/);
  }

  async fillUserForm(data: { username: string; password: string }) {
    await this.usernameInput().fill(data.username);
    await this.passwordInput().fill(data.password);
  }

  async saveUser() {
    await this.page.getByRole('button', { name: /确定|保存/ }).click();
    await this.verifySuccess();
  }

  async searchUser(username: string) {
    await this.searchInput().fill(username);
    await this.btnSearch().click();
  }
}
