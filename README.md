# Tommy PREEL — 3D Interactive Portfolio

A **3D interactive portfolio** where visitors drive a car through a virtual world to discover different sections (About, Projects, Skills, Contact). Built with React, Three.js, and TypeScript.

**Live at [tommy-tech.fr](https://tommy-tech.fr)**

## Features

- **3D navigation** — drive a car using keyboard controls (WASD / ZQSD) to explore the world
- **Interactive zones** — enter zones and press Enter to view section content
- **Bilingual** — full English & French support with seamless switching
- **Escape menu** — tabs for Home, Controls, Settings, and Map with zone teleportation
- **Minimap** — real-time car position and clickable zone shortcuts
- **CV link** — view or download the CV directly from the portfolio

## Tech Stack

- **React 19** + **TypeScript** — UI & type safety
- **Three.js** via `@react-three/fiber` & `drei` — 3D rendering and scene management
- **Vite** — fast build tooling
- **Docker + Nginx** — containerised production deployment
- **GitHub Actions** — CI/CD pipeline

## Getting Started

```bash
npm install
npm run dev
```

## Production Deployment

The app is containerised with a multi-stage Docker build (Node builder → Nginx Alpine):

```bash
docker compose up -d
```

The container exposes port `3200` and serves the built SPA through Nginx.

## Project Structure

```
src/
  App.tsx            — main app component, state management, 3D canvas
  i18n.ts            — all translatable content (EN/FR)
  App.css            — global styles, dark theme, content panel
  components/
    ContentPanel.tsx  — renders About / Projects / Skills / Contact
    3d/               — Three.js components (Car, World, Zone, ThreeDUI)
    ui/               — UI overlays (IntroModal, EscapeMenu, Minimap, SettingsPanel)
  config/             — zone positions and world settings
  hooks/              — keyboard controls
  types/              — global type declarations
```
