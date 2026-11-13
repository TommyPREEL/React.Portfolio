"""Build script for art/blender/landmarks-a.blend (arcade cabinet, server rack, antenna).
Run inside Blender: exec(open(path).read()); then build_cabinet() / build_rack() / build_antenna(),
bake(asset) and export(asset). Blender axes: X right, -Y front (= three.js +Z), Z up. Scale 1:1 game units.
"""
import bpy, bmesh, os
import numpy as np
from math import radians, sin, cos, atan2, pi, hypot
from mathutils import Vector, Matrix, Euler

ROOT = r"c:\Users\tommy\Desktop\All\Projects\React.Portfolio"
ASSETS = ("arcade-cabinet", "server-rack", "antenna")
PAL = [("m900", "#0E1217"), ("m800", "#141920"), ("m700", "#1B2129"), ("m600", "#222A33"), ("line", "#2E3843")]
IDX = {n: i for i, (n, _) in enumerate(PAL)}
LIGHTER = {"m900": "m800", "m800": "m700", "m700": "m600", "m600": "line", "line": "line"}


def _lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hexlin(h):
    h = h.lstrip("#")
    return tuple(_lin(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (1.0,)


def principled(mat):
    return next((n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)


def get_mat(name, base, emis=None):
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
        try:
            m.use_nodes = True
        except Exception:
            pass
    p = principled(m)
    if p is None:
        nt = m.node_tree
        nt.nodes.clear()
        p = nt.nodes.new("ShaderNodeBsdfPrincipled")
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(p.outputs[0], out.inputs[0])
    p.inputs["Base Color"].default_value = base
    p.inputs["Roughness"].default_value = 0.9
    p.inputs["Metallic"].default_value = 0.0
    if emis:
        p.inputs["Emission Color"].default_value = emis
        p.inputs["Emission Strength"].default_value = 1.0
    m.diffuse_color = emis if emis else base
    return m


def pal_mats():
    return [get_mat("pal-" + n, hexlin(h)) for n, h in PAL]


def emit(name):
    col = {"emit-cyan": (0.074, 0.807, 1.0, 1.0), "emit-orange": (1.0, 0.254, 0.014, 1.0)}[name]
    return get_mat(name, (0, 0, 0, 1), col)


def screen_mat():
    """Unlit `screen` material with a tiny dark placeholder texture: without a texture, gltf-transform
    prunes the quad's UVs. The web code replaces the map with the project screenshot."""
    img = bpy.data.images.get("screen_placeholder")
    if img is None:
        img = bpy.data.images.new("screen_placeholder", 16, 10, alpha=False)
        r, g, b_ = (int("0E1217"[i:i + 2], 16) / 255 for i in (0, 2, 4))
        img.pixels.foreach_set([r, g, b_, 1.0] * 160)
        img.filepath_raw = os.path.join(ROOT, "art", "blender", "screen_placeholder.png")
        img.file_format = "PNG"
        img.save()
    m = bpy.data.materials.get("screen") or bpy.data.materials.new("screen")
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


# ------------------------------------------------------------------ geometry kit
def TR(loc=(0, 0, 0), rot=(0, 0, 0)):
    return Matrix.Translation(loc) @ Euler(rot, "XYZ").to_matrix().to_4x4()


def _fin(tmp, edges, bev, mat, edge):
    mi = IDX[mat] if mat else 0
    for f in tmp.faces:
        f.material_index = mi
    if bev > 0 and edges:
        em = -1
        if mat and edge:
            em = IDX[LIGHTER[mat] if edge is True else edge]
        bmesh.ops.bevel(tmp, geom=edges, offset=bev, offset_type="OFFSET", segments=1, profile=0.5,
                        affect="EDGES", clamp_overlap=True, material=em)


def fix_normals(bm):
    """recalc_face_normals sometimes leaves a whole shell inside-out (thin unbevelled boxes, concave prisms):
    flip every CLOSED shell whose signed volume is negative. Open shells (quads) are left alone."""
    bm.faces.ensure_lookup_table()
    bm.faces.index_update()
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


def _flush(tmp, bm, M=None):
    if M is not None:
        tmp.transform(M)
    bmesh.ops.recalc_face_normals(tmp, faces=tmp.faces[:])
    fix_normals(tmp)
    me = bpy.data.meshes.new("_scratch")
    tmp.to_mesh(me)
    tmp.free()
    bm.from_mesh(me)
    bpy.data.meshes.remove(me)


def box(bm, size, loc, rot=(0, 0, 0), mat="m700", bev=0.03, edge=True, P=None):
    tmp = bmesh.new()
    bmesh.ops.create_cube(tmp, size=1.0)
    bmesh.ops.scale(tmp, vec=size, verts=tmp.verts[:])
    _fin(tmp, tmp.edges[:], bev, mat, edge)
    M = TR(loc, rot)
    _flush(tmp, bm, P @ M if P else M)


def cyl(bm, r1, r2, h, loc, rot=(0, 0, 0), mat="m700", seg=8, bev=0.02, edge=True, spin=0.0, P=None):
    tmp = bmesh.new()
    bmesh.ops.create_cone(tmp, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=h)
    if spin:
        tmp.transform(Matrix.Rotation(spin, 4, "Z"))
    rim = [e for e in tmp.edges if abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-6]
    _fin(tmp, rim, bev, mat, edge)
    M = TR(loc, rot)
    _flush(tmp, bm, P @ M if P else M)


def ico(bm, r, loc, mat="line", P=None):
    tmp = bmesh.new()
    bmesh.ops.create_icosphere(tmp, subdivisions=1, radius=r)
    _fin(tmp, [], 0, mat, False)
    M = TR(loc)
    _flush(tmp, bm, P @ M if P else M)


def prism(bm, pts, x0, x1, mat="m700", bev=0.03, edge=True, P=None, long_only=False):
    """Extrude a (y, z) profile along X."""
    tmp = bmesh.new()
    a = [tmp.verts.new((x0, y, z)) for y, z in pts]
    b = [tmp.verts.new((x1, y, z)) for y, z in pts]
    n = len(pts)
    tmp.faces.new(a)
    tmp.faces.new(b[::-1])
    for i in range(n):
        j = (i + 1) % n
        tmp.faces.new((a[i], b[i], b[j], a[j]))
    edges = tmp.edges[:]
    if long_only:
        edges = [e for e in edges if abs(e.verts[0].co.x - e.verts[1].co.x) > 1e-6]
    _fin(tmp, edges, bev, mat, edge)
    _flush(tmp, bm, P)


def smooth(pts, n=4):
    Pp = [Vector(p) for p in pts]
    Pp = [Pp[0]] + Pp + [Pp[-1]]
    out = []
    for i in range(1, len(Pp) - 2):
        p0, p1, p2, p3 = Pp[i - 1:i + 3]
        for s in range(n):
            t = s / n
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                              + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(Pp[-2])
    return out


def tube(bm, pts, r, mat="m900", seg=5, P=None):
    tmp = bmesh.new()
    pts = [Vector(p) for p in pts]
    t0 = (pts[1] - pts[0]).normalized()
    up = Vector((0, 0, 1)) if abs(t0.z) < 0.9 else Vector((1, 0, 0))
    nrm = t0.cross(up).normalized()
    rings = []
    for i, p in enumerate(pts):
        if i == 0:
            t = t0
        elif i == len(pts) - 1:
            t = (pts[i] - pts[i - 1]).normalized()
        else:
            t = ((pts[i + 1] - pts[i]).normalized() + (pts[i] - pts[i - 1]).normalized()).normalized()
        nrm = (nrm - t * nrm.dot(t)).normalized()
        bi = t.cross(nrm)
        rings.append([tmp.verts.new(p + r * (cos(2 * pi * k / seg) * nrm + sin(2 * pi * k / seg) * bi)) for k in range(seg)])
    for i in range(len(rings) - 1):
        for k in range(seg):
            k2 = (k + 1) % seg
            tmp.faces.new((rings[i][k], rings[i][k2], rings[i + 1][k2], rings[i + 1][k]))
    tmp.faces.new(rings[0])
    tmp.faces.new(rings[-1][::-1])
    _fin(tmp, [], 0, mat, False)
    _flush(tmp, bm, P)


def quad(bm, corners, P=None):
    vs = [bm.verts.new((P @ Vector(c)) if P else c) for c in corners]
    return bm.faces.new(vs)


def led(bm, x, y, z, w=0.07, h=0.05, P=None):
    """Front-facing (-Y) quad."""
    quad(bm, [(x - w / 2, y, z - h / 2), (x + w / 2, y, z - h / 2), (x + w / 2, y, z + h / 2), (x - w / 2, y, z + h / 2)], P)


# ------------------------------------------------------------------ scene helpers
def coll(name):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c


def reset_coll(name):
    c = coll(name)
    for o in list(c.objects):
        me = o.data
        bpy.data.objects.remove(o)
        if me and me.users == 0:
            bpy.data.meshes.remove(me)
    return c


def make(name, bm, mats, c, origin=None):
    if origin is not None:
        bm.transform(Matrix.Translation(-Vector(origin)))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    ob = bpy.data.objects.new(name, me)
    if origin is not None:
        ob.location = origin
    c.objects.link(ob)
    return ob


def solo(asset):
    lc = bpy.context.view_layer.layer_collection
    for ch in lc.children:
        if ch.name in ASSETS:
            ch.exclude = ch.name != asset


def tris(ob):
    return sum(len(p.vertices) - 2 for p in ob.data.polygons)


# ------------------------------------------------------------------ arcade cabinet
def build_cabinet():
    c = reset_coll("arcade-cabinet")
    pm = pal_mats()
    bm = bmesh.new()
    SIDE = [(-0.72, 0.10), (-0.72, 0.98), (-1.00, 1.06), (-1.00, 1.24), (-0.52, 1.42), (-0.36, 2.50),
            (-0.84, 2.74), (-0.84, 3.34), (-0.66, 3.52), (0.56, 3.52), (0.76, 3.32), (0.76, 0.10)]
    BODY = [(-0.65, 0.10), (-0.65, 1.00), (-0.93, 1.08), (-0.93, 1.20), (-0.47, 1.37), (-0.30, 2.52),
            (-0.77, 2.76), (-0.77, 3.30), (-0.62, 3.45), (0.52, 3.45), (0.69, 3.28), (0.69, 0.10)]
    for s in (-1, 1):
        prism(bm, SIDE, s * 0.70, s * 0.82, "m700", bev=0.03)
        # side art: raised bevelled bands
        x0, x1 = s * 0.81, s * 0.855
        prism(bm, [(-0.62, 0.45), (-0.30, 0.45), (0.66, 2.30), (0.66, 2.85)], x0, x1, "m600", bev=0.012)
        prism(bm, [(-0.10, 0.45), (0.05, 0.45), (0.66, 1.62), (0.66, 1.92)], x0, x1, "m900", bev=0.012)
        prism(bm, [(-0.76, 2.82), (-0.36, 2.82), (-0.76, 3.26)], x0, x1, "m600", bev=0.012)
    prism(bm, BODY, -0.73, 0.73, "m800", bev=0.02, long_only=True)
    box(bm, (1.50, 1.34, 0.12), (0, 0.03, 0.06), mat="m900", bev=0.02)          # plinth / toe kick
    box(bm, (1.74, 1.34, 0.06), (0, -0.06, 3.55), mat="m900", bev=0.015)        # roof slab
    box(bm, (1.38, 0.04, 0.46), (0, -0.78, 3.03), mat="m900", bev=0.012)        # marquee face
    # angled screen recess (frame proud of the slanted face)
    th = -atan2(0.17, 1.15)
    S = TR((0, -0.385, 1.945), (th, 0, 0))
    box(bm, (1.40, 0.07, 0.17), (0, -0.03, 0.465), mat="m900", bev=0.015, P=S)
    box(bm, (1.40, 0.07, 0.17), (0, -0.03, -0.465), mat="m900", bev=0.015, P=S)
    for s in (-1, 1):
        box(bm, (0.09, 0.07, 0.76), (s * 0.655, -0.03, 0), mat="m900", bev=0.015, P=S)
    # control panel
    ph = atan2(0.17, 0.46)
    C = TR((0, -0.70, 1.285), (ph, 0, 0))
    box(bm, (1.36, 0.44, 0.04), (0, 0, 0.02), mat="m600", bev=0.012, P=C)
    cyl(bm, 0.075, 0.06, 0.03, (-0.36, 0, 0.055), mat="m900", bev=0, P=C)
    cyl(bm, 0.026, 0.026, 0.2, (-0.36, 0, 0.15), mat="m900", seg=6, bev=0, P=C)
    ico(bm, 0.07, (-0.36, 0, 0.27), "line", P=C)
    for bx, by in ((0.08, -0.06), (0.24, 0.04), (0.40, -0.06), (0.56, 0.04)):
        cyl(bm, 0.05, 0.05, 0.035, (bx, by, 0.057), mat="line", bev=0.008, edge=False, P=C)
    # coin door
    box(bm, (0.52, 0.04, 0.56), (0, -0.665, 0.56), mat="m700", bev=0.012)
    for s in (-1, 1):
        box(bm, (0.06, 0.03, 0.15), (s * 0.11, -0.685, 0.66), mat="m900", bev=0)
    box(bm, (0.10, 0.03, 0.04), (0, -0.685, 0.42), mat="line", bev=0)
    cab = make("cabinet", bm, pm, c)

    # trim: marquee light bar + T-molding on side panel front edges
    tb = bmesh.new()
    box(tb, (1.20, 0.04, 0.07), (0, -0.805, 2.89), mat=None, bev=0)
    path = [(-0.72, 0.14)] + SIDE[1:9]
    for s in (-1, 1):
        for (y0, z0), (y1, z1) in zip(path[:-1], path[1:]):
            L = hypot(y1 - y0, z1 - z0)
            box(tb, (0.05, L + 0.02, 0.03), (s * 0.76, (y0 + y1) / 2, (z0 + z1) / 2),
                rot=(atan2(z1 - z0, y1 - y0), 0, 0), mat=None, bev=0)
    trim = make("trim", tb, [emit("emit-cyan")], c)

    # screen: 1.2 x 0.75 (16:10) quad, UV 0-1, u = viewer's left->right, v = bottom->top
    sb = bmesh.new()
    f = quad(sb, [(-0.6, -0.012, -0.375), (0.6, -0.012, -0.375), (0.6, -0.012, 0.375), (-0.6, -0.012, 0.375)], S)
    uv = sb.loops.layers.uv.new("UVMap")
    for lp, co in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        lp[uv].uv = co
    scr = make("screen", sb, [screen_mat()], c)
    return cab, trim, scr


# ------------------------------------------------------------------ server rack
def build_rack():
    c = reset_coll("server-rack")
    pm = pal_mats()
    bm = bmesh.new()
    lb = bmesh.new()
    RX, RY = -0.2, 0.4
    box(bm, (2.5, 2.0, 0.12), (0, 0.4, 0.06), mat="m900", bev=0.03)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(bm, (0.09, 0.09, 2.56), (RX + sx * 0.655, RY + sy * 0.455, 1.50), mat="m600", bev=0.015)
        box(bm, (0.04, 0.82, 0.07), (RX + sx * 0.655, RY, 1.43), mat="m600", bev=0.01)
        box(bm, (0.04, 0.82, 0.07), (RX + sx * 0.655, RY, 2.00), mat="m600", bev=0.01)
    box(bm, (1.40, 1.00, 0.10), (RX, RY, 0.17), mat="m700", bev=0.02)
    box(bm, (1.44, 1.04, 0.10), (RX, RY, 2.83), mat="m700", bev=0.025)
    units = [(0.26, 0.42, "ups"), (0.74, 0.26, "srv"), (1.03, 0.26, "srv"), (1.58, 0.14, "1u"),
             (1.75, 0.14, "switch"), (2.12, 0.26, "srv"), (2.42, 0.14, "patch")]
    FY, DY, LY = -0.09, -0.115, -0.1145
    for z0, h, kind in units:
        zc = z0 + h / 2
        box(bm, (1.20, 0.78, h - 0.02), (RX, 0.33, zc), mat="m800", bev=0.015, edge=False)
        box(bm, (1.38, 0.04, h), (RX, FY, zc), mat="m700" if kind in ("srv", "ups") else "m600", bev=0.012)
        for s in (-1, 1):
            box(bm, (0.035, 0.05, h * 0.6), (RX + s * 0.62, -0.13, zc), mat="line", bev=0)
        if kind == "srv":
            for i in range(4):
                for zz in (0.3, 0.7):
                    box(bm, (0.19, 0.02, 0.085), (RX - 0.42 + i * 0.21, DY, z0 + h * zz), mat="m900", bev=0)
        elif kind == "ups":
            for i in range(5):
                box(bm, (0.5, 0.02, 0.035), (RX - 0.25, DY, z0 + 0.08 + i * 0.065), mat="m900", bev=0)
            box(bm, (0.26, 0.02, 0.12), (RX + 0.12, DY, z0 + 0.27), mat="m900", bev=0)
        elif kind == "switch":
            for i in range(8):
                box(bm, (0.085, 0.02, 0.05), (RX - 0.5 + i * 0.105, DY, zc - 0.025), mat="m900", bev=0)
                led(lb, RX - 0.5 + i * 0.105, LY, zc + 0.04, 0.035, 0.02)
        elif kind == "patch":
            for i in range(12):
                box(bm, (0.06, 0.02, 0.05), (RX - 0.52 + i * 0.085, DY, zc), mat="m900", bev=0)
        else:
            box(bm, (0.6, 0.02, 0.04), (RX - 0.2, DY, zc), mat="m900", bev=0)
        if kind != "patch":
            led(lb, RX + 0.46, LY, zc)
            led(lb, RX + 0.55, LY, zc)
    # cable bundle down the right-rear post, over to the old PC
    for k, (dx, dy, m) in enumerate(((0, 0, "m900"), (0.05, 0.03, "m800"), (0.01, 0.07, "line"))):
        tube(bm, smooth([(0.54 + dx, 0.84 + dy, 2.52), (0.56 + dx, 0.84 + dy, 1.9), (0.57 + dx, 0.85 + dy, 1.0),
                         (0.60 + dx, 0.86 + dy, 0.42), (0.74 + dx, 0.84 + dy, 0.20), (0.92 + dx * 2, 0.72, 0.24),
                         (0.94 + dx * 2 - 0.05, 0.54, 0.42 + k * 0.08), (0.94 + dx * 2 - 0.05, 0.44, 0.52 + k * 0.1)], 3), 0.036, m)
    for zt in (1.85, 1.05):
        box(bm, (0.15, 0.16, 0.035), (0.59, 0.88, zt), mat="line", bev=0)
    for zc in (2.49, 2.25, 1.82, 1.16, 0.87):
        tube(bm, smooth([(0.38, 0.70, zc), (0.47, 0.80, zc - 0.02), (0.55, 0.86, zc - 0.12), (0.56, 0.87, zc - 0.3)], 3), 0.02, "m900", seg=4)
    # front patch leads (patch panel -> switch)
    for xa, xb, m, dr in ((RX - 0.35, RX - 0.29, "line", 0.17), (RX - 0.01, RX + 0.13, "m600", 0.13), (RX + 0.33, RX + 0.235, "line", 0.2)):
        xm = (xa + xb) / 2
        tube(bm, smooth([(xa, -0.12, 2.49), (xa, -0.12 - dr * 0.6, 2.45), (xm, -0.12 - dr, 2.14),
                         (xb, -0.12 - dr * 0.6, 1.83), (xb, -0.12, 1.795)], 3), 0.016, m, seg=4)
    # the old PC tower recycled as a server
    T = TR((0.93, 0.02, 0.12), (0, 0, radians(-8)))
    box(bm, (0.42, 0.86, 0.86), (0, 0, 0.45), mat="m600", bev=0.03, P=T)
    box(bm, (0.44, 0.05, 0.88), (0, -0.45, 0.45), mat="line", bev=0.02, edge=False, P=T)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(bm, (0.07, 0.1, 0.03), (sx * 0.14, sy * 0.3, 0.012), mat="m900", bev=0, P=T)
    for zz in (0.76, 0.64):
        box(bm, (0.33, 0.02, 0.09), (0, -0.48, zz), mat="m700", bev=0, P=T)
    box(bm, (0.33, 0.02, 0.055), (0, -0.48, 0.53), mat="m700", bev=0, P=T)
    box(bm, (0.2, 0.024, 0.016), (0.02, -0.482, 0.53), mat="m900", bev=0, P=T)
    cyl(bm, 0.032, 0.032, 0.03, (0.1, -0.485, 0.41), rot=(radians(90), 0, 0), mat="m900", bev=0, P=T)
    for i in range(4):
        box(bm, (0.3, 0.02, 0.022), (0, -0.48, 0.10 + i * 0.05), mat="m900", bev=0, P=T)
    box(bm, (0.012, 0.6, 0.6), (-0.214, 0.03, 0.45), mat="m700", bev=0, P=T)
    led(lb, -0.1, -0.477, 0.41, 0.05, 0.03, P=T)
    rack = make("rack", bm, pm, c)
    leds = make("leds", lb, [emit("emit-cyan")], c)
    return rack, leds


# ------------------------------------------------------------------ antenna
PIVOT = (0.0, 0.0, 3.7)
ELEV = radians(40)


def _dish_bm(yt):
    pm = None
    bm = bmesh.new()
    S8 = radians(22.5)
    cyl(bm, 0.36, 0.36, 0.14, (0, 0, 3.63), mat="m700", bev=0.02, spin=S8)
    box(bm, (1.0, 0.34, 0.12), (0, 0.05, 3.76), mat="m600", bev=0.025)
    tz = 4.2
    dy, dz = yt - 0.05, tz - 3.80
    L = hypot(dy, dz)
    for s in (-1, 1):
        box(bm, (0.09, 0.2, L + 0.16), (s * 0.44, 0.05 + dy / 2, 3.80 + dz / 2), rot=(-atan2(dy, dz), 0, 0), mat="m600", bev=0.02)
    cyl(bm, 0.07, 0.07, 1.0, (0, yt, tz), rot=(0, radians(90), 0), mat="line", bev=0.012, edge=False)
    a = Vector((0, -cos(ELEV), sin(ELEV)))
    D = Matrix.Translation(Vector((0, yt, tz)) + a * 0.2) @ Matrix.Rotation(pi / 2 - ELEV, 4, "X")
    # reflector shell
    R, Dp, seg, th = 1.35, 0.38, 16, 0.06
    tmp = bmesh.new()
    rs = [0.22, 0.62, 1.0, R]

    def ring(r, z):
        return [tmp.verts.new((r * cos(2 * pi * k / seg), r * sin(2 * pi * k / seg), z)) for k in range(seg)]

    fc, bc = tmp.verts.new((0, 0, 0)), tmp.verts.new((0, 0, -th))
    fr = [ring(r, Dp * (r / R) ** 2) for r in rs]
    br = [ring(r, Dp * (r / R) ** 2 - th) for r in rs]
    for rings, cen, mi in ((fr, fc, IDX["m800"]), (br, bc, IDX["m600"])):
        for k in range(seg):
            k2 = (k + 1) % seg
            tmp.faces.new((cen, rings[0][k], rings[0][k2])).material_index = mi
            for i in range(len(rings) - 1):
                tmp.faces.new((rings[i][k], rings[i + 1][k], rings[i + 1][k2], rings[i][k2])).material_index = mi
    for k in range(seg):
        k2 = (k + 1) % seg
        tmp.faces.new((fr[-1][k], br[-1][k], br[-1][k2], fr[-1][k2])).material_index = IDX["line"]
    _flush(tmp, bm, D)
    cyl(bm, 0.36, 0.24, 0.24, (0, 0, -0.18), mat="m700", bev=0.02, P=D)
    for k in range(8):   # back ribs
        ang = k * pi / 4 + pi / 8
        box(bm, (0.9, 0.04, 0.07), (0.75 * cos(ang), 0.75 * sin(ang), 0.38 * (0.75 / R) ** 2 - 0.09),
            rot=(0, -atan2(2 * 0.38 * 0.75 / R ** 2, 1), ang), mat="m700", bev=0, P=D)
    # feed
    for ang in (pi / 2, pi * 7 / 6, pi * 11 / 6):
        r = 1.25
        tube(bm, [(r * cos(ang), r * sin(ang), Dp * (r / R) ** 2), (0.07 * cos(ang), 0.07 * sin(ang), 1.12)], 0.02, "m600", seg=4, P=D)
    cyl(bm, 0.13, 0.07, 0.16, (0, 0, 1.12), mat="line", bev=0.01, edge=False, P=D)
    box(bm, (0.12, 0.12, 0.12), (0, 0, 1.24), mat="m600", bev=0.015, P=D)
    return bm


def build_antenna():
    c = reset_coll("antenna")
    pm = pal_mats()
    bm = bmesh.new()
    tb = bmesh.new()
    S8 = radians(22.5)
    cyl(bm, 1.78, 1.78, 0.22, (0, 0, 0.11), mat="m800", bev=0.035, spin=S8)
    cyl(bm, 1.50, 1.50, 0.20, (0, 0, 0.32), mat="m700", bev=0.035, spin=S8)
    ap = 1.5 * cos(S8) + 0.012
    for k in range(8):
        ang = k * pi / 4
        box(tb, (2 * 1.5 * sin(S8) + 0.02, 0.04, 0.04), (ap * cos(ang), ap * sin(ang), 0.245), rot=(0, 0, ang + pi / 2), mat=None, bev=0)
    cyl(bm, 0.50, 0.40, 0.50, (0, 0, 0.67), mat="m600", bev=0.03, spin=S8)
    cyl(bm, 0.26, 0.18, 2.50, (0, 0, 2.17), mat="m700", bev=0.02, spin=S8)
    cyl(bm, 0.30, 0.30, 0.08, (0, 0, 1.50), mat="line", bev=0.015, edge=False, spin=S8)
    cyl(bm, 0.26, 0.26, 0.08, (0, 0, 2.60), mat="line", bev=0.015, edge=False, spin=S8)
    for k in range(4):
        prism(bm, [(0.20, 0.42), (1.10, 0.42), (1.10, 0.50), (0.20, 1.55)], -0.035, 0.035, "m600", bev=0.012,
              P=Matrix.Rotation(pi / 4 + k * pi / 2, 4, "Z"))
    box(bm, (0.30, 0.16, 0.42), (0, -0.30, 1.16), mat="m600", bev=0.02)
    box(bm, (0.2, 0.02, 0.05), (0, -0.385, 1.27), mat="m900", bev=0)
    cyl(bm, 0.30, 0.30, 0.14, (0, 0, 3.49), mat="m600", bev=0.02, spin=S8)
    # obstruction-light pole (static, clear of the dish sweep radius 1.41)
    pa = radians(135)
    px, py = 1.52 * cos(pa), 1.52 * sin(pa)
    cyl(bm, 0.11, 0.09, 0.12, (px, py, 0.28), mat="m600", bev=0.01)
    cyl(bm, 0.065, 0.04, 5.44, (px, py, 3.06), mat="m700", seg=6, bev=0)
    cyl(bm, 0.075, 0.075, 0.05, (px, py, 5.78), mat="line", seg=6, bev=0)
    # terminal
    T = TR((3.0, -1.6, 0), (0, 0, -0.4))
    box(bm, (1.8, 1.3, 0.08), (0, 0, 0.04), mat="m800", bev=0.02, P=T)
    prism(bm, [(-0.45, 0.08), (-0.45, 0.80), (-0.05, 0.92), (0.08, 1.32), (0.40, 1.32), (0.40, 0.08)], -0.65, 0.65, "m700", bev=0.035, P=T)
    Sc = T @ TR((0, 0.015, 1.12), (-atan2(0.13, 0.40), 0, 0))
    box(bm, (1.06, 0.03, 0.32), (0, -0.015, 0), mat="m900", bev=0.01, P=Sc)
    for x, u, w in ((-0.17, 0.09, 0.56), (-0.26, 0.02, 0.38), (-0.21, -0.05, 0.48)):
        box(tb, (w, 0.02, 0.032), (x, -0.036, u), mat=None, bev=0, P=Sc)
    box(tb, (0.07, 0.02, 0.05), (-0.415, -0.036, -0.115), mat=None, bev=0, P=Sc)
    K = T @ TR((0, -0.25, 0.86), (atan2(0.12, 0.40), 0, 0))
    box(bm, (0.9, 0.26, 0.04), (0, 0, 0.02), mat="m600", bev=0.012, P=K)
    for yy in (-0.075, 0, 0.075):
        box(bm, (0.8, 0.05, 0.02), (0, yy, 0.05), mat="m900", bev=0, P=K)
    p0 = T @ Vector((-0.3, 0.38, 0.14))
    tube(bm, smooth([p0, (2.45, -1.0, 0.05), (1.95, -0.55, 0.05), (1.74, -0.40, 0.10), (1.60, -0.34, 0.26), (1.42, -0.30, 0.30)], 3), 0.04, "m900")
    base = make("base", bm, pm, c)
    trim = make("antenna-trim", tb, [emit("emit-cyan")], c)

    # dish: bbox centred on the rotation axis in X/Y so meshopt's quantization offset stays on the axis
    yt = 0.444
    for _ in range(3):
        d = _dish_bm(yt)
        ys = [v.co.y for v in d.verts]
        cy = (min(ys) + max(ys)) / 2
        if abs(cy) < 1e-5:
            break
        d.free()
        yt -= cy
        d = None
    if d is None:
        d = _dish_bm(yt)
    dish = make("dish", d, pm, c, origin=PIVOT)

    bb = bmesh.new()
    ico(bb, 0.11, (0, 0, 0), mat=None)
    beacon = make("beacon", bb, [emit("emit-orange")], c)
    beacon.location = (px, py, 5.90)
    return base, trim, dish, beacon


# ------------------------------------------------------------------ bake / export
BAKED = {"arcade-cabinet": ["cabinet"], "server-rack": ["rack"], "antenna": ["base", "dish"]}


def asset_objs(asset):
    return list(bpy.data.collections[asset].objects)


def _select(objs):
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]


def bake(asset, size=1024, samples=128, ao_dist=1.2):
    scn = bpy.context.scene
    solo(asset)
    objs = [bpy.data.collections[asset].objects[n] for n in BAKED[asset]]
    _select(objs)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=radians(66), island_margin=0.004)
    bpy.ops.object.mode_set(mode="OBJECT")
    # ground plane so contact occlusion grounds the asset
    hc = coll("bake-helpers")
    g = bpy.data.objects.get("bake-ground")
    if g is None:
        gb = bmesh.new()
        quad(gb, [(-30, -30, 0), (30, -30, 0), (30, 30, 0), (-30, 30, 0)])
        g = make("bake-ground", gb, [], hc)
    g.hide_render = False
    if scn.world is None:
        scn.world = bpy.data.worlds.new("World")
    scn.world.light_settings.distance = ao_dist
    imgs = {}
    for key in ("ao", "col"):
        nm = "_%s_%s" % (asset, key)
        old = bpy.data.images.get(nm)
        if old:
            bpy.data.images.remove(old)
        imgs[key] = bpy.data.images.new(nm, size, size, alpha=True, float_buffer=True)
    res = {}
    for key, kw, spp in (("ao", dict(type="AO"), samples), ("col", dict(type="DIFFUSE", pass_filter={"COLOR"}), 4)):
        for m in pal_mats():
            nt = m.node_tree
            tn = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None) or nt.nodes.new("ShaderNodeTexImage")
            tn.image = imgs[key]
            for n in nt.nodes:
                n.select = False
            tn.select = True
            nt.nodes.active = tn
        scn.cycles.samples = spp
        _select(objs)
        bpy.ops.object.bake(margin=8, use_clear=False, **kw)
        buf = np.empty(size * size * 4, dtype=np.float32)
        imgs[key].pixels.foreach_get(buf)
        res[key] = buf.reshape(-1, 4)
    g.hide_render = True
    g.hide_viewport = True
    out = np.zeros_like(res["col"])
    lin = np.clip(res["col"][:, :3] * (0.25 + 0.75 * res["ao"][:, :1]), 0, 1)   # lifted AO, like the car
    out[:, :3] = np.where(lin <= 0.0031308, lin * 12.92, 1.055 * np.power(lin, 1 / 2.4) - 0.055)
    out[:, 3] = 1.0
    nm = asset + "_bake"
    old = bpy.data.images.get(nm)
    if old:
        bpy.data.images.remove(old)
    fin = bpy.data.images.new(nm, size, size, alpha=False)
    fin.pixels.foreach_set(out.ravel())
    fin.filepath_raw = os.path.join(ROOT, "art", "blender", nm + ".png")
    fin.file_format = "PNG"
    fin.save()
    for i in imgs.values():
        bpy.data.images.remove(i)
    # unlit baked material: texture colour straight into the output (exports as KHR_materials_unlit)
    mn = "baked-" + asset
    m = bpy.data.materials.get(mn) or bpy.data.materials.new(mn)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    nt.nodes.clear()
    tn = nt.nodes.new("ShaderNodeTexImage")
    tn.image = fin
    on = nt.nodes.new("ShaderNodeOutputMaterial")
    on.location = (300, 0)
    nt.links.new(tn.outputs["Color"], on.inputs["Surface"])
    # keep palette-material sources in an excluded collection, then swap to the baked material
    sc = reset_coll("src-" + asset)
    for o in objs:
        s = o.copy()
        s.data = o.data.copy()
        s.name = "src-" + o.name
        sc.objects.link(s)
        o.data.materials.clear()
        o.data.materials.append(m)
        for p in o.data.polygons:
            p.material_index = 0
    bpy.context.view_layer.layer_collection.children[sc.name].exclude = True
    return float(res["ao"][:, 3].mean())


def export(asset):
    solo(asset)
    objs = asset_objs(asset)
    # object names are unique per .blend: the antenna's trim is stored as "antenna-trim", exported as "trim"
    swap = asset == "antenna"
    if swap:
        bpy.data.objects["trim"].name = "trim__cab"
        bpy.data.objects["antenna-trim"].name = "trim"
    _select(objs)
    path = os.path.join(ROOT, "art", "export", asset + ".glb")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_yup=True, export_apply=True,
                              export_texcoords=True, export_normals=True, export_materials="EXPORT",
                              export_cameras=False, export_lights=False, use_selection=True)
    if swap:
        bpy.data.objects["trim"].name = "antenna-trim"
        bpy.data.objects["trim__cab"].name = "trim"
    return path, {o.name: tris(o) for o in objs}
