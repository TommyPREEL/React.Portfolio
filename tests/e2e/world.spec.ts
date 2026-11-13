import { expect, test } from '@playwright/test'
import { expectNoContextLoss, gotoWorld, setLang, startDriving, teleport, waitForTrigger, watchProblems } from './helpers'

test.beforeEach(async ({ page }) => {
  await setLang(page, 'en')
})

test('intro closes and the canvas stays visible', async ({ page }) => {
  const problems = watchProblems(page)
  await gotoWorld(page)
  const intro = page.getByRole('dialog')
  await expect(intro).toBeVisible()
  await intro.getByRole('button', { name: 'Start driving' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const box = await page.locator('canvas').first().boundingBox()
  expect(box?.width).toBeGreaterThan(300)
  expect(box?.height).toBeGreaterThan(300)
  await expectNoContextLoss(page)
  expect(problems).toEqual([])
})

test('escape menu opens, closes, and tabs follow arrow keys', async ({ page }) => {
  const problems = watchProblems(page)
  await gotoWorld(page)
  await startDriving(page)
  await page.keyboard.press('Escape')
  const menu = page.getByRole('dialog')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('tab')).toHaveCount(4)
  await expect(menu.getByRole('tab', { name: 'Home' })).toHaveAttribute('aria-selected', 'true')

  await menu.getByRole('tab', { name: 'Home' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(menu.getByRole('tab', { name: 'Controls' })).toHaveAttribute('aria-selected', 'true')
  await expect(menu.getByRole('tab', { name: 'Controls' })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(menu.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true')
  await expect(menu.getByRole('radiogroup')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(menu.getByRole('tab', { name: 'Map' })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowRight') // wraps
  await expect(menu.getByRole('tab', { name: 'Home' })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowLeft') // wraps back
  await expect(menu.getByRole('tab', { name: 'Map' })).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(problems).toEqual([])
})

test('first Escape dismisses the acceleration toast, the second opens the menu', async ({ page }) => {
  await gotoWorld(page)
  await page.getByRole('button', { name: 'Start driving' }).click()
  const toast = page.getByRole('button', { name: 'Got it, continue' })
  await expect(toast).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(toast).toHaveCount(0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('M opens the map tab', async ({ page }) => {
  await gotoWorld(page)
  await page.getByRole('button', { name: 'Start driving' }).click()
  await page.keyboard.press('m')
  await expect(page.getByRole('tab', { name: 'Map' })).toHaveAttribute('aria-selected', 'true')
})

test('language choice persists after reload', async ({ page }) => {
  const problems = watchProblems(page)
  await gotoWorld(page)
  await startDriving(page)
  await page.keyboard.press('Escape')
  await page.getByRole('tab', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Français' }).click()
  await expect(page.getByRole('tab', { name: 'Paramètres' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('portfolio.lang'))).toBe('fr')

  // The init script forces 'en' on every load, so override it with a later one that keeps the saved value.
  await page.addInitScript(() => localStorage.setItem('portfolio.lang', 'fr'))
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.getByRole('button', { name: 'Démarrer' })).toBeVisible()
  expect(problems).toEqual([])
})

test('deep link /projects/pvpedia opens the panel with that card highlighted', async ({ page }) => {
  const problems = watchProblems(page)
  await gotoWorld(page, '/projects/pvpedia')
  const panel = page.getByRole('dialog')
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('heading', { level: 1 })).toBeVisible()
  const card = panel.locator('#project-pvpedia')
  await expect(card).toHaveAttribute('data-highlighted', 'true')
  await expect(card).toHaveAttribute('aria-current', 'true')
  await expect(panel.locator('[data-highlighted="true"]')).toHaveCount(1)
  expect(new URL(page.url()).pathname).toBe('/projects/pvpedia')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(problems).toEqual([])
})

test('garage: prompt appears, then Enter (desktop) or tap (mobile) opens About', async ({ page, isMobile }) => {
  const problems = watchProblems(page)
  await gotoWorld(page)
  await page.getByRole('button', { name: 'Start driving' }).click()
  await teleport(page, -33.8, 0)
  await waitForTrigger(page, 'garage')
  const prompt = page.getByRole('button', { name: isMobile ? /Tap to open/ : /Enter\s*Open/ })
  await expect(prompt).toBeVisible()
  if (isMobile) {
    await prompt.tap()
  } else {
    await expect(prompt.locator('kbd')).toHaveText('Enter')
    await page.keyboard.press('Enter')
  }
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(new URL(page.url()).pathname).toBe('/about')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(problems).toEqual([])
})

test('touch emulation shows the joystick, desktop does not', async ({ page, isMobile }) => {
  await gotoWorld(page)
  await page.getByRole('button', { name: 'Start driving' }).click()
  const joystick = page.locator('[class*="joystickBase"]')
  if (isMobile) {
    await expect(joystick).toBeVisible()
    const box = await joystick.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(44)
  } else {
    await expect(joystick).toHaveCount(0)
  }
})
