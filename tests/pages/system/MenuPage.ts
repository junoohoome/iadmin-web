import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class MenuPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.getByText('菜单管理').click();
    await this.page.waitForLoadState('networkidle');
  }

  // 搜索菜单
  async searchByMenuName(menuName: string) {
    await this.page.getByPlaceholder('菜单名称').fill(menuName);
    await this.clickButton('搜索');
  }

  // 点击新增
  async clickAdd() {
    await this.clickButton('新增');
  }

  // 填写菜单表单
  async fillMenuForm(data: {
    menuName?: string;
    path?: string;
    component?: string;
    sort?: string;
  }) {
    if (data.menuName) await this.fillInput('菜单名称', data.menuName);
    if (data.path) await this.fillInput('路由地址', data.path);
    if (data.component) await this.fillInput('组件路径', data.component);
    if (data.sort) await this.fillInput('显示顺序', data.sort);
  }

  // 展开菜单树
  async expandMenu(menuName: string) {
    const row = this.page.locator(`tr:has-text("${menuName}")`);
    await row.locator('.el-table__expand-icon').click();
  }
}
