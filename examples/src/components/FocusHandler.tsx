import { useFocus, V3 } from '../../../src';
import { FocusedObject, PlatformData, ClickPosition } from '../types';
export function FocusHandler({
  onObjectFocused,
}: {
  onObjectFocused: (obj: FocusedObject) => void;
}) {
  const { focusOn } = useFocus();
  (window as any).handlePlatformFocus = async (
    platformData: PlatformData,
    clickPosition: ClickPosition,
  ) => {
    const targetPosition = V3(clickPosition.x, clickPosition.y + 5, clickPosition.z + 8);
    const lookAtPosition = V3(
      platformData.position[0],
      platformData.position[1],
      platformData.position[2],
    );
    await focusOn({
      zoom: 1.5,
      target: lookAtPosition,
      position: targetPosition,
    });
    onObjectFocused({
      name: platformData.name,
      position: {
        x: platformData.position[0],
        y: platformData.position[1],
        z: platformData.position[2],
      },
      color: platformData.color,
      type: platformData.type,
    });
  };
  return null;
}
