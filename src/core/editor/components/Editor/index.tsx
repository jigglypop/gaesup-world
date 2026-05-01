import React, { FC, useEffect, useRef } from 'react';

import type { CameraOptionType } from '../../../camera/core/types';
import { useGaesupStore } from '../../../stores/gaesupStore';
import type { ModeState } from '../../../stores/slices/mode/types';
import { EditorLayout } from '../EditorLayout';
import '../../styles/theme.css';
import { EditorProps } from './types';
import './styles.css'

const EDITOR_CAMERA_OPTION: Partial<CameraOptionType> = {
  xDistance: 10,
  yDistance: 22,
  zDistance: 30,
  fov: 58,
  zoom: 1,
  enableZoom: true,
  minZoom: 0.35,
  maxZoom: 2.4,
  zoomSpeed: 0.001,
  enableCollision: false,
  smoothing: {
    position: 0.12,
    rotation: 0.12,
    fov: 0.12,
  },
};

export const Editor: FC<EditorProps> = ({ 
  children, 
  className = '', 
  style = {},
  shell,
}) => {
  const previousCameraRef = useRef<{
    mode: ModeState;
    cameraOption: CameraOptionType;
  } | null>(null);

  useEffect(() => {
    const store = useGaesupStore.getState();
    previousCameraRef.current = {
      mode: store.mode,
      cameraOption: store.cameraOption,
    };

    store.setMode({ control: 'thirdPerson' });
    store.setCameraOption(EDITOR_CAMERA_OPTION);

    return () => {
      const previous = previousCameraRef.current;
      if (!previous) return;
      useGaesupStore.getState().setMode(previous.mode);
      useGaesupStore.getState().setCameraOption(previous.cameraOption);
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