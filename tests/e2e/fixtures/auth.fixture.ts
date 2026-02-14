// tests/e2e/fixtures/auth.fixture.ts
import { test as base, expect as baseExpect } from '@playwright/test';

export const test = base.extend<{
  authenticated: boolean;
}>({
  authenticated: async ({ page }, use) => {
    // 访问登录页
    await page.goto('/login');

    // 填写凭据 - 使用正确的选择器
    await page.getByPlaceholder('账号').fill('admin');
    await page.getByPlaceholder('密码').fill('admin123');

    // 处理验证码 - 我们需要从后端获取验证码或者禁用验证码要求
    // 临时方案：等待验证码图片加载，然后填写一个占位符
    // 注意：这需要后端配合配置测试环境跳过验证码验证
    await page.getByPlaceholder('验证码').fill('1234');

    // 提交登录
    await page.getByRole('button', { name: '登 录' }).click();

    // 等待跳转到首页或检查菜单是否显示
    // 使用更可靠的方式检查登录成功
    await page.waitForLoadState('networkidle');

    // 检查是否成功跳转或在首页
    const currentUrl = page.url();
    if (!currentUrl.includes('/')) {
      throw new Error(`Login failed - expected to be at home page, but got: ${currentUrl}`);
    }

    // 验证登录成功 - 检查菜单是否存在
    await expect(page.locator('.el-menu')).toBeVisible({ timeout: 5000 });

    // 使用认证状态
    await use(true);

    // 可选：登出清理
    // await page.getByRole('button', { name: /退出/i }).click();
  }
});

export const expect = baseExpect;
