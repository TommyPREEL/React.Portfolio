import { expect, test } from '@playwright/test'
import { gotoWorld, setLang, startDriving, watchProblems } from './helpers'

test.beforeEach(async ({ page }) => {
  await setLang(page, 'en')
})

test('settings show one volume slider per channel, with defaults, and remember changes', async ({ page }) => {
  const problems = watchProblems(page)
  await gotoWorld(page)
  await startDriving(page)

  await page.keyboard.press('Escape')
  const menu = page.getByRole('dialog')
  await menu.getByRole('tab', { name: 'Settings' }).click()

  const sliders = menu.getByRole('slider')
  await expect(sliders).toHaveCount(5)
  // Defaults: overall at 50 %, music below the game sounds.
  await expect(menu.getByLabel('Overall')).toHaveValue('50')
  await expect(menu.getByLabel('Music')).toHaveValue('35')

  await menu.getByLabel('Music').fill('10')
  await expect(menu.getByLabel('Music')).toHaveValue('10')
  const saved = await page.evaluate(() => window.localStorage.getItem('portfolio.volumes'))
  expect(JSON.parse(saved ?? '{}').music).toBeCloseTo(0.1)

  await page.reload()
  await startDriving(page)
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').getByRole('tab', { name: 'Settings' }).click()
  await expect(page.getByRole('dialog').getByLabel('Music')).toHaveValue('10')
  expect(problems).toEqual([])
})
