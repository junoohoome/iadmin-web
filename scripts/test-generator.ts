/**
 * 测试生成器 - 基于 coverage.json 自动生成 Playwright 测试
 *
 * 用法：
 *   npm run test:e2e:generate
 *
 * 输出：tests/generated/*.spec.ts
 */

import fs from 'fs/promises';
import path from 'path';

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

class TestGenerator {
  private coverage: CoverageReport | null = null;
  private outputDir = path.join(process.cwd(), 'tests', 'generated');

  /**
   * 加载覆盖率报告
   */
  private async loadCoverage(): Promise<CoverageReport> {
    const coveragePath = path.join(process.cwd(), 'test-data', 'coverage.json');

    try {
      const content = await fs.readFile(coveragePath, 'utf-8');
      return JSON.parse(content) as CoverageReport;
    } catch (error) {
      throw new Error('无法加载覆盖率报告，请先运行 npm run test:e2e:discover');
    }
  }

  /**
   * 分类功能点 - 决定测试深度
   */
  private classifyAction(action: ClickableElement): 'A' | 'B' | 'C' {
    const actionKeywords = ['新增', '添加', '创建', '编辑', '修改', '删除', '保存', '提交', '导入', '导出'];
    if (actionKeywords.some(kw => action.text.includes(kw))) {
      return 'A';
    }

    const searchKeywords = ['搜索', '查询', '重置', '筛选'];
    if (searchKeywords.some(kw => action.text.includes(kw))) {
      return 'B';
    }

    return 'C';
  }

  /**
   * 生成测试代码
   */
  private async generatePageTestFile(pageKey: string, page: PageCoverage): Promise<void> {
    const tests: string[] = [];
    const pageName = this.inferPageName(page.path);

    // 过滤掉页脚链接等低价值元素
    const valuableActions = page.actions.filter(action => {
      if (action.text.includes('Apache') || action.text.includes('京ICP')) {
        return false;
      }
      return true;
    });

    if (valuableActions.length === 0) {
      console.log('   跳过 ' + page.title + ' (无可测试元素)');
      return;
    }

    // 生成导入
    tests.push("import { test, expect } from '@playwright/test';");
    tests.push("import { " + pageName + "Page } from '../pages/" + this.getPagePath(page.path) + "';");
    tests.push('');
    tests.push("test.describe('" + page.title + "', () => {");

    // 生成每个测试
    valuableActions.forEach((action, index) => {
      tests.push('');
      tests.push(this.generateTestCode(action, page, pageName, index));
    });

    tests.push('});');

    // 写入文件
    const fileName = pageKey.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-');
    const outputPath = path.join(this.outputDir, fileName + '.spec.ts');

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, tests.join('\n'), 'utf-8');

    console.log('   生成: ' + fileName + '.spec.ts (' + valuableActions.length + ' 个测试)');
  }

  /**
   * 推断 Page Object 名称
   */
  private inferPageName(pagePath: string): string {
    if (pagePath.includes('/user')) return 'User';
    if (pagePath.includes('/role')) return 'Role';
    if (pagePath.includes('/menu')) return 'Menu';
    if (pagePath.includes('/dept')) return 'Dept';
    return 'Dashboard';
  }

  /**
   * 获取 Page Object 相对路径
   */
  private getPagePath(pagePath: string): string {
    if (pagePath.includes('/user')) return 'system/UserPage';
    if (pagePath.includes('/role')) return 'system/RolePage';
    if (pagePath.includes('/menu')) return 'system/MenuPage';
    if (pagePath.includes('/dept')) return 'system/DeptPage';
    return 'DashboardPage';
  }

  /**
   * 生成测试代码
   */
  private generateTestCode(action: ClickableElement, page: PageCoverage, pageName: string, index: number): string {
    const actionType = this.classifyAction(action);

    const testTitle = page.title + ' - ' + action.text + '可点击';
    const pageObjName = pageName.toLowerCase() + 'Page';

    let body = '';

    body += '  test(\'' + testTitle + '\', async ({ page }) => {\n';
    body += '    const ' + pageObjName + ' = new ' + pageName + 'Page(page);\n';
    body += '    await ' + pageObjName + '.goto();\n';
    body += '\n';
    body += '    await expect(' + pageObjName + '.page.locator(\'' + action.selector + '\')).toBeVisible();\n';
    body += '    await ' + pageObjName + '.page.locator(\'' + action.selector + '\').click();\n';
    body += '\n';
    body += '    await page.waitForTimeout(500);\n';
    body += '  });\n';

    return body;
  }

  /**
   * 生成 README
   */
  private async generateReadme(): Promise<void> {
    const total = this.coverage?.summary.totalPages || 0;
    const actions = this.coverage?.summary.totalActions || 0;

    const readme = '# 自动生成的 E2E 测试\n\n' +
      '此目录中的测试由 `npm run test:e2e:generate` 自动生成。\n\n' +
      '## 覆盖率\n\n' +
      '- 总页面数: ' + total + '\n' +
      '- 总功能点: ' + actions + '\n\n' +
      '## 重新生成\n\n' +
      '```bash\n' +
      'npm run test:e2e:discover  # 重新发现功能点\n' +
      'npm run test:e2e:generate   # 重新生成测试\n' +
      '```\n';

    await fs.writeFile(
      path.join(this.outputDir, 'README.md'),
      readme,
      'utf-8'
    );
  }

  /**
   * 主执行方法
   */
  async run() {
    try {
      console.log('开始生成测试代码...\n');

      // 1. 加载覆盖率报告
      console.log('1. 加载覆盖率报告...');
      this.coverage = await this.loadCoverage();
      console.log('   加载 ' + this.coverage.summary.totalPages + ' 个页面，' + this.coverage.summary.totalActions + ' 个功能点\n');

      // 2. 清理输出目录
      console.log('2. 清理输出目录...');
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log('   输出目录已准备\n');

      // 3. 生成测试文件
      console.log('3. 生成测试文件...\n');

      for (const [pageKey, page] of Object.entries(this.coverage.pages)) {
        await this.generatePageTestFile(pageKey, page);
      }

      // 4. 生成 README
      console.log('\n4. 生成 README...');
      await this.generateReadme();
      console.log('   README 已生成\n');

      console.log('='.repeat(50));
      console.log('测试生成完成！');
      console.log('='.repeat(50) + '\n');

    } catch (error) {
      console.error('\n生成失败:', error);
      throw error;
    }
  }
}

// 运行生成器
const generator = new TestGenerator();
generator.run().catch(console.error);
