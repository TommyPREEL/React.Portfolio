import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'
const only = process.argv[2]
const sites = {
  'manga-sensei': 'https://manga-sensei.tommy-tech.fr',
  minigames: 'https://minigames.tommy-tech.fr',
  pvpedia: 'https://pvpedia.tommy-tech.fr',
  blitzquiz: 'https://blitzquiz.tommy-tech.fr',
  blindtest: 'https://blindtest.tommy-tech.fr',
  'scrum-poker': 'https://scrum-poker.tommy-tech.fr',
  'reflex-game': 'https://reflex-game.tommy-tech.fr',
}
const out = fileURLToPath(new URL('../public/projects/', import.meta.url))
const browser = await chromium.launch()
for (const [id, url] of Object.entries(sites)) {
  if (only && id !== only) continue
  for (const [w, h, suffix] of [[1280, 800, ''], [640, 400, '-640']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    try {
      let res, delay = 1500
      try {
        res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      } catch (e) {
        // Fallback for sites that never go network-idle (websockets/polling)
        if (!/Timeout/.test(e.message)) throw e
        res = await page.goto(url, { waitUntil: 'load', timeout: 30000 })
        delay = 2500
      }
      if (!res || res.status() >= 400) throw new Error('HTTP ' + res?.status())
      await page.waitForTimeout(delay)
      await page.screenshot({ path: `${out}${id}${suffix}.jpg`, type: 'jpeg', quality: 80 })
      console.log('ok', id + suffix)
    } catch (e) {
      console.log('FAIL', id + suffix, e.message.split('\n')[0])
    }
    await ctx.close()
  }
}
await browser.close()
