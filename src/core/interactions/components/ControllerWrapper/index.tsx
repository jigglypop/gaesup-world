import { Group, Object3DEventMap } from 'three';
import { MutableRefObject, forwardRef, Ref, ReactNode } from 'react';
import { GaesupControllerProps } from '@hooks/useGaesupController/types';
import { EntityController } from '../../../motions/entities';
import { GroundClicker } from '../GroundClicker';
import { Clicker } from '../Clicker';

type ControllerWrapperProps = GaesupControllerProps & {
  children?: ReactNode;
};

export const ControllerWrapper = forwardRef<
  MutableRefObject<Group<Object3DEventMap> | undefined>,
  ControllerWrapperProps
>((props, ref) => {
  const { clickToMove, children, ...rest } = props;
  return (
    <EntityController props={rest} ref={ref}>
      {clickToMove && (
        <>
          <GroundClicker />
          <Clicker />
        </>
      )}
      {children}
    </EntityController>
  );
});

export * from './types';
export { ControllerWrapper as GaesupController };
