import { ReactElement } from 'react';
import { EntityController } from '../physics/components';

export function GaesupComponent({ props }: { props: any }): ReactElement | null {
  return <EntityController props={props}>{props.children}</EntityController>;
}
