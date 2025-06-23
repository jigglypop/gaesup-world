import React from 'react';
import { AnimationController } from '../AnimationController';
import { AnimationPlayer } from '../AnimationPlayer';
import { AnimationDebugPanel } from '../AnimationDebugPanel';
import { AnimationUIProps } from './types';

export function AnimationUI({
  showController = true,
  showPlayer = true,
  showDebugPanel = false,
  controllerProps = {},
  playerProps = {},
  debugPanelProps = {}
}: AnimationUIProps) {
  return (
    <>
      {showController && (
        <AnimationController
          position="top-right"
          showLabels={true}
          compact={false}
          {...controllerProps}
        />
      )}
      
      {showPlayer && (
        <AnimationPlayer
          position="bottom-left"
          showControls={true}
          compact={false}
          {...playerProps}
        />
      )}
      
      {showDebugPanel && (
        <AnimationDebugPanel
          position="top-left"
          compact={false}
          {...debugPanelProps}
        />
      )}
    </>
  );
}
