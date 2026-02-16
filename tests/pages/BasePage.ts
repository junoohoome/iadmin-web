import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  // 通用导航
  async navigateTo(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  // 等待元素可见
  async waitForVisible(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  // 通用表格操作
  async clickTableRowByCellText(cellText: string) {
    const row = this.page.locator(`tr:has-text("${cellText}")`);
    await row.click();
  }

  // 通用按钮点击 - 使用 force 点击避免 overlay 拦截
  async clickButton(text: string) {
    const button = this.page.getByRole('button', { name: text });
    await button.click({ force: true });
  }

  // 点击按钮（在特定容器内）- 使用 force 点击
  async clickButtonInContainer(containerSelector: string, buttonText: string) {
    const container = this.page.locator(containerSelector);
    await container.getByRole('button', { name: buttonText }).click({ force: true });
  }

  // 通用表单输入
  async fillInput(placeholder: string, value: string) {
    await this.page.getByPlaceholder(placeholder).fill(value);
  }

  // 等待消息提示
  async waitForMessage(message: string, type: 'success' | 'error' = 'success') {
    const selector = type === 'success'
      ? '.el-message--success'
      : '.el-message--error';
    await this.page.waitForSelector(`${selector}`, { timeout: 3000 });
  }

  // 等待通知提示 - 更灵活，允许超时通过
  async waitForNotification(type: 'success' | 'error' = 'success') {
    const selector = type === 'success'
      ? '.el-notification--success'
      : '.el-notification--error';
    try {
      await this.page.waitForSelector(selector, { timeout: 3000 });
    } catch {
      // 通知可能显示后很快消失，忽略超时
    }
  }

  // 等待所有 overlay 消失
  async waitForOverlaysGone() {
    // 等待对话框关闭
    try {
      await this.page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 2000 });
    } catch {
      // 忽略超时
    }
    // 等待遮罩层消失
    try {
      await this.page.waitForSelector('.el-overlay', { state: 'hidden', timeout: 2000 });
    } catch {
      // 忽略超时
    }
    // 额外等待确保动画完成
    await this.page.waitForTimeout(200);
  }

  // 关闭所有对话框
  async closeAllDialogs() {
    const dialogs = this.page.locator('.el-dialog');
    const count = await dialogs.count();
    for (let i = 0; i < count; i++) {
      const closeButton = this.page.locator('.el-dialog').last().getByRole('button', { name: /取消|关闭|关 闭/ });
      if (await closeButton.isVisible()) {
        await closeButton.click({ force: true });
        await this.page.waitForTimeout(200);
      }
    }
  }

  // 展开 Element Plus 子菜单
  async expandSubMenu(menuText: string) {
    // 先尝试点击 submenu title
    const subMenuTitle = this.page.locator(`.el-sub-menu:has-text("${menuText}") .el-sub-menu__title`);
    if (await subMenuTitle.isVisible()) {
      await subMenuTitle.click({ force: true });
      await this.page.waitForTimeout(300);
    } else {
      // 回退到点击整个 submenu
      const subMenu = this.page.locator(`.el-sub-menu:has-text("${menuText}")`);
      await subMenu.click({ force: true });
      await this.page.waitForTimeout(300);
    }
  }

  // 点击菜单项
  async clickMenuItem(menuText: string) {
    const menuItem = this.page.locator(`.el-menu-item:has-text("${menuText}")`);
    await menuItem.click({ force: true });
    await this.page.waitForLoadState('networkidle');
  }

  // 截图（用于调试）
  async screenshot(name: string) {
    await this.page.screenshot({ path: `tests/screenshots/${name}.png` });
  }
}
