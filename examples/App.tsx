import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { GaesupAdmin } from '../src/admin-entry';
import { Navigation } from './components/nav/Navigation';
import { BlueprintEditorPage } from './pages/BlueprintEditorPage';
import { BuildingEditorPage } from './pages/BuildingEditorPage';
import { EditPage } from './pages/EditPage';
import { NetworkMultiplayerPage } from './pages/NetworkMultiplayerPage';
import { ShowcasePage } from './pages/ShowcasePage';
import { WorldPage } from './pages/World';

function AppLayout() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<ShowcasePage />} />
        <Route path="/world" element={<WorldPage />} />
        <Route path="/edit" element={<EditPage />} />
        <Route path="/building" element={<BuildingEditorPage />} />
        <Route path="/blueprints" element={<BlueprintEditorPage />} />
        <Route path="/network" element={<NetworkMultiplayerPage />} />
        <Route
          path="/admin/*"
          element={
            <GaesupAdmin>
              <WorldPage showEditor showHud={false} />
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
