import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');
    });

    test('should show login form', async ({ page }) => {
        await expect(page.locator('text=Inventario QAS')).toBeVisible();
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.locator('input[name="username"]').fill('wronguser');
        await page.locator('input[name="password"]').fill('wrongpass');
        await page.locator('button[type="submit"]').click();

        await expect(page.locator('div.text-sm.opacity-90:has-text("Email o contraseña incorrectos")')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        await page.locator('input[name="username"]').fill('admin');
        await page.locator('input[name="password"]').fill('admin123');
        await page.locator('button[type="submit"]').click();

        await expect(page.locator('[role="status"]:has-text("Inicio de sesión exitoso")')).toBeVisible();
        await expect(page).toHaveURL('http://localhost:3001/products');
    });

    test('should toggle password visibility', async ({ page }) => {
        const passwordInput = page.locator('input[name="password"]');
        await expect(passwordInput).toHaveAttribute('type', 'password');
        await page.locator('button:has(svg)').first().click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
        await passwordInput.fill('admin123');
        await expect(passwordInput).toHaveValue('admin123');
    });

    test('should handle network errors', async ({ page }) => {
        await page.route('**/api/v1/auth/login', route => route.abort());
        await page.locator('input[name="username"]').fill('admin');
        await page.locator('input[name="password"]').fill('admin123');
        await page.locator('button[type="submit"]').click();

        await expect(page.locator('[role="status"]:has-text("No se pudo conectar con el servidor")')).toBeVisible();
    });
});