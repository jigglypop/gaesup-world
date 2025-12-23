import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { WorldPage } from './World';
import { useBuildingStore } from '../../src';
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
    <WorldPage showEditor>
      <BuildingExample onClose={() => navigate('/')} />
    </WorldPage>
  );
} 