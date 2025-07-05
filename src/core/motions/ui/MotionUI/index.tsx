import React from 'react';
import { MotionController } from '../../controller/MotionController';
import { MotionDebugPanel } from '../MotionDebugPanel';
import { MotionUIProps } from './types';

export function MotionUI({
  showController = true,
  showDebugPanel = true,
  controllerProps = {},
  debugPanelProps = {}
}: MotionUIProps) {
  return (
    <>
      {showController && (
        <MotionController
          position="bottom-left"
          showLabels={true}
          compact={false}
          {...controllerProps}
        />
      )}
      
      {showDebugPanel && (
        <MotionDebugPanel
          position="top-right"
          updateInterval={100}
          precision={2}
          compact={false}
          {...debugPanelProps}
        />
      )}
    </>
  );
}
