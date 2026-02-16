import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginLogPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 导航到登录日志页面
  async goto() {
    await this.page.waitForLoadState('networkidle');

    // 先展开系统监控菜单
    await this.expandSubMenu('系统监控');

    // 点击登录日志子菜单
    await this.clickMenuItem('登录日志');

    // 等待表格加载
    await this.page.waitForSelector('.el-table', { timeout: 10000 });
  }

  // 按用户账号搜索
  async searchByUsername(account: string) {
    const input = this.page.getByPlaceholder('请输入用户账号');
    await input.fill(account);
    await this.page.waitForTimeout(200);
    await this.clickButtonInContainer('.filter-container', '搜索');
    await this.page.waitForTimeout(500);
  }

  // 重置搜索
  async resetSearch() {
    await this.clickButtonInContainer('.filter-container', '重置');
    await this.page.waitForTimeout(300);
  }

  // 导出日志
  async exportLog() {
    await this.clickButtonInContainer('.filter-container', '导出');
    await this.page.waitForTimeout(300);
  }

  // 确认操作
  async confirmAction() {
    await this.page.locator('.el-message-box').getByRole('button', { name: '确定' }).click();
  }

  // 取消操作
  async cancelAction() {
    await this.page.locator('.el-message-box').getByRole('button', { name: '取消' }).click();
  }

  // 等待成功通知
  async waitForSuccessNotification() {
    await this.waitForNotification('success');
  }
}
