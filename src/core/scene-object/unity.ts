import { createSceneDocument } from './core';
import { parseSceneDocument } from './serialization';
import { sceneEulerToQuaternion, sceneQuaternionToEuler } from './transforms';
import type { SceneQuaternion } from './transforms';
import type { SceneDocument, SceneVector3 } from './types';

export type UnitySceneObject = {
  id: string;
  name: string;
  parentId: string;
  position: SceneVector3;
  rotation: SceneQuaternion;
  scale: SceneVector3;
  componentsJson: string;
  tags: string[];
  layer: string;
};
export type UnitySceneDocument = {
  format: 'gaesup-unity-scene';
  version: 1;
  id: string;
  name: string;
  objects: UnitySceneObject[];
};

const clean = (value: number) => value === 0 ? 0 : value;
const reflectPosition = ([x, y, z]: SceneVector3): SceneVector3 => [x, y, clean(-z)];
const reflectRotation = ([x, y, z, w]: SceneQuaternion): SceneQuaternion => [clean(-x), clean(-y), z, w];

/** Meter units, local transforms; reflect Z between right-handed scene and Unity coordinates. */
export function exportUnityScene(document: SceneDocument): UnitySceneDocument {
  const parsed = parseSceneDocument(document);
  if (!parsed.ok || !parsed.document) throw new TypeError('Invalid scene document.');
  return {
    format: 'gaesup-unity-scene', version: 1, id: document.id, name: document.name ?? '',
    objects: parsed.document.objects.map((object) => ({
      id: object.id, name: object.name, parentId: object.parentId ?? '',
      position: reflectPosition(object.transform.position),
      rotation: reflectRotation(sceneEulerToQuaternion(object.transform.rotation)),
      scale: [...object.transform.scale], componentsJson: JSON.stringify(object.components),
      tags: [...object.tags], layer: object.layer ?? '',
    })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function vector(value: unknown, length: number): value is number[] {
  return Array.isArray(value) && value.length === length && value.every((n: unknown) => typeof n === 'number' && Number.isFinite(n));
}

export function importUnityScene(input: unknown): SceneDocument {
  const value: unknown = typeof input === 'string' ? JSON.parse(input) : input;
  if (!isRecord(value) || value['format'] !== 'gaesup-unity-scene' || value['version'] !== 1
    || typeof value['id'] !== 'string' || typeof value['name'] !== 'string' || !Array.isArray(value['objects'])) {
    throw new TypeError('Invalid Unity scene interchange document.');
  }
  const objects = value['objects'].map((entry: unknown) => {
    if (!isRecord(entry) || !['id', 'name', 'parentId', 'componentsJson', 'layer'].every((key) => typeof entry[key] === 'string')
      || !vector(entry['position'], 3) || !vector(entry['rotation'], 4) || !vector(entry['scale'], 3)
      || !Array.isArray(entry['tags']) || !entry['tags'].every((tag: unknown) => typeof tag === 'string')) {
      throw new TypeError('Invalid Unity scene object.');
    }
    const components: unknown = JSON.parse(entry['componentsJson'] as string);
    if (!Array.isArray(components)) throw new TypeError('Invalid Unity component metadata.');
    return {
      id: entry['id'], name: entry['name'], ...(entry['parentId'] ? { parentId: entry['parentId'] } : {}),
      transform: {
        position: reflectPosition(entry['position'] as unknown as SceneVector3),
        rotation: sceneQuaternionToEuler(reflectRotation(entry['rotation'] as unknown as SceneQuaternion)).map(clean),
        scale: entry['scale'].map(clean),
      }, components, tags: entry['tags'], ...(entry['layer'] ? { layer: entry['layer'] } : {}),
    };
  });
  const parsed = parseSceneDocument({ version: 1, id: value['id'], ...(value['name'] ? { name: value['name'] } : {}), objects });
  if (!parsed.ok || !parsed.document) throw new TypeError(parsed.issues.map((issue) => issue.message).join(' '));
  return createSceneDocument(parsed.document);
}
