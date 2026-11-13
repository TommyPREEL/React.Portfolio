import { expect, type Page } from '@playwright/test'

type GameProbe = {
  getState: () => { requestTeleport: (x: number, z: number) => void; activeTriggerId: string | null }
}

/** Collects console errors, page errors and WebGL context loss for a page. */
export function watchProblems(page: Page): string[] {
  const problems: string[] = []
  page.on('console', (msg) => {
    const text = msg.text()
    if (msg.type() === 'error' || /context lost/i.test(text)) problems.push(`console.${msg.type()}: ${text}`)
  })
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`))
  return problems
}

export async function expectNoContextLoss(page: Page): Promise<void> {
  const lost = await page.evaluate(() => {
    const c = document.querySelector('canvas')
    if (!c) return false
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null
    return gl ? gl.isContextLost() : false
  })
  expect(lost).toBe(false)
}

/** Forces the UI language before the app boots. */
export async function setLang(page: Page, lang: 'en' | 'fr'): Promise<void> {
  await page.addInitScript((l) => localStorage.setItem('portfolio.lang', l), lang)
}

/** Loads a world route and waits until the 3D scene is up (dev probe exposed). */
export async function gotoWorld(page: Page, path = '/'): Promise<void> {
  await page.goto(path)
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 60_000 })
  await page.waitForFunction(() => !!(window as unknown as { __game?: unknown }).__game, null, { timeout: 60_000 })
}

export async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate(
    ([px, pz]) => (window as unknown as { __game: GameProbe }).__game.getState().requestTeleport(px!, pz!),
    [x, z],
  )
}

export async function waitForTrigger(page: Page, id: string): Promise<void> {
  await page.waitForFunction(
    (want) => (window as unknown as { __game: GameProbe }).__game.getState().activeTriggerId === want,
    id,
    { timeout: 30_000 },
  )
}

/**
 * Closes the intro and dismisses the hardware-acceleration toast (always shown in headless software GL).
 * While that toast is up, the first Escape dismisses it instead of opening the menu.
 */
export async function startDriving(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Start driving' }).click()
  const toast = page.getByRole('status').filter({ has: page.getByRole('button', { name: 'Got it, continue' }) })
  await expect(toast).toBeVisible()
  await toast.getByRole('button', { name: 'Got it, continue' }).click()
  await expect(toast).toHaveCount(0)
}
