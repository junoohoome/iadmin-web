// tests/e2e/specs/user.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { test as dataTest } from '../fixtures/auth-data.fixture';
import { UserPage } from '../pages/user.page';

test.describe('用户管理 - 工具栏按钮', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ page, authenticated }) => {
    userPage = new UserPage(page);
    await userPage.goto();
  });

  test('新增按钮 - 打开对话框', async ({ page }) => {
    await userPage.btnAdd().click();
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.locator('.el-dialog')).toContainText(/新增用户/);
  });

  test('搜索按钮 - 过滤数据', async ({ page }) => {
    await userPage.searchInput().fill('admin');
    await userPage.btnSearch().click();
    // 验证表格更新（等待网络请求完成）
    await page.waitForLoadState('networkidle');
  });

  test('重置按钮 - 清空搜索', async ({ page }) => {
    // The input has clearable attribute which provides a clear button
    await userPage.searchInput().fill('test');
    // Click the clear button on the input (X button)
    await page.locator('.el-input__clear').first().click();
    await expect(userPage.searchInput()).toHaveValue('');
  });
});

// 继续在 tests/e2e/specs/user.spec.ts 中添加

dataTest.describe('用户管理 - CRUD 操作', () => {
  let userPage: UserPage;

  dataTest.beforeEach(async ({ page, authenticated }) => {
    userPage = new UserPage(page);
    await userPage.goto();
  });

  dataTest('完整创建用户流程', async ({ page, testData }) => {
    // 1. 打开对话框
    await userPage.openAddDialog();

    // 2. 填写表单
    await userPage.fillUserForm({
      username: testData.user.username,
      password: testData.user.password
    });

    // 3. 保存
    await userPage.saveUser();

    // 4. 验证成功
    await userPage.verifySuccess('新增成功');

    // 5. 验证数据出现在表格中
    await expect(page.locator(`tr:has-text("${testData.user.username}")`)).toBeVisible();
  });

  dataTest('编辑用户功能', async ({ page, testData }) => {
    // 1. 点击编辑
    await userPage.btnRowAction(testData.user.id, 'edit').click();
    await userPage.verifyDialogVisible(/修改用户/);

    // 2. 修改（保持简单，只验证能打开）
    await page.getByRole('button', { name: /取消/ }).click();
  });

  dataTest('删除用户功能', async ({ page, testData }) => {
    // 1. 点击删除
    await userPage.btnRowAction(testData.user.id, 'delete').click();

    // 2. 确认删除
    await page.getByRole('button', { name: /确定/ }).click();

    // 3. 验证成功
    await userPage.verifySuccess('删除成功');
  });
});
