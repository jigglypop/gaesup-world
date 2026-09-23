"""Export explicitly authored LOD collections; never infer runtime semantics from mesh names."""
import json
import os
import sys
import bpy

output = os.path.abspath(sys.argv[sys.argv.index('--') + 1])
collections = [bpy.data.collections.get(f'LOD{level}') for level in range(3)]
if any(collection is None for collection in collections):
    raise RuntimeError('Author LOD0, LOD1 and LOD2 collections before export')
for level, collection in enumerate(collections):
    target = os.path.join(output, f'lod{level}.glb')
    if os.path.exists(target):
        raise RuntimeError(f'Refusing to overwrite {target}')
    bpy.ops.object.select_all(action='DESELECT')
    for obj in collection.all_objects:
        obj.hide_set(False)
        obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=target, export_format='GLB', use_selection=True)
print(json.dumps({'exported': 3, 'blender': bpy.app.version_string, 'status': 'draft', 'next': 'compression and manifest validation'}))
