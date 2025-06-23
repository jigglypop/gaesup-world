import { EntityController } from '../../entities';
import { ReactElement } from 'react';
import { EntityWrapperProps } from './types';

export function EntityWrapper({ props }: EntityWrapperProps): ReactElement | null {
  return <EntityController props={props}>{props.children}</EntityController>;
}

export * from './types';
