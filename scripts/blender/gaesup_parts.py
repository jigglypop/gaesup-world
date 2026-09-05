"""Blender headless generator for gaesup-humanoid-v1 character parts.

Run through scripts/build-character-parts.cjs. Every generated part shares the base
body armature so the runtime skeleton contract resolves to identical/remappable.
"""
import argparse
import json
import math
import re
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

SKELETON_ID = "gaesup-humanoid-v1"
GENERATOR = "scripts/blender/gaesup_parts.py"
INSPECT_MARKER = "GAESUP_INSPECT_JSON:"
RESULT_MARKER = "GAESUP_RESULT_JSON:"

LEG_PATTERNS = [r"upleg", r"upperleg", r"thigh", r"[^a-z]leg", r"^leg", r"shin", r"calf", r"knee", r"foot", r"toe", r"ankle", r"heel"]
HIP_PATTERNS = [r"hips?$", r"pelvis"]
ARM_PATTERNS = [r"hand", r"forearm", r"lowerarm", r"upper_?arm", r"[^a-z]arm", r"^arm"]
RIGHT_SIDE_PATTERNS = [r"[._]r$", r"[._]r[._]\d+$", r"right", r"^r[._]"]
FOOT_HEIGHT_RATIO = 0.07
REFERENCE_HEIGHT_M = 1.7

PANTS_OFFSET_M = 0.01
SHOES_OFFSET_M = 0.014
SWORD_BLADE_M = (0.05, 0.012, 0.75)
SWORD_GUARD_M = (0.22, 0.03, 0.04)
SWORD_GRIP_RADIUS_M = 0.018
SWORD_GRIP_LENGTH_M = 0.2
SWORD_POMMEL_RADIUS_M = 0.028
SWORD_GUARD_Z_M = 0.12
SWORD_BLADE_Z_M = 0.14
SWORD_POMMEL_Z_M = -0.12
CYLINDER_SEGMENTS = 12
ROUGHNESS = 0.8
COORD_DECIMALS = 4

PARTS = [
    {"id": "pants_basic", "slot": "bottom", "kind": "characterPart", "region": "legs", "offset": PANTS_OFFSET_M, "color": "#3a4a6a"},
    {"id": "shoes_basic", "slot": "shoes", "kind": "characterPart", "region": "feet", "offset": SHOES_OFFSET_M, "color": "#3a2a1a"},
    {"id": "sword_basic", "slot": "weapon", "kind": "weapon", "region": "hand_right", "colors": {"steel": "#b8bcc4", "leather": "#3a2a1a"}},
]


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--body", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--url-prefix", default="gltf/parts")
    parser.add_argument("--inspect", action="store_true")
    return parser.parse_args(argv)


def matches(name, patterns):
    lowered = name.lower()
    return any(re.search(pattern, lowered) for pattern in patterns)


def classify_bones(armature):
    bones = list(armature.data.bones)
    legs = [b.name for b in bones if matches(b.name, LEG_PATTERNS)]
    hips = [b.name for b in bones if matches(b.name, HIP_PATTERNS)]
    arms_right = [b for b in bones if matches(b.name, ARM_PATTERNS) and matches(b.name, RIGHT_SIDE_PATTERNS)]
    hand = min(arms_right, key=lambda b: b.tail_local.z).name if arms_right else None
    return {"legs": legs, "hips": hips, "hand_right": hand}


def body_bounds(armature, body_meshes):
    lower = None
    upper = None
    for source in body_meshes:
        to_armature = armature.matrix_world.inverted() @ source.matrix_world
        for vertex in source.data.vertices:
            point = to_armature @ vertex.co
            lower = point.copy() if lower is None else Vector(map(min, lower, point))
            upper = point.copy() if upper is None else Vector(map(max, upper, point))
    return lower, upper


def foot_line_of(bounds):
    lower, upper = bounds
    return lower.z + (upper.z - lower.z) * FOOT_HEIGHT_RATIO


def meters_to_armature_unit(bounds):
    lower, upper = bounds
    return (upper.z - lower.z) / REFERENCE_HEIGHT_M


def bone_positions(armature, names):
    positions = {}
    for name in names:
        bone = armature.data.bones[name]
        positions[name] = {
            "head": [round(v, COORD_DECIMALS) for v in bone.head_local],
            "tail": [round(v, COORD_DECIMALS) for v in bone.tail_local],
        }
    return positions


def hex_to_rgba(value):
    clean = value.lstrip("#")
    return tuple(int(clean[i : i + 2], 16) / 255 for i in (0, 2, 4)) + (1.0,)


def make_material(name, color):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    principled = material.node_tree.nodes.get("Principled BSDF")
    if principled is not None:
        principled.inputs["Base Color"].default_value = hex_to_rgba(color)
        principled.inputs["Roughness"].default_value = ROUGHNESS
    material.diffuse_color = hex_to_rgba(color)
    return material


