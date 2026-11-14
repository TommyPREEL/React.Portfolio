# CLAUDE.md — Portfolio 3D de Tommy PREEL

Portfolio interactif en 3D (tommy-tech.fr) : le visiteur conduit une voiture et entre dans 4 zones (About, Projects, Skills, Contact). Objectif en cours : refonte complète de la DA en « diorama néon » (île-jouet low-poly de nuit, lumière précalculée, filets lumineux façon Tron ; voir le skill `diorama-art-direction`), assets modélisés dans Blender.

> Le fichier `c:\Users\tommy\Desktop\CLAUDE.md` (projet AnimeMasters : pnpm, NestJS, spec, MangaCoins…) est chargé car il est dans un dossier parent. **Il ne s'applique pas à ce dépôt.** Ici, seul ce fichier fait foi.

## 1. Stack et commandes
- React 19, TypeScript 5.9 strict, Vite 7, three r182, @react-three/fiber 9, @react-three/drei 10. Gestionnaire : **npm**.
- `npm run dev` · `npm run build` (= `tsc -b` + build) · `npm run lint` · `npm run typecheck` · `npm test` (Vitest, jamais deux en parallèle) · `npm run e2e` (Playwright ; port 5173 souvent pris → `E2E_PORT=5199 npm run e2e`).
- Autres : zustand (store du jeu), @react-three/postprocessing, @fontsource (Chakra Petch, IBM Plex Sans), @gltf-transform/cli (optimisation GLB).
- Déploiement : **tout push sur `master` part en production** (GitHub Actions → image GHCR `:latest` → SSH → docker compose, port 3200, Nginx). Toujours travailler sur une branche ; merge sur master seulement avec l'accord de Tommy.

## 2. Carte du code (pour ne pas ré-explorer)
| Fichier | Rôle |
|---|---|
| `src/App.tsx` | Shell : routes (`/`, `/classic`, `/<section>`, `/projects/<id>`), langue, overlays, `GameCanvas` chargé en lazy + `CanvasErrorBoundary` (échec WebGL → version classique) |
| `src/lib/` | Logique pure testée : physique voiture, collisions, triggers, carte, routes, langue, blocs, ruban/traînée, props |
| `src/store/gameStore.ts` | zustand : `pose` mutable (lue via `getState()`, jamais abonnée), trigger actif, qualité, téléport |
| `src/config/index.ts` · `world.ts` | `CONFIG` (monde 130×90, physique en u/s, palette), `ZONES`, `ASSETS` (chemins GLB) · île, circuit, `INTERACTABLES`, colliders, blocs |
| `src/components/3d/` | `GameCanvas` (Canvas mémoïsé), `Scene`, `Ground`, `Landmarks` + `LandmarkModels` (GLB avec repli procédural), `SkillBlocks`, `CarModel`, `LightTrail`, `CameraRig`, `materials.ts` (émissifs partagés) |
| `src/components/ui/` | Overlays CSS Modules + tokens `src/index.css` : IntroModal, EscapeMenu, Minimap, MobileControls, HWAccelWarning (toast), SettingsPanel (+ SoundToggle), LoadingScreen, InteractionPrompt, ExpressView, ProjectCard, `icons.tsx`, `useDialog` |
| `src/i18n.ts` (CRLF) | Tout le texte EN/FR ; `id` stable par projet |
| `art/blender/` · `public/models/` | Sources .blend + scripts de construction · GLB optimisés (meshopt, WebP) |
| `tests/e2e/` · `scripts/` | Playwright (helper `startDriving`) · capture des écrans de projets |

Son : `src/audio/` (AudioEngine Web Audio, bus, `useSoundSystem`), maths pures `src/lib/audioMix.ts`, fichiers `public/sounds/` (licences : `docs/ASSET_LICENSES.md`, ffmpeg installé via winget). Réglages à l'oreille dans `src/audio/manifest.ts`.
Dette connue : chunk principal 182 Ko gzip (three importé par `useCarPosition`), Docker `nginx:alpine` et tag `:latest` non figés.

## 3. Organisation : orchestrateur + sous-agents
**La session principale est l'orchestrateur.** (Dans Claude Code, un sous-agent ne peut pas lancer d'autres sous-agents : le chef doit donc être la session principale.) Il :
1. lit `docs/PROGRESS.md`, découpe la demande en tâches, annonce le plan en ≤ 5 lignes ;
2. délègue chaque tâche à l'agent compétent avec un brief autonome (objectif, fichiers, contraintes, critère de fin) — l'agent ne voit pas la conversation ;
3. vérifie lui-même chaque livraison (relit le diff, lance build/tests) avant d'accepter ;
4. fait lui-même les petites tâches (< ~20 lignes, une seule zone) : déléguer coûte plus cher que faire ;
5. met à jour `docs/PROGRESS.md` et répond à Tommy.

