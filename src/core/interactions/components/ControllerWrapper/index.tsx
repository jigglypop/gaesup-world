import { ReactNode } from 'react';

import { GaesupControllerProps } from '@hooks/useGaesupController/types';

import { EntityController } from '../../../motions/entities';
import { Clicker } from '../Clicker';
import { GroundClicker } from '../GroundClicker';

type ControllerWrapperProps = GaesupControllerProps & {
  children?: ReactNode;
};

export function ControllerWrapper(props: ControllerWrapperProps) {
  const { clickToMove, children, ...rest } = props;
  return (
    <EntityController props={rest}>
      <>
        {clickToMove && (
          <>
            <GroundClicker />
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
