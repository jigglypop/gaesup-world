import React from 'react';

import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import { GaesupAdmin } from '../src/admin-entry';
import './style.css';
import { Navigation } from './components/nav/Navigation';
import { BlueprintEditorPage } from './pages/BlueprintEditorPage';
import { BuildingEditorPage } from './pages/BuildingEditorPage';
import { EditPage } from './pages/EditPage';
import { NetworkMultiplayerPage } from './pages/NetworkMultiplayerPage';
import { WorldPage } from './pages/World';

function AppLayout() {
  const location = useLocation();
  const hideNavigation = location.pathname === '/' || location.pathname.startsWith('/admin');

  return (
    <>
      {!hideNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<WorldPage />} />
        <Route path="/edit" element={<EditPage />} />
        <Route path="/building" element={<BuildingEditorPage />} />
        <Route path="/blueprints" element={<BlueprintEditorPage />} />
        <Route path="/network" element={<NetworkMultiplayerPage />} />
        <Route
          path="/admin/*"
          element={
            <GaesupAdmin>
              <WorldPage showEditor={true} />
            </GaesupAdmin>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
