import type { CharacterAnimationProps } from './components/CharacterAnimationComponent';
import type { CharacterMovementProps } from './components/CharacterMovementComponent';
import type { GravityForceProperties } from './components/GravityForceComponent';
import type { BlueprintRecord, BlueprintValue } from '../types';

const asNumber = (value: BlueprintValue | undefined, fallback: number): number =>
  typeof value === 'number' ? value : fallback;

const asString = (value: BlueprintValue | undefined, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const asStringOrStringArray = (
  value: BlueprintValue | undefined,
  fallback: string | string[],
): string | string[] => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value;
  }
  return fallback;
};

const isRecord = (value: BlueprintValue | undefined): value is BlueprintRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const toGravityForceProperties = (
  props: BlueprintRecord,
): GravityForceProperties => ({
  ...(typeof props['gravity'] === 'number' ? { gravity: props['gravity'] } : {}),
  ...(typeof props['maxFallSpeed'] === 'number'
    ? { maxFallSpeed: props['maxFallSpeed'] }
    : {}),
  ...(typeof props['enabled'] === 'boolean' ? { enabled: props['enabled'] } : {}),
});

export const toCharacterMovementProps = (
  props: BlueprintRecord,
): CharacterMovementProps => ({
  walkSpeed: asNumber(props['walkSpeed'], 5),
  runSpeed: asNumber(props['runSpeed'], 10),
  jumpHeight: asNumber(props['jumpHeight'], 2),
  airControl: asNumber(props['airControl'], 0.2),
});

export const toCharacterAnimationProps = (
  props: BlueprintRecord,
): CharacterAnimationProps => {
  const animationsValue = props['animations'];
  const jumpValue =
    isRecord(animationsValue) && isRecord(animationsValue['jump'])
      ? animationsValue['jump']
      : {};

  const readMapping = (key: 'combat' | 'special') => {
    if (!isRecord(animationsValue) || !isRecord(animationsValue[key])) {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(animationsValue[key]).filter(
        ([, value]) =>
          typeof value === 'string' ||
          (Array.isArray(value) &&
            value.every((item) => typeof item === 'string')),
      ),
    ) as Record<string, string | string[]>;
  };

  const combat = readMapping('combat');
  const special = readMapping('special');

  return {
    animations: {
      idle: asStringOrStringArray(
        isRecord(animationsValue) ? animationsValue['idle'] : undefined,
        'idle',
      ),
      walk: asStringOrStringArray(
        isRecord(animationsValue) ? animationsValue['walk'] : undefined,
        'walk',
      ),
      run: asStringOrStringArray(
        isRecord(animationsValue) ? animationsValue['run'] : undefined,
        'run',
      ),
      jump: {
        start: asString(jumpValue['start'], 'jump_start'),
        loop: asString(jumpValue['loop'], 'jump_loop'),
        land: asString(jumpValue['land'], 'jump_land'),
      },
      ...(combat ? { combat } : {}),
      ...(special ? { special } : {}),
    },
    defaultAnimation: asString(props['defaultAnimation'], 'idle'),
  };
};
