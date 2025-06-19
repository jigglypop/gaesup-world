import { EntityController } from '@motions/entities';
import { ReactElement } from 'react';

interface GaesupComponentProps {
  props: {
    children?: React.ReactNode;
    [key: string]: unknown;
  };
}

export function GaesupComponent({ props }: GaesupComponentProps): ReactElement | null {
  return <EntityController props={props}>{props.children}</EntityController>;
}
