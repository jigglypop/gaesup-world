"""Renders review images of figure GLBs: front, side and back in the rest pose, then three moments of each clip.

blender --background --factory-startup --python render-figure.py -- <out-dir> <figure.glb> [...]

Per figure it prints `RENDERED {"name": ..., "files": [...]}` with the images written to <out-dir>, in sheet order.
"""
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
out = Path(argv[0])
out.mkdir(parents=True, exist_ok=True)


def setup(scene):
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "TEXTURE"
    scene.render.resolution_x, scene.render.resolution_y = 360, 480
    scene.view_settings.view_transform = "Standard"
    scene.world = bpy.data.worlds.new("review")
    scene.world.color = (0.62, 0.7, 0.78)
    camera = bpy.data.objects.new("review", bpy.data.cameras.new("review"))
    camera.data.type = "ORTHO"
    scene.collection.objects.link(camera)
    scene.camera = camera
    return camera


def bounds(meshes):
    """Centre and height of the deformed vertices: the armature places a skinned body, not the mesh's own box."""
    depsgraph = bpy.context.evaluated_depsgraph_get()
    corners = []
    for obj in meshes:
        evaluated = obj.evaluated_get(depsgraph)
        corners.extend(obj.matrix_world @ vertex.co for vertex in evaluated.to_mesh().vertices)
        evaluated.to_mesh_clear()
    low = Vector([min(corner[axis] for corner in corners) for axis in range(3)])
    high = Vector([max(corner[axis] for corner in corners) for axis in range(3)])
    return (low + high) / 2, max(high.z - low.z, 1e-6)


def render(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    scene = bpy.context.scene
    # The importer's bone-shape sphere sits in glTF_not_exported; it is not part of the figure.
    meshes = [obj for obj in scene.objects if obj.type == "MESH"
              and not any(c.name.startswith("glTF_not_exported") for c in obj.users_collection)]
    armature = next((obj for obj in scene.objects if obj.type == "ARMATURE"), None)
    if armature:
        armature.data.pose_position = "REST"
        bpy.context.view_layer.update()
    camera = setup(scene)
    center, height = bounds(meshes)
    files = []

    def shoot(label, yaw):
        """Orthographic view from `yaw` degrees around the figure; 0 looks at its front (glTF +Z is Blender -Y)."""
        angle = math.radians(yaw)
        camera.location = center + Vector((math.sin(angle), -math.cos(angle), 0)) * height * 4
        camera.rotation_euler = (math.radians(90), 0, angle)
        camera.data.ortho_scale = height * 1.15
        name = f"{path.stem}-{label}.png"
        scene.render.filepath = str(out / name)
        bpy.ops.render.render(write_still=True)
        files.append(name)

    for label, yaw in (("front", 0), ("side", 90), ("back", 180)):
        shoot(label, yaw)
    if armature:
        armature.data.pose_position = "POSE"
        armature.animation_data_create()
        for action in list(bpy.data.actions):
            armature.animation_data.action = action
            if getattr(action, "slots", None):
                armature.animation_data.action_slot = action.slots[0]
            start, end = (int(frame) for frame in action.frame_range)
            for index in range(3):
                scene.frame_set(start + (end - start) * index // 3)
                shoot(f"{''.join(ch for ch in action.name if ch.isalnum())[:24]}-{index}", 25)
    print("RENDERED " + json.dumps({"name": path.stem, "files": files}), flush=True)


for value in argv[1:]:
    render(Path(value))
