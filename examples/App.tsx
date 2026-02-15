import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { GaesupAdmin } from '../src/admin';
import './style.css';
import { Navigation } from './components/nav/Navigation';
import { BlueprintEditorPage } from './pages/BlueprintEditorPage';
import { BuildingEditorPage } from './pages/BuildingEditorPage';
import { NetworkMultiplayerPage } from './pages/NetworkMultiplayerPage';
import { WorldPage } from './pages/World';

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<WorldPage showEditor={true} />} />
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
    </BrowserRouter>
  );
}
