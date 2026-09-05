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
import {
  useWorldSceneDocumentSnapshot,
  type WorldSceneDocumentSession,
} from './world/sceneDocument';

export type WorldEditorSurfaceProps = {
  showEditorShell: boolean;
  includeEditorAuxPanels: boolean;
  editorShellOptions: NonNullable<WorldPageProps['editorShellOptions']>;
  sceneDocumentSession: WorldSceneDocumentSession;
};

export function WorldEditorSurface({
  showEditorShell,
  includeEditorAuxPanels,
  editorShellOptions,
  sceneDocumentSession,
}: WorldEditorSurfaceProps) {
  const [gameplayBlueprints, setGameplayBlueprints] = useState(() => getWorldGameplayBlueprints());
  const sceneDocument = useWorldSceneDocumentSnapshot(sceneDocumentSession);
  const [selectedObjectCandidate, setSelectedObjectCandidate] = useState<string | undefined>(
    () => sceneDocument.objects[0]?.id,
  );
  const selectedObjectId = sceneDocument.objects.some(
    (object) => object.id === selectedObjectCandidate,
  )
    ? selectedObjectCandidate
    : sceneDocument.objects[0]?.id;
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
      commands: [
        {
          id: 'example.scene-document.create-marker',
          label: '월드 표식 추가',
          run: async () => {
            const objectId = sceneDocumentSession.createObjectId();
            const rootCount = sceneDocumentSession
              .getSnapshot()
              .objects.filter((object) => !object.parentId).length;
            const accepted = await sceneDocumentSession.createObject({
              id: objectId,
              name: `월드 표식 ${rootCount}`,
              tags: ['creator', 'runtime-marker'],
              transform: { position: [8 + rootCount * 2, 1, -6] },
            });
            if (accepted) setSelectedObjectCandidate(objectId);
          },
        },
        {
          id: 'example.scene-document.delete-selected',
          label: '선택한 객체 삭제',
          run: async () => {
            if (!selectedObjectId) return;
            const accepted = await sceneDocumentSession.deleteObject(selectedObjectId);
            if (accepted) setSelectedObjectCandidate(undefined);
          },
        },
        ...(editorShellOptions.commands ?? []),
      ],
      defaultActivePanels: editorShellOptions.defaultActivePanels ?? [
        'hierarchy',
        'inspector',
        'tile',
        'character',
      ],
      sidebarPreset: editorShellOptions.sidebarPreset ?? 'compact',
      hiddenBuiltInPanels: editorShellOptions.hiddenBuiltInPanels ?? [
        'vehicle',
        'animation',
        'motion',
        'performance',
      ],
      panelOrder: editorShellOptions.panelOrder ?? [
        'hierarchy',
        'inspector',
        'project-assets',
        'world',
        'character',
        'wall',
        'tile',
        'block',
        'object',
        'npc',
        'camera',
        'gameplay-events',
        'cinematic',
        'studio',
      ],
    });
  }, [
    editorShellOptions,
    gameplayBlueprints,
    includeEditorAuxPanels,
    sceneDocumentSession,
    selectedObjectId,
  ]);

  if (!showEditorShell) return null;
  return (
    <Editor
      shell={editorShell}
      sceneDocument={sceneDocument}
      projectScenes={[sceneDocument]}
      {...(selectedObjectId ? { selectedObjectId } : {})}
      onSelectSceneObject={(object) => setSelectedObjectCandidate(object.id)}
      onUpdateSceneObject={(objectId, patch) => {
        void sceneDocumentSession.updateObject(objectId, patch);
      }}
      onAddSceneComponent={(objectId, component) => {
        void sceneDocumentSession.addComponent(objectId, component);
      }}
      onRemoveSceneComponent={(objectId, componentId) => {
        void sceneDocumentSession.removeComponent(objectId, componentId);
      }}
    />
  );
}

export default WorldEditorSurface;
