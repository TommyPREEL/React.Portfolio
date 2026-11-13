import { expect, test } from '@playwright/test'
import { setLang, watchProblems } from './helpers'

test.beforeEach(async ({ page }) => {
  await setLang(page, 'en')
})

test('intro Express button switches to the express page', async ({ page }) => {
  const problems = watchProblems(page)
  await page.goto('/')
  await page.getByRole('dialog').getByRole('button', { name: 'Express version' }).click()
  await expect(page).toHaveURL(/\/express$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(problems).toEqual([])
})

test('/express renders four sections, no canvas, and passes basic a11y', async ({ page }) => {
  const problems = watchProblems(page)
  await page.goto('/express')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)

  for (const id of ['about', 'projects', 'skills', 'contact']) {
    await expect(page.locator(`section#express-${id}`)).toBeVisible()
    await expect(page.locator(`section#express-${id} h2`)).toHaveCount(1)
  }

  const levels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => Number(h.tagName[1])),
  )
  expect(levels.filter((l) => l === 1)).toHaveLength(1)
  expect(levels[0]).toBe(1)
  for (let i = 1; i < levels.length; i++) expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1)

  // Skip link: first Tab stop, visible when focused, targets main.
  await page.keyboard.press('Tab')
  const skip = page.locator(':focus')
  await expect(skip).toHaveAttribute('href', '#express-main')
  await expect(skip).toBeVisible()
  await expect(page.locator('main#express-main')).toHaveCount(1)

  // Images are lazy: force them to load, then require a non-empty alt on each.
  await page.evaluate(() => document.querySelectorAll('img').forEach((i) => (i.loading = 'eager')))
  expect(await page.locator('img').count()).toBeGreaterThan(0)
  const missingAlt = await page.evaluate(() =>
    Array.from(document.images)
      .filter((i) => !i.getAttribute('alt')?.trim())
      .map((i) => i.src),
  )
  expect(missingAlt).toEqual([])

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  expect(problems).toEqual([])
})
