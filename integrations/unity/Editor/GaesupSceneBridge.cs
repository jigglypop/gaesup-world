using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Gaesup.World
{
    public static class GaesupSceneBridge
    {
        [Serializable] public sealed class SceneData
        {
            public string format = "gaesup-unity-scene";
            public int version = 1;
            public string id;
            public string name;
            public ObjectData[] objects;
        }

        [Serializable] public sealed class ObjectData
        {
            public string id, name, parentId, componentsJson, layer;
            public float[] position, rotation, scale;
            public string[] tags;
        }

        [MenuItem("Tools/Gaesup World/Import Scene JSON")]
        public static void Import()
        {
            var file = EditorUtility.OpenFilePanel("Import Gaesup scene", "", "json");
            if (string.IsNullOrEmpty(file)) return;
            var data = JsonUtility.FromJson<SceneData>(File.ReadAllText(file));
            if (data == null || data.format != "gaesup-unity-scene" || data.version != 1 || data.objects == null)
                throw new InvalidDataException("Expected gaesup-unity-scene version 1.");
            var definitions = new Dictionary<string, ObjectData>();
            foreach (var item in data.objects)
            {
                if (item == null || string.IsNullOrEmpty(item.id) || definitions.ContainsKey(item.id))
                    throw new InvalidDataException("Missing or duplicate object ID.");
                ValidateVector(item.position, 3); ValidateVector(item.rotation, 4); ValidateVector(item.scale, 3);
                var rotation = new Quaternion(item.rotation[0], item.rotation[1], item.rotation[2], item.rotation[3]);
                if (Quaternion.Dot(rotation, rotation) < 1e-12f) throw new InvalidDataException("Zero quaternion.");
                definitions.Add(item.id, item);
            }
            foreach (var item in data.objects)
            {
                var seen = new HashSet<string> { item.id };
                var parent = item.parentId;
                while (!string.IsNullOrEmpty(parent))
                {
                    if (!definitions.ContainsKey(parent) || !seen.Add(parent))
                        throw new InvalidDataException("Missing parent or hierarchy cycle.");
                    parent = definitions[parent].parentId;
                }
            }
            var group = Undo.GetCurrentGroup();
            Undo.SetCurrentGroupName("Import Gaesup scene");
            var root = new GameObject(string.IsNullOrEmpty(data.name) ? data.id : data.name);
            Undo.RegisterCreatedObjectUndo(root, "Import Gaesup scene");
            root.AddComponent<GaesupSceneObject>().objectId = data.id;
            var objects = new Dictionary<string, GameObject>();
            foreach (var item in data.objects)
            {
                var obj = new GameObject(item.name);
                Undo.RegisterCreatedObjectUndo(obj, "Import Gaesup object");
                var metadata = obj.AddComponent<GaesupSceneObject>();
                metadata.objectId = item.id;
                metadata.componentsJson = item.componentsJson ?? "[]";
                metadata.sceneTags = item.tags ?? new string[0];
                metadata.sceneLayer = item.layer ?? "";
                objects.Add(item.id, obj);
            }
            foreach (var item in data.objects)
            {
                var transform = objects[item.id].transform;
                transform.SetParent(string.IsNullOrEmpty(item.parentId) ? root.transform : objects[item.parentId].transform, false);
                transform.localPosition = V3(item.position);
                transform.localRotation = new Quaternion(item.rotation[0], item.rotation[1], item.rotation[2], item.rotation[3]).normalized;
                transform.localScale = V3(item.scale);
            }
            Undo.CollapseUndoOperations(group);
            Selection.activeGameObject = root;
        }

        [MenuItem("Tools/Gaesup World/Export Selected Children as Scene JSON")]
        public static void Export()
        {
            var root = Selection.activeTransform;
            if (root == null) throw new InvalidOperationException("Select a scene container first.");
            var file = EditorUtility.SaveFilePanel("Export Gaesup scene", "", "unity-scene.json", "json");
            if (string.IsNullOrEmpty(file)) return;
            var transforms = root.GetComponentsInChildren<Transform>(true);
            var ids = new Dictionary<Transform, string>();
            var used = new HashSet<string>();
            foreach (var transform in transforms)
            {
                if (transform == root) continue;
                var metadata = transform.GetComponent<GaesupSceneObject>();
                if (metadata == null) metadata = Undo.AddComponent<GaesupSceneObject>(transform.gameObject);
                var id = metadata.objectId;
                if (string.IsNullOrEmpty(id) || !used.Add(id))
                {
                    Undo.RecordObject(metadata, "Assign Gaesup ID");
                    id = Guid.NewGuid().ToString(); used.Add(id); metadata.objectId = id;
                    EditorUtility.SetDirty(metadata);
                }
                ids.Add(transform, id);
            }
            var objects = new List<ObjectData>();
            foreach (var transform in transforms)
            {
                if (transform == root) continue;
                var metadata = transform.GetComponent<GaesupSceneObject>();
                var q = transform.localRotation;
                objects.Add(new ObjectData {
                    id = ids[transform], name = transform.name,
                    parentId = transform.parent == root ? "" : ids[transform.parent],
                    position = Array(transform.localPosition), rotation = new[] { q.x, q.y, q.z, q.w },
                    scale = Array(transform.localScale), componentsJson = metadata.componentsJson,
                    tags = metadata.sceneTags, layer = metadata.sceneLayer
                });
            }
            var rootMetadata = root.GetComponent<GaesupSceneObject>();
            var sceneId = rootMetadata != null && !string.IsNullOrEmpty(rootMetadata.objectId) ? rootMetadata.objectId : root.name;
            File.WriteAllText(file, JsonUtility.ToJson(new SceneData { id = sceneId, name = root.name, objects = objects.ToArray() }, true));
        }

        private static Vector3 V3(float[] v) => new Vector3(v[0], v[1], v[2]);
        private static float[] Array(Vector3 v) => new[] { v.x, v.y, v.z };
        private static void ValidateVector(float[] v, int length)
        {
            if (v == null || v.Length != length) throw new InvalidDataException("Invalid transform array.");
            foreach (var n in v) if (float.IsNaN(n) || float.IsInfinity(n)) throw new InvalidDataException("Non-finite transform.");
        }
    }
}
