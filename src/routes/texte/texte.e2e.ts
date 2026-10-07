import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 1024 } });

test('overview lists chapters', async ({ page }) => {
	await page.goto('/texte/');
	await expect(page.locator('a[href$="/texte/div-3_001/"]')).toHaveCount(1);
});

test.describe('reader', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/texte/div-13_006/');
	});

	for (const viewport of [
		{ width: 1440, height: 1024 },
		{ width: 390, height: 844 }
	]) {
		test(`keeps initial content lazy at ${viewport.width}px`, async ({ page }) => {
			await page.setViewportSize(viewport);
			await page.reload();
			const ru = page.getByRole('region', { name: 'Transkription' });
			await expect(ru.locator('[data-slug="div-13_005"]')).toBeAttached();
			for (const name of ['Transkription', 'Übersetzung']) {
				const pane = page.getByRole('region', { name });
				const bounds = await pane.evaluate((el) => ({
					top: el.getBoundingClientRect().top,
					bottom: el.getBoundingClientRect().bottom,
					height: el.clientHeight,
					scrollHeight: el.scrollHeight,
					readerTop: el.closest('.drawer')!.getBoundingClientRect().top,
					readerBottom: el.closest('.drawer')!.getBoundingClientRect().bottom
				}));
				expect(bounds.top).toBeGreaterThanOrEqual(bounds.readerTop);
				expect(bounds.bottom).toBeLessThanOrEqual(bounds.readerBottom);
				expect(bounds.height).toBeGreaterThan(0);
				expect(bounds.scrollHeight).toBeGreaterThan(bounds.height);
				expect(await pane.locator('[data-slug]').count()).toBeLessThanOrEqual(3);
				await expect(pane.locator('[data-slug="div-13_007"]')).not.toBeAttached();
			}
		});
	}

	test('shows navigation, transcription and translation panes', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Navigation' })).toBeVisible();
		const ru = page.getByRole('region', { name: 'Transkription' });
		const de = page.getByRole('region', { name: 'Übersetzung' });
		await expect(ru.locator('[data-slug="div-13_006"]')).toBeVisible();
		await expect(de.locator('[data-slug="div-13_006"]')).toContainText('TRANSLATION GOES HERE');
		await expect(page.locator('a[aria-current="page"]')).toHaveText('div-13_006');
	});

	test('prepends the previous chapter without moving the view', async ({ page }) => {
		const ru = page.getByRole('region', { name: 'Transkription' });
		await expect(ru.locator('[data-slug="div-13_005"]')).toBeAttached();
		const offset = await ru
			.locator('[data-slug="div-13_006"]')
			.evaluate(
				(el) => el.getBoundingClientRect().top - el.parentElement!.getBoundingClientRect().top
			);
		expect(Math.abs(offset)).toBeLessThan(50);
		await expect(page).toHaveURL(/\/texte\/div-13_006\/$/);
	});

	test('appends the next chapter and updates the URL', async ({ page }) => {
		const ru = page.getByRole('region', { name: 'Transkription' });
		const de = page.getByRole('region', { name: 'Übersetzung' });
		await ru.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
		await expect(ru.locator('[data-slug="div-13_007"]')).toBeAttached();
		await expect(de.locator('[data-slug="div-13_007"]')).toBeAttached();
		await ru.locator('[data-slug="div-13_007"]').evaluate((el) => {
			const pane = el.parentElement!;
			pane.scrollTop += el.getBoundingClientRect().top - pane.getBoundingClientRect().top + 50;
		});
		await expect(page).toHaveURL(/\/texte\/div-13_007\/$/);
		await expect(page.locator('a[aria-current="page"]')).toHaveText('div-13_007');
	});

	test('scrolling the transcription scrolls the translation', async ({ page }) => {
		const ru = page.getByRole('region', { name: 'Transkription' });
		const de = page.getByRole('region', { name: 'Übersetzung' });
		await expect(ru.locator('[data-slug="div-13_005"]')).toBeAttached();
		const before = await de.evaluate((el) => el.scrollTop);
		await ru.hover();
		await page.mouse.wheel(0, 1500);
		await expect.poll(() => de.evaluate((el) => el.scrollTop)).toBeGreaterThan(before + 200);
	});
});
