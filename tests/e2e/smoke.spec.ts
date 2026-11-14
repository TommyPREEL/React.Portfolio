import { expect, test } from '@playwright/test'

test('loads, renders a canvas, no console errors or WebGL context loss', async ({ page }) => {
  const problems: string[] = []
  page.on('console', (msg) => {
    const text = msg.text()
    if (msg.type() === 'error' || /context lost/i.test(text)) problems.push(`console.${msg.type()}: ${text}`)
  })
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`))

  await page.goto('/')
  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box?.width).toBeGreaterThan(100)
  expect(box?.height).toBeGreaterThan(100)

  // Escape must not throw, whatever the current UI state.
  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
  await expect(canvas).toBeVisible()

  const lost = await page.evaluate(() => {
    const c = document.querySelector('canvas')
    const gl = (c?.getContext('webgl2') ?? c?.getContext('webgl')) as WebGLRenderingContext | null
    return gl ? gl.isContextLost() : false
  })
  expect(lost).toBe(false)
  expect(problems).toEqual([])
})
