import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UserPage } from '../pages/system/UserPage';
import { RolePage } from '../pages/system/RolePage';
import { DeptPage } from '../pages/system/DeptPage';
import { MenuPage } from '../pages/system/MenuPage';
import { DictPage } from '../pages/system/DictPage';
import { OperLogPage } from '../pages/system/OperLogPage';
import { LoginLogPage } from '../pages/system/LoginLogPage';

// 测试数据接口
export interface TestData {
  users: {
    valid: { username: string; password: string };
    invalid: { username: string; password: string };
  };
  newUser: {
    username: string;
    nickName: string;
    password: string;
    email: string;
    phonenumber: string;
  };
  newRole: {
    roleName: string;
    roleKey: string;
    sort: string;
  };
  newDept: {
    deptName: string;
    sort: string;
  };
  newDict: {
    dictName: string;
    dictType: string;
    sort: string;
  };
}

// 生成带时间戳的唯一测试数据
function generateTestData(): TestData {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const unique = `${timestamp}_${random}`;

  return {
    users: {
      valid: { username: 'admin', password: 'admin123' },
      invalid: { username: 'wrong', password: 'wrong' },
    },
    newUser: {
      username: `test_${unique}`,
      nickName: `测试用户_${unique}`,
      password: 'Test123456',
      email: `test_${unique}@example.com`,
      phonenumber: `138${random.toString().padStart(8, '0')}`,
    },
    newRole: {
      roleName: `测试角色_${unique}`,
      roleKey: `test_role_${unique}`,
      sort: '1',
    },
    newDept: {
      deptName: `测试部门_${unique}`,
      sort: '1',
    },
    newDict: {
      dictName: `测试字典_${unique}`,
      dictType: `test_dict_${unique}`,
      sort: '1',
    },
  };
}

// 基础 fixture - 包含所有 Page Objects
export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  userPage: UserPage;
  rolePage: RolePage;
  deptPage: DeptPage;
  menuPage: MenuPage;
  dictPage: DictPage;
  operLogPage: OperLogPage;
  loginLogPage: LoginLogPage;
  testData: TestData;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  userPage: async ({ page }, use) => {
    await use(new UserPage(page));
  },

  rolePage: async ({ page }, use) => {
    await use(new RolePage(page));
  },

  deptPage: async ({ page }, use) => {
    await use(new DeptPage(page));
  },

  menuPage: async ({ page }, use) => {
    await use(new MenuPage(page));
  },

  dictPage: async ({ page }, use) => {
    await use(new DictPage(page));
  },

  operLogPage: async ({ page }, use) => {
    await use(new OperLogPage(page));
  },

  loginLogPage: async ({ page }, use) => {
    await use(new LoginLogPage(page));
  },

  testData: async ({}, use) => {
    await use(generateTestData());
  },
});

// 已登录状态的 fixture - 自动登录并保持认证状态
export const testWithAuth = test.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page, loginPage }, use) => {
    // 导航到登录页
    await loginPage.goto();

    // 使用环境变量或默认凭据登录
    const username = process.env.TEST_USERNAME || 'admin';
    const password = process.env.TEST_PASSWORD || 'admin123';

    await loginPage.login(username, password);

    // 等待登录成功后跳转到首页
    await page.waitForURL('**/index', { timeout: 10000 });

    // 保存认证状态（Cookie 方式）
    await page.context().storageState({ path: '.auth/admin.json' });

    await use(page);
  },
});

// 导出 expect 以便使用
export { expect } from '@playwright/test';