def load_body(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    armatures = [obj for obj in bpy.data.objects if obj.type == "ARMATURE"]
    if len(armatures) != 1:
        raise RuntimeError(f"[gaesup_parts Error]: expected exactly one armature, found {len(armatures)}")
    armature = armatures[0]
    meshes = [
        obj
        for obj in bpy.data.objects
        if obj.type == "MESH" and any(m.type == "ARMATURE" and m.object == armature for m in obj.modifiers)
    ]
    if not meshes:
        raise RuntimeError("[gaesup_parts Error]: body has no skinned meshes")
    return armature, meshes


def deselect_all():
    for obj in bpy.context.view_layer.objects:
        obj.select_set(False)


def dominant_group_name(vertex, group_names):
    best_name = None
    best_weight = 0.0
    for group in vertex.groups:
        if group.weight > best_weight:
            best_weight = group.weight
            best_name = group_names.get(group.group)
    return best_name


def extract_region(armature, body_meshes, part, region_bones, foot_line, below, unit):
    region_set = set(region_bones)
    offset = part["offset"] * unit
    pieces = []
    for source in body_meshes:
        group_names = {group.index: group.name for group in source.vertex_groups}
        to_armature = armature.matrix_world.inverted() @ source.matrix_world
        keep = set()
        for vertex in source.data.vertices:
            if dominant_group_name(vertex, group_names) not in region_set:
                continue
            height = (to_armature @ vertex.co).z
            if (below and height <= foot_line) or (not below and height > foot_line):
                keep.add(vertex.index)
        if not keep:
            continue
        duplicate = source.copy()
        duplicate.data = source.data.copy()
        duplicate.name = f"{part['id']}_{source.name}"
        bpy.context.collection.objects.link(duplicate)
        bm = bmesh.new()
        bm.from_mesh(duplicate.data)
        bm.verts.ensure_lookup_table()
        drop_faces = [face for face in bm.faces if not all(v.index in keep for v in face.verts)]
        bmesh.ops.delete(bm, geom=drop_faces, context="FACES")
        loose = [v for v in bm.verts if not v.link_faces]
        bmesh.ops.delete(bm, geom=loose, context="VERTS")
        bm.normal_update()
        for vertex in bm.verts:
            vertex.co += vertex.normal * offset
        bm.to_mesh(duplicate.data)
        bm.free()
        if len(duplicate.data.polygons) == 0:
            bpy.data.objects.remove(duplicate, do_unlink=True)
            continue
        pieces.append(duplicate)
    if not pieces:
        raise RuntimeError(
            f"[gaesup_parts Error]: region '{part['region']}' produced no faces; bones={sorted(region_set)}"
        )
    deselect_all()
    for piece in pieces:
        piece.select_set(True)
    bpy.context.view_layer.objects.active = pieces[0]
    if len(pieces) > 1:
        bpy.ops.object.join()
    result = bpy.context.view_layer.objects.active
    result.name = part["id"]
    result.data.name = part["id"]
    result.data.materials.clear()
    result.data.materials.append(make_material(f"{part['id']}_material", part["color"]))
    for polygon in result.data.polygons:
        polygon.material_index = 0
    return result


def add_box(bm, size, center):
    geometry = bmesh.ops.create_cube(bm, size=1.0)
    scale = Matrix.Diagonal((size[0], size[1], size[2], 1.0))
    for vertex in geometry["verts"]:
        vertex.co = scale @ vertex.co + Vector(center)


def build_sword_mesh(unit):
    bm = bmesh.new()
    leather = 1
    blade = tuple(value * unit for value in SWORD_BLADE_M)
    guard = tuple(value * unit for value in SWORD_GUARD_M)
    blade_center = (0.0, 0.0, SWORD_BLADE_Z_M * unit + blade[2] / 2)
    add_box(bm, blade, blade_center)
    add_box(bm, guard, (0.0, 0.0, SWORD_GUARD_Z_M * unit))
    grip = bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        segments=CYLINDER_SEGMENTS,
        radius1=SWORD_GRIP_RADIUS_M * unit,
        radius2=SWORD_GRIP_RADIUS_M * unit,
        depth=SWORD_GRIP_LENGTH_M * unit,
    )
    grip_verts = set(grip["verts"])
    pommel = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=SWORD_POMMEL_RADIUS_M * unit)
    for vertex in pommel["verts"]:
        vertex.co += Vector((0.0, 0.0, SWORD_POMMEL_Z_M * unit))
    pommel_verts = set(pommel["verts"])
    for face in bm.faces:
        if any(v in grip_verts or v in pommel_verts for v in face.verts):
            face.material_index = leather
    mesh = bpy.data.meshes.new("sword_basic")
    bm.to_mesh(mesh)
    bm.free()
    return mesh


def build_sword(armature, part, hand_bone_name, unit):
    mesh = build_sword_mesh(unit)
    mesh.materials.append(make_material("sword_steel", part["colors"]["steel"]))
    mesh.materials.append(make_material("sword_leather", part["colors"]["leather"]))
    bone = armature.data.bones[hand_bone_name]
    bone_rotation = bone.matrix_local.to_3x3().to_4x4()
    z_to_bone_y = Matrix.Rotation(-math.pi / 2, 4, "X")
    placement = Matrix.Translation(bone.tail_local) @ bone_rotation @ z_to_bone_y
    mesh.transform(placement)
    obj = bpy.data.objects.new(part["id"], mesh)
    bpy.context.collection.objects.link(obj)
    obj.parent = armature
    obj.matrix_parent_inverse = Matrix.Identity(4)
    obj.matrix_basis = Matrix.Identity(4)
    group = obj.vertex_groups.new(name=hand_bone_name)
    group.add([vertex.index for vertex in mesh.vertices], 1.0, "REPLACE")
    modifier = obj.modifiers.new("Armature", "ARMATURE")
    modifier.object = armature
    return obj


