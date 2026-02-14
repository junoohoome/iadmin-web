// tests/e2e/pages/dict.page.ts
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DictPage extends BasePage {
  readonly url = '/system/dict';

  // 工具栏按钮
  readonly btnAdd = () => this.page.getByRole('button', { name: /新增|添加/i });
  readonly btnSearch = () => this.page.getByRole('button', { name: /搜索|查询/i });

  // 输入框
  readonly searchInput = () => this.page.getByPlaceholder(/请输入字典名称/);
  readonly dictNameInput = () => this.page.getByLabel(/字典名称/);

  // 操作方法
  async goto(url?: string) {
    // For SPA with dynamic routes, navigate using menu link
    // Click on "字典管理" menu item text instead of link
    const menuItem = this.page.getByText('字典管理').first();
    await menuItem.click();

    // Wait for dictionary management page content to load
    await this.page.waitForSelector('input[placeholder*="字典名称"]', { timeout: 10000 });
  }

  async openAddDialog() {
    await this.btnAdd().click();
    await this.verifyDialogVisible(/新增字典/);
  }

  async fillDictForm(data: { dictName: string }) {
    await this.dictNameInput().fill(data.dictName);
  }

  async saveDict() {
    await this.page.getByRole('button', { name: /确定|保存/ }).click();
    await this.verifySuccess();
  }

  async searchDict(dictName: string) {
    await this.searchInput().fill(dictName);
    await this.btnSearch().click();
  }
}
