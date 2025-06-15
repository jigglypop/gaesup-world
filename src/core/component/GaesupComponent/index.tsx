import { EntityController } from '@motions/entities';
import { ReactElement } from 'react';

export function GaesupComponent({ props }: { props: any }): ReactElement | null {
  return <EntityController props={props}>{props.children}</EntityController>;
}
