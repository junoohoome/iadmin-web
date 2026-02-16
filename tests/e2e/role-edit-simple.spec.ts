import { test, expect } from '@playwright/test';

/**
 * 角色编辑功能测试
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
  test('应该能成功打开角色编辑对话框', async ({ page }) => {
    console.log('开始测试：导航到首页...');
    await page.goto('http://localhost:3000');

    // 等待页面加载
    await page.waitForLoadState('domcontentloaded');
    console.log('页面已加载，当前URL:', page.url());

    // 检查是否需要登录
    const needsLogin = page.url().includes('/login') || await page.getByPlaceholder('账号').isVisible().catch(() => false);

    if (needsLogin) {
      console.log('需要登录');

      // 填写登录信息
      await page.getByPlaceholder('账号').fill('admin');
      await page.getByPlaceholder('密码').fill('admin123');

      // 检查是否有验证码
      const codeInput = page.getByPlaceholder('验证码');
      const needsCode = await codeInput.isVisible().catch(() => false);

      if (needsCode) {
        console.log('⚠️  检测到验证码，请手动输入验证码并按回车继续');
        console.log('提示：也可以在后端禁用验证码或配置固定的测试验证码');

        // 暂停测试，等待用户手动输入验证码
        await page.pause();
      } else {
        console.log('没有验证码，直接点击登录');

        // 点击登录按钮
        await page.getByRole('button', { name: /登/i }).click();

        // 等待导航到首页
        await page.waitForURL('**/index', { timeout: 10000 });
        console.log('登录成功，已导航到:', page.url());
      }
    } else {
      console.log('已登录或在首页');
    }

    // 现在测试角色编辑功能
    console.log('步骤1：导航到角色管理页面');

    // 查找并点击"角色管理"菜单项
    const roleMenuItem = page.getByText('角色管理');
    const isRoleMenuVisible = await roleMenuItem.isVisible({ timeout: 5000 }).catch(() => false);

    if (!isRoleMenuVisible) {
      console.log('❌ 未找到"角色管理"菜单项');

      // 尝试查找可能的替代文本
      console.log('尝试查找其他可能的菜单项...');
      const allTextItems = page.locator('text=/角色|管理/');
      const count = await allTextItems.count();
      console.log(`找到 ${count} 个包含"角色"或"管理"的文本元素`);

      // 截图
      await page.screenshot({ path: 'test-results/role-menu-not-found.png' });
      throw new Error('未找到"角色管理"菜单项');
    }

    console.log('找到"角色管理"菜单项，点击...');
    await roleMenuItem.click();

    // 等待页面加载
    await page.waitForTimeout(1000);
    console.log('当前URL:', page.url());

    // 等待角色列表表格加载
    console.log('步骤2：等待角色列表表格加载');
    const table = page.locator('.el-table');
    await expect(table).toBeVisible({ timeout: 10000 });
    console.log('✅ 角色列表表格已加载');

    // 查找编辑按钮
    console.log('步骤3：查找编辑按钮');
    const editButtons = table.getByRole('button', { name: /编辑/i });
    const editButtonCount = await editButtons.count();
    console.log(`找到 ${editButtonCount} 个编辑按钮`);

    if (editButtonCount === 0) {
      console.log('❌ 未找到编辑按钮');

      // 尝试查找其他可能的按钮
      const allButtons = table.locator('button');
      const allButtonCount = await allButtons.count();
      console.log(`表格中共有 ${allButtonCount} 个按钮`);

      for (let i = 0; i < Math.min(allButtonCount, 5); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`  按钮 ${i + 1}: "${buttonText}"`);
      }

      // 截图
      await page.screenshot({ path: 'test-results/edit-button-not-found.png' });
      throw new Error('未找到编辑按钮');
    }

    // 点击第一个编辑按钮
    console.log('步骤4：点击第一个编辑按钮');
    await editButtons.first().click();

    // 等待对话框动画
    await page.waitForTimeout(500);

    // 检查编辑对话框
    console.log('步骤5：检查编辑对话框是否打开');

    // 查找对话框（可能有不同的标题）
    const dialog = page.locator('.el-dialog').first();
    const isDialogVisible = await dialog.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isDialogVisible) {
      console.log('❌ 编辑对话框未打开');

      // 检查是否有错误消息
      const errorMessages = page.locator('.el-message--error');
      const errorCount = await errorMessages.count();

      if (errorCount > 0) {
        console.log(`检测到 ${errorCount} 个错误消息`);
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorMessages.nth(i).textContent();
          console.log(`  错误 ${i + 1}: "${errorText}"`);

          if (errorText?.includes('编辑组件未准备好')) {
            console.log('❌ 测试失败：出现"编辑组件未准备好"错误');
            throw new Error('编辑组件未准备好');
          }
        }
      }

      // 检查控制台错误
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(1000);

      if (consoleErrors.length > 0) {
        console.log('控制台错误:');
        consoleErrors.forEach(err => console.log(`  - ${err}`));
      }

      // 截图
      await page.screenshot({ path: 'test-results/role-edit-dialog-not-open.png' });
      throw new Error('编辑对话框未能成功打开');
    }

    console.log('✅ 编辑对话框已打开');

    // 获取对话框标题
    const dialogTitle = await dialog.locator('.el-dialog__title').textContent();
    console.log(`对话框标题: "${dialogTitle}"`);

    // 验证对话框内容
    const hasFormFields = await dialog.locator('input').count() > 0;
    if (hasFormFields) {
      console.log('✅ 编辑对话框包含表单字段');
    } else {
      console.warn('⚠️  编辑对话框可能缺少表单字段');
    }

    console.log('');
    console.log('====================');
    console.log('✅ 测试通过！');
    console.log('====================');
    console.log('');
    console.log('测试结果总结：');
    console.log('1. ✓ 成功登录系统');
    console.log('2. ✓ 成功导航到角色管理页面');
    console.log('3. ✓ 角色列表表格正常加载');
    console.log('4. ✓ 找到并点击了编辑按钮');
    console.log('5. ✓ 编辑对话框成功打开');
    console.log('6. ✓ 没有出现"编辑组件未准备好"错误');
    console.log('');
  });
});
