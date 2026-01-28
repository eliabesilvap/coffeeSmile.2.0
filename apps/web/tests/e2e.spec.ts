import { test, expect } from '@playwright/test';

test('home carrega e mostra cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('article')).toHaveCount(9);
});

test('clicar num card abre a pagina do post', async ({ page }) => {
  await page.goto('/');
  const firstLink = page.locator('a[href^="/post/"]').first();
  const href = await firstLink.getAttribute('href');
  await firstLink.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator('article')).toBeVisible();
});

test('categoria filtra e mantem o layout', async ({ page }) => {
  await page.goto('/');
  const firstCategory = page.locator('aside a[href^="/categoria/"]').first();
  const href = await firstCategory.getAttribute('href');
  await firstCategory.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator('aside')).toBeVisible();
  await expect(page.locator('article')).toBeVisible();
});

test('paginacao numerica altera querystring e lista', async ({ page }) => {
  await page.goto('/');
  const firstTitle = await page.locator('article h3').first().innerText();
  await page.getByRole('link', { name: '2' }).click();
  await expect(page).toHaveURL(/page=2/);
  const secondTitle = await page.locator('article h3').first().innerText();
  expect(firstTitle).not.toBe(secondTitle);
});
