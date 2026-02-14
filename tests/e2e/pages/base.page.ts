// tests/e2e/pages/base.page.ts
import { Page, expect } from '@playwright/test';

export class BasePage {
  url = '';

  constructor(protected page: Page) {}

  async goto(url?: string) {
    const targetUrl = url || this.url;
    await this.page.goto(targetUrl);
  }

  async clickButton(label: string, options?: { exact?: boolean }) {
    await this.page.getByRole('button', { name: label, exact: options?.exact }).click();
  }

  async clickDropdownItem(triggerLabel: string, itemLabel: string) {
    await this.page.getByRole('button', { name: triggerLabel }).click();
    await this.page.waitForSelector('.el-dropdown-menu:visible', { timeout: 5000 });
    await this.page.getByRole('menuitem', { name: itemLabel }).click();
  }

  async verifySuccess(expectedMessage?: string) {
    const message = this.page.locator('.el-message--success');
    await expect(message).toBeVisible({ timeout: 5000 });
    if (expectedMessage) {
      await expect(message).toContainText(expectedMessage);
    }
  }

  async verifyDialogVisible(title: string | RegExp) {
    const dialog = this.page.locator('.el-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(title);
  }
}
