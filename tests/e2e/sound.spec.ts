import { expect, test } from '@playwright/test'
import { gotoWorld, setLang, startDriving, watchProblems } from './helpers'

test.beforeEach(async ({ page }) => {
  await setLang(page, 'en')
})

test('sound is off by default, toggles on and off without errors, choice is remembered', async ({ page }) => {
  const problems = watchProblems(page)
  const soundRequests: string[] = []
  page.on('request', (req) => {
    if (req.url().includes('/sounds/')) soundRequests.push(req.url())
  })
  await gotoWorld(page)
  await startDriving(page)

  const toggle = page.getByRole('button', { name: /^Sound:/ })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  // Nothing is fetched while sound is off.
  expect(soundRequests).toEqual([])

  const engineLoaded = page.waitForResponse((r) => r.url().endsWith('/sounds/engine.mp3'))
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  expect((await engineLoaded).ok()).toBe(true)
  expect(await page.evaluate(() => localStorage.getItem('portfolio.sound'))).toBe('on')

  // Panel-free drive for a moment so the update loop runs.
  await page.keyboard.down('ArrowUp')
  await page.waitForTimeout(800)
  await page.keyboard.up('ArrowUp')

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate(() => localStorage.getItem('portfolio.sound'))).toBe('off')
  await page.waitForTimeout(600)
  expect(problems).toEqual([])
})
