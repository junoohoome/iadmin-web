import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

// 公钥（用于前端加密）- 与前端 src/utils/rsaEncrypt.ts 保持一致
const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANVW/fMB4NHchAORwWKic375lrJT9Dte' +
  '9nlCaHt/iCdIA1DYIrA0XX1fUgYLTdg+QgzUD/SMOXvH83JLWN/kW7ECAwEAAQ==';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 页面元素
  private usernameInput = () => this.page.getByPlaceholder('账号');
  private passwordInput = () => this.page.getByPlaceholder('密码');
  private codeInput = () => this.page.getByPlaceholder('验证码');
  private loginButton = () => this.page.getByRole('button', { name: /登/i });
  private captchaImage = () => this.page.locator('.login-code img');

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');

    // 注入 JSEncrypt 库到页面
    await this.page.addScriptTag({
      url: 'https://cdn.jsdelivr.net/npm/jsencrypt@3.3.2/bin/jsencrypt.min.js'
    });
  }

  async fillUsername(username: string) {
    await this.usernameInput().fill(username);
  }

  async fillPassword(password: string) {
    await this.passwordInput().fill(password);
  }

  async fillCode(code: string) {
    await this.codeInput().fill(code);
  }

  async getCaptchaSrc(): Promise<string> {
    return await this.captchaImage().getAttribute('src') || '';
  }

  // 登录 - 使用 RSA 加密密码（在浏览器上下文中执行）
  async login(username: string, password: string, code?: string, uuid?: string) {
    // 填写用户名和密码
    await this.fillUsername(username);
    await this.fillPassword(password);

    if (code) {
      await this.fillCode(code);
    }

    // 在浏览器上下文中加密密码并登录
    const result = await this.page.evaluate(async ({ username, password, code, uuid, publicKey }) => {
      try {
        // 检查 JSEncrypt 是否可用
        // @ts-ignore
        if (typeof JSEncrypt === 'undefined') {
          return { error: 'JSEncrypt not loaded' };
        }

        // 使用 JSEncrypt 加密密码
        // @ts-ignore
        const encryptor = new JSEncrypt();
        encryptor.setPublicKey(publicKey);
        const encryptedPassword = encryptor.encrypt(password);

        if (!encryptedPassword) {
          return { error: 'Password encryption failed' };
        }

        const response = await fetch('/dev-api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password: encryptedPassword,
            code,
            uuid,
          }),
        });
        return await response.json();
      } catch (error) {
        return { error: String(error) };
      }
    }, { username, password, code, uuid, publicKey });

    console.log('Login API result:', JSON.stringify(result));

    // 如果登录成功，保存 token 并导航
    if (result.code === 200 && result.data) {
      // 存储 token 到 Cookie（前端使用 Cookies 存储 token）
      const token = result.data;
      await this.page.context().addCookies([{
        name: 'IADMIN-TOKEN',
        value: token,
        domain: 'localhost',
        path: '/',
      }]);

      // 手动导航到首页（前端会检测 Cookie 中的 token）
      await this.page.goto('/index');
      await this.page.waitForLoadState('networkidle');
      return result;
    }

    // 如果 API 登录失败，回退到表单提交
    console.log('API login failed, falling back to form submission');
    await this.loginButton().click();

    // 等待可能的导航
    try {
      await this.page.waitForURL('**/index', { timeout: 5000 });
    } catch {
      // 忽略超时
    }

    return result;
  }

  // 获取登录状态
  async isLoggedIn(): Promise<boolean> {
    return await this.page.url().includes('/index');
  }
}
