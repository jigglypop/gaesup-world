import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { WorldPage } from './World';
import { useBuildingStore } from '../../src';


export function EditPage() {
  const navigate = useNavigate();
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
        <button
          type="button"
          onClick={() => navigate('/edit/npc')}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '7px 10px',
            borderRadius: 7,
            border: '1px solid rgba(147,197,253,0.42)',
            background: 'rgba(59,130,246,0.18)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          NPC 전용 에디터 열기
        </button>
      </div>
    </WorldPage>
  );
}

export default EditPage;
