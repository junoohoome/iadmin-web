import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DictPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.waitForLoadState('networkidle');

    // 先展开系统管理菜单
    await this.expandSubMenu('系统管理');

    // 点击字典管理子菜单
    await this.clickMenuItem('字典管理');

    // 等待表格加载
    await this.page.waitForSelector('.el-table', { timeout: 10000 });
  }

  // 搜索字典名称
  async searchByDictName(dictName: string) {
    const input = this.page.getByPlaceholder('输入字典名称');
    await input.fill(dictName);
    await this.page.waitForTimeout(200);
    await this.clickButtonInContainer('.filter-container', '搜索');
    await this.page.waitForTimeout(500);
  }

  // 点击新增
  async clickAdd() {
    await this.page.locator('.box-card').first().getByRole('button', { name: '新增' }).click();
    await this.page.waitForTimeout(300);
  }

  // 填写字典表单
  async fillDictForm(data: {
    dictName?: string;
    dictType?: string;
    remark?: string;
  }) {
    const dialog = this.page.locator('.el-dialog');

    if (data.dictName) {
      await dialog.locator('.el-form-item:has-text("字典名称") input').fill(data.dictName);
    }
    if (data.dictType) {
      await dialog.locator('.el-form-item:has-text("字典类型") input').fill(data.dictType);
    }
    if (data.remark) {
      await dialog.locator('.el-form-item:has-text("描述") input').fill(data.remark);
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

  // 编辑字典
  async clickEdit(dictName: string) {
    const row = this.page.locator(`tr:has-text("${dictName}")`);
    await row.getByRole('button', { name: '编辑' }).click();
    await this.page.waitForTimeout(300);
  }

  // 删除字典
  async deleteDict(dictName: string) {
    const row = this.page.locator(`tr:has-text("${dictName}")`);
    await row.getByRole('button', { name: '删除' }).click();
    await this.page.waitForTimeout(300);
    await this.page.locator('.el-popconfirm').getByRole('button', { name: '确定' }).click();
  }

  // 选择字典行（用于查看字典详情）
  async selectDictRow(dictName: string) {
    const row = this.page.locator(`tr:has-text("${dictName}")`);
    await row.click();
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
