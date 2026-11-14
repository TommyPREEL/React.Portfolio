"""Build script for art/blender/landmarks-b.blend (garage, plane-hangar, island-model).
Run inside Blender: exec(open(path).read()); then build_garage() / build_hangar() / build_model(),
bake(asset), finish_model() (island-model only) and export_b(asset).
Reuses the geometry kit, bake() and helpers of landmarks_a.py (same folder).
Blender axes: X right, -Y front (= three.js +Z), Z up. Scale 1:1 game units.
Local frames match the placeholders in Landmarks.tsx: garage and hangar have their origin at the
door centre on the ground (building spans Blender y in [0, 8]); island-model is centred.
"""
import os
_HERE = r"c:\Users\tommy\Desktop\All\Projects\React.Portfolio\art\blender"
exec(open(os.path.join(_HERE, "landmarks_a.py")).read())

ASSETS = ("garage", "plane-hangar", "island-model")
BAKED = {"garage": ["garage"], "plane-hangar": ["hangar", "plane"], "island-model": ["pedestal", "miniature"]}
EXPORT_NAMES = {"garage-trim": "trim", "hangar-trim": "trim", "model-trim": "trim"}
YX = Matrix(((0, 1, 0, 0), (1, 0, 0, 0), (0, 0, 1, 0), (0, 0, 0, 1)))   # prism profile (x, z), extruded along Y


def hexa(bm, lo, hi, mat="m700", bev=0.02, edge=True, P=None):
    """Solid between two rings of points (same order)."""
    tmp = bmesh.new()
    a = [tmp.verts.new(p) for p in lo]
    b = [tmp.verts.new(p) for p in hi]
    n = len(lo)
    tmp.faces.new(a)
    tmp.faces.new(b[::-1])
    for i in range(n):
        j = (i + 1) % n
        tmp.faces.new((a[i], b[i], b[j], a[j]))
    _fin(tmp, tmp.edges[:], bev, mat, edge)
    _flush(tmp, bm, P)


def fix_normals(bm):
    """recalc_face_normals gets concave prisms (arch ribs, fins) wrong: flip every CLOSED shell
    whose signed volume is negative. Open shells (ribbons, quads) are left alone."""
    bm.faces.ensure_lookup_table()
    seen = set()
    flipped = 0
    for f0 in bm.faces:
        if f0.index in seen:
            continue
        stack, comp = [f0], []
        seen.add(f0.index)
        while stack:
            f = stack.pop()
            comp.append(f)
            for e in f.edges:
                for g in e.link_faces:
                    if g.index not in seen:
                        seen.add(g.index)
                        stack.append(g)
        if any(len(e.link_faces) != 2 for f in comp for e in f.edges):
            continue
        c0 = comp[0].verts[0].co.copy()
        vol = 0.0
        for f in comp:
            vs = [v.co - c0 for v in f.verts]
            for i in range(1, len(vs) - 1):
                vol += vs[0].dot(vs[i].cross(vs[i + 1]))
        if vol < 0:
            bmesh.ops.reverse_faces(bm, faces=comp)
            flipped += 1
    return flipped


def sign_mat():
    """Unlit `sign` material, white base colour factor + a NON-solid dark placeholder texture
    (gltf-transform prune folds solid-colour textures into the colour factor)."""
    W, H = 256, 32
    img = bpy.data.images.get("sign_placeholder")
    if img is None:
        img = bpy.data.images.new("sign_placeholder", W, H, alpha=False)
        px = np.zeros((H, W, 4), dtype=np.float32)
        px[..., 3] = 1.0
        px[..., :3] = [0x0E / 255, 0x12 / 255, 0x17 / 255]
        px[:2, :, :3] = px[-2:, :, :3] = px[:, :2, :3] = px[:, -2:, :3] = [0x2E / 255, 0x38 / 255, 0x43 / 255]
        for i in range(11):                      # faint letter-slot blocks so the texture is never solid
            x0 = 24 + i * 19
            px[10:22, x0:x0 + 13, :3] = [0x1B / 255, 0x21 / 255, 0x29 / 255]
        img.pixels.foreach_set(px.ravel())
        img.filepath_raw = os.path.join(ROOT, "art", "blender", "sign_placeholder.png")
        img.file_format = "PNG"
        img.save()
    m = bpy.data.materials.get("sign") or bpy.data.materials.new("sign")
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    nt.nodes.clear()
    tn = nt.nodes.new("ShaderNodeTexImage")
    tn.image = img
    on = nt.nodes.new("ShaderNodeOutputMaterial")
    on.location = (300, 0)
    nt.links.new(tn.outputs["Color"], on.inputs["Surface"])
    return m


