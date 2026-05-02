import React from 'react';

import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { BlueprintEditor } from '../../src/blueprints/editor';
import './styles/BlueprintEditorPage.css';

export function BlueprintEditorPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const actionSlot = typeof document !== 'undefined'
    ? document.getElementById('app-editor-navigation-slot')
    : null;

  return (
    <div className="blueprint-editor-page">
      {actionSlot && createPortal(
        <button type="button" onClick={handleClose} className="blueprint-editor-page__close">
          블루프린트 닫기
        </button>,
        actionSlot,
      )}
      <BlueprintEditor onClose={handleClose} />
    </div>
  );
} 
