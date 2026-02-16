import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DeptPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.waitForLoadState('networkidle');

    // 先展开系统管理菜单
    const systemMenu = this.page.locator('.el-sub-menu:has-text("系统管理")');
    await systemMenu.click();
    await this.page.waitForTimeout(500);

    // 点击部门管理子菜单
    const deptMenu = this.page.locator('.el-menu-item:has-text("部门管理")');
    await deptMenu.click();
    await this.page.waitForLoadState('networkidle');

    // 等待表格加载
    await this.page.waitForSelector('.el-table', { timeout: 10000 });
  }

  // 搜索部门
  async searchByDeptName(deptName: string) {
    await this.page.getByPlaceholder('请输入部门名称').fill(deptName);
    await this.clickButton('搜索');
    await this.page.waitForTimeout(500);
  }

  // 点击新增
  async clickAdd() {
    await this.clickButton('新增');
    await this.page.waitForTimeout(300);
  }

  // 填写部门表单
  async fillDeptForm(data: {
    deptName?: string;
    orderNum?: number;
    leader?: string;
    phone?: string;
    email?: string;
    status?: string;
  }) {
    const dialog = this.page.locator('.el-dialog');

    if (data.deptName) {
      await dialog.getByPlaceholder('请输入部门名称').fill(data.deptName);
    }
    if (data.orderNum !== undefined) {
      // el-input-number - find by label
      const orderInput = dialog.locator('.el-form-item:has-text("显示排序") input');
      await orderInput.fill(String(data.orderNum));
    }
    if (data.leader) {
      await dialog.getByPlaceholder('请输入负责人').fill(data.leader);
    }
    if (data.phone) {
      await dialog.getByPlaceholder('请输入联系电话').fill(data.phone);
    }
    if (data.email) {
      await dialog.getByPlaceholder('请输入邮箱').fill(data.email);
    }
    if (data.status) {
      // Radio button
      await dialog.locator(`.el-radio:has-text("${data.status}")`).click();
    }
  }

  // 提交表单
  async submit() {
    await this.page.locator('.el-dialog').getByRole('button', { name: '确认' }).click();
  }

  // 取消表单
  async cancel() {
    await this.page.locator('.el-dialog').getByRole('button', { name: '取消' }).click();
  }

  // 在表格中选择部门行
  async selectDept(deptName: string) {
    const row = this.page.locator(`tr:has-text("${deptName}")`);
    await row.click();
  }

  // 点击编辑
  async clickEdit(deptName: string) {
    const row = this.page.locator(`tr:has-text("${deptName}")`);
    await row.getByRole('button', { name: '编辑' }).click();
    await this.page.waitForTimeout(300);
  }

  // 删除部门
  async deleteDept(deptName: string) {
    const row = this.page.locator(`tr:has-text("${deptName}")`);
    await row.getByRole('button', { name: '删除' }).click();
    await this.page.waitForTimeout(300);
    // Confirm in dialog
    await this.page.getByRole('button').filter({ hasText: '确定' }).click();
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
    await this.page.waitForSelector('.el-notification--success', { timeout: 5000 });
  }
}