| Agent (`.claude/agents/`) | Modèle | Périmètre | Skills préchargés |
|---|---|---|---|
| `3d-artist` | fable | Blender via MCP, `art/`, `public/models/` | diorama-art-direction, blender-asset-pipeline, threejs-asset-pipeline, threejs-materials |
| `scene-integrator` | sonnet | `src/components/3d`, Canvas, perf, physique | diorama-art-direction, threejs-react-three-fiber, -loaders, -lighting, -postprocessing, -performance, test-driven-development |
| `ui-designer` | sonnet | `src/components/ui`, ContentPanel, CSS, icônes SVG | diorama-art-direction, frontend-design |
| `qa-tester` | sonnet | Vitest, Playwright, captures, bugs | test-driven-development, webapp-testing, systematic-debugging, verification-before-completion |
| `reviewer` | sonnet (lecture seule) | Revue du diff avant commit | verification-before-completion, diorama-art-direction |
| `copywriter` | sonnet | Textes `i18n.ts`, README | humanizer |

Skills utilisables directement par l'orchestrateur : `/code-review`, `/simplify`, `/security-review` (fin de tâche sensible), `skill-finder` (chercher un skill manquant ; son script Python est à lancer manuellement par Tommy ou après autorisation), `game-studio` (méthode de pilotage créatif), `threejs-textures`.

Enchaînements types :
- **Nouvel objet 3D** : 3d-artist (modèle + GLB) → scene-integrator (intégration + mesures) → qa-tester (e2e + captures) → reviewer.
- **Changement d'UI** : ui-designer → copywriter si texte → qa-tester (390 px et 1440 px) → reviewer.
- **Bug** : qa-tester reproduit avec un test → agent du périmètre corrige → qa-tester revalide.
Lancer en parallèle les agents indépendants (ex. 3d-artist sur un asset pendant que ui-designer refait le menu). Deux agents ne modifient jamais le même fichier en même temps.

## 4. Économie de tokens
- Lire `docs/PROGRESS.md` (≤ 60 lignes) au lieu de ré-explorer ; ce fichier-ci contient déjà la carte du code.
- `grep`/`Glob` avant `Read` ; lire des plages de lignes, pas des fichiers entiers ; ne pas relire un fichier déjà lu.
- Diffs ciblés, pas de reformatage, rien hors périmètre.
- Briefs d'agents courts et précis ; rapports d'agents ≤ 12 lignes, sans code collé.
- `look` Blender avec `max_size` ≤ 768 ; captures Playwright enregistrées sur disque, décrites plutôt que collées.
- Modèle adapté : fable seulement pour la modélisation 3D (qualité visuelle), sonnet ailleurs ; Explore pour les recherches larges.

## 5. Règles de qualité (non négociables)
1. Rien de lourd dans `useFrame` : pas de `setState`, pas d'allocation (`new Vector3`) par frame.
2. Logique de jeu (physique, détection de zone, projection minimap) en fonctions pures dans `src/lib/`, testées par Vitest.
3. Tout texte visible passe par `src/i18n.ts`, en EN **et** FR.
4. Budgets 3D et paliers de qualité : voir le skill `diorama-art-direction` et `blender-asset-pipeline`. Un dépassement bloque la livraison.
5. Accessibilité : focus visible, contraste AA, `prefers-reduced-motion`, cibles tactiles ≥ 44 px, Escape ferme les modales.
6. Pas d'emojis comme icônes, pas de look « IA » (dégradés violets, néon partout, glassmorphism gratuit).
7. Aucun secret ni donnée perso ajoutés au dépôt. Les liens externes ont `rel="noopener noreferrer"`.
8. **Jamais de commit ni de push sans la confirmation explicite de Tommy**, à chaque fois (une confirmation ne vaut que pour l'opération demandée). Préparer le message, montrer le diff résumé, attendre son « ok ». Format : Conventional Commits (`feat(3d): ...`), petits, une branche par fonctionnalité. Aucun sous-agent ne commite.

## 6. Définition de terminé
- [ ] `npm run lint` et `npm run build` passent ; tests au vert (quand en place), dont un test pour tout bug corrigé
- [ ] Vérifié dans le navigateur (qa-tester) en desktop et mobile pour tout changement visible
- [ ] `reviewer` : aucun point bloquant
- [ ] Budgets 3D respectés, chiffres dans le rapport
- [ ] `docs/PROGRESS.md` mis à jour (≤ 10 lignes)
- [ ] Réponse finale à Tommy : 3 à 6 lignes (ce qui a changé, tests et résultat, question ouverte)

## 7. Feuille de route
- **T1 — Socle qualité** : scripts `typecheck`/`test`/`e2e`, Vitest + Playwright, extraction des fonctions pures, étape lint+tests dans la CI avant le déploiement.
- **T2 — Perf** : sortir la position voiture du state React (ref/store), minimap throttlée.
- **T3 — DA diorama néon** : scène de nuit, grille, traînée lumineuse, bloom sélectif, paliers de qualité.
- **T4 — Voiture** puis **T5 — île + circuit** puis **T6 — landmarks** (garage, bornes d'arcade, avion, baie serveur, maquette, blocs de compétences, antenne).
- **T7 — UI** redessinée (tokens, icônes SVG, suppression des emojis) + textes humanisés.