def export_part(armature, obj, filepath):
    deselect_all()
    armature.select_set(True)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    wanted = {
        "filepath": filepath,
        "export_format": "GLB",
        "use_selection": True,
        "export_apply": True,
        "export_animations": False,
        "export_skins": True,
        "export_yup": True,
        "export_materials": "EXPORT",
        "export_def_bones": False,
        "export_morph": False,
        "export_lights": False,
        "export_cameras": False,
    }
    supported = set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys())
    kwargs = {key: value for key, value in wanted.items() if key in supported}
    bpy.ops.export_scene.gltf(**kwargs)


def to_yup(vector):
    return [round(vector.x, COORD_DECIMALS), round(vector.z, COORD_DECIMALS), round(-vector.y, COORD_DECIMALS)]


def yup_bounds(lower, upper):
    corners = [to_yup(lower), to_yup(upper)]
    return {
        "min": [min(corner[axis] for corner in corners) for axis in range(3)],
        "max": [max(corner[axis] for corner in corners) for axis in range(3)],
    }


def bounds_of(obj):
    coords = [Vector(vertex.co) for vertex in obj.data.vertices]
    lower = Vector((min(c.x for c in coords), min(c.y for c in coords), min(c.z for c in coords)))
    upper = Vector((max(c.x for c in coords), max(c.y for c in coords), max(c.z for c in coords)))
    return yup_bounds(lower, upper)


def used_bones(obj):
    weighted = set()
    for vertex in obj.data.vertices:
        for group in vertex.groups:
            if group.weight > 0:
                weighted.add(group.group)
    return [group.name for group in obj.vertex_groups if group.index in weighted]


def main():
    args = parse_args()
    armature, body_meshes = load_body(args.body)
    bone_names = [bone.name for bone in armature.data.bones]
    regions = classify_bones(armature)
    bounds = body_bounds(armature, body_meshes)
    foot_line = foot_line_of(bounds)
    unit = meters_to_armature_unit(bounds)
    tracked = regions["legs"] + regions["hips"] + ([regions["hand_right"]] if regions["hand_right"] else [])
    inspection = {
        "armature": armature.name,
        "bones": bone_names,
        "meshes": [
            {"name": obj.name, "vertices": len(obj.data.vertices), "groups": [g.name for g in obj.vertex_groups]}
            for obj in body_meshes
        ],
        "regions": regions,
        "footLine": foot_line,
        "metersToUnit": unit,
        "bodyBounds": {"min": list(bounds[0]), "max": list(bounds[1])},
        "positions": bone_positions(armature, tracked),
        "blender": bpy.app.version_string,
    }
    if args.inspect:
        print(INSPECT_MARKER + json.dumps(inspection))
        return
    if regions["hand_right"] is None:
        raise RuntimeError(f"[gaesup_parts Error]: no right arm bone found in {bone_names}")
    if not regions["legs"]:
        raise RuntimeError(f"[gaesup_parts Error]: no leg bones found in {bone_names}")
    generated = []
    for part in PARTS:
        if part["region"] == "hand_right":
            obj = build_sword(armature, part, regions["hand_right"], unit)
            colors = part["colors"]
        else:
            leg_bones = regions["legs"] + regions["hips"]
            obj = extract_region(armature, body_meshes, part, leg_bones, foot_line, part["region"] == "feet", unit)
            colors = {"primary": part["color"]}
        filename = f"{part['id']}.glb"
        export_part(armature, obj, f"{args.out}/{filename}")
        generated.append(
            {
                "id": part["id"],
                "slot": part["slot"],
                "kind": part["kind"],
                "file": filename,
                "url": f"{args.url_prefix}/{filename}",
                "deformation": "skinned",
                "skeleton": SKELETON_ID,
                "colors": colors,
                "bones": used_bones(obj),
                "vertexCount": len(obj.data.vertices),
                "bounds": bounds_of(obj),
            }
        )
    manifest = {
        "version": 1,
        "skeleton": SKELETON_ID,
        "generator": {"script": GENERATOR, "blender": bpy.app.version_string},
        "body": {
            "armature": armature.name,
            "bones": bone_names,
            "handRight": regions["hand_right"],
            "footLine": foot_line,
            "metersToUnit": unit,
            "bounds": yup_bounds(bounds[0], bounds[1]),
            "regions": {"legs": regions["legs"], "hips": regions["hips"]},
        },
        "parts": generated,
    }
    with open(args.manifest, "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
        handle.write("\n")
    print(RESULT_MARKER + json.dumps({"parts": [part["file"] for part in generated]}))


main()
