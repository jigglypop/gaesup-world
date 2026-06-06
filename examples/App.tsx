import React, { Suspense, lazy } from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Navigation } from './components/nav/Navigation';

const GaesupAdmin = lazy(() => import('gaesup-world/admin').then((module) => ({ default: module.GaesupAdmin })));
const WorldPage = lazy(() => import('./pages/World').then((module) => ({ default: module.WorldPage })));
const MinimalExamplePage = lazy(() => import('./pages/MinimalExamplePage').then((module) => ({ default: module.MinimalExamplePage })));
const EditPage = lazy(() => import('./pages/EditPage').then((module) => ({ default: module.EditPage })));
const NPCEditorPage = lazy(() => import('./pages/NPCEditorPage').then((module) => ({ default: module.NPCEditorPage })));
const NetworkMultiplayerPage = lazy(() => import('./pages/NetworkMultiplayerPage').then((module) => ({ default: module.NetworkMultiplayerPage })));

function AppLayout() {
  React.useEffect(() => {
    void import('./packageSurface').then((module) => {
      module.createPackageSurfaceExample();
    });
  }, []);

  return (
    <>
      <Navigation />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/index.html" element={<WorldPage showHud />} />
          <Route path="/" element={<WorldPage showHud />} />
          <Route path="/world" element={<WorldPage showHud />} />
          <Route path="/minimal" element={<MinimalExamplePage />} />
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
      </Suspense>
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
