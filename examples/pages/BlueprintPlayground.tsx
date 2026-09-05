import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import { useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { CapsuleCollider, Physics, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Box3, Group, Skeleton, SkinnedMesh, Vector3 } from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { useBlueprintEntity } from 'gaesup-world';
import { BlueprintConverter, type BlueprintMovementInput, WARRIOR_BLUEPRINT } from 'gaesup-world/blueprints';
import './styles/BlueprintEditorPage.css';

const CHARACTER_RADIUS = 0.3;
const CHARACTER_HALF_HEIGHT = 0.6;
const GROUND_MARGIN = 0.08;
const WARRIOR_DEFINITION = new BlueprintConverter().convert(WARRIOR_BLUEPRINT);
const MOVEMENT_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space']);
const TOUCH_CONTROLS = [['KeyW', '앞으로'], ['KeyA', '왼쪽으로'], ['KeyS', '뒤로'], ['KeyD', '오른쪽으로'], ['ShiftLeft', '달리기'], ['Space', '점프']] as const;

function PlaygroundCharacter({ keys, touches }: { keys: Set<string>; touches: Set<string> }) {
  const body = useRef<RapierRigidBody>(null!);
  const modelGroup = useRef<Group>(null!);
  const { scene, animations } = useGLTF('/gltf/ally_body.glb', '/draco/');
  const model = useMemo(() => {
    const root = SkeletonUtils.clone(scene);
    const bounds = new Box3().setFromObject(root);
    const size = bounds.getSize(new Vector3());
    const scale = (CHARACTER_HALF_HEIGHT + CHARACTER_RADIUS) * 2 / Math.max(size.y, 0.001);
    const skeletons = new Set<Skeleton>();
    root.traverse(object => { if (object instanceof SkinnedMesh) skeletons.add(object.skeleton); });
    return { root, scale, offset: -CHARACTER_HALF_HEIGHT - CHARACTER_RADIUS - bounds.min.y * scale, skeletons };
  }, [scene]);
  const animationClips = useMemo(() => Object.fromEntries(animations.map(clip => [clip.name, clip])), [animations]);
  const { world, rapier } = useRapier();
  const [ray] = useState(() => new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 }));
  const input = useRef<BlueprintMovementInput>({ isGrounded: false });
  const pressed = (code: string) => keys.has(code) || touches.has(code);
  useBlueprintEntity({
    blueprint: WARRIOR_DEFINITION,
    rigidBodyRef: body,
    innerGroupRef: modelGroup,
    animationClips,
    getMovementInput: () => {
      const rigidBody = body.current;
      if (!rigidBody) return undefined;
      const position = rigidBody.translation();
      ray.origin.x = position.x;
      ray.origin.y = position.y;
      ray.origin.z = position.z;
      const hit = world.castRayAndGetNormal(ray, CHARACTER_HALF_HEIGHT + CHARACTER_RADIUS + GROUND_MARGIN, true, rapier.QueryFilterFlags.EXCLUDE_SENSORS, undefined, undefined, rigidBody);
      const current = input.current;
      current.isGrounded = Boolean(hit && hit.normal.y > 0.7 && rigidBody.linvel().y <= 0.1);
      current.forward = pressed('KeyW') || pressed('ArrowUp');
      current.backward = pressed('KeyS') || pressed('ArrowDown');
      current.leftward = pressed('KeyA') || pressed('ArrowLeft');
      current.rightward = pressed('KeyD') || pressed('ArrowRight');
      current.run = pressed('ShiftLeft') || pressed('ShiftRight');
      current.jump = pressed('Space');
      return current;
    },
  });
  useEffect(() => () => {
    for (const skeleton of model.skeletons) skeleton.dispose();
  }, [model]);
  return (
    <RigidBody ref={body} position={[0, 1, 0]} colliders={false} enabledRotations={[false, false, false]} mass={WARRIOR_BLUEPRINT.physics.mass}>
      <CapsuleCollider args={[CHARACTER_HALF_HEIGHT, CHARACTER_RADIUS]} />
      <group ref={modelGroup}>
        <group position={[0, model.offset, 0]} scale={model.scale}>
          <primitive object={model.root} dispose={null} />
        </group>
      </group>
    </RigidBody>
  );
}

export function BlueprintPlayground() {
  const [keys] = useState(() => new Set<string>());
  const [touches] = useState(() => new Set<string>());
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const clearInput = () => { keys.clear(); touches.clear(); };
    window.addEventListener('blur', clearInput);
    return () => { window.removeEventListener('blur', clearInput); clearInput(); };
  }, [keys, touches]);
  return (
    <section className="blueprint-playground">
      <p>전사 이동 체험 · 화면을 선택한 뒤 방향키 또는 W·A·S·D로 이동하고, Shift로 달리고, Space로 점프하세요. 아래 조작 버튼을 누르고 있어도 됩니다.</p>
      <button type="button" onClick={() => { keys.clear(); touches.clear(); setAttempt(value => value + 1); }}>처음 위치로</button>
      <div
        className="blueprint-playground__viewport"
        tabIndex={0}
        role="group"
        aria-label="전사 이동 체험 화면"
        onPointerDown={event => event.currentTarget.focus()}
        onBlur={() => keys.clear()}
        onKeyDown={event => { if (MOVEMENT_KEYS.has(event.code)) { event.preventDefault(); keys.add(event.code); } }}
        onKeyUp={event => { if (MOVEMENT_KEYS.has(event.code)) { event.preventDefault(); keys.delete(event.code); } }}
      >
        <Canvas camera={{ position: [0, 12, 18], fov: 50 }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} intensity={2} />
          <Suspense fallback={null}>
            <Physics>
              <PlaygroundCharacter key={attempt} keys={keys} touches={touches} />
              <RigidBody type="fixed" position={[0, -0.5, 0]}>
                <mesh><boxGeometry args={[30, 1, 30]} /><meshStandardMaterial color="#293b48" /></mesh>
              </RigidBody>
            </Physics>
          </Suspense>
        </Canvas>
      </div>
      <div className="blueprint-playground__controls" role="group" aria-label="터치 이동 조작">
        {TOUCH_CONTROLS.map(([code, label]) => (
          <button
            key={code}
            style={{ gridArea: code }}
            type="button"
            onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); touches.add(code); }}
            onPointerUp={() => touches.delete(code)}
            onPointerCancel={() => touches.delete(code)}
            onLostPointerCapture={() => touches.delete(code)}
            onBlur={() => touches.delete(code)}
            onKeyDown={event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); touches.add(code); } }}
            onKeyUp={event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); touches.delete(code); } }}
          >{label}</button>
        ))}
      </div>
    </section>
  );
}
