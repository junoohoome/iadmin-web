// tests/e2e/specs/auth.spec.ts
import { test, expect } from '../fixtures/auth.fixture';

test('登录成功 - 跳转到首页', async ({ page, authenticated }) => {
  // 登录成功后会跳转到 /index 或 /
  await expect(page).toHaveURL(/\/(index)?$/);
  await expect(page.locator('.el-menu')).toBeVisible();
});
