import { test as base } from '@playwright/test';

interface TestData {
  users: {
    valid: { username: string; password: string };
    invalid: { username: string; password: string };
  };
  newUser: {
    username: string;
    nickName: string;
    password: string;
    email: string;
  };
}

export const test = base.extend<{
  testData: TestData;
}>({
  testData: async ({}, use) => {
    const timestamp = Date.now();
    const data: TestData = {
      users: {
        valid: { username: 'admin', password: 'admin123' },
        invalid: { username: 'wrong', password: 'wrong' },
      },
      newUser: {
        username: `test_${timestamp}`,
        nickName: '测试用户',
        password: 'Test123456',
        email: `test${timestamp}@example.com`,
      },
    };
    await use(data);
  },
});
