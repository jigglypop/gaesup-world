import React, { useEffect } from 'react';

import { WorldPage } from './World';
import { useBuildingStore } from '../../src';


export function EditPage() {
  const setEditMode = useBuildingStore((s) => s.setEditMode);

  useEffect(() => {
    setEditMode('tile');
    return () => { setEditMode('none'); };
  }, [setEditMode]);

  return (
    <WorldPage showEditor showHud compactHud>
      <div
        style={{
          position: 'fixed',
          top: 64,
          left: 12,
          zIndex: 30,
          maxWidth: 360,
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(20,24,36,0.85)',
          color: '#fff',
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Editor Quick Guide</div>
        <div>왼쪽 Building 패널 - 모드에서 NPC를 선택하세요.</div>
        <div>NPC 인스턴스를 선택하면 Brain 인스펙터가 보입니다.</div>
        <div>조건 노드 추가 시 true/false 분기 템플릿이 자동 생성됩니다.</div>
      </div>
    </WorldPage>
  );
}

export default EditPage;
