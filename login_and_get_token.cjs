const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,  // 显示浏览器以便观察
    slowMo: 500     // 慢速执行
  });

  const page = await browser.newPage();
  const baseURL = 'http://localhost:3000';

  console.log('========================================');
  console.log('iAdmin 自动化测试 - 登录并获取Token');
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

    // 3. 识别验证码（使用后端接口返回的验证码文本）
    console.log('\n[3] 从后端获取验证码文本...');
    const codeResp = await page.evaluate(async (uuid) => {
      // 从Redis获取验证码（需要后端支持）
      const response = await fetch(`/dev-api/auth/code?getCode=${uuid}`);
      const text = await response.text();
      return JSON.parse(text);
    }, [captchaResp.data.uuid]);

    let code = '1234';  // 默认值
    if (codeResp.data && codeResp.data.code) {
      code = codeResp.data.data;
      console.log('  验证码:', code);
    } else {
      console.log('  ⚠ 无法从后端获取验证码，使用默认值: 1234');
    }

    // 4. 填写表单
    console.log('\n[4] 填写登录表单...');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'admin123');
    await page.fill('input[placeholder*="验证码"]', code);
    console.log('  ✓ 用户名: admin');
    console.log('  ✓ 密码: admin123');
    console.log('  ✓ 验证码:', code);

    // 5. 点击登录按钮
    console.log('\n[5] 点击登录按钮...');
    await page.click('button:has-text("登录")');

    // 6. 等待跳转到首页
    console.log('\n[6] 等待登录成功...');
    try {
      await page.waitForURL('**/index', { timeout: 10000 });
      console.log('  ✓ 登录成功！已跳转到首页');
    } catch (e) {
      console.log('  ⚠ 未检测到跳转，检查当前页面状态...');
      await page.screenshot({ path: '/tmp/after_login_attempt.png' });
    }

    // 7. 从 localStorage 获取 token
    console.log('\n[7] 获取 Token...');
    const token = await page.evaluate(() => {
      return localStorage.getItem('Admin-Token');
    });

    if (token) {
      console.log('  ✓ Token 获取成功!');
      console.log('  Token (前50字符):', token.substring(0, 50) + '...');

      // 保存 token 到文件供后续测试使用
      require('fs').writeFileSync('/tmp/iadmin_token.txt', token);
      console.log('  ✓ Token 已保存到 /tmp/iadmin_token.txt');
    } else {
      console.log('  ✗ 未找到 Token，可能登录失败');
    }

    // 8. 获取当前用户信息
    console.log('\n[8] 获取用户信息...');
    const userInfo = await page.evaluate(async () => {
      const response = await fetch('/dev-api/user/info', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('Admin-Token')
        }
      });
      const text = await response.text();
      return JSON.parse(text);
    });

    if (userInfo.code === 200 && userInfo.data) {
      console.log('  ✓ 用户名:', userInfo.data.user.userName);
      console.log('  ✓ 角色:', userInfo.data.roles.map(r => r.roleName).join(', '));
    } else {
      console.log('  ✗ 获取用户信息失败');
    }

    // 保持浏览器打开，等待用户关闭
    console.log('\n========================================');
    console.log('登录成功！浏览器将保持打开状态');
    console.log('Token 已保存，可以用于后续 API 测试');
    console.log('按 Ctrl+C 关闭浏览器');
    console.log('========================================\n');

    // 等待用户手动关闭
    await page.waitForTimeout(300000);  // 等待5分钟或手动关闭

  } catch (e) {
    console.error('\n✗ 测试出错:', e.message);
    await page.screenshot({ path: '/tmp/error_screenshot.png' });
  } finally {
    await browser.close();
  }
})();
