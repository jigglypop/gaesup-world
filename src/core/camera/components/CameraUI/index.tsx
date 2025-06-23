import React from 'react';
import { CameraController } from '../CameraController';
import { CameraDebugPanel } from '../CameraDebugPanel';
import { CameraPresets } from '../CameraPresets';
import { CameraUIProps } from './types';

export function CameraUI({
  debugPanelProps,
  controllerProps,
  presetsProps
}: CameraUIProps) {
  return (
    <>
      {debugPanelProps && <CameraDebugPanel {...debugPanelProps} />}
      {controllerProps && <CameraController {...controllerProps} />}
      {presetsProps && <CameraPresets {...presetsProps} />}
    </>
  );
}