# ------------------------------------------------------------------ garage
def build_garage():
    c = reset_coll("garage")
    pm = pal_mats()
    bm = bmesh.new()
    tb = bmesh.new()
    F = 0.15   # floor level
    box(bm, (11.0, 9.0, F), (0, 4, F / 2), mat="m800", bev=0.04)
    # walls
    box(bm, (9.0, 0.5, 4.0), (0, 7.75, F + 2.0), mat="m700", bev=0.04)
    for s in (-1, 1):
        box(bm, (0.5, 7.0, 4.0), (s * 4.75, 4.0, F + 2.0), mat="m700", bev=0.04)
        box(bm, (0.8, 0.7, 4.2), (s * 4.75, 0.25, F + 2.1), mat="m600", bev=0.05)      # front pilaster
        box(bm, (0.7, 0.7, 4.2), (s * 4.75, 7.75, F + 2.1), mat="m600", bev=0.05)      # rear corner
        box(bm, (0.08, 6.4, 0.3), (s * 5.02, 4.0, 1.45), mat="m600", bev=0.02)         # outer wall bands
        box(bm, (0.08, 6.4, 0.3), (s * 5.02, 4.0, 2.95), mat="m600", bev=0.02)
        box(bm, (0.62, 7.0, 0.16), (s * 4.75, 4.0, 4.23), mat="m600", bev=0.03)        # wall cap
        box(bm, (0.14, 0.2, 3.0), (s * 4.28, 0.36, F + 1.5), mat="line", bev=0.015)    # door guide rail
        box(bm, (0.08, 5.2, 0.012), (s * 1.75, 3.4, F + 0.006), mat="line", bev=0)     # painted bay lines
    box(bm, (9.0, 0.62, 0.16), (0, 7.75, 4.23), mat="m600", bev=0.03)
    box(bm, (3.6, 0.08, 0.012), (0, 5.96, F + 0.006), mat="line", bev=0)
    # door header + roller shutter (rolled up, three slats showing)
    box(bm, (8.8, 0.5, 1.0), (0, 0.25, 3.65), mat="m700", bev=0.04)
    box(bm, (8.7, 0.62, 0.62), (0, 0.80, 3.62), mat="m600", bev=0.08)
    for i in range(3):
        box(bm, (8.42, 0.07, 0.19), (0, 0.36, 3.04 - i * 0.2), mat="line" if i < 2 else "m900", bev=0.02)
    # front roof band + open rafters (interior stays visible from the chase camera)
    box(bm, (11.2, 2.3, 0.35), (0, 0.95, 4.33), mat="m600", bev=0.06)
    for y in (3.3, 4.9, 6.5):
        box(bm, (9.2, 0.22, 0.32), (0, y, 4.05), mat="m600", bev=0.03)
    box(bm, (0.2, 5.6, 0.2), (0, 4.9, 4.27), mat="line", bev=0.02)
    # sign backing on the roof band
    for s in (-1, 1):
        box(bm, (0.24, 0.24, 0.3), (s * 2.3, -0.02, 4.6), mat="m600", bev=0.02)
    box(bm, (6.3, 0.3, 1.1), (0, -0.1, 5.1), mat="m900", bev=0.05, edge="m700")
    # --- workbench (back left)
    WX, WY = -2.5, 6.95
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(bm, (0.14, 0.14, 0.86), (WX + sx * 1.36, WY + sy * 0.4, F + 0.43), mat="m600", bev=0.015)
    box(bm, (3.1, 1.05, 0.12), (WX, WY, F + 0.92), mat="m600", bev=0.03)
    box(bm, (2.7, 0.8, 0.06), (WX, WY, F + 0.3), mat="m700", bev=0.015)
    box(bm, (0.95, 0.86, 0.5), (WX + 0.95, WY - 0.02, F + 0.6), mat="m700", bev=0.02)
    for i in range(2):
        box(bm, (0.83, 0.03, 0.19), (WX + 0.95, WY - 0.46, F + 0.49 + i * 0.23), mat="m800", bev=0.01)
        box(bm, (0.3, 0.03, 0.03), (WX + 0.95, WY - 0.485, F + 0.52 + i * 0.23), mat="line", bev=0)
    T = F + 0.98   # bench top
    # vise
    box(bm, (0.3, 0.3, 0.14), (WX - 1.15, WY - 0.3, T + 0.07), mat="line", bev=0.02)
    box(bm, (0.26, 0.07, 0.16), (WX - 1.15, WY - 0.42, T + 0.2), mat="m900", bev=0.01)
    box(bm, (0.26, 0.07, 0.16), (WX - 1.15, WY - 0.24, T + 0.2), mat="m900", bev=0.01)
    cyl(bm, 0.02, 0.02, 0.4, (WX - 1.15, WY - 0.52, T + 0.1), rot=(0, radians(90), 0), mat="line", seg=5, bev=0)
    # laptop (dev at work), toolbox, can
    L = TR((WX - 0.25, WY - 0.12, T), (0, 0, radians(12)))
    box(bm, (0.56, 0.38, 0.03), (0, 0, 0.015), mat="line", bev=0.008, edge=False, P=L)
    box(bm, (0.56, 0.03, 0.36), (0, 0.235, 0.185), rot=(radians(-14), 0, 0), mat="line", bev=0.008, edge=False, P=L)
    box(bm, (0.5, 0.012, 0.3), (0, 0.213, 0.19), rot=(radians(-14), 0, 0), mat="m900", bev=0, P=L)
    box(bm, (0.44, 0.2, 0.004), (0, -0.04, 0.032), mat="m900", bev=0, P=L)
    box(bm, (0.72, 0.36, 0.3), (WX + 0.85, WY + 0.15, T + 0.15), mat="line", bev=0.03)
    box(bm, (0.74, 0.38, 0.06), (WX + 0.85, WY + 0.15, T + 0.33), mat="m700", bev=0.015)
    box(bm, (0.3, 0.05, 0.05), (WX + 0.85, WY + 0.15, T + 0.4), mat="m900", bev=0)
    cyl(bm, 0.09, 0.09, 0.24, (WX + 0.2, WY + 0.28, T + 0.12), mat="m700", bev=0.015)
    # pegboard + tools
    PY = 7.5
    box(bm, (2.9, 0.07, 1.3), (WX, PY - 0.035, 2.2), mat="m800", bev=0.02, edge="m600")
    ty = PY - 0.09
    box(bm, (0.07, 0.03, 0.62), (WX - 1.1, ty, 2.2), mat="line", bev=0)                      # wrench
    box(bm, (0.2, 0.03, 0.14), (WX - 1.1, ty, 2.56), mat="line", bev=0)
    box(bm, (0.08, 0.035, 0.07), (WX - 1.1, ty - 0.003, 2.6), mat="m800", bev=0)
    box(bm, (0.16, 0.03, 0.1), (WX - 1.1, ty, 1.87), mat="line", bev=0)
    box(bm, (0.06, 0.04, 0.6), (WX - 0.65, ty, 2.15), mat="m600", bev=0)                     # hammer
    box(bm, (0.3, 0.09, 0.12), (WX - 0.65, ty - 0.01, 2.5), mat="line", bev=0.015, edge=False)
    for i, h in enumerate((0.5, 0.42, 0.34)):                                                # screwdrivers
        x = WX - 0.2 + i * 0.16
        box(bm, (0.025, 0.025, h), (x, ty, 2.62 - h / 2 - 0.16), mat="line", bev=0)
        box(bm, (0.07, 0.05, 0.18), (x, ty, 2.55), mat="m900", bev=0)
    hexa(bm, [(WX + 0.45, ty + 0.02, 1.85), (WX + 1.2, ty + 0.02, 1.85), (WX + 1.2, ty + 0.02, 2.0), (WX + 0.45, ty + 0.02, 2.3)],
         [(WX + 0.45, ty - 0.01, 1.85), (WX + 1.2, ty - 0.01, 1.85), (WX + 1.2, ty - 0.01, 2.0), (WX + 0.45, ty - 0.01, 2.3)],
         mat="line", bev=0)                                                                  # saw blade
    box(bm, (0.2, 0.05, 0.3), (WX + 0.42, ty, 2.12), mat="m900", bev=0.01)
    for i in range(3):                                                                        # spanner set
        box(bm, (0.05, 0.03, 0.3 + i * 0.07), (WX + 0.75 + i * 0.16, ty, 2.52 - i * 0.035), mat="line", bev=0)
    # shelf with bins
    box(bm, (2.9, 0.42, 0.07), (WX, PY - 0.21, 3.05), mat="m600", bev=0.02)
    for x, w, h, m in ((-1.05, 0.5, 0.3, "m700"), (-0.45, 0.4, 0.22, "line"), (0.35, 0.6, 0.34, "m700"), (1.05, 0.36, 0.26, "m800")):
        box(bm, (w, 0.3, h), (WX + x, PY - 0.21, 3.085 + h / 2), mat=m, bev=0.02)
    box(tb, (2.5, 0.05, 0.04), (WX, PY - 0.36, 3.0), mat=None, bev=0)                        # work light under the shelf
    # --- right side: rolling tool chest, tyre stack, oil drum, spare tyre
    CX, CY = 2.2, 7.0
    box(bm, (1.2, 0.7, 0.86), (CX, CY, F + 0.57), mat="m600", bev=0.03)
    box(bm, (1.26, 0.76, 0.06), (CX, CY, F + 1.03), mat="m900", bev=0.015)
    for i in range(4):
        box(bm, (1.08, 0.03, 0.16), (CX, CY - 0.36, F + 0.26 + i * 0.2), mat="m700", bev=0.01)
        box(bm, (0.5, 0.03, 0.025), (CX, CY - 0.385, F + 0.3 + i * 0.2), mat="line", bev=0)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl(bm, 0.07, 0.07, 0.06, (CX + sx * 0.48, CY + sy * 0.25, F + 0.07), rot=(0, radians(90), 0), mat="m900", bev=0)
    for i in range(3):
        cyl(bm, 0.44, 0.44, 0.27, (3.72 + (i % 2) * 0.05, 6.9 - (i % 2) * 0.04, F + 0.135 + i * 0.27), mat="m900", seg=10, bev=0.07,
            edge="m800", spin=i * 0.2)
    cyl(bm, 0.24, 0.24, 0.02, (3.72, 6.9, F + 0.815), mat="m800", seg=10, bev=0)
    cyl(bm, 0.44, 0.44, 0.27, (4.33, 5.3, F + 0.46), rot=(0, radians(76), 0), mat="m900", seg=10, bev=0.07, edge="m800")
    cyl(bm, 0.33, 0.33, 0.92, (-4.02, 5.2, F + 0.46), mat="m700", seg=10, bev=0.03)
    for z in (0.3, 0.62):
        cyl(bm, 0.345, 0.345, 0.05, (-4.02, 5.2, F + z), mat="m600", seg=10, bev=0)
    cyl(bm, 0.07, 0.07, 0.03, (-3.9, 5.1, F + 0.93), mat="line", seg=6, bev=0)
    box(bm, (0.5, 0.5, 0.42), (-3.95, 4.2, F + 0.21), mat="m600", bev=0.025)                 # crate
    fix_normals(bm)
    garage = make("garage", bm, pm, c)

    # --- emissive trim: door frame, threshold, sign frame (work light added above)
    for s in (-1, 1):
        box(tb, (0.07, 0.07, 3.0), (s * 4.3, -0.13, F + 1.5), mat=None, bev=0)
        box(tb, (0.05, 0.04, 1.0), (s * 2.97, -0.27, 5.1), mat=None, bev=0)
        box(tb, (5.99, 0.04, 0.05), (0, -0.27, 5.1 + s * 0.475), mat=None, bev=0)
    box(tb, (8.67, 0.07, 0.07), (0, -0.03, 3.185), mat=None, bev=0)
    box(tb, (8.6, 0.1, 0.04), (0, -0.3, F + 0.015), mat=None, bev=0)
    trim = make("garage-trim", tb, [emit("emit-cyan")], c)

    # --- sign: 5.6 x 0.7 quad (8:1), UV 0-1, u = viewer's left->right, v = bottom->top
    sb = bmesh.new()
    f = quad(sb, [(-2.8, -0.262, 4.75), (2.8, -0.262, 4.75), (2.8, -0.262, 5.45), (-2.8, -0.262, 5.45)])
    uv = sb.loops.layers.uv.new("UVMap")
    for lp, co in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        lp[uv].uv = co
    sign = make("sign", sb, [sign_mat()], c)
    return garage, trim, sign


