import { useGaesupStore } from '@stores/gaesupStore';
import { useGaesupGltf } from './useGaesupGltf';
import { useStateEngine } from './useStateEngine';
import { InteractionEngine } from '../../interactions/core/InteractionEngine';
import { RefObject, useEffect, useRef } from 'react';
import { CollisionEnterPayload, CollisionExitPayload, RapierRigidBody } from '@react-three/rapier';
import { getGlobalAnimationBridge } from '../../animation/hooks/useAnimationBridge';
import { MotionBridge } from '../bridge/MotionBridge';
import { MotionCommand } from '../bridge/types';
import { useAnimationPlayer } from '../../hooks';
import { UsePhysicsEntityProps } from './types';
import { useCallback } from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import { PhysicsState, PhysicsCalculationProps } from '../types';
import { PhysicsSystem } from '../core/engine/PhysicsSystem';
import { SizesType } from '../../stores/slices/sizes';
import { PhysicsCalcProps } from '../core/types';
import { StoreState } from '../../stores/types';
import * as THREE from 'three';
import { EntityStateManager } from '../core/engine/EntityStateManager';
import { getGlobalStateManager } from './useStateEngine';
import { createInitialPhysicsState } from './state/physicsStateFactory';
import { useAnimationSetup } from './setup/useAnimationSetup';
import { useMotionSetup } from './setup/useMotionSetup';

const updateInputState = (state: PhysicsState, input: PhysicsCalculationProps): void => {
    const keyboardKeys: (keyof typeof state.keyboard)[] = [
        'forward',
        'backward',
        'leftward',
        'rightward',
        'shift',
        'space',
        'keyE',
        'keyR',
    ];

    for (let i = 0; i < keyboardKeys.length; i++) {
        const key = keyboardKeys[i];
        if (!key) continue;
        if (state.keyboard[key] !== input.keyboard[key]) {
            state.keyboard[key] = input.keyboard[key];
        }
    }
    if (!state.mouse.target.equals(input.mouse.target)) {
        state.mouse.target.copy(input.mouse.target);
    }
    if (state.mouse.angle !== input.mouse.angle) {
        state.mouse.angle = input.mouse.angle;
    }
    if (state.mouse.isActive !== input.mouse.isActive) {
        state.mouse.isActive = input.mouse.isActive;
    }
    if (state.mouse.shouldRun !== input.mouse.shouldRun) {
        state.mouse.shouldRun = input.mouse.shouldRun;
    }
};

export const usePhysicsLoop = (props: PhysicsCalculationProps) => {
    const physics = usePhysics();
    const physicsStateRef = useRef<PhysicsState | null>(null);
    const physicsSystem = useRef<PhysicsSystem | null>(null);
    const isInitializedRef = useRef(false);
    const mouseTargetRef = useRef(new THREE.Vector3());
    const matchSizesRef = useRef<SizesType | null>(null);
    const stateManagerRef = useRef<EntityStateManager | null>(null);
    const store = useGaesupStore();

    useEffect(() => {
        if (!isInitializedRef.current) {
            physicsSystem.current = new PhysicsSystem(store.physics);
            stateManagerRef.current = getGlobalStateManager();
            isInitializedRef.current = true;
        }
    }, [store.physics]);

    useEffect(() => {
        if (physicsSystem.current) {
            physicsSystem.current.updateConfig(store.physics);
        }
    }, [store.physics]);

    useEffect(() => {
        const handleTeleport = (event: CustomEvent) => {
            try {
                const { position } = event.detail;
                if (props.rigidBodyRef?.current && position) {
                    props.rigidBodyRef.current.setTranslation(
                        {
                            x: position.x,
                            y: position.y,
                            z: position.z,
                        },
                        true,
                    );
                    props.rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    props.rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
                }
            } catch (error) {
                console.error('Teleport error:', error);
            }
        };

        window.addEventListener('gaesup:teleport', handleTeleport as EventListener);
        document.addEventListener('teleport-request', handleTeleport as EventListener);

        return () => {
            window.removeEventListener('gaesup:teleport', handleTeleport as EventListener);
            document.removeEventListener('teleport-request', handleTeleport as EventListener);
        };
    }, [props.rigidBodyRef]);

    const executePhysics = useCallback(
        (state: RootState, delta: number) => {
            try {
                if (!physics.isReady || !physicsSystem.current || !stateManagerRef.current)
                    return;

                if (!physicsStateRef.current) {
                    const worldContext = physics.worldContext as StoreState;
                    physicsStateRef.current = createInitialPhysicsState(
                        worldContext,
                        stateManagerRef.current,
                        physics.input,
                        delta,
                        mouseTargetRef.current
                    );

                    if (props.rigidBodyRef?.current && physicsStateRef.current.activeState) {
                        const { activeState } = physicsStateRef.current;
                        props.rigidBodyRef.current.lockRotations(false, true);
                        activeState.euler.set(0, 0, 0);
                        props.rigidBodyRef.current.setTranslation(
                            {
                                x: activeState.position.x,
                                y: activeState.position.y + 5,
                                z: activeState.position.z,
                            },
                            true,
                        );
                    }
                } else {
                    updateInputState(physicsStateRef.current, physics.input);
                    if (physicsStateRef.current && stateManagerRef.current) {
                        physicsStateRef.current.activeState = stateManagerRef.current.getActiveState();
                        physicsStateRef.current.gameStates = stateManagerRef.current.getGameStates();
                        physicsStateRef.current.delta = delta;
                    }
                }

                const calcProp: PhysicsCalcProps = {
                    rigidBodyRef: props.rigidBodyRef,
                    innerGroupRef: props.innerGroupRef,
                    state,
                    delta,
                    worldContext: physics.worldContext,
                    dispatch: physics.dispatch,
                    matchSizes: matchSizesRef.current || (matchSizesRef.current = physics.getSizesByUrls() as SizesType),
                    inputRef: { current: physics.input },
                    setKeyboardInput: physics.setKeyboardInput,
                    setMouseInput: physics.setMouseInput,
                };

                physicsSystem.current.update({
                  deltaTime: delta,
                  calcProp,
                  physicsState: physicsStateRef.current
                });
            } catch (error) {
                console.error('Physics execution error:', error);
            }
        },
        [physics, props],
    );

    useFrame((state, delta) => {
        if (!physics.isReady || !isInitializedRef.current) return;
        executePhysics(state, delta);
    });
};

