import { memo, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useThree } from '@react-three/fiber';
import type * as THREE from 'three';
import { attribute, vertexColor } from 'three/tsl';
import { MeshStandardNodeMaterial } from 'three/webgpu';

import { ModelBatch } from './batch';
import { bakeModel, layoutStaticModels, mergeStaticModels, sameStaticCell, type BakedModel, type StaticCell, type StaticLayout, type StaticModelGroup } from './merge';
import { useGLTFAsset } from '../../../../assets/useGLTFAsset';
import { CompileGate } from '../../../../rendering/CompileGate';
import { castNearShadowOnly } from '../../../../rendering/sky/nearShadow';
import { weatheredSurface } from '../../../../rendering/tsl/weatherSurface';
import { rendererKind } from '../../../../rendering/webgpu';
import { useReusedByKey } from '../../../hooks/useReusedByKey';

export type { StaticModelGroup } from './merge';

type Report = (url: string, model: BakedModel | null | undefined) => void;

const materials = new Map<THREE.Side, MeshStandardNodeMaterial>();

/**
 * The material of merged cells: every vertex carries its model material's color, emission and roughness. The live
 * weather wets it and lays snow on its upward faces; that only moves shared uniforms, so it never rebuilds.
 */
function cellMaterial(side: THREE.Side): MeshStandardNodeMaterial {
  let material = materials.get(side);
  if (!material) {
    material = new MeshStandardNodeMaterial({ side, metalness: 0 });
    material.name = 'static-models';
    const surface = weatheredSurface(vertexColor().rgb, attribute('roughness', 'float'));
    material.colorNode = surface.color;
    material.roughnessNode = surface.roughness;
    material.emissiveNode = attribute('emissive', 'vec3');
    materials.set(side, material);
  }
  return material;
}

/** Loads one model and reports its bake, in its own Suspense so a model still loading hides no other. */
function BakeModel({ url, onBake }: { url: string; onBake: Report }) {
  const { scene } = useGLTFAsset(url);
  useLayoutEffect(() => {
    onBake(url, bakeModel(scene));
    return () => onBake(url, undefined);
  }, [url, scene, onBake]);
  return null;
}

const CellMesh = memo(function CellMesh({ cell }: { cell: StaticCell }) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => mergeStaticModels(cell.entries), [cell]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  useLayoutEffect(() => (cell.shadow === 'near' && ref.current ? castNearShadowOnly(ref.current) : undefined), [cell.shadow, geometry]);
  if (!geometry) return null;
  return <mesh ref={ref} geometry={geometry} material={cellMaterial(cell.side)} castShadow={cell.shadow !== 'none'} receiveShadow />;
});

/**
 * Placed GLB models outside the editor, drawn as a game engine draws static geometry. On node renderers the flat-colored
 * models of a 32 m cell with the same shadow policy and material side merge into one mesh, a draw a pass however many
 * models it holds. Models with maps or transparency, and models placed so often that their copies pass the vertex
 * budget, draw instanced (`ModelBatch`), as every model does on the classic WebGL renderer.
 */
export function StaticModels({ groups }: { groups: readonly StaticModelGroup[] }) {
  const merges = rendererKind(useThree((state) => state.gl)) !== 'webgl';
  const [models, setModels] = useState<ReadonlyMap<string, BakedModel | null>>(() => new Map());
  const report = useCallback<Report>((url, model) => setModels((known) => {
    if (model === undefined ? !known.has(url) : known.has(url) && known.get(url) === model) return known;
    const next = new Map(known);
    if (model === undefined) next.delete(url);
    else next.set(url, model);
    return next;
  }), []);
  const layout = useMemo<StaticLayout>(
    () => (merges ? layoutStaticModels(groups, models) : { cells: [], instanced: groups }),
    [merges, groups, models],
  );
  // A change regroups every model, but only the cells it touched get new objects and merge again.
  const cells = useReusedByKey(layout.cells, sameStaticCell);
  return (
    <group name="static-models">
      {merges && groups.map((group) => (
        <Suspense key={group.url} fallback={null}><BakeModel url={group.url} onBake={report} /></Suspense>
      ))}
      {cells.map((cell) => <CompileGate key={cell.key}><CellMesh cell={cell} /></CompileGate>)}
      {layout.instanced.map((group) => (
        <Suspense key={group.url} fallback={null}>
          <CompileGate><ModelBatch url={group.url} objects={group.objects} shadow={group.shadow} /></CompileGate>
        </Suspense>
      ))}
    </group>
  );
}
