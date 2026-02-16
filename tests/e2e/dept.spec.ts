import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DeptPage } from '../pages/system/DeptPage';

test.describe('部门管理', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin123');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示部门表格', async ({ page }) => {
    const deptPage = new DeptPage(page);
    await deptPage.goto();
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能点击新增按钮打开表单', async ({ page }) => {
    const deptPage = new DeptPage(page);
    await deptPage.goto();
    await deptPage.clickAdd();
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.getByText('新增部门')).toBeVisible();
  });

  test('应该能取消新增部门', async ({ page }) => {
    const deptPage = new DeptPage(page);
    await deptPage.goto();
    await deptPage.clickAdd();
    await deptPage.waitForDialog();
    await deptPage.cancel();
    await expect(page.locator('.el-dialog')).not.toBeVisible();
  });

  test('应该能新增部门', async ({ page }) => {
    const deptPage = new DeptPage(page);
    const timestamp = Date.now();
    const deptName = `测试部门_${timestamp}`;

    await deptPage.goto();
    await deptPage.clickAdd();
    await deptPage.waitForDialog();

    await deptPage.fillDeptForm({
      deptName,
      orderNum: 1,
      leader: '测试负责人',
      phone: '13800138000',
    });

    await deptPage.submit();

    // 等待成功消息
    await deptPage.waitForSuccessNotification();

    // 验证新部门出现在表格中
    await expect(page.locator(`tr:has-text("${deptName}")`).first()).toBeVisible({ timeout: 5000 });

    // 清理：删除测试部门
    await page.waitForTimeout(500);
    await deptPage.deleteDept(deptName);
  });

  test('应该能编辑部门', async ({ page }) => {
    const deptPage = new DeptPage(page);
    const timestamp = Date.now();
    const deptName = `编辑部门_${timestamp}`;

    // 先创建一个测试部门
    await deptPage.goto();
    await deptPage.clickAdd();
    await deptPage.fillDeptForm({ deptName, orderNum: 1 });
    await deptPage.submit();
    await page.waitForTimeout(500);

    // 编辑部门
    await deptPage.clickEdit(deptName);
    await deptPage.waitForDialog();

    // 修改负责人
    await deptPage.fillDeptForm({ leader: '修改后的负责人' });
    await deptPage.submit();

    // 等待成功消息
    await deptPage.waitForSuccessNotification();

    // 清理
    await page.waitForTimeout(500);
    await deptPage.deleteDept(deptName);
  });

  test('应该能删除部门', async ({ page }) => {
    const deptPage = new DeptPage(page);
    const timestamp = Date.now();
    const deptName = `删除部门_${timestamp}`;

    // 先创建一个测试部门
    await deptPage.goto();
    await deptPage.clickAdd();
    await deptPage.fillDeptForm({ deptName, orderNum: 1 });
    await deptPage.submit();
    await page.waitForTimeout(500);

    // 删除部门
    await deptPage.deleteDept(deptName);

    // 等待成功消息
    await deptPage.waitForSuccessNotification();
  });
});
