import { EntityWrapper } from '../../../motions/components/EntityWrapper';
import { useKeyboard } from '@hooks/useKeyboard';
import { ControllerWrapperProps } from './types';

export function ControllerWrapper({ 
  children,
  ...props 
}: ControllerWrapperProps) {
  useKeyboard();

  return (
    <EntityWrapper 
      props={{
        children,
        ...props
      }}
    />
  );
}

export * from './types';
export { ControllerWrapper as GaesupController };
