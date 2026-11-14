# Asset licenses — sounds

All files in `public/sounds/` are third-party assets, trimmed and loudness-normalised for the portfolio.
CC0 assets need no attribution (credited anyway); the one CC-BY 3.0 asset is credited in the site footer
(express version, i18n key `ui.express.soundCredits`).

## Sources

| Pack | Author | License | Link |
|---|---|---|---|
| Sci-Fi Sounds | Kenney | CC0 | https://kenney.nl/assets/sci-fi-sounds |
| Interface Sounds | Kenney | CC0 | https://kenney.nl/assets/interface-sounds |
| 63 Digital sound effects | Kenney (OpenGameArt) | CC0 | https://opengameart.org/content/63-digital-sound-effects-lasers-phasers-space-etc |
| 512 Sound Effects (8-bit style) | Juhani Junkala | CC0 | https://opengameart.org/content/512-sound-effects-8-bit-style |
| 5 Chiptunes (Action) | Juhani Junkala | CC0 | https://opengameart.org/content/5-chiptunes-action |
| Space City | MintoDog | CC0 | https://opengameart.org/content/space-city |
| Jet Engine Takeoff | dklon | **CC-BY 3.0** (attribution required) | https://opengameart.org/content/jet-engine-takeoff |

## File map

| File | Use in the game | Source |
|---|---|---|
| `theme.mp3` | Main theme (loop) | MintoDog — Space City |
| `arcade.mp3` | Arcade cabinets ambience (loop) | Juhani Junkala — 5 Chiptunes (Action), "level1" |
| `engine.mp3` | Car engine loop | Kenney — Sci-Fi Sounds, `spaceEngineLow_000` |
| `server-hum.mp3` | Server rack hum (loop) | Kenney — Sci-Fi Sounds, `computerNoise_000` |
| `boost.mp3` | Boost thruster | Kenney — Sci-Fi Sounds, `thrusterFire_000` |
| `plane.mp3` | Jet take-off at the hangar | dklon — Jet Engine Takeoff, `engine_takeoff` (CC-BY 3.0) |
| `block-hit.mp3` | Car knocks a skill block | Kenney — Sci-Fi Sounds, `impactMetal_000` |
| `ui-click.mp3` | HUD buttons | Kenney — Interface Sounds, `click_002` |
| `ui-open.mp3` | Panel / menu opens | Kenney — Interface Sounds, `maximize_006` |
| `ui-close.mp3` | Panel / menu closes | Kenney — Interface Sounds, `minimize_006` |
| `ui-toggle.mp3` | Sound switched on | Kenney — Interface Sounds, `switch_002` |
| `server-bleep-1.mp3` | Server rack random bleeps | Juhani Junkala — 512 Sound Effects, `sfx_sounds_Blip4` |
| `server-bleep-2.mp3` | Server rack random bleeps | Juhani Junkala — 512 Sound Effects, `sfx_sounds_Blip7` |
| `server-bleep-3.mp3` | Server rack random bleeps | Kenney — 63 Digital sound effects, `twoTone1` |
| `arcade-coin.mp3` | Arcade random coin | Juhani Junkala — 512 Sound Effects, `sfx_coin_double1` |
| `arcade-powerup.mp3` | Arcade random power-up | Juhani Junkala — 512 Sound Effects, `sfx_sounds_powerup3` |
| `antenna-ping.mp3` | Antenna ping | Kenney — 63 Digital sound effects, `threeTone1` |

Processing: ffmpeg (mp3; loops and music loudness-normalised, one-shots trimmed, faded out and
peak-normalised to -3 dBFS). Only `plane.mp3` carries an attribution requirement.
