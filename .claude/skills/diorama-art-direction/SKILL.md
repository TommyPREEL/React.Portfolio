---
name: diorama-art-direction
description: Visual bible for the portfolio's "neon diorama" look - a stylized low-poly toy island at night with disciplined Tron-like light lines. World layout, zones, palette, lighting, materials, camera, UI, typography, sound and the anti-"AI look" rules. Use before designing, building or reviewing anything visible (3D asset, scene, post-processing, UI overlay, icon, text tone).
---

# Art direction: neon diorama

Validated by Tommy on 2026-11-11. Inspiration: the *kind* of experience Bruno Simon's portfolio offers (toy-like low-poly diorama, baked light, playful physics, secrets). **Never copy his site**: no similar car, layout, props, colors or UI. Our identity = night + Tron-like light discipline + Tommy's own projects as physical objects.

## Principles
1. **Dark and matte, light only on lines.** Surfaces are low-poly, matte, dark. Light lives on edges, trims, grid lines, screens and the car's trail.
2. **Two light colors, never more.** Cyan = the player and anything interactive. Orange = the active/important thing. Everything else is neutral.
3. **Toy scale, real feel.** Chunky soft-bevelled shapes, slightly exaggerated proportions, weighty physics.
4. **Every object says something about Tommy.** No random decoration.

## Palette (CSS tokens and three.js constants share these names)
| Token | Hex | Use |
|---|---|---|
| `--night` | `#07090C` | sky, void, page background |
| `--matter-900` | `#0E1217` | deepest surfaces, shadows |
| `--matter-800` | `#141920` | ground, panels |
| `--matter-700` | `#1B2129` | objects, raised panels |
| `--matter-600` | `#222A33` | highlights on matter, borders |
| `--line` | `#2E3843` | hairlines, inactive strokes |
| `--cyan` | `#4DE8FF` | player light, interactive, focus ring |
| `--cyan-dim` | `#1A6C7A` | inactive light lines, grid |
| `--orange` | `#FF8A1F` | active zone, primary call-to-action, alerts |
| `--text` | `#E6EDF2` | main text |
| `--text-dim` | `#8A97A3` | secondary text (AA on `--matter-800`) |
No other hue. No gradients except light falloff (glow) and the sky's subtle vertical fade `--night` → `#0B1118`.

## World
An organic-shaped low-poly **island at night**, floating in the dark void, with a **loop circuit** and free terrain around it. The car spawns in front of the garage. Size ≈ 2–3× the current 80×30 world, readable from the chase camera.

| Zone | Physical landmark |
|---|---|
| About | **Garage / start hangar**: where the car spawns. Open door, workbench, a lit sign with Tommy's name. |
| Projects | **Arcade row**: one cabinet per web game (MiniGames, PvPedia, BlitzQuiz, Blindtest, Reflex Game, Scrum Poker, MangaSensei); each screen shows the project screenshot. Plus: **low-poly plane in a small hangar** (Airbus apps), **server rack** with blinking LEDs (self-hosted server), **miniature of the island** on a pedestal (this portfolio). Driving into an object opens that project. |
| Skills | **Light blocks** that the car can knock over, one block per technology, grouped by category on platforms. |
| Contact | **Radar antenna** emitting pulse rings, next to a small terminal. |
Secrets: a ramp/jump, a low-poly plane crossing the sky now and then (Toulouse nod), an achievement when every skill block has fallen.

## Lighting and rendering
- **Baked lighting** is the core of the look: AO and soft light baked in Blender into a color atlas; runtime uses unlit or matcap-like materials (`MeshBasicMaterial` with baked map) for static scenery.
- Dynamic objects (car, skill blocks) use simple lit materials + one directional "moon" light + fake blob shadows (a soft dark decal under the object), not shadow maps.
- **Emissive light lines** (separate emissive material, color `--cyan`/`--orange`/`--cyan-dim`) + **selective bloom** (high luminance threshold so only emissives glow).
- Ground: subtle grid of `--cyan-dim` lines, brightening in a radius around the car.
- Car: a **light trail** ribbon behind it (cyan, fades over ~1.5 s), stronger when boosting.
- Tone mapping: AgX or ACES, sRGB output. Fog: `--night`, starts far enough to keep the island readable.

## Camera
High 3/4 chase view (diorama feel), fov 35–40, slight lag and look-ahead in the driving direction; zooms slightly out at speed. Reduced motion: no camera shake, no roll.

## UI: "dashboard terminal"
- Panels: near-opaque `--matter-800` (95 %), 1 px `--line` border, **cut corners** (clip-path, 8–12 px), no blur blobs, no drop-shadow soup. A thin `--cyan` accent line marks the focused/active panel.
- Typography (2 families max): **Chakra Petch** (600) for titles, labels, HUD (uppercase allowed, letter-spacing 0.06em); **IBM Plex Sans** (400/500) for body text. Self-hosted via @fontsource.
- Icons: in-house SVGs, 1.5 px stroke, square caps, 24 px grid, `currentColor`. **Zero emojis anywhere**, including i18n strings. No raw icon packs.
- Buttons: primary = `--orange` outline or fill with dark text; secondary = `--line` outline; focus ring = 2 px `--cyan` offset 2 px.
- Motion: 150–250 ms, ease-out; only `transform`/`opacity`. Text "boot" reveal allowed on panel open, disabled with reduced motion.
- Content panel = terminal readout: project screenshot, short pitch, role, stack chips, links. Always 2D (readability, accessibility).
- **Express mode**: a fast, fully accessible 2D page with all content, same tokens, reachable from the intro and from a permanent HUD link.

## Sound
Synth engine hum (pitch follows speed), soft UI ticks, block impacts. **Muted by default**, a visible toggle, preference remembered.

## Banned ("AI look" and copy risks)
Blue→purple gradients, Tailwind default palette, glassmorphism, glow on everything, emojis, more than 2 light colors, Orbitron, generic "Welcome to my portfolio 🚀" copy, anything recognizably taken from Bruno Simon's folio (orange toy car, his props, his typography).

## Performance (part of the look)
Budgets in `blender-asset-pipeline`. Targets: 60 fps mid-range laptop, ≥ 30 fps mid-range phone, first frame < 4 s on 4G. Quality tiers via drei `PerformanceMonitor`: high = bloom + DPR ≤ 2; low = no bloom (emissives still bright), DPR ≤ 1.5.

## Review checklist (yes/no + evidence)
1. Only `--cyan` and `--orange` emit light? No other hue anywhere?
2. Matte, dark, low-poly surfaces with soft bevels; light on lines only?
3. Every object tied to Tommy's content? Nothing that looks like Bruno Simon's site?
4. No emoji, no gradient, tokens only?
5. Within budgets, fps OK on the low tier, readable at 390 px?
