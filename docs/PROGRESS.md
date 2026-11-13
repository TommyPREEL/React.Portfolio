# PROGRESS — Portfolio 3D

État au 2026-11-12. Garder ce fichier ≤ 60 lignes. Branche : `feat/neon-diorama` (**rien de commité**, attendre l'accord de Tommy).

## Fait
- Organisation multi-agents (`CLAUDE.md`, `.claude/agents/`, `.claude/skills/` + skills maison `diorama-art-direction`, `blender-asset-pipeline`).
- DA « diorama néon » validée le 2026-11-11 (skill `diorama-art-direction`).
- Socle qualité : Vitest (59 tests : physique, triggers, carte, i18n, routes, langue…), Playwright (24 e2e desktop + mobile, captures `test-results/visual/`), CI `verify` (lint + typecheck + tests) avant déploiement, Node 22.
- Perf : pose voiture dans un store zustand (plus de setState par frame), UI à 8 Hz, 3D en chunk séparé (`GameCanvas` lazy), mémoire GPU libérée.
- Scène : île de nuit 130×90, circuit, grille locale autour de la voiture, traînée lumineuse, bloom sélectif, paliers de qualité, landmarks procéduraux, blocs de compétences poussables, écrans d'arcade avec captures.
- UI refaite : tokens, Chakra Petch + IBM Plex Sans, icônes SVG maison, zéro emoji, panneaux « terminal », loader, prompt d'interaction, version express `/express`, liens directs `/projects/<id>`, langue détectée + mémorisée, toggle son (moteur son à faire), garde-fou WebGL → express.
- Textes EN/FR réécrits (copywriter). Captures des 7 projets web dans `public/projects/`.
- Blender intégré (tous < budgets) : voiture (4,4k tris), borne d'arcade ×7 (instanciée), baie serveur, antenne (`landmarks-a.blend`), garage, hangar + avion, maquette de l'île (`landmarks-b.blend`). Scène au spawn : ~40 draw calls, ~28k tris.
- 2026-11-12 : gate complète verte (typecheck, lint, 59 Vitest, build, 24/24 Playwright).

## À faire
Moteur son (synthé moteur, clics) · enseigne du garage peu lisible depuis le spawn · minimap desktop (vide sous les icônes) · réduire le chunk principal (three importé par `useCarPosition`) · blocs de compétences en Blender (optionnel) · réponses de Tommy aux questions du copywriter · **commit sur confirmation de Tommy**.

## Pièges
- Push sur `master` = déploiement en production.
- Le CLAUDE.md du Bureau (AnimeMasters) ne s'applique pas ici. `src/i18n.ts` est en CRLF.
- npm 11 bloque le postinstall d'esbuild (build OK quand même).
- Port 5173 souvent pris par MangaSensei : `E2E_PORT=5199 npm run e2e`.
- Blender : ne jamais fermer un fichier d'un autre projet sans l'accord de Tommy. Un seul agent Blender à la fois.
- gltf-transform optimize : toujours `--join-named false` (sinon les nœuds nommés sont fusionnés) ; meshopt ajoute ses propres transforms de nœuds → mettre l'échelle sur un groupe parent.
- Les sous-agents peuvent recevoir une version en cache des skills : leur faire lire les fichiers SKILL.md dans le brief.
- Ne jamais lancer deux Vitest en même temps (crash « reading 'config' ») ; e2e lents sous charge (rendu logiciel) : timeout 60 s, 2 workers, 1 retry.
- En headless Chromium, le toast d'accélération matérielle s'affiche et capte le premier Échap (comportement voulu, helper `startDriving` dans les e2e).
