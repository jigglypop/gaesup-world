import { ReactNode } from 'react';

export interface GaeSupPropsType {
  type?: 'normal' | 'ground';
  text?: string;
  position?: [number, number, number];
  children: ReactNode;
}
