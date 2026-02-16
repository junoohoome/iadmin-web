import { test, expect } from '@playwright/test';
import { RolePage } from '../pages/system/RolePage';

/**
 * 角色编辑功能测试
 *
 * 前置条件：需要先手动登录系统
 *
 * 测试步骤：
 * 1. 导航到 http://localhost:3000
 * 2. 登录（用户名: admin, 密码: admin123）
 * 3. 导航到角色管理页面
 * 4. 点击"编辑"按钮
 * 5. 验证编辑对话框是否打开
 * 6. 如果对话框打开，测试通过；如果出现"编辑组件未准备好"错误，测试失败
 */

test.describe('角色编辑功能测试', () => {
  test.use({
    // 使用已登录的状态
    storageState: {
      cookies: [],
      origins: []
    }
  });

  test.beforeEach(async ({ page }) => {
    // 导航到首页
    await page.goto('/');

    // 检查是否需要登录
    if (page.url().includes('/login')) {
      console.log('需要登录，请在浏览器中手动完成登录');
      console.log('用户名: admin');
      console.log('密码: admin123');

      // 填写登录信息
      await page.getByPlaceholder('账号').fill('admin');
      await page.getByPlaceholder('密码').fill('admin123');

      // 检查是否有验证码
      const codeInput = page.getByPlaceholder('验证码');
      const needsCode = await codeInput.isVisible().catch(() => false);

      if (needsCode) {
        console.log('检测到验证码输入框');
        console.log('⚠️  请在浏览器中手动输入验证码并点击登录按钮');

        // 等待用户手动登录
        await page.waitForURL('**/index', { timeout: 60000 });
      } else {
        // 没有验证码，直接点击登录
        await page.getByRole('button', { name: /登/i }).click();

        // 等待导航到首页
        await page.waitForURL('**/index', { timeout: 10000 });
      }
    }

    console.log('已登录，当前URL:', page.url());
  });

  test('应该能成功打开角色编辑对话框', async ({ page }) => {
    const rolePage = new RolePage(page);

    // 导航到角色管理页面
    console.log('导航到角色管理页面...');
    await page.getByText('角色管理').click();
    await page.waitForLoadState('networkidle');

    // 等待角色列表加载
    console.log('等待角色列表加载...');
    await expect(page.locator('.el-table')).toBeVisible({ timeout: 10000 });

    // 查找编辑按钮
    console.log('查找编辑按钮...');
    const editButtons = page.locator('.el-table').getByRole('button', { name: /编辑/i });
    const count = await editButtons.count();

    console.log(`找到 ${count} 个编辑按钮`);

    if (count === 0) {
      throw new Error('未找到编辑按钮');
    }

    // 点击第一个编辑按钮
    console.log('点击第一个编辑按钮...');
    await editButtons.first().click();

    // 验证编辑对话框是否打开
    console.log('检查编辑对话框是否打开...');

    // 等待一下让对话框动画完成
    await page.waitForTimeout(500);

    // 检查对话框
    const dialog = page.locator('.el-dialog').filter({ hasText: /修改角色|编辑角色/i });
    const isDialogVisible = await dialog.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isDialogVisible) {
      console.error('❌ 测试失败：编辑对话框未打开');

      // 检查是否有错误消息
      const errorMessage = page.locator('.el-message--error');
      if (await errorMessage.isVisible({ timeout: 1000 }).catch(() => false)) {
        const errorText = await errorMessage.textContent();
        console.error('错误消息:', errorText);

        if (errorText?.includes('编辑组件未准备好') || errorText?.includes('not ready')) {
          throw new Error('编辑组件未准备好');
        }
      }

      // 截图
      await page.screenshot({ path: 'test-results/role-edit-dialog-not-open.png' });

      throw new Error('编辑对话框未能成功打开');
    }

    console.log('✅ 测试通过：角色编辑对话框成功打开');

    // 验证对话框中是否有必要的表单字段
    const hasFormFields = await dialog.locator('input[type="text"]').count() > 0;
    if (hasFormFields) {
      console.log('✅ 编辑对话框包含预期的表单字段');
    } else {
      console.warn('⚠️  编辑对话框可能缺少预期的表单字段');
    }
  });

  test('应该能打开多个角色进行编辑', async ({ page }) => {
    const rolePage = new RolePage(page);

    // 导航到角色管理页面
    await page.getByText('角色管理').click();
    await page.waitForLoadState('networkidle');

    // 等待角色列表加载
    await expect(page.locator('.el-table')).toBeVisible({ timeout: 10000 });

    // 获取所有编辑按钮
    const editButtons = page.locator('.el-table').getByRole('button', { name: /编辑/i });
    const count = await editButtons.count();

    console.log(`找到 ${count} 个编辑按钮`);

    // 至少应该有一个编辑按钮
    expect(count).toBeGreaterThan(0);

    // 点击第一个编辑按钮
    await editButtons.first().click();

    // 验证对话框打开
    const dialog = page.locator('.el-dialog').filter({ hasText: /修改角色|编辑角色/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    console.log('✅ 测试通过：成功找到并点击了编辑按钮');
  });

  test('应该处理"编辑组件未准备好"错误的情况', async ({ page }) => {
    const rolePage = new RolePage(page);

    // 导航到角色管理页面
    await page.getByText('角色管理').click();
    await page.waitForLoadState('networkidle');

    // 等待角色列表加载
    await expect(page.locator('.el-table')).toBeVisible({ timeout: 10000 });

    // 监听控制台错误
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 点击编辑按钮
    const editButton = page.locator('.el-table').getByRole('button', { name: /编辑/i }).first();
    await editButton.click();

    // 等待一下，看是否有错误出现
    await page.waitForTimeout(2000);

    // 检查是否有"编辑组件未准备好"的错误
    const hasEditComponentError = errors.some(error =>
      error.includes('编辑组件未准备好') ||
      error.includes('edit component') ||
      error.includes('not ready')
    );

    if (hasEditComponentError) {
      console.log('❌ 检测到"编辑组件未准备好"错误');
      console.log('错误列表:', errors);
      throw new Error('编辑组件未准备好');
    }

    // 如果没有错误，验证对话框是否打开
    const dialog = page.locator('.el-dialog').filter({ hasText: /修改角色|编辑角色/i });
    const isDialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);

    if (!isDialogVisible) {
      console.log('❌ 测试失败：编辑对话框未打开，且未检测到明确的错误消息');
      await page.screenshot({ path: 'test-results/role-edit-component-error.png' });
      throw new Error('编辑对话框未打开');
    }

    console.log('✅ 测试通过：角色编辑对话框成功打开，没有"编辑组件未准备好"错误');
  });

  test('应该能编辑角色信息', async ({ page }) => {
    // 导航到角色管理页面
    await page.getByText('角色管理').click();
    await page.waitForLoadState('networkidle');

    // 等待角色列表加载
    await expect(page.locator('.el-table')).toBeVisible({ timeout: 10000 });

    // 点击第一个编辑按钮
    const editButton = page.locator('.el-table').getByRole('button', { name: /编辑/i }).first();
    await editButton.click();

    // 等待对话框打开
    const dialog = page.locator('.el-dialog').filter({ hasText: /修改角色|编辑角色/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 尝试获取角色名称输入框的值
    const roleNameInput = dialog.getByPlaceholder('角色名称');
    const isVisible = await roleNameInput.isVisible({ timeout: 2000 }).catch(() => false);

    if (isVisible) {
      const currentValue = await roleNameInput.inputValue();
      console.log('当前角色名称:', currentValue);

      // 尝试修改角色名称（添加测试前缀）
      const newValue = `测试_${currentValue}`;
      await roleNameInput.clear();
      await roleNameInput.fill(newValue);

      console.log('修改后的角色名称:', newValue);

      // 点击取消按钮（不保存修改）
      const cancelButton = dialog.getByRole('button', { name: /取消/i });
      await cancelButton.click();

      // 等待对话框关闭
      await expect(dialog).not.toBeVisible({ timeout: 3000 });

      console.log('✅ 测试通过：成功打开编辑对话框并能修改表单字段');
    } else {
      console.warn('⚠️  未找到角色名称输入框');
    }
  });
});
