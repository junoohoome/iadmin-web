#!/usr/bin/env python3
"""
IAdmin Web Frontend Testing Script
Tests all major frontend functionality using Playwright
"""

from playwright.sync_api import sync_playwright, Page, Browser
import json
import time


def test_login_page(page: Page):
    """Test login page UI and form validation"""
    print("\n=== Testing Login Page ===")

    # Navigate to login page
    page.goto("http://localhost:3003/login")
    page.wait_for_load_state("networkidle")

    # Take screenshot
    page.screenshot(path="/tmp/login_page.png", full_page=True)
    print("✓ Login page screenshot saved to /tmp/login_page.png")

    # Check page title
    title = page.title()
    print(f"Page title: {title}")

    # Check if form elements exist
    username_input = page.locator("#username")
    password_input = page.locator("#password")
    code_input = page.locator("#code")
    login_btn = page.locator("button[type='primary'], .el-button--primary")

    # Check visibility
    assert username_input.is_visible(), "Username input not visible"
    assert password_input.is_visible(), "Password input not visible"
    assert code_input.is_visible(), "Code input not visible"
    assert login_btn.is_visible(), "Login button not visible"
    print("✓ All form elements are visible")

    # Test form validation - empty fields
    login_btn.click()
    page.wait_for_timeout(500)

    # Check for validation messages
    error_msgs = page.locator(".el-form-item__error")
    if error_msgs.count() > 0:
        print(f"✓ Form validation working: {error_msgs.count()} error messages shown")
        for i in range(min(3, error_msgs.count())):
            print(f"  - {error_msgs.nth(i).text_content()}")

    # Check console for errors
    check_console_errors(page)

    return True


def test_main_layout_after_login(page: Page):
    """Test main layout components"""
    print("\n=== Testing Main Layout ===")

    # Check for layout components
    sidebar = page.locator(".sidebar-container")
    navbar = page.locator(".navbar")
    tags_view = page.locator(".tags-view-container")
    app_main = page.locator(".app-main")

    layout_visible = False
    if sidebar.is_visible():
        print("✓ Sidebar is visible")
        layout_visible = True
    else:
        print("⚠ Sidebar not visible")

    if navbar.is_visible():
        print("✓ Navbar is visible")
        layout_visible = True
    else:
        print("⚠ Navbar not visible")

    if tags_view.count() > 0:
        print("✓ Tags View is present")
    else:
        print("⚠ Tags View not found")

    if app_main.count() > 0:
        print("✓ App Main content area is present")
    else:
        print("⚠ App Main not found")

    return layout_visible


def test_console_errors(page: Page):
    """Check for console errors"""
    print("\n=== Checking Console Errors ===")
    # Console errors will be captured by the browser context
    pass


def test_ui_components(page: Page):
    """Test various UI components"""
    print("\n=== Testing UI Components ===")

    # Check for common components
    components_to_check = [
        ("Pagination", ".pagination-container"),
        ("Table", ".el-table"),
        ("Form", ".el-form"),
        ("Dialog", ".el-dialog"),
        ("Message", ".el-message"),
    ]

    for name, selector in components_to_check:
        count = page.locator(selector).count()
        if count > 0:
            print(f"✓ {name}: {count} found")
        else:
            print(f"⚠ {name}: not found on current page")


def test_responsive_design(page: Page):
    """Test responsive design at different viewport sizes"""
    print("\n=== Testing Responsive Design ===")

    sizes = [
        (1920, 1080, "Desktop"),
        (1366, 768, "Laptop"),
        (768, 1024, "Tablet"),
        (375, 667, "Mobile"),
    ]

    for width, height, name in sizes:
        page.set_viewport_size({"width": width, "height": height})
        page.wait_for_timeout(500)
        page.screenshot(path=f"/tmp/responsive_{name.lower()}.png")
        print(f"✓ {name} ({width}x{height}) screenshot saved")


def check_console_errors(page: Page):
    """Helper to check and report console errors"""
    # This would need to be set up before page creation
    pass


def main():
    """Main test runner"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Track console messages
        console_errors = []
        def on_console(msg):
            if msg.type == "error":
                console_errors.append(msg.text)
                print(f"Console Error: {msg.text}")

        page.on("console", on_console)

        try:
            # Test 1: Login Page
            test_login_page(page)

            # Try to navigate to main app (will likely redirect to login without auth)
            print("\n=== Testing Navigation ===")
            page.goto("http://localhost:3003/")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            current_url = page.url
            print(f"Current URL: {current_url}")

            # If we're on a page with layout, test it
            if "/login" not in current_url:
                test_main_layout_after_login(page)
                test_ui_components(page)
                test_responsive_design(page)
            else:
                print("⚠ Not logged in - skipping main layout tests")

            # Final screenshot
            page.screenshot(path="/tmp/final_state.png", full_page=True)
            print("\n✓ Final screenshot saved to /tmp/final_state.png")

            # Report console errors
            if console_errors:
                print(f"\n⚠ Found {len(console_errors)} console errors:")
                for error in console_errors[:10]:  # Show first 10
                    print(f"  - {error}")
            else:
                print("\n✓ No console errors detected")

        except Exception as e:
            print(f"\n✗ Test failed with error: {e}")
            page.screenshot(path="/tmp/error_state.png", full_page=True)
            print("Error screenshot saved to /tmp/error_state.png")

        finally:
            browser.close()


if __name__ == "__main__":
    main()
