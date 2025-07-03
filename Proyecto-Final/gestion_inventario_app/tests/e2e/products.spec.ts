import { test, expect } from '@playwright/test';

test.describe('Products Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3001/login');
        await page.locator('input[name="username"]').fill('admin');
        await page.locator('input[name="password"]').fill('admin123');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/products');
        await expect(page.locator('text=Gestión de Productos')).toBeVisible();
    });

    test('should add a new product', async ({ page }) => {
        await page.getByRole('button', { name: /Agregar Producto/i }).click();
        await page.waitForURL('**/products/add');
        await page.waitForLoadState('networkidle');

        await page.fill('#name', 'Producto Test');
        await page.fill('#description', 'Descripción del producto test');
        await page.fill('#price', '99.99');
        await page.fill('#quantity', '50');

        await page.locator('button[role="combobox"]').click();
        await page.getByRole('option', { name: 'Electrónicos' }).click();

        await page.getByRole('button', { name: /Guardar Producto/i }).click();

        await page.waitForSelector('[role="status"]');
        const toastTitle = await page.locator('.text-sm.font-semibold').first();
        await expect(toastTitle).toContainText(/Producto creado/i);
    });

    test('should edit an existing product', async ({ page }) => {
        await page.waitForSelector('table');

        await page.fill('input[placeholder*="Buscar"]', 'Producto Test');
        await page.waitForTimeout(2000);

        const productRow = page.locator('tr', {
            has: page.locator('td', { hasText: 'Producto Test' })
        });

        const editButton = productRow.locator('button', {
            has: page.locator('svg')
        }).first();

        await editButton.click();

        await page.waitForURL('**/products/edit/**');
        await page.waitForLoadState('networkidle');

        await page.fill('#name', 'Producto Test Modificado');
        await page.fill('#price', '149.99');

        await page.getByRole('button', { name: /Actualizar Producto/i }).click();

        await page.waitForSelector('[role="status"]');
        const toastTitle = await page.locator('.text-sm.font-semibold').first();
        await expect(toastTitle).toContainText(/Producto actualizado/i);
    });

    test('should delete a product', async ({ page }) => {
        await page.waitForSelector('table');

        await page.fill('input[placeholder*="Buscar"]', 'Producto Test Modificado');
        await page.waitForTimeout(2000);


        const productRow = page.locator('tr', {
            has: page.locator('td', { hasText: 'Producto Test Modificado' })
        });

        const actionButtons = productRow.locator('button');

        const deleteButton = actionButtons.nth(1);

        await deleteButton.click();

        await page.waitForSelector('[role="alertdialog"]');

        const confirmButton = page.getByRole('button', { name: 'Eliminar' });
        await confirmButton.click();

        await page.waitForSelector('[role="status"]');
        const toastTitle = await page.locator('.text-sm.font-semibold').first();
        await expect(toastTitle).toContainText(/Producto eliminado/i);

        await page.waitForTimeout(1000);
        const productExists = await page.locator('td', {
            hasText: 'Producto Test Modificado'
        }).count();
        expect(productExists).toBe(0);
    });

    test('should filter products by category', async ({ page }) => {
        await page.locator('button[role="combobox"]').click();
        await page.getByRole('option', { name: 'Electrónicos' }).click();
        await page.waitForTimeout(2000);

        const productos = await page.locator('td:has-text("Electrónicos")').count();
        expect(productos).toBeGreaterThanOrEqual(0);
    });

    test('should search products', async ({ page }) => {
        await page.getByRole('button', { name: /Agregar Producto/i }).click();
        await page.waitForURL('**/products/add');
        await page.waitForLoadState('networkidle');

        const testProductName = 'Producto Búsqueda Test';

        await page.fill('#name', testProductName);
        await page.fill('#description', 'Descripción test');
        await page.fill('#price', '99.99');
        await page.fill('#quantity', '50');

        await page.locator('button[role="combobox"]').click();
        await page.getByRole('option', { name: 'Electrónicos' }).click();

        await page.getByRole('button', { name: /Guardar Producto/i }).click();

        await page.waitForURL('**/products');
        await page.waitForSelector('[role="status"]');
        await expect(page.locator('.text-sm.font-semibold').first()).toContainText(/Producto creado/i);

        await page.waitForSelector('input[placeholder*="Buscar"]');
        await page.fill('input[placeholder*="Buscar"]', testProductName);
        await page.waitForTimeout(1000);

        const productRows = page.locator('tr', {
            has: page.locator('td', { hasText: testProductName })
        });

        const count = await productRows.count();
        expect(count).toBeGreaterThan(0);

        const firstRow = productRows.first();
        await expect(firstRow).toBeVisible();

        const cells = firstRow.locator('td');
        await expect(cells.nth(0)).toContainText(testProductName);
        await expect(cells.nth(1)).toContainText('Descripción test');
        await expect(cells.nth(2)).toContainText('Electrónicos');

        const priceCell = await cells.nth(3).textContent();
        expect(priceCell?.includes('99.99')).toBeTruthy();

        const quantityCell = await cells.nth(4).textContent();
        expect(quantityCell?.includes('50')).toBeTruthy();
    });

    test('should show low stock warning', async ({ page }) => {
        await page.getByRole('button', { name: /Agregar Producto/i }).click();
        await page.waitForURL('**/products/add');
        await page.waitForLoadState('networkidle');

        await page.fill('#name', 'Producto Stock Bajo');
        await page.fill('#description', 'Producto con stock bajo');
        await page.fill('#price', '49.99');
        await page.fill('#quantity', '5');

        await page.locator('button[role="combobox"]').click();
        await page.getByRole('option', { name: 'Electrónicos' }).click();

        await page.getByRole('button', { name: /Guardar Producto/i }).click();

        await page.waitForSelector('table');

        const stockBadge = page.locator('div', {
            hasText: 'Stock Bajo',
            has: page.locator('.bg-yellow-100.text-yellow-800')
        }).first();

        await expect(stockBadge).toBeVisible();
    });
});