import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { RideableSlice, createRideableSlice } from '../slices';
import { AnimationSlice, createAnimationSlice } from '@core/animation/stores/slices';
import { InteractionSlice, createInteractionSlice } from '@core/interactions/stores/slices';

export type GameplayStore = RideableSlice & AnimationSlice & InteractionSlice;

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