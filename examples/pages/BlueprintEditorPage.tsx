import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../src/admin';
import { BlueprintEditor } from '../../src/blueprints';
import './styles/BlueprintEditorPage.css';

export function BlueprintEditorPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    // Implement proper redirect or message
    return <div>Please log in to access the Blueprint Editor.</div>;
  }

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="blueprint-editor-page">
      <div className="blueprint-editor-page__header">
        <button onClick={handleClose} className="blueprint-editor-page__close">×</button>
      </div>
      <BlueprintEditor onClose={handleClose} />
    </div>
  );
} 