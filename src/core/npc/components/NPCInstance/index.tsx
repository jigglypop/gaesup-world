import React, { Suspense, useRef, useEffect, useLayoutEffect, useMemo, useCallback, useState } from 'react';

import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { PhysicsEntity } from '@motions/entities/refs/PhysicsEntity';

import { cloneNPCFigure, disposeNPCFigure, findClip, fitNPCFigure, prepareNPCClips, type NPCClips } from './figure';
import { NPCPresence } from './NPCPresence';
import { NPCPartMeshProps, NPCInstanceProps } from './types';
import { useClipTransition } from '../../../animation/hooks/useClipTransition';
import { useSharedAnimations } from '../../../animation/hooks/useSharedAnimations';
import type { ImportedMaterialPolicy } from '../../../assets/materialPolicy';
import { CompileGate } from '../../../rendering/CompileGate';
import { castSubtreeNearShadowOnly } from '../../../rendering/sky/nearShadow';
import { useSceneToon } from '../../../rendering/useSceneToon';
import { useEngineFrame } from '../../../runtime/frame';
import { useWorldPhysicsInterpolation } from '../../../simulation/physicsContext';
import type { NPCGesture } from '../../core/NPCSimulation';
import { npcDecisionPhase, npcUnit } from '../../core/wander';
import { useNPCSimulation } from '../../hooks/useNPCSimulation';
import { useNPCStore } from '../../stores/npcStore';
import { NPCInstance as NPCInstanceData, NPCPart } from '../../types';
import { NPC_ANIMATION_FAR } from '../NPCSystem/lod';
import { useNPCView } from '../NPCSystem/views';
import './styles.css';

type PointerHandlers = {
  pointerover?: () => void;
  click?: () => void;
};
type GroupWithHandlers = THREE.Group & { __handlers?: PointerHandlers };

type NPCPartErrorBoundaryProps = NPCPartMeshProps & {
  children: React.ReactNode;
};

type NPCPartErrorBoundaryState = {
  hasError: boolean;
};

class NPCPartErrorBoundary extends React.Component<NPCPartErrorBoundaryProps, NPCPartErrorBoundaryState> {
  override state: NPCPartErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): NPCPartErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidUpdate(prevProps: NPCPartErrorBoundaryProps) {
    if (this.state.hasError && prevProps.part.url !== this.props.part.url) {
      this.setState({ hasError: false });
    }
  }

  override render() {
    if (this.state.hasError) {
      return <NPCPartFallbackMesh part={this.props.part} instanceId={this.props.instanceId} />;
    }
    return this.props.children;
  }
}

function NPCPartFallbackMesh({ part }: NPCPartMeshProps) {
  return (
    <mesh
      position={part.position || [0, 0, 0]}
      rotation={part.rotation || [0, 0, 0]}
      scale={part.scale || [1, 1, 1]}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={part.color || '#cccccc'}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function resolveNPCAssetUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('gltf/')) return `/${trimmed}`;
  return trimmed;
}

function NPCPartGltfMesh({ part, currentAnimation, transition, cullRadius, materialPolicy = 'keep', onClips, height, onFit }: NPCPartMeshProps) {
  const assetUrl = useMemo(() => resolveNPCAssetUrl(part.url), [part.url]);
  const gltf = useGLTF(assetUrl);
  const figure = useMemo(() => cloneNPCFigure(gltf.scene, materialPolicy), [gltf, materialPolicy]);
  const prepared = useMemo(() => prepareNPCClips(gltf.scene, gltf.animations), [gltf]);
  // Casts into the nearest shadow cascade only; the renderer's objects for this copy are freed when it goes.
  useLayoutEffect(() => castSubtreeNearShadowOnly(figure), [figure]);
  useEffect(() => () => disposeNPCFigure(figure), [figure]);
  useSceneToon(figure);
  const { actions } = useSharedAnimations(prepared.clips, figure, cullRadius, NPC_ANIMATION_FAR);
  useClipTransition(actions, currentAnimation, transition);
  useLayoutEffect(() => onClips?.(prepared), [onClips, prepared]);
  useLayoutEffect(() => onFit?.(height ? fitNPCFigure(gltf.scene, prepared.clips, height) : undefined), [gltf, prepared, height, onFit]);

  return (
    <primitive
      object={figure}
      dispose={null}
      position={part.position || [0, 0, 0]}
      rotation={part.rotation || [0, 0, 0]}
      scale={part.scale || [1, 1, 1]}
    />
  );
}

/**
 * A model that is still loading suspends only itself, and it shows once its pipelines are built instead of stalling
 * the frame that first draws it.
 */
