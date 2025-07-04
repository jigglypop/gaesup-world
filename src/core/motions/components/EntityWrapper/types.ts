import { ReactNode } from 'react';

export interface EntityWrapperProps {
  props: {
    children: ReactNode;
    entityType?: 'character' | 'vehicle' | 'airplane';
    controllerId?: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    enablePhysics?: boolean;
    enableCollision?: boolean;
    [key: string]: unknown;
  };
}
