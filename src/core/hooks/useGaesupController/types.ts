import type { ActiveStateType } from '../../motions/core/types';
import type { PhysicsEntityProps } from '../../motions/entities/types';
import type { ModeState, ControllerOptionsType } from '../../stores/slices/mode/types';
import type { GaesupState } from '../../stores/types';
import type { GameStatesType } from '../../world/components/Rideable/types';

export type GaesupControllerProps = Omit<
  PhysicsEntityProps,
  'url' | 'isActive' | 'componentType'
> & {
  clickToMove?: boolean;
};

export interface UseGaesupControllerResult {
  state: ActiveStateType | null;
  mode: ModeState | null;
  states: GameStatesType;
  control: ControllerOptionsType;
  context: {
    mode: ModeState | null;
    states: GameStatesType;
    control: ControllerOptionsType;
  };
  controller: GaesupState;
}