function NPCModelGate({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}><CompileGate>{children}</CompileGate></Suspense>;
}

function NPCPartMesh(props: NPCPartMeshProps) {
  const { part, instanceId } = props;
  const hasUrl = !!part.url && part.url.trim() !== '';
  if (!hasUrl) return <NPCPartFallbackMesh part={part} instanceId={instanceId} />;
  return (
    <NPCPartErrorBoundary part={part} instanceId={instanceId} currentAnimation={props.currentAnimation}>
      <NPCModelGate>
        <NPCPartGltfMesh {...props} />
      </NPCModelGate>
    </NPCPartErrorBoundary>
  );
}

/** A greeting without a clip is a hop this long, in seconds, and this high, in meters. */
const HOP_SECONDS = 0.42;
const HOP_HEIGHT = 0.3;
/** Salt of an NPC's idle playback rate. */
const IDLE_RATE = 3;

/**
 * The parts of an NPC and how they move together: the stored clip, or its stance while it stops for whoever talks to
 * it; gestures it has clips for, and a hop for a greeting it has none for; a move clip paced by its speed; an idle out
 * of step with its neighbors; and the body's height fit.
 */
function NPCParts({ instance, parts, height, materialPolicy, cullRadius }: {
  instance: NPCInstanceData;
  parts: NPCPart[];
  height: number | undefined;
  materialPolicy: ImportedMaterialPolicy | undefined;
  cullRadius: number;
}) {
  const simulation = useNPCSimulation();
  const [gesture, setGesture] = useState<NPCGesture>();
  const [attending, setAttending] = useState(false);
  const [body, setBody] = useState<NPCClips>();
  const [fit, setFit] = useState<{ scale: number; y: number }>();
  const hop = useRef<THREE.Group>(null);
  const seen = useRef({ gestures: -1, at: -Infinity, attending: false, hop: -1 });
  const clearGesture = useCallback(() => setGesture(undefined), []);

  useEngineFrame('effects', (delta) => {
    const own = seen.current;
    const holding = simulation.isAttending(instance.id);
    if (holding !== own.attending) {
      own.attending = holding;
      setAttending(holding);
    }
    if (simulation.gestureRevision !== own.gestures) {
      own.gestures = simulation.gestureRevision;
      const next = simulation.getGesture(instance.id);
      // A walking NPC keeps going; a model without the clip hops for a greeting and skips the rest.
      if (next && next.at !== own.at && (holding || instance.navigation?.state !== 'moving')) {
        own.at = next.at;
        if (body && findClip(body.clips, next.clip)) setGesture(next);
        else if (next.greeting) own.hop = 0;
      }
    }
    if (own.hop < 0 || !hop.current) return;
    own.hop += delta / HOP_SECONDS;
    hop.current.position.y = own.hop < 1 ? Math.sin(own.hop * Math.PI) * HOP_HEIGHT : 0;
    if (own.hop >= 1) own.hop = -1;
  }, { label: 'npc:figure' });

  const behavior = instance.behavior;
  const stance = behavior?.idleAnimation ?? 'idle';
  const walking = instance.navigation?.state === 'moving' && !attending;
  // Walking off ends a gesture; the NPC stopped for whoever talks to it stands in its stance.
  useEffect(() => { if (walking) setGesture(undefined); }, [walking]);
  const playing = walking ? undefined : gesture;
  const base = instance.navigation?.state === 'moving' && attending ? stance : instance.currentAnimation ?? stance;
  let timeScale = 0.9 + 0.2 * npcUnit(instance.id, IDLE_RATE);
  if (walking) {
    const clip = body ? findClip(body.clips, base) : undefined;
    const authored = body && clip ? (body.groundSpeed.get(clip.name) ?? 0) * (fit?.scale ?? 1) * instance.scale[1] : 0;
    const stride = behavior?.strideSpeed ?? authored;
    const speed = instance.navigation?.speed ?? behavior?.speed ?? 0;
    timeScale = stride > 0 ? THREE.MathUtils.clamp(speed / stride, 0.5, 2) : 1;
  }
  const transition = { once: playing !== undefined, stance, phase: npcDecisionPhase(instance.id), timeScale, onFinish: clearGesture };
  const bodyPart = parts.find((part) => part.type === 'body') ?? parts[0];

  return (
    <group ref={hop}>
      <group scale={fit?.scale ?? 1} position={[0, fit?.y ?? 0, 0]}>
        {parts.map((part) => (
          <NPCPartMesh
            key={part.id}
            part={part}
            instanceId={instance.id}
            currentAnimation={playing?.clip ?? base}
            transition={transition}
            cullRadius={cullRadius}
            materialPolicy={materialPolicy}
            {...(part === bodyPart ? { onClips: setBody, height, onFit: setFit } : {})}
          />
        ))}
      </group>
    </group>
  );
}

