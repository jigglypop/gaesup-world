"""Import a candidate into a reproducible Blender working file, without claiming rig approval."""
import bpy
import json
import os
import sys

source, output = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source)
meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
if not meshes:
    raise RuntimeError('Candidate contains no meshes')
for obj in meshes:
    obj.data.calc_loop_triangles()
os.makedirs(output, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(output, 'source.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(output, 'preview.glb'), export_format='GLB')
report = {
    'blender': bpy.app.version_string,
    'meshes': len(meshes),
    'triangles': sum(len(obj.data.loop_triangles) for obj in meshes),
    'armatures': sum(obj.type == 'ARMATURE' for obj in bpy.context.scene.objects),
    'status': 'imported-draft',
    'rigApproval': 'not-validated',
}
with open(os.path.join(output, 'inspection.json'), 'x', encoding='utf8') as file:
    json.dump(report, file, indent=2)
