import { ReactNode } from 'react';

import { GaesupControllerProps } from '@hooks/useGaesupController/types';

import type { ClickerMoveOptions } from '../../../hooks/useClicker/types';
import { EntityController } from '../../../motions/entities';
import { Clicker } from '../Clicker';
import { GroundClicker } from '../GroundClicker';

type ControllerWrapperProps = GaesupControllerProps & {
  children?: ReactNode;
  clickerOptions?: ClickerMoveOptions;
};

export function ControllerWrapper(props: ControllerWrapperProps) {
  const { clickToMove, children, clickerOptions, ...rest } = props;
  const resolvedClickerOptions: ClickerMoveOptions = {
    ...(clickerOptions ?? {}),
    ...(
      clickerOptions?.agentRadius === undefined && rest.colliderSize?.radius !== undefined
        ? { agentRadius: rest.colliderSize.radius }
        : {}
    ),
  };
  return (
    <EntityController props={rest}>
      <>
        {clickToMove && (
          <>
            <GroundClicker clickerOptions={resolvedClickerOptions} />
            <Clicker />
          </>
        )}
        {children}
      </>
    </EntityController>
  );
}

export * from './types';
export { ControllerWrapper as GaesupController };
