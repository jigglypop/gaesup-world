import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useBuildingStore } from 'gaesup-world';

import { WorldPage } from './World';
import { BuildingExample } from '../components/building';

export function BuildingEditorPage() {
  const setEditMode = useBuildingStore(state => state.setEditMode);
  const navigate = useNavigate();
  
  useEffect(() => {
    setEditMode('wall');
    return () => {
      setEditMode('none');
    }
  }, [setEditMode]);

  return (
    <WorldPage showHud={false}>
      <BuildingExample onClose={() => navigate('/')} />
    </WorldPage>
  );
} 
