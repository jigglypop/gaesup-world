import React, { FC, useEffect, useRef } from 'react';

import type { CameraOptionType } from '../../../camera/core/types';
import { useGaesupStore } from '../../../stores/gaesupStore';
import type { ModeState } from '../../../stores/slices/mode/types';
import { EditorLayout } from '../EditorLayout';
import '../../styles/theme.css';
import { EditorProps } from './types';
import './styles.css';

type EditorSessionSnapshot = {
  mode: ModeState;
  cameraOption: CameraOptionType;
  interactionActive: boolean;
};

const RELEASED_KEYBOARD_STATE = {
  forward: false,
  backward: false,
  leftward: false,
  rightward: false,
  shift: false,
  space: false,
  keyZ: false,
  keyR: false,
  keyF: false,
  keyE: false,
  escape: false,
};

const INACTIVE_MOUSE_STATE = {
  isActive: false,
  shouldRun: false,
  isLookAround: false,
};

const cloneCameraOption = (cameraOption: CameraOptionType): CameraOptionType => ({
  ...cameraOption,
  ...(cameraOption.smoothing ? { smoothing: { ...cameraOption.smoothing } } : {}),
  ...(cameraOption.bounds ? { bounds: { ...cameraOption.bounds } } : {}),
  ...(cameraOption.modeSettings ? { modeSettings: { ...cameraOption.modeSettings } } : {}),
});

export const Editor: FC<EditorProps> = ({ 
  children, 
  className = '', 
  style = {},
  shell,
}) => {
  const sessionSnapshotRef = useRef<EditorSessionSnapshot | null>(null);

  useEffect(() => {
    const store = useGaesupStore.getState();
    sessionSnapshotRef.current = {
      mode: { ...store.mode },
      cameraOption: cloneCameraOption(store.cameraOption),
      interactionActive: store.interaction.isActive,
    };

    store.stopAutomation();
    store.updateKeyboard(RELEASED_KEYBOARD_STATE);
    store.updateMouse(INACTIVE_MOUSE_STATE);
    store.setInteractionActive(false);

    return () => {
      const snapshot = sessionSnapshotRef.current;
      if (!snapshot) return;

      const currentStore = useGaesupStore.getState();
      currentStore.setMode(snapshot.mode);
      currentStore.replaceCameraOption(snapshot.cameraOption);
      currentStore.setInteractionActive(snapshot.interactionActive);
      currentStore.updateKeyboard(RELEASED_KEYBOARD_STATE);
      currentStore.updateMouse(INACTIVE_MOUSE_STATE);
    };
  }, []);

  return (
    <div 
      className={`gaesup-editor ${className}`}
      style={{
        ...style
      }}
    >
      <EditorLayout
        {...(shell?.panels ? { panels: shell.panels } : {})}
        {...(shell?.defaultActivePanels ? { defaultActivePanels: shell.defaultActivePanels } : {})}
        {...(shell?.actions ? { actions: shell.actions } : {})}
        {...(shell?.hiddenBuiltInPanels ? { hiddenBuiltInPanels: shell.hiddenBuiltInPanels } : {})}
        {...(shell?.panelOrder ? { panelOrder: shell.panelOrder } : {})}
        {...(shell?.panelDefaults ? { panelDefaults: shell.panelDefaults } : {})}
        {...(shell?.validate ? { validateBundle: shell.validate } : {})}
      >
        {children}
      </EditorLayout>
    </div>
  );
};

export default Editor; 