# ------------------------------------------------------------------ plane hangar
HZ0 = 0.15


def arc(rx, rz, a0=0.0, a1=pi, n=12):
    return [(rx * cos(a0 + (a1 - a0) * i / n), HZ0 + rz * sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


def ring_prof(ro, ri, a0=0.0, a1=pi, n=12):
    return arc(ro[0], ro[1], a0, a1, n) + arc(ri[0], ri[1], a0, a1, n)[::-1]


def loft(bm, secs, seg=10, spin=radians(18), top="line", belly="m600"):
    tmp = bmesh.new()
    rings = [[tmp.verts.new((r * cos(spin + 2 * pi * k / seg), y, zc + r * sin(spin + 2 * pi * k / seg))) for k in range(seg)]
             for y, r, zc in secs]
    for i in range(len(rings) - 1):
        for k in range(seg):
            k2 = (k + 1) % seg
            tmp.faces.new((rings[i][k], rings[i][k2], rings[i + 1][k2], rings[i + 1][k]))
    tmp.faces.new(rings[0])
    tmp.faces.new(rings[-1][::-1])
    bmesh.ops.recalc_face_normals(tmp, faces=tmp.faces[:])
    for f in tmp.faces:
        f.material_index = IDX[belly] if f.normal.z < -0.5 else IDX[top]
    _flush(tmp, bm)


def wing(bm, pts, s=1, mat="line", bev=0.015):
    """pts: (x, y, z, thickness) planform corners; s mirrors in X."""
    lo = [(s * x, y, z - t / 2) for x, y, z, t in pts]
    hi = [(s * x, y, z + t / 2) for x, y, z, t in pts]
    hexa(bm, lo, hi, mat=mat, bev=bev)


def build_hangar():
    c = reset_coll("plane-hangar")
    pm = pal_mats()
    bm = bmesh.new()
    tb = bmesh.new()
    RO, RI = (4.4, 4.0), (4.1, 3.7)
    SO, SI = (4.33, 3.93), (4.23, 3.83)
    box(bm, (9.6, 9.0, HZ0), (0, 4, HZ0 / 2), mat="m800", bev=0.04)
    # arched ribs (front one chunkier), open at the front so the plane reads from the chase camera
    for y0, w, m in ((0.0, 0.4, "m600"), (2.05, 0.26, "m600"), (4.05, 0.26, "m600"), (6.0, 0.26, "m600")):
        prism(bm, ring_prof(RO, RI), y0, y0 + w, m, bev=0.04, P=YX)
    # cladding over the rear part, knee walls along the open part, back wall
    prism(bm, ring_prof(SO, SI), 4.2, 7.85, "m700", bev=0, P=YX)
    KA = radians(24)
    for a0, a1 in ((KA, 0.0), (pi - KA, pi)):
        prism(bm, ring_prof(SO, SI, a0, a1, 2), 0.3, 4.2, "m700", bev=0, P=YX)
    prism(bm, arc(*RO), 7.75, 8.05, "m700", bev=0.04, P=YX)
    box(bm, (2.2, 0.08, 2.3), (0, 7.72, HZ0 + 1.15), mat="m800", bev=0.02, edge="m600")      # rear service door
    box(bm, (0.08, 0.04, 2.2), (0, 7.69, HZ0 + 1.12), mat="m900", bev=0)
    for a in (pi / 3, pi * 2 / 3):                                                   # purlins
        box(bm, (0.16, 7.7, 0.16), (4.22 * cos(a), 4.0, HZ0 + 3.82 * sin(a)), rot=(0, pi / 2 - a, 0), mat="m600", bev=0.02)
    for s in (-1, 1):                                                                        # rib feet
        for y0, w in ((0.0, 0.4), (2.05, 0.26), (4.05, 0.26), (6.0, 0.26)):
            box(bm, (0.56, w + 0.14, 0.3), (s * 4.25, y0 + w / 2, HZ0 + 0.15), mat="m700", bev=0.03)
    # ground equipment: boarding stairs (left of the nose), tug block, chocks, crates
    S = TR((-2.55, 1.75, HZ0), (0, 0, 0))
    for i in range(5):
        box(bm, (0.8, 0.26, 0.06), (0, -0.5 + i * 0.25, 0.2 + i * 0.2), mat="line", bev=0.01, edge=False, P=S)
    prism(bm, [(-0.66, 0.06), (0.74, 0.06), (0.74, 1.02), (0.52, 1.02)], -0.44, -0.38, "m600", bev=0.01, P=S)
    prism(bm, [(-0.66, 0.06), (0.74, 0.06), (0.74, 1.02), (0.52, 1.02)], 0.38, 0.44, "m600", bev=0.01, P=S)
    box(bm, (0.9, 0.5, 0.06), (0, 0.75, 1.03), mat="line", bev=0.01, edge=False, P=S)
    for sx in (-1, 1):
        box(bm, (0.04, 0.04, 0.5), (sx * 0.41, 0.95, 1.3), mat="m600", bev=0, P=S)
        box(bm, (0.04, 0.5, 0.04), (sx * 0.41, 0.74, 1.55), mat="m600", bev=0, P=S)
        cyl(bm, 0.07, 0.07, 0.05, (sx * 0.44, 0.6, 0.07), rot=(0, radians(90), 0), mat="m900", bev=0, P=S)
        cyl(bm, 0.07, 0.07, 0.05, (sx * 0.44, -0.5, 0.07), rot=(0, radians(90), 0), mat="m900", bev=0, P=S)
    box(bm, (0.7, 0.7, 0.55), (3.1, 6.6, HZ0 + 0.275), mat="m600", bev=0.03)
    box(bm, (0.5, 0.5, 0.4), (3.0, 6.55, HZ0 + 0.75), mat="m700", bev=0.03, rot=(0, 0, 0.3))
    box(bm, (0.6, 0.9, 0.5), (-3.2, 6.5, HZ0 + 0.25), mat="m700", bev=0.03)
    fix_normals(bm)
    hangar = make("hangar", bm, pm, c)

    # --- plane: small complete low-poly airliner, nose towards the door, no markings
    pb = bmesh.new()
    ZC = 1.5
    loft(pb, [(0.45, 0.06, ZC - 0.12), (0.62, 0.26, ZC - 0.09), (0.95, 0.46, ZC - 0.04), (1.5, 0.6, ZC), (2.2, 0.63, ZC),
              (4.9, 0.63, ZC), (5.7, 0.5, ZC + 0.09), (6.45, 0.32, ZC + 0.2), (7.05, 0.13, ZC + 0.3)])
    # cockpit glazing
    box(pb, (0.5, 0.34, 0.03), (0, 0.9, ZC + 0.335), rot=(radians(38), 0, 0), mat="m900", bev=0)
    for s in (-1, 1):
        box(pb, (0.03, 0.3, 0.15), (s * 0.4, 1.02, ZC + 0.2), rot=(radians(10), 0, s * radians(-26)), mat="m900", bev=0)
        for i in range(9):                                                                   # cabin windows
            box(pb, (0.03, 0.15, 0.13), (s * 0.6, 1.9 + i * 0.4, ZC + 0.1), mat="m900", bev=0)
        # main wing, winglet, engine + pylon, stabiliser, main gear
        wing(pb, [(0.45, 2.75, ZC - 0.36, 0.16), (0.45, 4.35, ZC - 0.36, 0.16), (3.15, 4.85, ZC - 0.14, 0.06), (3.15, 4.3, ZC - 0.14, 0.06)], s)
        wing(pb, [(3.1, 4.34, ZC - 0.14, 0.05), (3.1, 4.86, ZC - 0.14, 0.05), (3.26, 5.0, ZC + 0.26, 0.04), (3.26, 4.72, ZC + 0.26, 0.04)], s, mat="m600", bev=0)
        cyl(pb, 0.27, 0.22, 1.0, (s * 1.55, 3.25, ZC - 0.63), rot=(radians(90), 0, 0), mat="m700", seg=10, bev=0.03)
        cyl(pb, 0.2, 0.2, 0.03, (s * 1.55, 2.745, ZC - 0.63), rot=(radians(90), 0, 0), mat="m900", seg=10, bev=0)
        box(pb, (0.07, 0.7, 0.2), (s * 1.55, 3.55, ZC - 0.37), mat="m600", bev=0)
        wing(pb, [(0.2, 6.2, ZC + 0.24, 0.08), (0.2, 6.92, ZC + 0.26, 0.08), (1.35, 7.08, ZC + 0.3, 0.04), (1.35, 6.78, ZC + 0.3, 0.04)], s)
        cyl(pb, 0.045, 0.045, 0.62, (s * 0.72, 3.85, HZ0 + 0.47), mat="m600", seg=6, bev=0)
        for dx in (-0.09, 0.09):
            cyl(pb, 0.19, 0.19, 0.11, (s * 0.72 + dx, 3.85, HZ0 + 0.19), rot=(0, radians(90), 0), mat="m900", seg=10, bev=0.03, edge="m800")
    prism(pb, [(5.75, ZC + 0.5), (6.85, ZC + 0.36), (7.2, ZC + 1.55), (6.8, ZC + 1.55)], -0.05, 0.05, "m700", bev=0.015)   # fin
    box(pb, (0.9, 1.9, 0.3), (0, 3.6, ZC - 0.55), mat="m600", bev=0.06)                      # wing box fairing
    cyl(pb, 0.04, 0.04, 0.6, (0, 1.45, HZ0 + 0.45), mat="m600", seg=6, bev=0)                # nose gear
    for dx in (-0.07, 0.07):
        cyl(pb, 0.15, 0.15, 0.09, (dx, 1.45, HZ0 + 0.15), rot=(0, radians(90), 0), mat="m900", seg=10, bev=0.025, edge="m800")
    fix_normals(pb)
    plane = make("plane", pb, pm, c)

    # --- emissive trim: door arch outline, runway centre dashes, edge lights
    mid = arc(4.25, 3.85)
    for (x0, z0), (x1, z1) in zip(mid[:-1], mid[1:]):
        L = hypot(x1 - x0, z1 - z0)
        box(tb, (L + 0.03, 0.05, 0.08), ((x0 + x1) / 2, -0.02, (z0 + z1) / 2), rot=(0, -atan2(z1 - z0, x1 - x0), 0), mat=None, bev=0)
    for i in range(7):
        box(tb, (0.12, 0.7, 0.03), (0, -0.1 + i * 1.2, HZ0 + 0.012), mat=None, bev=0)
    for s in (-1, 1):
        for i in range(6):
            box(tb, (0.14, 0.14, 0.05), (s * 3.55, -0.2 + i * 1.5, HZ0 + 0.02), mat=None, bev=0)
    trim = make("hangar-trim", tb, [emit("emit-cyan")], c)
    return hangar, plane, trim


# ------------------------------------------------------------------ island model
MS = 0.022          # miniature scale (same as the placeholder)
MZ = 1.3            # height of the miniature's ground plane


def island_outline():
    out = []
    for i in range(40):
        t = i / 40 * 2 * pi
        k = 1 + 0.08 * sin(3 * t + 1) + 0.05 * sin(5 * t + 2)
        out.append((round(58 * k * cos(t), 2), round(38 * k * sin(t), 2)))
    return out


def circuit_points():
    out = []
    for i in range(12):
        t = i / 12 * 2 * pi + pi
        k = 1 + 0.08 * sin(2 * t + 0.5)
        out.append((round(30 * k * cos(t), 2), round(19 * k * sin(t), 2)))
    return out


def mini(x, z):
    """World (x, z) -> miniature (x, y) in Blender."""
    return Vector((x * MS, -z * MS))


def closed_spline(pts, n=4):
    N = len(pts)
    out = []
    for i in range(N):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % N], pts[(i + 2) % N]
        for s in range(n):
            t = s / n
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    return out


def ribbon(bm, path, off, half, z, mi=0):
    N = len(path)
    L, R = [], []
    for i in range(N):
        t = (path[(i + 1) % N] - path[i - 1]).normalized()
        nrm = Vector((-t.y, t.x))
        c = path[i] + nrm * off
        L.append(bm.verts.new((c.x + nrm.x * half, c.y + nrm.y * half, z)))
        R.append(bm.verts.new((c.x - nrm.x * half, c.y - nrm.y * half, z)))
    for i in range(N):
        j = (i + 1) % N
        f = bm.faces.new((L[i], R[i], R[j], L[j]))
        f.material_index = mi
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    for f in bm.faces:
        if f.normal.z < 0:
            f.normal_flip()


def build_model():
    c = reset_coll("island-model")
    pm = pal_mats()
    bm = bmesh.new()
    tb = bmesh.new()
    S16 = pi / 16
    cyl(bm, 1.72, 1.72, 0.16, (0, 0, 0.08), mat="m800", seg=16, bev=0.035, spin=S16)
    cyl(bm, 1.6, 1.4, 0.52, (0, 0, 0.42), mat="m700", seg=16, bev=0.03, spin=S16)
    cyl(bm, 1.54, 1.54, 0.12, (0, 0, 0.74), mat="m600", seg=16, bev=0.03, spin=S16)
    cyl(bm, 0.8, 0.8, 0.02, (0, 0, 0.805), mat="m900", seg=16, bev=0, spin=S16)
    cyl(bm, 0.5, 0.36, 0.1, (0, 0, 0.85), mat="m700", seg=8, bev=0.02, spin=pi / 8)          # projector hub
    for k in range(8):                                                                       # buttress fins
        a = k * pi / 4 + pi / 8
        prism(bm, [(1.36, 0.16), (1.7, 0.16), (1.7, 0.24), (1.5, 0.66), (1.36, 0.66)], -0.05, 0.05, "m600", bev=0.012,
              P=Matrix.Rotation(a, 4, "Z") @ Matrix.Rotation(-pi / 2, 4, "Z"))
    # front plaque
    Pq = TR((0, -1.6, 0.36), (radians(62), 0, 0))
    box(bm, (1.0, 0.44, 0.08), (0, 0, 0), mat="m600", bev=0.02, P=Pq)
    box(bm, (0.84, 0.3, 0.02), (0, 0, 0.045), mat="m900", bev=0, P=Pq)
    box(tb, (0.5, 0.03, 0.02), (-0.12, 0.05, 0.062), mat=None, bev=0, P=Pq)
    box(tb, (0.3, 0.03, 0.02), (-0.22, -0.05, 0.062), mat=None, bev=0, P=Pq)
    fix_normals(bm)
    pedestal = make("pedestal", bm, pm, c)
    ap = 1.54 * cos(S16) + 0.012
    for k in range(16):                                                                      # rim light ring
        a = k * pi / 8
        box(tb, (2 * 1.54 * sin(S16) + 0.02, 0.04, 0.04), (ap * cos(a), ap * sin(a), 0.74), rot=(0, 0, a + pi / 2), mat=None, bev=0)
    trim = make("model-trim", tb, [emit("emit-cyan")], c)

    # --- miniature: floating island, outline + loop road from world.ts
    mb = bmesh.new()
    out = [mini(x, z) for x, z in island_outline()]
    N = len(out)

    def ring(sc, z, jit=0.0):
        return [mb.verts.new((p.x * sc * (1 + jit * sin(i * 2.3 + sc * 9)), p.y * sc * (1 + jit * cos(i * 1.7 + sc * 5)), z)) for i, p in enumerate(out)]

    levels = [(0.975, 0.0, 0.0), (1.0, -0.03, 0.0), (0.985, -0.12, 0.0), (0.74, -0.25, 0.05), (0.4, -0.37, 0.1)]
    rings = [ring(*lv) for lv in levels]
    hub = mb.verts.new((0, 0, 0))                # fan: the outline is star-shaped but not convex
    for k in range(N):
        mb.faces.new((hub, rings[0][k], rings[0][(k + 1) % N])).material_index = IDX["m600"]
    for i, m in enumerate(("line", "m600", "m800", "m900")):
        for k in range(N):
            k2 = (k + 1) % N
            mb.faces.new((rings[i][k], rings[i + 1][k], rings[i + 1][k2], rings[i][k2])).material_index = IDX[m]
    apex = mb.verts.new((0.02, -0.01, -0.47))
    for k in range(N):
        mb.faces.new((rings[-1][k], apex, rings[-1][(k + 1) % N])).material_index = IDX["m900"]
    bmesh.ops.recalc_face_normals(mb, faces=mb.faces[:])
    path = closed_spline([mini(x, z) for x, z in circuit_points()], 4)
    road = bmesh.new()
    ribbon(road, path, 0.0, 3.0 * MS, 0.006, IDX["m900"])
    _flush(road, mb)

    def prop(size, wx, wz, mat="m600", bev=0.006, rot=0.0):
        p = mini(wx, wz)
        box(mb, size, (p.x, p.y, size[2] / 2), rot=(0, 0, rot), mat=mat, bev=bev)

    prop((0.2, 0.24, 0.1), -42, 0, "m600")                                                   # garage (faces +x)
    for i in range(7):                                                                        # arcade row
        prop((0.045, 0.04, 0.085), (i - 3) * 6, -8, "line", bev=0)
    p = mini(-18, 6)                                                                          # plane hangar
    cyl(mb, 0.085, 0.085, 0.17, (p.x, p.y, 0.0), rot=(radians(90), 0, 0), mat="m600", seg=10, bev=0)
    prop((0.035, 0.03, 0.07), 20, 9.6, "line", bev=0)                                         # server rack
    p = mini(0, 10)                                                                           # this pedestal
    cyl(mb, 0.04, 0.035, 0.03, (p.x, p.y, 0.015), mat="m600", seg=8, bev=0)
    cyl(mb, 0.028, 0.012, 0.02, (p.x, p.y, 0.045), mat="line", seg=8, bev=0)
    for ox, oz in ((-4.2, -4.2), (4.2, -4.2), (-4.2, 4.2), (4.2, 4.2)):                       # skill pads + blocks
        prop((7 * MS, 7 * MS, 0.016), 41 + ox, oz, "m600", bev=0)
        for dx, dz in ((-1.6, -1), (0.6, -1.2), (-0.6, 1.3), (1.7, 1)):
            p = mini(41 + ox + dx, oz + dz)
            box(mb, (0.03, 0.03, 0.03), (p.x, p.y, 0.031), mat="line", bev=0)
    p = mini(0, -32)                                                                          # antenna
    cyl(mb, 0.05, 0.05, 0.016, (p.x, p.y, 0.008), mat="m600", seg=8, bev=0)
    cyl(mb, 0.008, 0.012, 0.13, (p.x, p.y, 0.08), mat="line", seg=5, bev=0)
    cyl(mb, 0.01, 0.05, 0.03, (p.x, p.y - 0.01, 0.15), rot=(radians(50), 0, 0), mat="line", seg=8, bev=0)
    # centre the bounding box on the spin axis (meshopt quantisation re-origins the node at the bbox centre)
    xs = [v.co.x for v in mb.verts]
    ys = [v.co.y for v in mb.verts]
    off = Vector((-(min(xs) + max(xs)) / 2, -(min(ys) + max(ys)) / 2, MZ))
    mb.transform(Matrix.Translation(off))
    fix_normals(mb)
    miniature = make("miniature", mb, pm, c)

    lb = bmesh.new()
    for o in (-1, 1):
        ribbon(lb, path, o * (3.0 * MS - 0.012), 0.011, 0.012)
    lb.transform(Matrix.Translation(off))
    lines = make("miniature-lines", lb, [emit("emit-cyan")], c)
    return pedestal, trim, miniature, lines


def finish_model():
    """After bake('island-model'): join the cyan road lines into `miniature` (2 primitives, 1 node)."""
    mn, ln = bpy.data.objects["miniature"], bpy.data.objects.get("miniature-lines")
    if ln is None:
        return
    solo("island-model")
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    ln.select_set(True)
    mn.select_set(True)
    bpy.context.view_layer.objects.active = mn
    bpy.ops.object.join()


def export_b(asset):
    solo(asset)
    objs = asset_objs(asset)
    renamed = []
    for o in objs:
        if o.name in EXPORT_NAMES:
            renamed.append((o, o.name))
            o.name = EXPORT_NAMES[o.name]
    _select(objs)
    path = os.path.join(ROOT, "art", "export", asset + ".glb")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    try:
        bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_yup=True, export_apply=True,
                                  export_texcoords=True, export_normals=True, export_materials="EXPORT",
                                  export_cameras=False, export_lights=False, use_selection=True)
        info = {o.name: tris(o) for o in objs}
    finally:
        for o, n in renamed:
            o.name = n
    return path, info
