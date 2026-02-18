import React, { FC, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { shaderMaterial, useTexture } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { weightFromDistance } from "@core/utils/sfe";
import { FLAG_STYLE_META, FlagStyle } from "../../../types";

import fragmentShader from "./frag.glsl";
import { FlagBatchProps, FlagMeshProps } from "./type";
import vertexShader from "./vert.glsl";

const FlagMaterial = shaderMaterial(
  {
    map: null as THREE.Texture | null,
    time: 0,
    windStrength: 1.0,
    transmission: 0.05,
    envMapIntensity: 1,
  },
  vertexShader,
  fragmentShader,
);

extend({ FlagMaterial });

type FlagUniforms = { time: number; windStrength: number };

let _fallbackTex: THREE.Texture | null = null;
function getFallbackTexture(): THREE.Texture {
  if (_fallbackTex) return _fallbackTex;
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 4;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#cc2222";
  ctx.fillRect(0, 0, 4, 4);
  _fallbackTex = new THREE.CanvasTexture(c);
  _fallbackTex.needsUpdate = true;
  return _fallbackTex;
}

// ---------------------------------------------------------------------------
// Single flag (standalone, non-batched)
// ---------------------------------------------------------------------------

function FlagWithTexture({
  geometry, textureUrl, lod, center, windStrength = 1.0, ...meshProps
}: Omit<FlagMeshProps, "pamplet_url"> & { textureUrl: string }) {
  const materialRef = useRef<THREE.Material>(null!);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const centerRef = useRef(new THREE.Vector3());
  const lastVisibleRef = useRef(true);
  const lodAccumRef = useRef(0);
  const texture = useTexture(textureUrl);

  useEffect(() => {
    if (center) centerRef.current.set(center[0], center[1], center[2]);
  }, [center]);

  useFrame((state, delta) => {
    if (lod) {
      const near = lod.near ?? 30;
      const far = lod.far ?? 180;
      const str = lod.strength ?? 4;
      lodAccumRef.current += Math.max(0, delta);
      if (lodAccumRef.current >= (lastVisibleRef.current ? 0.2 : 0.5)) {
        lodAccumRef.current = 0;
        if (!center && meshRef.current) meshRef.current.getWorldPosition(centerRef.current);
        const w = weightFromDistance(state.camera.position.distanceTo(centerRef.current), near, far, str);
        const vis = w > 0;
        if (vis !== lastVisibleRef.current) {
          lastVisibleRef.current = vis;
          if (meshRef.current) meshRef.current.visible = vis;
        }
      }
      if (!lastVisibleRef.current) return;
    }
    const u = materialRef.current as unknown as FlagUniforms;
    u.time = state.clock.elapsedTime * 5;
    u.windStrength = windStrength;
  });

  useEffect(() => () => { materialRef.current?.dispose(); }, [texture]);

  return (
    <mesh ref={meshRef} geometry={geometry} {...meshProps}>
      <flagMaterial ref={materialRef} map={texture} transmission={0.05}
        windStrength={windStrength} envMapIntensity={1} side={THREE.DoubleSide} transparent />
    </mesh>
  );
}

function FlagWithFallback({
  geometry, windStrength = 1.0, ...meshProps
}: Omit<FlagMeshProps, "pamplet_url">) {
  const materialRef = useRef<THREE.Material>(null!);
  const fallbackTex = useMemo(() => getFallbackTexture(), []);

  useFrame((state) => {
    const u = materialRef.current as unknown as FlagUniforms;
    u.time = state.clock.elapsedTime * 5;
    u.windStrength = windStrength;
  });

  return (
    <mesh geometry={geometry} {...meshProps}>
      <flagMaterial ref={materialRef} map={fallbackTex} transmission={0.05}
        windStrength={windStrength} envMapIntensity={1} side={THREE.DoubleSide} transparent />
    </mesh>
  );
}

export const FlagMesh: FC<FlagMeshProps> = ({ pamplet_url, ...rest }) => {
  if (pamplet_url) return <FlagWithTexture textureUrl={pamplet_url} {...rest} />;
  return <FlagWithFallback {...rest} />;
};

// ---------------------------------------------------------------------------
// Batched rendering - InstancedMesh for poles + cloths
// ---------------------------------------------------------------------------

const _poleMat = new THREE.MeshStandardMaterial({ color: "#8B4513" });
const _frameMat = new THREE.MeshStandardMaterial({ color: "#444444", metalness: 0.6, roughness: 0.3 });
const _dummy = new THREE.Object3D();

type FlagEntry = {
  x: number; y: number; z: number;
  flagWidth: number;
  flagHeight: number;
  style: FlagStyle;
  textureUrl: string;
};

// --- Pole instancing per style ---

function buildPoleMatrices(entries: FlagEntry[]): THREE.Matrix4[] {
  const matrices: THREE.Matrix4[] = [];
  for (const e of entries) {
    const meta = FLAG_STYLE_META[e.style];
    switch (meta.poleType) {
      case "side": {
        const h = e.flagHeight + 2.5;
        _dummy.position.set(e.x, e.y + h / 2, e.z);
        _dummy.scale.set(1, h, 1);
        _dummy.updateMatrix();
        matrices.push(_dummy.matrix.clone());
        break;
      }
      case "top": {
        const h = e.flagHeight + 1.5;
        _dummy.position.set(e.x, e.y + h + 0.025, e.z);
        _dummy.rotation.set(0, 0, Math.PI / 2);
        _dummy.scale.set(1, e.flagWidth, 1);
        _dummy.updateMatrix();
        matrices.push(_dummy.matrix.clone());
        _dummy.rotation.set(0, 0, 0);
        break;
      }
      case "frame": {
        const h = e.flagHeight + 0.5;
        // left
        _dummy.position.set(e.x - e.flagWidth / 2, e.y + h / 2, e.z);
        _dummy.scale.set(1, h, 1);
        _dummy.updateMatrix();
        matrices.push(_dummy.matrix.clone());
        // right
        _dummy.position.set(e.x + e.flagWidth / 2, e.y + h / 2, e.z);
        _dummy.updateMatrix();
        matrices.push(_dummy.matrix.clone());
        // top bar
        _dummy.position.set(e.x, e.y + h, e.z);
        _dummy.rotation.set(0, 0, Math.PI / 2);
        _dummy.scale.set(1, e.flagWidth + 0.05, 1);
        _dummy.updateMatrix();
        matrices.push(_dummy.matrix.clone());
        _dummy.rotation.set(0, 0, 0);
        // bottom bar
        _dummy.position.set(e.x, e.y + 0.025, e.z);
        _dummy.rotation.set(0, 0, Math.PI / 2);
        _dummy.scale.set(1, e.flagWidth + 0.05, 1);
        _dummy.updateMatrix();
        matrices.push(_dummy.matrix.clone());
        _dummy.rotation.set(0, 0, 0);
        break;
      }
      case "both": {
        const h = e.flagHeight + 2.5;
        // left pole
        _dummy.position.set(e.x - e.flagWidth / 2, e.y + h / 2, e.z);
        _dummy.scale.set(1, h, 1);
        _dummy.updateMatrix();
        matrices.push(_dummy.matrix.clone());
        // right pole
        _dummy.position.set(e.x + e.flagWidth / 2, e.y + h / 2, e.z);
        _dummy.updateMatrix();
        matrices.push(_dummy.matrix.clone());
        break;
      }
    }
  }
  return matrices;
}

function PoleBatch({ entries }: { entries: FlagEntry[] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const geometry = useMemo(() => new THREE.BoxGeometry(0.05, 1, 0.05), []);

  const matrices = useMemo(() => buildPoleMatrices(entries), [entries]);
  const count = matrices.length;
  const capacity = useMemo(() => Math.max(1, count), [count]);

  const isFrame = entries.some((e) => e.style === "panel");
  const mat = isFrame ? _frameMat : _poleMat;

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.count = count;
    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, matrices[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices, count]);

  useEffect(() => () => { geometry.dispose(); }, [geometry]);

  if (count === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, mat, capacity]} />;
}

