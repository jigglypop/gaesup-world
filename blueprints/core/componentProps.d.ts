import type { BlueprintRecord } from '../types';
import type { CharacterAnimationProps } from './components/CharacterAnimationComponent';
import type { CharacterMovementProps } from './components/CharacterMovementComponent';
import type { GravityForceProperties } from './components/GravityForceComponent';
export declare const toGravityForceProperties: (props: BlueprintRecord) => GravityForceProperties;
export declare const toCharacterMovementProps: (props: BlueprintRecord) => CharacterMovementProps;
export declare const toCharacterAnimationProps: (props: BlueprintRecord) => CharacterAnimationProps;
