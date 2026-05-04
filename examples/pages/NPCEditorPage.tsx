import React, { useEffect } from 'react';

import { BuildingPanel } from '../../src/editor';
import { useBuildingStore } from '../../src';
import { WorldPage } from './World';
import './styles/NPCEditorPage.css';

export function NPCEditorPage() {
  const setEditMode = useBuildingStore((state) => state.setEditMode);

  useEffect(() => {
    document.body.classList.add('npc-editor-route');
    setEditMode('npc');

    return () => {
      document.body.classList.remove('npc-editor-route');
      setEditMode('none');
    };
  }, [setEditMode]);

  return (
    <WorldPage
      showEditor
      showEditorShell={false}
      showHud={false}
      includeEditorAuxPanels={false}
    >
      <main className="npc-editor-page__workspace">
        <section className="npc-editor-page__inspector" aria-label="NPC inspector">
          <BuildingPanel forcedEditMode="npc" npcLayout="sidebars" hideHeader />
        </section>
      </main>
    </WorldPage>
  );
}

export default NPCEditorPage;
