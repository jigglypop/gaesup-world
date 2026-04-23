import { RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';

import { useGaesupStore } from '@stores/gaesupStore';

import { useStateSystem } from './useStateSystem';
import { InteractionSystem } from '../../interactions/core/InteractionSystem';
import type { InteractionCommand, InteractionState } from '../../interactions/bridge';

type UsePhysicsResult = {
    worldContext: ReturnType<typeof useGaesupStore.getState>;
    activeState: ReturnType<typeof useStateSystem>['activeState'];
    input: {
        keyboard: InteractionState['keyboard'];
        mouse: InteractionState['mouse'];
        rigidBodyRef: RefObject<RapierRigidBody | null>;
    };
    interaction: InteractionState;
    urls: ReturnType<typeof useGaesupStore.getState>['urls'];
    setKeyboardInput: (input: Partial<InteractionState['keyboard']>) => void;
    setMouseInput: (input: Partial<InteractionState['mouse']>) => void;
    dispatch: (action: InteractionCommand) => void;
    isReady: boolean;
};

/**
 * @deprecated usePhysicsBridge와 useMotion을 대신 사용하세요
 * 
 * 이 hook은 하위 호환성을 위해 남겨두었습니다.
 * 새로운 코드에서는 다음을 사용하세요:
 * - 물리 시뮬레이션: usePhysicsBridge
 * - 엔티티 모션: useMotion
 */
export function usePhysics(): UsePhysicsResult {
    const { activeState } = useStateSystem();
    const interactionSystem = InteractionSystem.getInstance();
    const interaction = interactionSystem.getState();
    const urls = useGaesupStore((state) => state.urls);
    const rigidBodyRef: RefObject<RapierRigidBody | null> = { current: null };
    const isReady = !!(interaction && urls && activeState);

    return {
        worldContext: useGaesupStore.getState(),
        activeState,
        input: {
            keyboard: interaction.keyboard,
            mouse: interaction.mouse,
            rigidBodyRef,
        },
        interaction,
        urls,
        setKeyboardInput: (input: Partial<typeof interaction.keyboard>) => {
            interactionSystem.updateKeyboard(input);
        },
        setMouseInput: (input: Partial<typeof interaction.mouse>) => {
            interactionSystem.updateMouse(input);
        },
        dispatch: (action: InteractionCommand) => {
            void action;
        },
        isReady,
    };
}

 
