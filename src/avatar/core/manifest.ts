import {
  AVATAR_SLOTS,
  BODY_REGIONS,
  HUMANOID_BONES,
  AvatarCompatibilityError,
  type AvatarManifest,
  type AvatarState,
  type AvatarEquipmentState,
  type EquipmentSlot,
} from './types';
import type { AssetRecord } from '../../core/assets/types';

const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const id = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/.test(v);
const indices = (v: unknown): boolean =>
  Array.isArray(v) &&
  v.every(
    (r: unknown) =>
      record(r) &&
      Number.isInteger(r['node']) &&
      Number(r['node']) >= 0 &&
      Number.isInteger(r['primitive']) &&
      Number(r['primitive']) >= 0,
  );
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new AvatarCompatibilityError(message);
}

export function parseAvatarManifest(value: unknown): AvatarManifest {
  assert(record(value), 'Avatar manifest must be an object');
  assert(
    value['schemaVersion'] === 1 &&
      id(value['assetId']) &&
      Number.isInteger(value['version']) &&
      Number(value['version']) > 0,
    'Invalid avatar identity/version',
  );
  assert(
    ['avatar-body', 'avatar-part', 'avatar-animation'].includes(String(value['kind'])),
    'Invalid avatar kind',
  );
  assert(AVATAR_SLOTS.includes(value['slot'] as never), 'Invalid avatar slot');
  assert(value['kind'] !== 'avatar-body' || value['slot'] === 'body', 'Body must use body slot');
  assert(value['kind'] !== 'avatar-part' || value['slot'] !== 'body', 'Part cannot use body slot');
  assert(value['rig'] === 'gaesup-humanoid-v1', 'Unsupported avatar rig');
  assert(
    Array.isArray(value['bodyArchetypes']) &&
      value['bodyArchetypes'].length > 0 &&
      value['bodyArchetypes'].every(id),
    'Invalid body archetypes',
  );
  const source = value['source'];
  assert(
    record(source) &&
      typeof source['uri'] === 'string' &&
      source['uri'].length > 0 &&
      !/^(javascript|data):/i.test(source['uri']),
    'Invalid avatar source',
  );
  assert(
    indices(value['meshes']) &&
      (value['kind'] === 'avatar-animation' || (value['meshes'] as unknown[]).length > 0),
    'Invalid mesh references',
  );
  const bones = value['bones'];
  assert(
    record(bones) &&
      HUMANOID_BONES.every((key) => Number.isInteger(bones[key]) && Number(bones[key]) >= 0),
    'Missing canonical bone mapping',
  );
  assert(
    new Set(Object.values(bones)).size === HUMANOID_BONES.length,
    'Duplicate canonical bone mapping',
  );
  const attachment = value['attachment'];
  assert(
    record(attachment) && ['skinned', 'bone', 'socket'].includes(String(attachment['mode'])),
    'Invalid attachment',
  );
  if (attachment['mode'] === 'bone')
    assert(HUMANOID_BONES.includes(attachment['bone'] as never), 'Invalid attachment bone');
  if (attachment['mode'] === 'socket')
    assert(
      ['head', 'face', 'handL', 'handR', 'back', 'waist', 'chest'].includes(
        String(attachment['socket']),
      ),
      'Invalid socket',
    );
  if (attachment['transform'] !== undefined) {
    const t = attachment['transform'];
    assert(
      record(t) &&
        ['position', 'rotation', 'scale'].every(
          (key) =>
            Array.isArray(t[key]) &&
            t[key].length === 3 &&
            t[key].every((n: unknown) => typeof n === 'number' && Number.isFinite(n)),
        ),
      'Invalid attachment transform',
    );
    assert(
      (t['scale'] as number[]).every((n) => n > 0),
      'Attachment scale must be positive',
    );
  }
  const regions = value['bodyRegions'];
  if (regions !== undefined)
    assert(
      record(regions) &&
        Object.entries(regions).every(
          ([key, refs]) => BODY_REGIONS.includes(key as never) && indices(refs),
        ),
      'Invalid body region mapping',
    );
  if (value['kind'] === 'avatar-body')
    assert(
      record(regions) &&
        BODY_REGIONS.every((key) => Array.isArray(regions[key]) && regions[key].length > 0) &&
        attachment['mode'] === 'skinned',
      'Canonical body requires all body regions',
    );
  for (const key of ['hideBodyRegions', 'conflictsWith', 'requires'] as const) {
    const list = value[key];
    const allowed =
      key === 'hideBodyRegions' ? BODY_REGIONS : AVATAR_SLOTS.filter((slot) => slot !== 'body');
    if (list !== undefined)
      assert(
        Array.isArray(list) &&
          list.every((entry: unknown) => allowed.includes(entry as never)) &&
          new Set(list).size === list.length,
        `Invalid ${key}`,
      );
  }
  if (value['lods'] !== undefined) {
    assert(Array.isArray(value['lods']), 'Invalid LOD list');
    const levels = new Set<number>();
    for (const lod of value['lods']) {
      assert(
        record(lod) &&
          Number.isInteger(lod['level']) &&
          Number(lod['level']) > 0 &&
          !levels.has(Number(lod['level'])),
        'Invalid LOD level',
      );
      assert(
        Object.keys(lod).every((key) =>
          ['level', 'source', 'meshes', 'bones', 'bodyRegions'].includes(key),
        ),
        'LOD cannot override avatar semantics',
      );
      levels.add(Number(lod['level']));
      parseAvatarManifest({ ...value, ...lod, lods: undefined });
    }
  }
  assert(
    !Array.isArray(value['conflictsWith']) || !value['conflictsWith'].includes(value['slot']),
    'A part cannot conflict with its own slot',
  );
  return JSON.parse(JSON.stringify(value)) as AvatarManifest;
}

