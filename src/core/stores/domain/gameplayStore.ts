import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import type { AnimationSlice } from '@core/animation/stores/types';
import { createAnimationSlice } from '@core/animation/stores/slices';
import type { InteractionActions, InteractionSliceState } from '@core/interactions/stores/types';
import { createInteractionSlice } from '@core/interactions/stores/slices';

import { RideableSlice, createRideableSlice } from '../slices';

type AnimationStoreSlice = Omit<AnimationSlice, 'getAnimation' | 'getCurrentAnimation'>;
type InteractionSlice = InteractionSliceState & InteractionActions;

export type GameplayStore = RideableSlice & AnimationStoreSlice & InteractionSlice;

export const useGameplayStore = create<GameplayStore>()(
  devtools(
    subscribeWithSelector(
      (...a) => ({
        ...createRideableSlice(...a),
        ...createAnimationSlice(...a),
        ...createInteractionSlice(...a),
      })
    ),
    { name: 'gameplay-store' }
  )
); 