const DEFAULT_NPC_VOLUME = {
  height: 1.8,
  radius: 0.32,
  interactionRadius: 1.6,
} as const;
/** The body capsule of a volume drawn at `scale`; the talk range stays in world meters. */
function npcCapsule(volume: { height: number; radius: number; interactionRadius: number }, scale: readonly [number, number, number]) {
  const radius = volume.radius * Math.max(scale[0], scale[2]);
  const halfHeight = Math.max(0.05, volume.height * scale[1] * 0.5 - radius);
  return { radius, height: volume.height * scale[1], halfHeight, y: halfHeight + radius, interactionRadius: Math.max(volume.interactionRadius, radius) };
}

export const NPCInstance = React.memo(function NPCInstance({ instance, isEditMode, onClick: onClickProp, onSelect }: NPCInstanceProps) {
  const simulation = useNPCSimulation();
  const onClick = useMemo(
    () => (onSelect ? () => { onClickProp?.(); onSelect(instance.id); } : onClickProp),
    [instance.id, onClickProp, onSelect],
  );
  const groupRef = useRef<GroupWithHandlers>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const entityRef = useRef<THREE.Group>(null!);
  const detachBody = useRef<(() => void) | undefined>(undefined);
  const bindBody = useCallback((body: RapierRigidBody | null) => {
    detachBody.current?.();
    rigidBodyRef.current = body;
    detachBody.current = body ? simulation.bindBody(instance.id, body) : undefined;
  }, [simulation, instance.id]);
  const pose = simulation.getPose(instance.id);
  const template = useNPCStore(
    useCallback(
      (state) => state.templates.get(instance.templateId),
      [instance.templateId]
    )
  );
  const clothingSet = useNPCStore(
    useCallback(
      (state) =>
        instance.currentClothingSetId
          ? state.clothingSets.get(instance.currentClothingSetId)
          : undefined,
      [instance.currentClothingSetId]
    )
  );
  const executeInstanceAction = useNPCStore((state) => state.executeInstanceAction);
  const updateInstance = useNPCStore((state) => state.updateInstance);

  const volume = instance.volume ?? DEFAULT_NPC_VOLUME;
  const bodyType = 'kinematicPosition';
  // A single-model NPC is culled by its entity's outer group; a part-built one registers its own visual below.
  useNPCView(instance.id, entityRef, npcCapsule(volume, instance.scale).height);

  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    const handlers = groupRef.current?.__handlers;
    if (handlers?.pointerover) handlers.pointerover();
  }, []);

  const handlePointerLeave = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);

  const runEvent = useCallback((eventType: 'onClick' | 'onHover' | 'onInteract') => {
    const event = instance.events?.find((entry) => entry.type === eventType);
    if (!event) return;

    const payload = event.payload;
    if (event.action === 'dialogue' && payload?.type === 'dialogue') {
      simulation.speak(instance.id, payload.text, payload.duration);
      return;
    }
    if (event.action === 'animation' && payload?.type === 'animation') {
      executeInstanceAction(instance.id, {
        type: 'playAnimation',
        animationId: payload.animationId,
        ...(payload.loop !== undefined ? { loop: payload.loop } : {}),
      });
      return;
    }
    if (event.action === 'custom' && payload?.type === 'custom') {
      executeInstanceAction(instance.id, {
        type: 'remember',
        key: `event:${event.id}`,
        value: payload.data,
      });
      return;
    }
    if (event.action === 'sound' && payload?.type === 'sound') {
      updateInstance(instance.id, {
        metadata: {
          ...instance.metadata,
          lastInteractionTargetId: payload.soundUrl,
        },
      });
    }
  }, [executeInstanceAction, instance.events, instance.id, instance.metadata, simulation, updateInstance]);

  // 이벤트 핸들러 바인딩은 hook 이므로 early return 보다 위에서 호출되어야 React 의 hook 순서가 일관된다.
  useEffect(() => {
    if (!instance.events || instance.events.length === 0) return;
    const mesh = groupRef.current;
    if (!mesh) return;

    const handlePointerOver = () => {
      runEvent('onHover');
    };

    const handleClick = () => {
      runEvent('onClick');
    };

    mesh.__handlers = {
      pointerover: handlePointerOver,
      click: handleClick
    };
    return () => {
      delete mesh.__handlers;
    };
  }, [instance.events, runEvent]);

  // template / clothingSet / customParts 가 변하지 않는 한 같은 배열 reference 를 유지.
  const allParts = useMemo<NPCPart[]>(() => {
    if (!template) return [];
    const parts: NPCPart[] = [...template.baseParts];
    if (clothingSet) parts.push(...clothingSet.parts);
    if (template.accessoryParts) parts.push(...template.accessoryParts);
    if (instance.customParts) {
      for (const customPart of instance.customParts) {
        const idx = parts.findIndex(p => p.type === customPart.type);
        if (idx >= 0) parts[idx] = { ...parts[idx], ...customPart };
        else parts.push(customPart);
      }
    }
    return parts;
  }, [template, clothingSet, instance.customParts]);

  if (!template) {
    return null;
  }
  const fullModelUrl = template.fullModelUrl || instance.metadata?.modelUrl;

  if (fullModelUrl) {
    const capsule = npcCapsule(volume, instance.scale);
    return (
      <NPCModelGate>
      <PhysicsEntity
        ref={bindBody}
        url={fullModelUrl}
        isActive={false}
        componentType="character"
        name={`npc-${instance.id}`}
        position={pose?.position ?? instance.position}
        rotation={pose?.rotation ?? instance.rotation}
        scale={instance.scale}
        rigidbodyType={bodyType}
        colliderSize={{ height: capsule.height, radius: capsule.radius }}
        animationCullRadius={capsule.height}
        currentAnimation={instance.currentAnimation || 'idle'}
        outerGroupRef={entityRef}
        {...(template.materialPolicy ? { materialPolicy: template.materialPolicy } : {})}
        userData={{
          instanceId: instance.id,
          templateId: instance.templateId,
          nameTag: instance.metadata?.nameTag,
          npcBrainMode: instance.brain?.mode ?? 'none',
          npcPerceptionEnabled: instance.perception?.enabled ?? false,
        }}
        colliderChildren={<CapsuleCollider sensor args={[capsule.halfHeight, capsule.interactionRadius]} position={[0, capsule.y, 0]} />}
        onCollisionEnter={() => {
          runEvent('onClick');
          if (onClick) onClick();
        }}
      >
        {isEditMode && (
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
          </mesh>
        )}
        <NPCPresence instance={instance} height={capsule.height} onInteract={() => runEvent('onInteract')} />
      </PhysicsEntity>
      </NPCModelGate>
    );
  }

  // mainPartUrl 분기 / fallback 분기는 본문이 동일하여 단일 경로로 합친다.
  const capsule = npcCapsule(volume, instance.scale);
  return (
    <RigidBody
      ref={bindBody}
      type={bodyType}
      position={pose?.position ?? instance.position}
      rotation={pose?.rotation ?? instance.rotation}
      colliders={false}
      userData={{
        instanceId: instance.id,
        templateId: instance.templateId,
        npcBrainMode: instance.brain?.mode ?? 'none',
        npcPerceptionEnabled: instance.perception?.enabled ?? false,
      }}
    >
      <CapsuleCollider args={[capsule.halfHeight, capsule.radius]} position={[0, capsule.y, 0]} />
      <CapsuleCollider
        sensor
        args={[capsule.halfHeight, capsule.interactionRadius]}
        position={[0, capsule.y, 0]}
      />
      <NPCVisual id={instance.id} height={capsule.height} bodyRef={rigidBodyRef}><group
        ref={groupRef}
        scale={instance.scale}
        {...(onClick
          ? {
              onClick: (e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                e.nativeEvent.preventDefault();
                runEvent('onClick');
                onClick();
              },
            }
          : {})}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <NPCParts instance={instance} parts={allParts} height={template.height} materialPolicy={template.materialPolicy} cullRadius={capsule.height} />

        {isEditMode && (
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
          </mesh>
        )}
      </group>
      <NPCPresence instance={instance} height={capsule.height} onInteract={() => runEvent('onInteract')} />
      </NPCVisual>
    </RigidBody>
  );
});

/** Characters never block the camera or other ray probes, matching `PhysicsEntity`. */
const INTANGIBLE = { intangible: true };

function NPCVisual({ id, height, bodyRef, children }: {
  id: string;
  height: number;
  bodyRef: React.RefObject<RapierRigidBody | null>;
  children: React.ReactNode;
}) {
  const visual = useWorldPhysicsInterpolation(bodyRef);
  useNPCView(id, visual, height);
  return <group ref={visual} userData={INTANGIBLE}>{children}</group>;
}
