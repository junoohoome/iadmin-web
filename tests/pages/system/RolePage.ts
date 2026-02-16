import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RolePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.waitForLoadState('networkidle');

    // 先展开系统管理菜单
    await this.expandSubMenu('系统管理');

    // 点击角色管理子菜单
    await this.clickMenuItem('角色管理');

    // 等待表格加载
    await this.page.waitForSelector('.el-table', { timeout: 10000 });
  }

  // 搜索角色
  async searchByRoleName(roleName: string) {
    const input = this.page.getByPlaceholder('输入名称搜索');
    await input.fill(roleName);
    await this.page.waitForTimeout(200);
    await this.clickButtonInContainer('.filter-container', '搜索');
    await this.page.waitForTimeout(500);
  }

  // 点击新增
  async clickAdd() {
    await this.clickButtonInContainer('.filter-container', '新增');
    await this.page.waitForTimeout(300);
  }

  // 填写角色表单
  async fillRoleForm(data: {
    roleName?: string;
    roleKey?: string;
    remark?: string;
  }) {
    const dialog = this.page.locator('.el-dialog');

    if (data.roleName) {
      await dialog.locator('.el-form-item:has-text("角色名称") input').fill(data.roleName);
    }
    if (data.roleKey) {
      await dialog.locator('.el-form-item:has-text("角色权限") input').fill(data.roleKey);
    }
    if (data.remark) {
      await dialog.locator('.el-form-item:has-text("描述信息") textarea').fill(data.remark);
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

  // 点击编辑
  async clickEdit(roleName: string) {
    const row = this.page.locator(`tr:has-text("${roleName}")`);
    await row.getByRole('button', { name: '编辑' }).click();
    await this.page.waitForTimeout(300);
  }

  // 删除角色
  async deleteRole(roleName: string) {
    const row = this.page.locator(`tr:has-text("${roleName}")`);
    await row.getByRole('button', { name: '删除' }).click();
    await this.page.waitForTimeout(300);
    await this.page.locator('.el-popconfirm').getByRole('button', { name: '确定' }).click();
  }

  // 等待对话框可见
  async waitForDialog() {
    await this.waitForVisible('.el-dialog');
  }

  // 等待对话框关闭
  async waitForDialogClose() {
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  // 选择角色行（用于菜单分配）
  async selectRoleRow(roleName: string) {
    const row = this.page.locator(`tr:has-text("${roleName}")`);
    await row.click();
    await this.page.waitForTimeout(300);
  }

  // 等待成功通知
  async waitForSuccessNotification() {
    await this.waitForNotification('success');
  }
}
