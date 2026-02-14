// tests/e2e/pages/menu.page.ts
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class MenuPage extends BasePage {
  readonly url = '/system/menu';

  // 工具栏按钮
  readonly btnAdd = () => this.page.getByRole('button', { name: /新增|添加/i });
  readonly btnExpandAll = () => this.page.getByRole('button', { name: /展开全部/i });
  readonly btnCollapseAll = () => this.page.getByRole('button', { name: /折叠全部/i });

  readonly menuNameInput = () => this.page.getByLabel(/菜单名称/);

  // 操作方法
  async goto(url?: string) {
    // For SPA with dynamic routes, navigate using menu link
    // Click on the "菜单管理" menu item text instead of the link
    const menuItem = this.page.getByText('菜单管理').first();
    await menuItem.click();

    // Wait for menu management page content to load
    await this.page.waitForSelector('button:has-text("新增")', { timeout: 10000 });
  }

  async openAddDialog() {
    await this.btnAdd().click();
    await this.verifyDialogVisible(/新增菜单/);
  }

  async fillMenuForm(data: { menuName: string }) {
    await this.menuNameInput().fill(data.menuName);
  }

  async saveMenu() {
    await this.page.getByRole('button', { name: /确定|保存/ }).click();
    await this.verifySuccess();
  }

  async expandAll() {
    await this.btnExpandAll().click();
  }

  async collapseAll() {
    await this.btnCollapseAll().click();
  }
}