// --- Cloth instancing per texture group ---

function ClothBatchGroup({
  entries, textureUrl, windStrength,
}: {
  entries: FlagEntry[];
  textureUrl: string;
  windStrength: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const materialRef = useRef<THREE.Material>(null!);
  const count = entries.length;
  const capacity = useMemo(() => Math.max(1, count), [count]);

  const wGeo = entries[0]?.flagWidth ?? 1.5;
  const hGeo = entries[0]?.flagHeight ?? 1.0;
  const segsX = windStrength > 0 ? 16 : 1;
  const segsY = windStrength > 0 ? 8 : 1;
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(wGeo, hGeo, segsX, segsY),
    [wGeo, hGeo, segsX, segsY],
  );

  const texture = textureUrl
    ? useTexture(textureUrl)
    : useMemo(() => getFallbackTexture(), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.count = count;
    for (let i = 0; i < count; i++) {
      const e = entries[i];
      const meta = FLAG_STYLE_META[e.style];
      let cx = e.x;
      let cy = e.y;
      switch (meta.poleType) {
        case "side":
          cx = e.x + e.flagWidth / 2;
          cy = e.y + e.flagHeight + 2.5 - e.flagHeight / 2;
          break;
        case "top":
          cy = e.y + e.flagHeight + 1.5 - e.flagHeight / 2;
          break;
        case "frame":
          cy = e.y + (e.flagHeight + 0.5) / 2 + 0.025;
          break;
        case "both":
          cy = e.y + e.flagHeight + 2.5 - e.flagHeight / 2;
          break;
      }
      _dummy.position.set(cx, cy, e.z);
      _dummy.scale.set(e.flagWidth / wGeo, e.flagHeight / hGeo, 1);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [entries, count, wGeo, hGeo]);

  useFrame((state) => {
    const u = materialRef.current as unknown as FlagUniforms;
    u.time = state.clock.elapsedTime * 5;
    u.windStrength = windStrength;
  });

  useEffect(() => () => { geometry.dispose(); }, [geometry]);

  if (count === 0) return null;
  return (
    <instancedMesh ref={ref} args={[geometry, undefined!, capacity]} frustumCulled={false}>
      <flagMaterial ref={materialRef} map={texture} transmission={0.05}
        windStrength={windStrength} envMapIntensity={1} side={THREE.DoubleSide} transparent />
    </instancedMesh>
  );
}

// --- Main batch component ---

export const FlagBatch = React.memo(function FlagBatch({ flags }: FlagBatchProps) {
  const entries: FlagEntry[] = useMemo(() =>
    flags.map((f) => ({
      x: f.position.x,
      y: f.position.y,
      z: f.position.z,
      flagWidth: f.objectConfig?.flagWidth ?? 1.5,
      flagHeight: f.objectConfig?.flagHeight ?? 1.0,
      style: (f.objectConfig?.flagStyle ?? "flag") as FlagStyle,
      textureUrl: f.objectConfig?.flagTexture ?? "",
    })),
    [flags],
  );

  const groups = useMemo(() => {
    const map = new Map<string, FlagEntry[]>();
    for (const e of entries) {
      const key = `${e.textureUrl}|${e.style}`;
      let arr = map.get(key);
      if (!arr) { arr = []; map.set(key, arr); }
      arr.push(e);
    }
    return Array.from(map.entries());
  }, [entries]);

  return (
    <>
      <PoleBatch entries={entries} />
      {groups.map(([key, grp]) => {
        const style = grp[0].style;
        const ws = FLAG_STYLE_META[style].windStrength;
        const tex = grp[0].textureUrl;
        return (
          <ClothBatchGroup
            key={key}
            entries={grp}
            textureUrl={tex}
            windStrength={ws}
          />
        );
      })}
    </>
  );
});
