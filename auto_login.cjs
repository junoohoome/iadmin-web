const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const page = await browser.newPage();
  const baseURL = 'http://localhost:3000';

  console.log('========================================');
  console.log('iAdmin 自动化登录');
  console.log('========================================\n');

  try {
    // 1. 打开登录页面
    console.log('[1] 打开登录页面...');
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    console.log('  ✓ 页面加载完成');

    // 2. 获取验证码
    console.log('\n[2] 获取验证码...');
    const captchaResp = await page.evaluate(async () => {
      const response = await fetch('/dev-api/auth/code');
      const text = await response.text();
      return JSON.parse(text);
    });
    console.log('  UUID:', captchaResp.data.uuid);

    // 3. 使用 getCode 参数直接获取验证码文本
    console.log('\n[3] 获取验证码文本...');
    const codeResp = await page.evaluate(async (uuid) => {
      const response = await fetch(`/dev-api/auth/code?getCode=${uuid}`);
      const text = await response.text();
      return JSON.parse(text);
    }, [captchaResp.data.uuid]);

    let code = '1234';  // 默认值
    if (codeResp.data && codeResp.data.data) {
      code = codeResp.data.data;
      console.log('  验证码:', code);
    } else {
      console.log('  ⚠ 无法获取验证码文本，使用默认值: 1234');
    }

    // 4. 填写表单
    console.log('\n[4] 填写登录表单...');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'admin123');
    await page.fill('input[placeholder*="验证码"]', code);
    console.log('  ✓ 用户名: admin');
    console.log('  ✓ 密码: admin123');
    console.log('  ✓ 验证码:', code);

    // 5. 点击登录
    console.log('\n[5] 点击登录按钮...');
    await page.click('button:has-text("登录")');

    // 6. 等待跳转
    console.log('\n[6] 等待登录成功...');
    try {
      await page.waitForURL('**/index', { timeout: 10000 });
      console.log('  ✓ 登录成功！已跳转到首页');

      // 7. 获取 Token
      console.log('\n[7] 获取 Token...');
      const token = await page.evaluate(() => {
        return localStorage.getItem('Admin-Token');
      });

      if (token) {
        console.log('  ✓ Token 获取成功!');
        console.log('  Token (前50字符):', token.substring(0, 50) + '...');

        // 保存 Token
        require('fs').writeFileSync('/tmp/iadmin_token.txt', token);
        console.log('  ✓ Token 已保存到 /tmp/iadmin_token.txt');

        // 8. 获取用户信息验证
        console.log('\n[8] 验证 Token 有效性...');
        const userInfo = await page.evaluate(async (tkn) => {
          const response = await fetch('/dev-api/user/info', {
            headers: { 'Authorization': `Bearer ${tkn}` }
          });
          const text = await response.text();
          return JSON.parse(text);
        }, [token]);

        if (userInfo.code === 200 && userInfo.data) {
          console.log('  ✓ Token 有效！');
          console.log('  用户:', userInfo.data.user.userName);
          console.log('  角色:', userInfo.data.roles.map(r => r.roleName).join(', '));
        } else {
          console.log('  ✗ Token 验证失败');
        }
      } else {
        console.log('  ✗ 未找到 Token');
      }
    } catch (e) {
      console.log('  ⚠ 登录可能失败，当前页面:', page.url());
      await page.screenshot({ path: '/tmp/login_result.png' });
    }

    // 保持浏览器打开
    console.log('\n========================================');
    console.log('浏览器将保持打开，您可以查看登录状态');
    console.log('Token 已保存，可以用于后续测试');
    console.log('按 Ctrl+C 或手动关闭浏览器窗口');
    console.log('========================================\n');

    // 等待用户关闭浏览器
    await page.waitForTimeout(300000);  // 等待5分钟或用户手动关闭
  } catch (e) {
    console.error('\n✗ 发生错误:', e.message);
    await page.screenshot({ path: '/tmp/error_screenshot.png' });
  } finally {
    await browser.close();
  }
})();
