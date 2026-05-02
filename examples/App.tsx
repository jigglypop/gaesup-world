import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { GaesupAdmin } from '../src/admin-entry';
import { Navigation } from './components/nav/Navigation';
import { EditPage } from './pages/EditPage';
import { NetworkMultiplayerPage } from './pages/NetworkMultiplayerPage';
import { NPCEditorPage } from './pages/NPCEditorPage';
import { WorldPage } from './pages/World';

function AppLayout() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/index.html" element={<WorldPage showHud />} />
        <Route path="/" element={<WorldPage showHud />} />
        <Route path="/world" element={<WorldPage showHud />} />
        <Route path="/edit" element={<EditPage />} />
        <Route path="/edit/npc" element={<NPCEditorPage />} />
        <Route path="/blueprints" element={<WorldPage showHud />} />
        <Route path="/blueprints/*" element={<WorldPage showHud />} />
        <Route path="/network" element={<NetworkMultiplayerPage />} />
        <Route
          path="/admin/*"
          element={
            <GaesupAdmin>
              <WorldPage showEditor showHud={false} />
            </GaesupAdmin>
          }
        />
        <Route path="*" element={<WorldPage showHud />} />
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
