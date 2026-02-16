import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class UserPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 导航到用户管理
  async goto() {
    await this.page.waitForLoadState('networkidle');

    // 先展开系统管理菜单
    await this.expandSubMenu('系统管理');

    // 点击用户管理子菜单
    await this.clickMenuItem('用户管理');

    // 等待表格加载
    await this.page.waitForSelector('.el-table', { timeout: 10000 });
  }

  // 搜索用户
  async searchByUsername(username: string) {
    const input = this.page.getByPlaceholder('请输入用户账号');
    await input.fill(username);
    await this.page.waitForTimeout(200);
    await this.clickButtonInContainer('.filter-container', '搜索');
    await this.page.waitForTimeout(500);
  }

  // 点击新增按钮
  async clickAdd() {
    await this.clickButtonInContainer('.filter-container', '新增');
    await this.page.waitForTimeout(300);
  }

  // 填写用户表单
  async fillUserForm(data: {
    userName?: string;
    nickName?: string;
    password?: string;
    mobile?: string;
    email?: string;
    status?: string;
    roleIds?: string[];
  }) {
    const dialog = this.page.locator('.el-dialog');

    if (data.userName) {
      await dialog.getByPlaceholder('请输入登录账号').fill(data.userName);
    }
    if (data.nickName) {
      await dialog.getByPlaceholder('请输入用户姓名').fill(data.nickName);
    }
    if (data.password) {
      await dialog.getByPlaceholder('请输入登录密码').fill(data.password);
    }
    if (data.mobile) {
      await dialog.getByPlaceholder('请输入联系电话').fill(data.mobile);
    }
    if (data.email) {
      await dialog.getByPlaceholder('请输入电子邮箱').fill(data.email);
    }
    if (data.status) {
      await dialog.locator('.el-form-item:has-text("用户状态") .el-select').click();
      await this.page.waitForTimeout(300);
      await this.page.locator('.el-select-dropdown__item').filter({ hasText: data.status }).click();
      await this.page.waitForTimeout(200);
    }
    if (data.roleIds && data.roleIds.length > 0) {
      await dialog.locator('.el-form-item:has-text("用户角色") .el-select').click();
      await this.page.waitForTimeout(300);
      for (const role of data.roleIds) {
        await this.page.locator('.el-select-dropdown__item').filter({ hasText: role }).click();
        await this.page.waitForTimeout(100);
      }
      await dialog.click({ position: { x: 10, y: 10 } });
    }
  }

  // 提交表单
  async submit() {
    await this.page.locator('.el-dialog .el-dialog__footer').getByRole('button', { name: '确认' }).click();
  }

  // 取消表单
  async cancel() {
    await this.page.locator('.el-dialog .el-dialog__footer').getByRole('button', { name: '取消' }).click();
  }

  // 删除用户
  async deleteUser(username: string) {
    const row = this.page.locator(`tr:has-text("${username}")`);
    await row.getByRole('button', { name: '删除' }).click();
    await this.page.waitForTimeout(300);
    await this.page.locator('.el-message-box').getByRole('button', { name: '确定' }).click();
  }

  // 编辑用户
  async clickEdit(username: string) {
    const row = this.page.locator(`tr:has-text("${username}")`);
    await row.getByRole('button', { name: '编辑' }).click();
    await this.page.waitForTimeout(300);
  }

  // 等待对话框可见
  async waitForDialog() {
    await this.waitForVisible('.el-dialog');
  }

  // 等待对话框关闭
  async waitForDialogClose() {
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  // 等待成功通知
  async waitForSuccessNotification() {
    await this.waitForNotification('success');
  }
}
