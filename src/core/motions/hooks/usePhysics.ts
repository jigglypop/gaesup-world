import { useGaesupStore } from '@stores/gaesupStore';
import { useGaesupGltf } from './useGaesupGltf';
import { useStateEngine } from './useStateEngine';
import { InteractionEngine } from '../../interactions/core/InteractionEngine';

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