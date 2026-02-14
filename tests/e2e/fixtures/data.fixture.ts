// tests/e2e/fixtures/data.fixture.ts
import { test as base } from '@playwright/test';
import { ApiClient } from '../utils/api-client';

interface TestData {
  user: { id: number; username: string; password: string };
  role: { id: number; roleName: string };
}

export const test = base.extend<{
  testData: TestData;
  apiClient: ApiClient;
}>({
  apiClient: async ({ }, use) => {
    const client = await ApiClient.create();
    await use(client);
  },

  testData: async ({ apiClient }, use, testInfo) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const data: TestData = {
      user: {
        id: 0,
        username: `test_user_${timestamp}_${random}`,
        password: 'Test123456'
      },
      role: {
        id: 0,
        roleName: `test_role_${timestamp}_${random}`
      }
    };

    // 创建测试数据
    try {
      data.user.id = await apiClient.createTestUser(data.user);
      data.role.id = await apiClient.createTestRole(data.role);
    } catch (e) {
      console.error('Failed to create test data:', e);
      throw e;
    }

    await use(data);

    // 清理测试数据
    try {
      await apiClient.deleteUser(data.user.id);
      await apiClient.deleteRole(data.role.id);
    } catch (e) {
      console.error(`Failed to cleanup test data for ${testInfo.title}:`, e);
    }
  }
});
