import type { CameraProps } from './components/types';
import { useCamera } from './hooks/useCamera';
 

export default function Camera({ enableMouse = true }: CameraProps = {}) {
  useCamera(enableMouse);
  return null;
}
