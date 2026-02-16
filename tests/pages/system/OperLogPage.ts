import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class OperLogPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 导航到操作日志页面
  async goto() {
    await this.page.waitForLoadState('networkidle');

    // 先展开系统监控菜单
    await this.expandSubMenu('系统监控');

    // 点击操作日志子菜单
    await this.clickMenuItem('操作日志');

    // 等待表格加载
    await this.page.waitForSelector('.el-table', { timeout: 10000 });
  }

  // 按系统模块搜索
  async searchByTitle(title: string) {
    const input = this.page.getByPlaceholder('请输入系统模块');
    await input.fill(title);
    await this.page.waitForTimeout(200);
    await this.clickButtonInContainer('.filter-container', '搜索');
    await this.page.waitForTimeout(500);
  }

  // 按操作人员搜索
  async searchByOperator(operName: string) {
    const input = this.page.getByPlaceholder('请输入操作人员');
    await input.fill(operName);
    await this.page.waitForTimeout(200);
    await this.clickButtonInContainer('.filter-container', '搜索');
    await this.page.waitForTimeout(500);
  }

  // 重置搜索
  async resetSearch() {
    await this.clickButtonInContainer('.filter-container', '重置');
    await this.page.waitForTimeout(300);
  }

  // 查看日志详情
  async viewDetail(rowText: string) {
    const row = this.page.locator(`tr:has-text("${rowText}")`);
    await row.getByRole('button', { name: '详细' }).click();
    await this.page.waitForTimeout(300);
  }

  // 关闭详情弹窗
  async closeDetailDialog() {
    await this.page.locator('.el-dialog').getByRole('button', { name: '关 闭' }).click();
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

  // 等待详情弹窗可见
  async waitForDetailDialog() {
    await this.waitForVisible('.el-dialog');
  }

  // 等待成功通知
  async waitForSuccessNotification() {
    await this.waitForNotification('success');
  }
}
