import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';

import { SCENE_COMPONENT_TYPES } from '../../../components';
import { createSceneComponent, createSceneDocument } from '../../../core';
import type { CreateSceneObjectInput } from '../../../types';
import { SceneObjectBody } from '../index';

type MockProps = Record<string, unknown> & { children?: ReactNode };
type CollisionHandler = (payload: object) => void;

const mockBodies: MockProps[] = [];
const mockColliders: Array<{ shape: string; props: MockProps }> = [];

jest.mock('@react-three/rapier', () => ({
  RigidBody: (props: MockProps) => {
    mockBodies.push(props);
    return props.children ?? null;
  },
  CuboidCollider: (props: MockProps) => {
    mockColliders.push({ shape: 'box', props });
    return null;
  },
  BallCollider: (props: MockProps) => {
    mockColliders.push({ shape: 'sphere', props });
    return null;
  },
  CapsuleCollider: (props: MockProps) => {
    mockColliders.push({ shape: 'capsule', props });
    return null;
  },
}));

function createObject(input: CreateSceneObjectInput) {
  return createSceneDocument({ id: 'scene', objects: [input] }).objects[0]!;
}

function handler(name: string): CollisionHandler {
  return mockBodies[0]![name] as CollisionHandler;
}

describe('SceneObjectBody', () => {
  beforeEach(() => {
    mockBodies.length = 0;
    mockColliders.length = 0;
  });

  test('트리거 박스를 레이어 충돌 그룹으로 만들고 물리 이벤트를 상대 오브젝트 ID와 함께 전달한다', () => {
    const onPhysicsEvent = jest.fn();
    const zone = createObject({
      id: 'zone',
      layer: 'interactable',
      transform: { position: [1, 2, 3] },
      components: [createSceneComponent({
        type: SCENE_COMPONENT_TYPES.collider,
        data: { shape: 'box', size: [2, 4, 6], trigger: true },
      })],
    });
    render(
      <SceneObjectBody object={zone} collisionGroups={new Map([['interactable', 123]])} onPhysicsEvent={onPhysicsEvent}>
        <span data-testid="visual" />
      </SceneObjectBody>,
    );

    expect(screen.getByTestId('visual')).toBeTruthy();
    expect(mockBodies[0]).toMatchObject({
      type: 'fixed',
      colliders: false,
      position: [1, 2, 3],
      userData: { sceneObjectId: 'zone' },
    });
    expect(mockColliders).toEqual([
      { shape: 'box', props: { args: [1, 2, 3], sensor: true, collisionGroups: 123 } },
    ]);
    handler('onIntersectionEnter')({ other: { rigidBodyObject: { userData: { sceneObjectId: 'player' }, name: 'x' } } });
    handler('onIntersectionExit')({ other: { rigidBodyObject: { userData: {}, name: 'npc-1' } } });
    handler('onCollisionEnter')({ other: {} });
    expect(onPhysicsEvent.mock.calls).toEqual([
      ['triggerEnter', 'zone', 'player'],
      ['triggerExit', 'zone', 'npc-1'],
      ['collisionEnter', 'zone', ''],
    ]);
  });

  test('강체 설정과 캡슐 크기를 Rapier 속성으로 옮긴다', () => {
    const crate = createObject({
      id: 'crate',
      components: [
        createSceneComponent({
          type: SCENE_COMPONENT_TYPES.rigidBody,
          data: { type: 'kinematic', mass: 3, gravityScale: 0, lockRotations: true },
        }),
        createSceneComponent({
          type: SCENE_COMPONENT_TYPES.collider,
          data: { shape: 'capsule', height: 2, radius: 0.5 },
        }),
      ],
    });
    render(<SceneObjectBody object={crate} />);

    expect(mockBodies[0]).toMatchObject({ type: 'kinematicPosition', gravityScale: 0, lockRotations: true });
    expect(mockColliders).toEqual([{ shape: 'capsule', props: { args: [0.5, 0.5], sensor: false, mass: 3 } }]);
  });

  test('켜진 콜라이더가 없으면 강체 없이 자식만 렌더한다', () => {
    const decoration = createObject({
      id: 'decoration',
      components: [createSceneComponent({
        type: SCENE_COMPONENT_TYPES.collider,
        enabled: false,
        data: { shape: 'sphere' },
      })],
    });
    render(
      <SceneObjectBody object={decoration}>
        <span data-testid="visual" />
      </SceneObjectBody>,
    );

    expect(screen.getByTestId('visual')).toBeTruthy();
    expect(mockBodies).toHaveLength(0);
  });
});
