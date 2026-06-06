import { useMemo, useState } from 'react';

import {
  CinematicPanel,
  Editor,
  GameplayEventPanel,
  StudioPanel,
  createEditorShell,
} from 'gaesup-world/editor';

import {
  deleteWorldGameplayEventBlueprint,
  dispatchWorldGameplayEvent,
  getWorldGameplayBlueprints,
  registerWorldGameplayEventBlueprint,
} from './runtime';
import type { WorldPageProps } from './types';

export type WorldEditorSurfaceProps = {
  showEditorShell: boolean;
  includeEditorAuxPanels: boolean;
  editorShellOptions: NonNullable<WorldPageProps['editorShellOptions']>;
};

export function WorldEditorSurface({
  showEditorShell,
  includeEditorAuxPanels,
  editorShellOptions,
}: WorldEditorSurfaceProps) {
  const [gameplayBlueprints, setGameplayBlueprints] = useState(() => getWorldGameplayBlueprints());
  const editorShell = useMemo(() => {
    const auxiliaryPanels = includeEditorAuxPanels
      ? [
          {
            id: 'gameplay-events',
            title: '게임 이벤트',
            component: (
              <GameplayEventPanel
                blueprints={gameplayBlueprints}
                onCreate={(blueprint) => {
                  registerWorldGameplayEventBlueprint(blueprint);
                  setGameplayBlueprints(getWorldGameplayBlueprints());
                }}
                onUpdate={(blueprint) => {
                  registerWorldGameplayEventBlueprint(blueprint);
                  setGameplayBlueprints(getWorldGameplayBlueprints());
                }}
                onDelete={(id) => {
                  deleteWorldGameplayEventBlueprint(id);
                  setGameplayBlueprints(getWorldGameplayBlueprints());
                }}
                onRun={(trigger) => dispatchWorldGameplayEvent(trigger)}
              />
            ),
            defaultSide: 'right' as const,
            pluginId: 'gaesup.gameplay-events',
          },
          {
            id: 'cinematic',
            title: '연출',
            component: <CinematicPanel />,
            defaultSide: 'right' as const,
            pluginId: 'gaesup.cinematic',
          },
          {
            id: 'studio',
            title: '스튜디오',
            component: <StudioPanel gameplayEvents={gameplayBlueprints} />,
            defaultSide: 'right' as const,
            pluginId: 'gaesup.studio',
          },
        ]
      : [];

    return createEditorShell({
      ...editorShellOptions,
      panels: [...auxiliaryPanels, ...(editorShellOptions.panels ?? [])],
      defaultActivePanels: editorShellOptions.defaultActivePanels ?? ['tile', 'character'],
      hiddenBuiltInPanels: editorShellOptions.hiddenBuiltInPanels ?? ['vehicle', 'animation', 'motion', 'performance'],
      panelOrder: editorShellOptions.panelOrder ?? ['world', 'character', 'wall', 'tile', 'block', 'object', 'npc', 'camera', 'gameplay-events', 'cinematic', 'studio'],
    });
  }, [editorShellOptions, gameplayBlueprints, includeEditorAuxPanels]);

  if (!showEditorShell) return null;
  return <Editor shell={editorShell} />;
}

export default WorldEditorSurface;
