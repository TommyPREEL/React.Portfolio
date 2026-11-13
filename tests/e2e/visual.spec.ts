import { test } from '@playwright/test'
import { gotoWorld, setLang, teleport, waitForTrigger } from './helpers'

// Screenshot capture for manual art-direction review: test-results/visual/<project>-<name>.png
test('capture visual states', async ({ page }, info) => {
  test.setTimeout(180_000)
  await setLang(page, 'en')
  const p = info.project.name
  const shot = (name: string) => page.screenshot({ path: `test-results/visual/${p}-${name}.png` })

  await gotoWorld(page)
  await page.getByRole('dialog').waitFor()
  await page.waitForTimeout(1500) // visual only: let the loader fade out
  await shot('1-intro')

  await page.getByRole('button', { name: 'Start driving' }).click()
  await page.waitForTimeout(1500)
  await shot('2-world')

  await teleport(page, -6, -5.9)
  await waitForTrigger(page, 'arcade-pvpedia')
  await page.waitForTimeout(800)
  await shot('3-prompt-arcade')

  await page.locator('button', { hasText: /Open|Tap to open/ }).last().click() // click, not Enter: see Enter bug in world.spec
  await page.getByRole('dialog').waitFor()
  await page.waitForTimeout(1200)
  await shot('4-projects-panel')
  await page.keyboard.press('Escape') // closes the panel
  await page.getByRole('dialog').waitFor({ state: 'detached' })

  // The software-GL toast is still up (kept for the screenshots above); it eats the next Escape.
  await page.getByRole('button', { name: 'Got it, continue' }).click()
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor()
  await shot('5-escape-home')
  await page.getByRole('tab', { name: 'Settings' }).click()
  await shot('5b-escape-settings')
  await page.getByRole('tab', { name: 'Map' }).click()
  await shot('5c-escape-map')

  await page.goto('/express')
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(500)
  await shot('6-express')
  await page.screenshot({ path: `test-results/visual/${p}-6b-express-full.png`, fullPage: true })
})