export function avatarManifestFromRecord(asset: AssetRecord): AvatarManifest {
  const manifest = parseAvatarManifest(asset.metadata?.['avatar']);
  assert(
    manifest.assetId === asset.id && manifest.kind === asset.kind,
    'Catalog/manifest identity mismatch',
  );
  const resolveUri = (uri: string): string => {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(uri)) return uri;
    assert(asset.url, 'Relative avatar source requires a catalog URL');
    const base = new URL(asset.url, 'https://avatar.invalid/');
    const resolved = new URL(uri, base);
    return resolved.origin === 'https://avatar.invalid'
      ? `${resolved.pathname}${resolved.search}${resolved.hash}`
      : resolved.href;
  };
  manifest.source.uri = resolveUri(manifest.source.uri);
  for (const lod of manifest.lods ?? []) lod.source.uri = resolveUri(lod.source.uri);
  return manifest;
}

export function parseAvatarState(value: unknown): AvatarState {
  assert(record(value) && id(value['body']) && record(value['equipment']), 'Invalid saved avatar');
  const equipment: AvatarEquipmentState = {};
  for (const [slot, assetId] of Object.entries(value['equipment'])) {
    assert(
      slot !== 'body' && AVATAR_SLOTS.includes(slot as never) && id(assetId),
      'Equipment state must contain slots and asset IDs only',
    );
    equipment[slot as EquipmentSlot] = assetId;
  }
  assert(
    !(equipment.onepiece && (equipment.top || equipment.bottom)),
    'Conflicting saved equipment',
  );
  return Object.freeze({ body: value['body'], equipment: Object.freeze(equipment) });
}

export function resolveAvatarEquipment(
  current: AvatarEquipmentState,
  part: AvatarManifest,
): AvatarEquipmentState {
  const next = { ...current, [part.slot]: part.assetId };
  if (part.slot === 'onepiece') {
    delete next.top;
    delete next.bottom;
  }
  if (part.slot === 'top' || part.slot === 'bottom') delete next.onepiece;
  for (const slot of part.conflictsWith ?? []) delete next[slot];
  return next;
}
