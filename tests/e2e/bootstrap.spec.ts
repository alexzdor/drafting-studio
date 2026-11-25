import { expect, test } from '@playwright/test'

test('opens the editor with a new project', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Чертёжная Мастерская' })).toBeVisible()
  await expect(page.getByText('Новый чертёж', { exact: true })).toBeVisible()
})
