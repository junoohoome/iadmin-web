import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.goto('/index');
  }

  // 获取用户名
  async getUsername(): Promise<string | null> {
    return await this.page.locator('.el-dropdown-link').textContent();
  }

  // 登出
  async logout() {
    await this.page.getByText('退出登录').click();
  }

  // 检查菜单项是否存在
  async hasMenuItem(text: string): Promise<boolean> {
    return await this.page.getByText(text).count() > 0;
  }

  // 点击菜单项
  async clickMenu(menuText: string) {
    await this.page.getByText(menuText).click();
    await this.page.waitForLoadState('networkidle');
  }
}