export function usePhysicsEntity({
    rigidBodyRef,
    actions,
    name,
    isActive,
    onIntersectionEnter,
    onIntersectionExit,
    onCollisionEnter,
    userData,
    outerGroupRef,
    innerGroupRef,
    colliderRef,
    groundRay,
    onFrame,
    onAnimate,
    onReady
}: UsePhysicsEntityProps) {
    const entityId = useRef<string>(
        name || `entity-${Date.now()}-${Math.random()}`
    ).current;
    const activeMode = useGaesupStore((state) => state.mode);
    const { gameStates } = useStateEngine();
    const isRiding = gameStates.isRiding;
    const modeType = activeMode?.type;

    useAnimationSetup(actions, modeType, isActive);
    const { 
      executeMotionCommand, 
      updateMotion, 
      getMotionSnapshot 
    } = useMotionSetup(entityId, rigidBodyRef, modeType, isActive);

    const handleIntersectionEnter = useCallback(async (payload: CollisionEnterPayload) => {
        if (onIntersectionEnter) onIntersectionEnter(payload);
        if (userData?.['onNear'] && typeof userData['onNear'] === 'function') {
            await userData['onNear'](payload, userData);
        }
    }, [onIntersectionEnter, userData]);

    const handleIntersectionExit = useCallback(async (payload: CollisionExitPayload) => {
        if (onIntersectionExit) onIntersectionExit(payload);
        if (userData?.['onLeave'] && typeof userData['onLeave'] === 'function') {
            await userData['onLeave'](payload);
        }
    }, [onIntersectionExit, userData]);

    const handleCollisionEnter = useCallback(async (payload: CollisionEnterPayload) => {
        if (onCollisionEnter) onCollisionEnter(payload);
        if (userData?.['onNear'] && typeof userData['onNear'] === 'function') {
            await userData['onNear'](payload, userData);
        }
    }, [onCollisionEnter, userData]);

    if (isActive) {
        usePhysicsLoop({
            outerGroupRef,
            innerGroupRef,
            rigidBodyRef: rigidBodyRef as RefObject<RapierRigidBody>,
            colliderRef,
            groundRay
        });
    }

    useAnimationPlayer(isActive && modeType === 'character');

    useEffect(() => {
        if (onReady) onReady();
    }, [onReady]);

    useEffect(() => {
        let animationId: number;
        const frameHandler = () => {
            if (onFrame) onFrame();
            if (onAnimate && actions) onAnimate();
            animationId = requestAnimationFrame(frameHandler);
        };
        if (onFrame || (onAnimate && actions)) {
            animationId = requestAnimationFrame(frameHandler);
            return () => {
                cancelAnimationFrame(animationId);
            };
        }
    }, [onFrame, onAnimate, actions]);

    return {
        executeMotionCommand,
        updateMotion,
        getMotionSnapshot,
        mode: activeMode,
        isRiding,
        handleIntersectionEnter,
        handleIntersectionExit,
        handleCollisionEnter
    };
}
export function usePhysics() {
    const { activeState } = useStateEngine();
    const interactionEngine = InteractionEngine.getInstance();
    const interaction = interactionEngine.getStateRef();
    const urls = useGaesupStore((state) => state.urls);
    const { getSizesByUrls } = useGaesupGltf();
    const isReady = !!(interaction && urls && activeState);

    return {
        worldContext: useGaesupStore.getState(),
        activeState,
        input: {
            keyboard: interaction.keyboard,
            mouse: interaction.mouse,
            rigidBodyRef: { current: null } as RefObject<RapierRigidBody>,
        },
        interaction,
        urls,
        getSizesByUrls,
        setKeyboardInput: (input: Partial<typeof interaction.keyboard>) => {
            interactionEngine.updateKeyboard(input);
        },
        setMouseInput: (input: Partial<typeof interaction.mouse>) => {
            interactionEngine.updateMouse(input);
        },
        dispatch: (action: { type: string; payload?: unknown }) => {
        },
        isReady,
    };
} 