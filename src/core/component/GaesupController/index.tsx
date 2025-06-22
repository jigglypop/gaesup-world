import { GaesupComponent } from '../GaesupComponent';
import { useKeyboard } from '@hooks/useKeyboard';
import { ControllerType } from './types';

export function GaesupController({ 
  children,
  ...props 
}: ControllerType) {
  useKeyboard();

  return (
    <GaesupComponent 
      props={{
        children,
        ...props
      }}
    />
  );
}
