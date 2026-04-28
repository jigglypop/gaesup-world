import React from 'react';

import { useNavigate } from 'react-router-dom';

import { BlueprintEditor } from '../../src/blueprints/editor';
import './styles/BlueprintEditorPage.css';

export function BlueprintEditorPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="blueprint-editor-page">
      <div className="blueprint-editor-page__header">
        <h1 className="blueprint-editor-page__title">Blueprint Editor</h1>
        <button onClick={handleClose} className="blueprint-editor-page__close">Close</button>
      </div>
      <BlueprintEditor onClose={handleClose} />
    </div>
  );
} 
