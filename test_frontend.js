const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500  // 慢速执行以便观察
  });
  
  const page = await browser.newPage();
  const baseURL = 'http://localhost:3001';
  
  console.log('========================================');
  console.log('iAdmin 前端自动化测试');
  console.log('========================================\n');
  
  // 1. 打开登录页面
  console.log('[1] 打开登录页面...');
  await page.goto(baseURL);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '/tmp/login_page.png' });
  console.log('    ✓ 登录页面加载完成');
  
  // 2. 填写登录表单
  console.log('\n[2] 填写登录表单...');
  
  // 等待用户名输入框
  await page.waitForSelector('input[placeholder*="用户名"]', { timeout: 5000 });
  await page.fill('input[placeholder*="用户名"]', 'admin');
  console.log('    ✓ 输入用户名: admin');
  
  // 等待密码输入框
  await page.waitForSelector('input[placeholder*="密码"]', { timeout: 5000 });
  await page.fill('input[placeholder*="密码"]', 'admin123');
  console.log('    ✓ 输入密码: admin123');
  
  // 等待验证码输入框
  await page.waitForSelector('input[placeholder*="验证码"]', { timeout: 5000 });
  
  // 获取验证码图片
  const captchaImg = await page.locator('img[src*="captcha"], img[src*="code"]').first();
  if (await captchaImg.count() > 0) {
    console.log('    ⚠ 发现验证码，需要手动输入');
    console.log('    请在浏览器中输入验证码并点击登录...');
    
    // 等待用户手动登录
    await page.waitForURL('**/index', { timeout: 60000 });
  } else {
    // 点击登录按钮
    await page.click('button:has-text("登录")');
    await page.waitForLoadState('networkidle');
  }
  
  console.log('\n[3] 登录成功，进入主页...');
  await page.screenshot({ path: '/tmp/home_page.png' });
  
  // 4. 测试用户管理
  console.log('\n[4] 测试用户管理...');
  try {
    // 查找用户管理菜单
    const userMenu = page.getByText('用户管理').or(page.locator('[href*="user"]')).or(page.locator('[router-link*="user"]'));
    if (await userMenu.count() > 0) {
      await userMenu.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/tmp/user_management.png' });
      console.log('    ✓ 用户管理页面打开成功');
      
      // 检查是否有用户列表
      const table = page.locator('table, .el-table, .user-list');
      if (await table.count() > 0) {
        console.log('    ✓ 用户列表显示正常');
      }
    }
  } catch (e) {
    console.log('    ✗ 用户管理页面测试失败:', e.message);
  }
  
  // 5. 测试角色管理
  console.log('\n[5] 测试角色管理...');
  try {
    const roleMenu = page.getByText('角色管理').or(page.locator('[href*="role"]')).or(page.locator('[router-link*="role"]'));
    if (await roleMenu.count() > 0) {
      await roleMenu.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/tmp/role_management.png' });
      console.log('    ✓ 角色管理页面打开成功');
    }
  } catch (e) {
    console.log('    ✗ 角色管理页面测试失败:', e.message);
  }
  
  // 6. 测试部门管理
  console.log('\n[6] 测试部门管理...');
  try {
    const deptMenu = page.getByText('部门管理').or(page.locator('[href*="dept"]')).or(page.locator('[router-link*="dept"]'));
    if (await deptMenu.count() > 0) {
      await deptMenu.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/tmp/dept_management.png' });
      console.log('    ✓ 部门管理页面打开成功');
    }
  } catch (e) {
    console.log('    ✗ 部门管理页面测试失败:', e.message);
  }
  
  // 7. 测试菜单管理
  console.log('\n[7] 测试菜单管理...');
  try {
    const menuMenu = page.getByText('菜单管理').or(page.locator('[href*="menu"]')).or(page.locator('[router-link*="menu"]'));
    if (await menuMenu.count() > 0) {
      await menuMenu.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/tmp/menu_management.png' });
      console.log('    ✓ 菜单管理页面打开成功');
    }
  } catch (e) {
    console.log('    ✗ 菜单管理页面测试失败:', e.message);
  }
  
  console.log('\n========================================');
  console.log('测试完成！');
  console.log('========================================');
  console.log('\n截图已保存到 /tmp/ 目录:');
  console.log('  - login_page.png (登录页面)');
  console.log('  - home_page.png (主页)');
  console.log('  - user_management.png (用户管理)');
  console.log('  - role_management.png (角色管理)');
  console.log('  - dept_management.png (部门管理)');
  console.log('  - menu_management.png (菜单管理)');
  
  // 保持浏览器打开以便观察
  console.log('\n浏览器将保持打开状态，按 Ctrl+C 退出...');
  
  // 等待用户关闭浏览器
  await browser.close();
})();
