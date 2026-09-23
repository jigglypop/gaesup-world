import type { AnimatorCondition, AnimatorControllerDefinition } from './types';
import { ANIMATOR_ANY_STATE } from './validate';

export const DEFAULT_CHARACTER_ANIMATOR_ID = 'gaesup.character';

export const CHARACTER_ANIMATOR_PARAMETERS = {
  locomotion: 'locomotion',
  speed: 'speed',
  riding: 'riding',
  jumping: 'jumping',
  falling: 'falling',
  grounded: 'grounded',
} as const;

export const CHARACTER_LOCOMOTION = {
  idle: 0,
  walk: 1,
  run: 2,
} as const;

const CHARACTER_TRANSITION_DURATION = 0.3;

const NOT_RIDING: AnimatorCondition = { parameter: CHARACTER_ANIMATOR_PARAMETERS.riding, operator: 'false' };
const NOT_JUMPING: AnimatorCondition = { parameter: CHARACTER_ANIMATOR_PARAMETERS.jumping, operator: 'false' };
const NOT_FALLING: AnimatorCondition = { parameter: CHARACTER_ANIMATOR_PARAMETERS.falling, operator: 'false' };

export function createDefaultCharacterAnimator(
  id: string = DEFAULT_CHARACTER_ANIMATOR_ID,
): AnimatorControllerDefinition {
  return {
    id,
    parameters: {
      [CHARACTER_ANIMATOR_PARAMETERS.locomotion]: { type: 'float', default: CHARACTER_LOCOMOTION.idle },
      [CHARACTER_ANIMATOR_PARAMETERS.speed]: { type: 'float', default: 0 },
      [CHARACTER_ANIMATOR_PARAMETERS.riding]: { type: 'bool', default: false },
      [CHARACTER_ANIMATOR_PARAMETERS.jumping]: { type: 'bool', default: false },
      [CHARACTER_ANIMATOR_PARAMETERS.falling]: { type: 'bool', default: false },
      [CHARACTER_ANIMATOR_PARAMETERS.grounded]: { type: 'bool', default: true },
    },
    layers: [
      {
        name: 'base',
        defaultState: 'locomotion',
        states: [
          {
            name: 'locomotion',
            motion: {
              kind: 'blend1D',
              parameter: CHARACTER_ANIMATOR_PARAMETERS.locomotion,
              children: [
                { clip: 'idle', threshold: CHARACTER_LOCOMOTION.idle },
                { clip: 'walk', threshold: CHARACTER_LOCOMOTION.walk },
                { clip: 'run', threshold: CHARACTER_LOCOMOTION.run },
              ],
            },
          },
          { name: 'jump', motion: { kind: 'clip', clip: 'jump' } },
          { name: 'fall', motion: { kind: 'clip', clip: 'fall' } },
          { name: 'ride', motion: { kind: 'clip', clip: 'ride' } },
        ],
        transitions: [
          {
            from: ANIMATOR_ANY_STATE,
            to: 'ride',
            duration: CHARACTER_TRANSITION_DURATION,
            conditions: [{ parameter: CHARACTER_ANIMATOR_PARAMETERS.riding, operator: 'true' }],
          },
          {
            from: ANIMATOR_ANY_STATE,
            to: 'jump',
            duration: CHARACTER_TRANSITION_DURATION,
            conditions: [NOT_RIDING, { parameter: CHARACTER_ANIMATOR_PARAMETERS.jumping, operator: 'true' }],
          },
          {
            from: ANIMATOR_ANY_STATE,
            to: 'fall',
            duration: CHARACTER_TRANSITION_DURATION,
            conditions: [NOT_RIDING, NOT_JUMPING, { parameter: CHARACTER_ANIMATOR_PARAMETERS.falling, operator: 'true' }],
          },
          {
            from: ANIMATOR_ANY_STATE,
            to: 'locomotion',
            duration: CHARACTER_TRANSITION_DURATION,
            conditions: [NOT_RIDING, NOT_JUMPING, NOT_FALLING],
          },
        ],
      },
    ],
  };
}

export const defaultCharacterAnimator: AnimatorControllerDefinition = createDefaultCharacterAnimator();
