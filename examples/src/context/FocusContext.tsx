import { createContext, useContext, useState, ReactNode } from 'react';
import { useFocus } from '../../../src';
import { FocusedObject, PlatformData, ClickPosition } from '../types';
import { V3 } from '../../../src';

interface FocusableContextType {
  focusedObject: FocusedObject | null;
  focusOnPlatform: (platformData: PlatformData, clickPosition: ClickPosition) => Promise<void>;
  clearFocus: () => void;
}

const FocusableContext = createContext<FocusableContextType | undefined>(undefined);

export function FocusableProvider({ children }: { children: ReactNode }) {
  const [focusedObject, setFocusedObject] = useState<FocusedObject | null>(null);
  const { focusOn, focusOff } = useFocus();

  const focusOnPlatform = async (platformData: PlatformData, clickPosition: ClickPosition) => {
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
    setFocusedObject({
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

  const clearFocus = async () => {
    await focusOff({ zoom: 1 });
    setFocusedObject(null);
  };

  return (
    <FocusableContext.Provider value={{ focusedObject, focusOnPlatform, clearFocus }}>
      {children}
    </FocusableContext.Provider>
  );
}

export function useFocusable() {
  const context = useContext(FocusableContext);
  if (context === undefined) {
    throw new Error('useFocusable must be used within a FocusableProvider');
  }
  return context;
}
