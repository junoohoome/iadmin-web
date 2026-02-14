/**
 * 功能爬虫 - 自动遍历应用并发现所有可交互元素
 *
 * 用法：
 *   npm run test:e2e:discover
 *
 * 输出：test-data/coverage.json
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

interface ClickableElement {
  selector: string;
  text: string;
  type: 'menu' | 'button' | 'link' | 'input' | 'action';
  page: string;
  path: string;
  prerequisites?: string[];
}

interface PageCoverage {
  path: string;
  title: string;
  actions: ClickableElement[];
}

interface CoverageReport {
  timestamp: string;
  pages: Record<string, PageCoverage>;
  summary: {
    totalPages: number;
    totalActions: number;
  };
}

class AppCrawler {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private baseURL = 'http://localhost:3000';
  private apiBase = 'http://localhost:8090';
  private coverage: CoverageReport = {
    timestamp: new Date().toISOString(),
    pages: {},
    summary: { totalPages: 0, totalActions: 0 },
  };

  /**
   * 测试登录 - 获取 Token
   */
  private async login(): Promise<string> {
    const response = await fetch(`${this.apiBase}/auth/testLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    // data.data 已经包含 "Bearer " 前缀
    return data.data;
  }

  /**
   * 获取所有路由菜单
   */
  private async getRouters(token: string): Promise<any[]> {
    const response = await fetch(`${this.apiBase}/user/info/getRouters`, {
      headers: {
        // token 已经包含 "Bearer " 前缀
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get routers: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  }

  /**
   * 初始化浏览器
   */
  private async initBrowser(token: string) {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext({
      storageState: {
        origins: [
          {
            origin: this.baseURL,
            localStorage: [
              {
                name: 'Admin-Token',
                value: token,
              },
            ],
          },
        ],
      },
    });

    // 添加请求拦截器，自动添加 token
    await this.context.route('**/*', (route) => {
      const headers = { ...route.request().headers() };
      // token 已经包含 "Bearer " 前缀
      headers['authorization'] = token;
      route.continue({ headers });
    });
  }

  /**
   * 发现页面上的所有可点击元素
   */
  private async discoverPageElements(pagePath: string, pageTitle: string): Promise<ClickableElement[]> {
    if (!this.page) throw new Error('Page not initialized');

    const elements: ClickableElement[] = [];

    try {
      // 导航到页面
      await this.page.goto(`${this.baseURL}#${pagePath}`);
      await this.page.waitForLoadState('networkidle');

      // 等待主要内容加载
      await this.page.waitForSelector('.app-container', { timeout: 5000 }).catch(() => {});

      // 发现所有按钮
      const buttons = await this.page.locator('button:visible').all();
      for (const button of buttons) {
        const text = await button.textContent().catch(() => '');
        const isVisible = await button.isVisible().catch(() => false);

        if (isVisible && text && text.trim() && !this.shouldIgnoreButton(text.trim())) {
          elements.push({
            selector: await this.getUniqueSelector(button),
            text: text.trim(),
            type: this.classifyButton(text.trim()),
            page: pageTitle,
            path: pagePath,
          });
        }
      }

      // 发现所有链接
      const links = await this.page.locator('a:visible').all();
      for (const link of links) {
        const text = await link.textContent().catch(() => '');
        const isVisible = await link.isVisible().catch(() => false);

        if (isVisible && text && text.trim() && !this.shouldIgnoreLink(text.trim())) {
          elements.push({
            selector: await this.getUniqueSelector(link),
            text: text.trim(),
            type: 'link',
            page: pageTitle,
            path: pagePath,
          });
        }
      }

    } catch (error) {
      console.error(`  ❌ 发现元素失败: ${error}`);
    }

    return elements;
  }

  /**
   * 获取元素的唯一选择器
   */
  private async getUniqueSelector(element: any): Promise<string> {
    try {
      // 尝试获取 ID
      const id = await element.getAttribute('id');
      if (id) return `#${id}`;

      // 尝试获取 data-* 属性
      const dataId = await element.getAttribute('data-id');
      if (dataId) return `[data-id="${dataId}"]`;

      // 尝试使用 class + 文本组合
      const className = await element.getAttribute('class');
      const text = await element.textContent();

      if (className && text) {
        const classes = className.split(' ').filter(c => c && !c.includes(':')).slice(0, 2);
        if (classes.length > 0) {
          return `.${classes.join('.')}:has-text("${text.trim().substring(0, 20)}")`;
        }
      }

      // 最后使用位置
      return await element.evaluate((el: any) => {
        const tagName = el.tagName.toLowerCase();
        const sameTagSiblings = Array.from(el.parentElement?.children || [])
          .filter((sib: any) => sib.tagName === el.tagName);
        const index = sameTagSiblings.indexOf(el) + 1;
        return `${tagName}:nth-of-type(${index})`;
      });
    } catch {
      return 'unknown';
    }
  }

  /**
   * 判断是否应该忽略这个按钮
   */
  private shouldIgnoreButton(text: string): boolean {
    const ignorePatterns = [
      '上一页',
      '下一页',
      '更多',
      '刷新',
      '关闭',
      '取消',
      'el-icon',
    ];
    return ignorePatterns.some(p => text.includes(p)) || text.length < 2;
  }

  /**
   * 判断是否应该忽略这个链接
   */
  private shouldIgnoreLink(text: string): boolean {
    const ignorePatterns = [
      '首页',
      '返回',
      'el-icon',
    ];
    return ignorePatterns.some(p => text.includes(p));
  }

  /**
   * 分类按钮类型
   */
  private classifyButton(text: string): ClickableElement['type'] {
    const actionPatterns: Record<string, 'action'> = {
      新增: 'action',
      添加: 'action',
      创建: 'action',
      编辑: 'action',
      修改: 'action',
      删除: 'action',
      保存: 'action',
      提交: 'action',
      导出: 'action',
      导入: 'action',
      搜索: 'action',
      查询: 'action',
      重置: 'action',
    };

    for (const [pattern, type] of Object.entries(actionPatterns)) {
      if (text.includes(pattern)) return type;
    }

    return 'button';
  }

  /**
   * 递归遍历菜单树，提取所有页面
   */
  private extractPages(routes: any[], parentPath = '', pages: { path: string; title: string }[] = []): { path: string; title: string }[] {
    for (const route of routes) {
      // 检查是否应该跳过这个路由
      const isHidden = route.hidden === '1' || route.hidden === true;
      if (isHidden) continue;

      // 构建完整路径
      let fullPath;
      if (route.path && route.path.startsWith('/')) {
        fullPath = route.path;
      } else if (route.path) {
        fullPath = `${parentPath}/${route.path}`.replace(/\/+/g, '/');
      } else {
        fullPath = parentPath;
      }

      // 检查是否是页面（有 component 且不是 Layout）
      if (route.component && route.component !== 'Layout') {
        pages.push({
          path: fullPath,
          title: route.meta?.title || route.name || '未知页面',
        });
      }

      // 递归处理子菜单
      if (route.children && Array.isArray(route.children) && route.children.length > 0) {
        this.extractPages(route.children, fullPath, pages);
      }
    }

    return pages;
  }

  /**
   * 保存覆盖率报告
   */
  private async saveReport() {
    const fs = await import('fs/promises');
    const path = await import('path');

    const reportDir = path.join(process.cwd(), 'test-data');
    await fs.mkdir(reportDir, { recursive: true });

    const reportPath = path.join(reportDir, 'coverage.json');
    await fs.writeFile(reportPath, JSON.stringify(this.coverage, null, 2), 'utf-8');

    console.log(`\n✅ 覆盖率报告已保存: ${reportPath}`);
  }

  /**
   * 主执行方法
   */
  async run() {
    try {
      console.log('🚀 开始功能爬取...\n');

      // 1. 登录
      console.log('1️⃣  正在登录...');
      const token = await this.login();
      console.log('   ✅ 登录成功');

      // 2. 获取所有路由
      console.log('\n2️⃣  获取所有菜单路由...');
      const routes = await this.getRouters(token);
      const pages = this.extractPages(routes);
      console.log(`   ✅ 发现 ${pages.length} 个页面`);

      // 3. 初始化浏览器
      console.log('\n3️⃣  初始化浏览器...');
      await this.initBrowser(token);
      this.page = await this.context.newPage();
      console.log('   ✅ 浏览器已启动');

      // 4. 遍历所有页面
      console.log('\n4️⃣  开始遍历页面...\n');

      for (let i = 0; i < pages.length; i++) {
        const { path, title } = pages[i];
        console.log(`   [${i + 1}/${pages.length}] ${title} (${path})`);

        const elements = await this.discoverPageElements(path, title);

        this.coverage.pages[title] = {
          path,
          title,
          actions: elements,
        };

        this.coverage.summary.totalPages++;
        this.coverage.summary.totalActions += elements.length;

        console.log(`      发现 ${elements.length} 个可交互元素`);
      }

      // 5. 保存报告
      console.log('\n5️⃣  保存报告...');
      await this.saveReport();

      console.log('\n' + '='.repeat(50));
      console.log('📊 功能爬取完成！');
      console.log(`   - 总页面数: ${this.coverage.summary.totalPages}`);
      console.log(`   - 总功能点: ${this.coverage.summary.totalActions}`);
      console.log('='.repeat(50) + '\n');

    } catch (error) {
      console.error('\n❌ 爬取失败:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 清理资源
   */
  private async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

// 运行爬虫
const crawler = new AppCrawler();
crawler.run().catch(console.error);
