---
name: blender-asset-pipeline
description: Modeling stylized low-poly "neon diorama" assets in Blender through the Blender MCP, baking their lighting, and exporting them as optimized GLB for this React Three Fiber portfolio. Use when creating, editing, baking or exporting any 3D object (car, island, landmarks, props) for the site.
---

# Blender → GLB pipeline (neon diorama)

Read `diorama-art-direction` first for the look. This skill covers *how* to build and ship.

## 0. Session start
1. `get_addon_status` once, then `get_scene_info`.
2. One source file per asset family: `art/blender/<asset>.blend` (absolute repo path). Save often (`bpy.ops.wm.save_as_mainfile`).
3. Units: 1 Blender unit = 1 three.js unit. Scale reference: the car GLB is 1.6 long and is displayed ×1.5 in game (≈ 2.4 units). For landmarks, read the footprint of the matching procedural placeholder in `src/components/3d/Landmarks.tsx` and model at that in-game size (scale 1:1). Never rely on node transforms after export: meshopt quantization adds its own. Origin at ground-contact center, object resting at Z=0, scale and rotation applied.
4. Shader nodes: find them by type (`n.type == "BSDF_PRINCIPLED"`), never by name. Never hardcode enum identifiers; read them from `bl_rna`.

## 1. Modeling (stylized low-poly)
- Chunky silhouettes, slightly exaggerated proportions, **soft bevels** on every visible edge (Bevel modifier, 1–2 segments) so baked light catches them. Flat-shaded facets are fine where intentional; avoid noisy triangulation.
- Separate objects only when they move or need a different material (wheels, steering parts, screens, LEDs). Static scenery → join.
- **Light lines** are separate thin geometry (strips/trims, ≥ 0.02 thick) with a dedicated emissive material named `emit-cyan`, `emit-orange` or `emit-cyan-dim`. The web code swaps these by material name.
- Screens (arcade cabinets, terminal) get a separate material named `screen-<slug>` with a clean 0–1 UV quad, so the web can map a screenshot texture.

## 2. Materials and baking (the look comes from here)
- Base surfaces use palette colors from the art direction (`--matter-*`), matte (roughness 0.8–1, metallic 0). Slight value variation between parts, no texture noise.
- **Bake** combined light (or diffuse color + AO) of static scenery into one atlas per asset family: Cycles, 128–256 samples, denoise, margin 8 px. Lighting setup for baking: dim cool moon key from above-left + a faint fill + the emissive strips actually lighting their surroundings (that cyan/orange spill on dark matter is the signature).
- Export baked objects with a simple material carrying only the baked texture (web uses `MeshBasicMaterial`). Dynamic objects (car body, skill blocks) keep a plain Principled material with base color (+ baked AO in their texture if useful).
- Atlas sizes: island/terrain 2048, landmark families 1024–2048, car 1024, props 512.

## 3. Budgets (hard limits; the reviewer rejects above these)
| Asset | Triangles | Materials | GLB after compression |
|---|---|---|---|
| Car | ≤ 15k | ≤ 4 (+ emissives) | ≤ 600 KB |
| Island + circuit | ≤ 40k | ≤ 2 (+ emissives) | ≤ 2 MB |
| Landmark (each) | ≤ 10k | ≤ 2 (+ emissives, screens) | ≤ 600 KB |
| Prop / skill block | ≤ 1k | 1 | ≤ 100 KB |
| Whole scene first load | ≤ 150k | — | ≤ 6 MB |

## 4. Export
- `bpy.ops.export_scene.gltf(filepath=..., export_format="GLB", export_yup=True, export_apply=True, export_texcoords=True, export_normals=True, export_materials="EXPORT", export_cameras=False, export_lights=False, use_selection=True)`; read valid enum values from the operator RNA if a call fails.
- Raw export → `art/export/<asset>.glb` (gitignored). Then from repo root:
  `npx gltf-transform optimize art/export/<asset>.glb public/models/<asset>.glb --compress meshopt --texture-compress webp --join-named false` (`--join-named false` is mandatory: without it, named nodes such as wheels are merged away)
  and `npx gltf-transform inspect public/models/<asset>.glb` (put tri count and size in the report).
- Naming: kebab-case files (`car.glb`, `island.glb`, `arcade-cabinet.glb`), meaningful node names (`wheel-fl`, `screen-pvpedia`, `block-react`) because code targets them.

## 5. Verification before handing off
1. `look` from the game's camera angle (high 3/4) and one close-up, `max_size` ≤ 768.
2. Run the art-direction checklist on what you see; fix before exporting.
3. Report: paths, triangles, materials (names), atlas sizes, GLB size, node names, open issues.

## 6. Sourcing
Poly Haven is allowed by Tommy only if truly needed (this style rarely needs it). `generate_3d` never without explicit orchestrator approval (may cost credits). Record any third-party asset in `docs/ASSET_LICENSES.md`.
