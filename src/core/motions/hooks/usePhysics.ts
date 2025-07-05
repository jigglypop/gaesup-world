import { useGaesupStore } from '@stores/gaesupStore';
import { useGaesupGltf } from './useGaesupGltf';
import { useStateEngine } from './useStateEngine';
import { InteractionEngine } from '../../interactions/core/InteractionEngine';
import { RefObject, useEffect, useRef } from 'react';
import { CollisionEnterPayload, CollisionExitPayload, RapierRigidBody } from '@react-three/rapier';
import { getGlobalAnimationBridge } from '../../animation/hooks/useAnimationBridge';
import { MotionBridge } from '../bridge/MotionBridge';
import { useAnimationPlayer } from '../../hooks';
import { UsePhysicsEntityProps } from './types';
import { useCallback} from 'react';
import { useFrame, RootState } from '@react-three/fiber';
import { PhysicsState, PhysicsCalculationProps } from '../types';
import { PhysicsEngine } from '../core/engine/PhysicsEngine';
import { SizesType } from '../../stores/slices/sizes';
import { PhysicsCalcProps } from '../core/types';
import { StoreState } from '../../stores/types';
import * as THREE from 'three';
import { StateEngine } from '../core/engine/StateEngine';

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
    const physicsEngine = useRef<PhysicsEngine | null>(null);
    const isInitializedRef = useRef(false);
    const mouseTargetRef = useRef(new THREE.Vector3());
    const matchSizesRef = useRef<SizesType | null>(null);
    const stateEngineRef = useRef<StateEngine | null>(null);

    useEffect(() => {
        if (!isInitializedRef.current && physics.worldContext) {
            physicsEngine.current = new PhysicsEngine({
                character: physics.worldContext.character,
                vehicle: physics.worldContext.vehicle,
                airplane: physics.worldContext.airplane
            });
            stateEngineRef.current = StateEngine.getInstance();
            isInitializedRef.current = true;
        }
    }, [physics.worldContext]);

    useEffect(() => {
        if (physicsEngine.current && physics.worldContext) {
            physicsEngine.current.updateConfig({
                character: physics.worldContext.character,
                vehicle: physics.worldContext.vehicle,
                airplane: physics.worldContext.airplane
            });
        }
    }, [
        physics.worldContext?.character,
        physics.worldContext?.vehicle,
        physics.worldContext?.airplane
    ]);

    useEffect(() => {
        const handleTeleport = (event: CustomEvent) => {
            try {
                const { position } = event.detail;
                if (props.rigidBodyRef.current && position) {
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
                if (!physics.worldContext || !physics.input || !physicsEngine.current || !stateEngineRef.current)
                    return;

                if (!physicsStateRef.current) {
                    const worldContext = physics.worldContext as StoreState;
                    const modeType = worldContext.mode?.type || 'character';
                    const activeStateRef = stateEngineRef.current.getActiveStateRef();
                    const gameStatesRef = stateEngineRef.current.getGameStatesRef();

                    physicsStateRef.current = {
                        activeState: activeStateRef,
                        gameStates: gameStatesRef,
                        keyboard: { ...physics.input.keyboard },
                        mouse: {
                            target: mouseTargetRef.current.copy(physics.input.mouse.target),
                            angle: physics.input.mouse.angle,
                            isActive: physics.input.mouse.isActive,
                            shouldRun: physics.input.mouse.shouldRun,
                        },
                        characterConfig: worldContext.character || {},
                        vehicleConfig: worldContext.vehicle || {},
                        airplaneConfig: worldContext.airplane || {},
                        automationOption: worldContext.automation || {
                            isActive: false,
                            queue: {
                                actions: [],
                                currentIndex: 0,
                                isRunning: false,
                                isPaused: false,
                                loop: false,
                                maxRetries: 3
                            },
                            settings: {
                                trackProgress: false,
                                autoStart: false,
                                loop: false,
                                showVisualCues: false
                            }
                        },
                        modeType: modeType as 'character' | 'vehicle' | 'airplane',
                    };

                    if (props.rigidBodyRef?.current && activeStateRef) {
                        props.rigidBodyRef.current.lockRotations(false, true);
                        activeStateRef.euler.set(0, 0, 0);
                        props.rigidBodyRef.current.setTranslation(
                            {
                                x: activeStateRef.position.x,
                                y: activeStateRef.position.y + 5,
                                z: activeStateRef.position.z,
                            },
                            true,
                        );
                    }
                } else {
                    updateInputState(physicsStateRef.current, physics.input);
                    if (physicsStateRef.current && stateEngineRef.current) {
                        physicsStateRef.current.activeState = stateEngineRef.current.getActiveStateRef();
                        physicsStateRef.current.gameStates = stateEngineRef.current.getGameStatesRef();
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

                physicsEngine.current.calculate(calcProp, physicsStateRef.current);
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

let globalMotionBridge: MotionBridge | null = null;
function getGlobalMotionBridge(): MotionBridge {
    if (!globalMotionBridge) {
        globalMotionBridge = new MotionBridge();
    }
    return globalMotionBridge;
}

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
    const animationBridgeRef = useRef<boolean>(false);
    const entityIdRef = useRef<string>(
        name || `entity-${Date.now()}-${Math.random()}`
    );
    const registeredRef = useRef<boolean>(false);
    const activeMode = useGaesupStore((state) => state.mode);
    const { gameStates } = useStateEngine();
    const isRiding = gameStates.isRiding;
    const modeType = activeMode?.type;

    useEffect(() => {
        if (actions && modeType && isActive && !animationBridgeRef.current) {
            const animationBridge = getGlobalAnimationBridge();
            animationBridge.registerAnimations(modeType as any, actions);
            animationBridgeRef.current = true;
            return () => {
                if (animationBridgeRef.current) {
                    animationBridge.unregisterAnimations(modeType as any);
                    animationBridgeRef.current = false;
                }
            };
        }
    }, [actions, modeType, isActive]);

    useEffect(() => {
        if (isActive && rigidBodyRef && !registeredRef.current && rigidBodyRef.current) {
            const motionBridge = getGlobalMotionBridge();
            motionBridge.registerEntity(
                entityIdRef.current,
                modeType === 'vehicle' || modeType === 'airplane'
                    ? 'vehicle'
                    : 'character',
                rigidBodyRef.current
            );
            registeredRef.current = true;
            return () => {
                motionBridge.unregisterEntity(entityIdRef.current);
                registeredRef.current = false;
            };
        }
    }, [isActive, rigidBodyRef, modeType]);

    const handleIntersectionEnter = async (payload: CollisionEnterPayload) => {
        if (onIntersectionEnter) onIntersectionEnter(payload);
        if (userData?.['onNear'] && typeof userData['onNear'] === 'function') {
            await userData['onNear'](payload, userData);
        }
    };

    const handleIntersectionExit = async (payload: CollisionExitPayload) => {
        if (onIntersectionExit) onIntersectionExit(payload);
        if (userData?.['onLeave'] && typeof userData['onLeave'] === 'function') {
            await userData['onLeave'](payload);
        }
    };

    const handleCollisionEnter = async (payload: CollisionEnterPayload) => {
        if (onCollisionEnter) onCollisionEnter(payload);
        if (userData?.['onNear'] && typeof userData['onNear'] === 'function') {
            await userData['onNear'](payload, userData);
        }
    };

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
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
            };
        }
    }, [onFrame, onAnimate, actions]);

    const executeMotionCommand = (command: any) => {
        if (registeredRef.current && isActive) {
            const motionBridge = getGlobalMotionBridge();
            motionBridge.execute(entityIdRef.current, command);
        }
    };

    const updateMotion = (deltaTime: number) => {
        if (registeredRef.current && isActive) {
            const motionBridge = getGlobalMotionBridge();
            motionBridge.updateEntity(entityIdRef.current, deltaTime);
        }
    };

    const getMotionSnapshot = () => {
        if (registeredRef.current && isActive) {
            const motionBridge = getGlobalMotionBridge();
            return motionBridge.snapshot(entityIdRef.current);
        }
        return null;
    };

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
            rigidBodyRef: { current: null } as any,
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