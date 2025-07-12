import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GaesupAdmin } from '../src/admin';
import './style.css';
import { Navigation } from './components/nav/Navigation';
import { WorldPage } from './pages/World';
import { BuildingEditorPage } from './pages/BuildingEditorPage';
import { BlueprintEditorPage } from './pages/BlueprintEditorPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<WorldPage showEditor={false} />} />
        <Route path="/building" element={<BuildingEditorPage />} />
        <Route path="/blueprints" element={<BlueprintEditorPage />} />
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
