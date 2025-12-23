import { RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';

import { useGaesupStore } from '@stores/gaesupStore';

import { useGaesupGltf } from './useGaesupGltf';
import { useStateSystem } from './useStateSystem';
import { InteractionSystem } from '../../interactions/core/InteractionSystem';

/**
 * @deprecated usePhysicsBridge와 useMotion을 대신 사용하세요
 * 
 * 이 hook은 하위 호환성을 위해 남겨두었습니다.
 * 새로운 코드에서는 다음을 사용하세요:
 * - 물리 시뮬레이션: usePhysicsBridge
 * - 엔티티 모션: useMotion
 */
export function usePhysics() {
    const { activeState } = useStateSystem();
    const interactionSystem = InteractionSystem.getInstance();
    const interaction = interactionSystem.getState();
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
            interactionSystem.updateKeyboard(input);
        },
        setMouseInput: (input: Partial<typeof interaction.mouse>) => {
            interactionSystem.updateMouse(input);
        },
        dispatch: (action: { type: string; payload?: unknown }) => {
        },
        isReady,
    };
}

 