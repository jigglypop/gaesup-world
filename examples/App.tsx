import React, { Suspense, lazy } from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AdminTest from './AdminTest';
import { ExampleErrorBoundary } from './components/harness';
import { AppShell } from './components/shell/AppShell';
import { AssetsPage } from './pages/AssetsPage';
import { ExampleCatalogPage } from './pages/ExampleCatalogPage';
import { HomePage } from './pages/HomePage';

const GaesupAdmin = lazy(() =>
  import('gaesup-world/admin').then((module) => ({ default: module.GaesupAdmin })),
);
const WorldPage = lazy(() =>
  import('./pages/World').then((module) => ({ default: module.WorldPage })),
);
const MinimalExamplePage = lazy(() =>
  import('./pages/MinimalExamplePage').then((module) => ({ default: module.MinimalExamplePage })),
);
const EditPage = lazy(() =>
  import('./pages/EditPage').then((module) => ({ default: module.EditPage })),
);
const NPCEditorPage = lazy(() =>
  import('./pages/NPCEditorPage').then((module) => ({ default: module.NPCEditorPage })),
);
const NetworkMultiplayerPage = lazy(() =>
  import('./pages/NetworkMultiplayerPage').then((module) => ({
    default: module.NetworkMultiplayerPage,
  })),
);
const ShowcasePage = lazy(() =>
  import('./pages/ShowcasePage').then((module) => ({ default: module.ShowcasePage })),
);
const BuildingEditorPage = lazy(() =>
  import('./pages/BuildingEditorPage').then((module) => ({ default: module.BuildingEditorPage })),
);
const BlueprintEditorPage = lazy(() =>
  import('./pages/BlueprintEditorPage').then((module) => ({ default: module.BlueprintEditorPage })),
);
const NextCorePage = lazy(() =>
  import('./pages/NextCorePage').then((module) => ({ default: module.NextCorePage })),
);

function AppLayout() {
  React.useEffect(() => {
    void import('./packageSurface').then((module) => {
      module.createPackageSurfaceExample();
    });
  }, []);
  return (
    <AppShell>
      <Suspense fallback={<div className="example-route-loading">시나리오 불러오는 중...</div>}>
        <ExampleErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/index.html" element={<HomePage />} />
            <Route path="/world" element={<WorldPage showHud />} />
            <Route path="/creator" element={<EditPage />} />
            <Route path="/multiplayer" element={<NetworkMultiplayerPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/performance" element={<NextCorePage />} />
            <Route path="/examples" element={<ExampleCatalogPage />} />
            <Route path="/minimal" element={<MinimalExamplePage />} />
            <Route path="/edit" element={<EditPage />} />
            <Route path="/edit/npc" element={<NPCEditorPage />} />
            <Route path="/showcase" element={<ShowcasePage />} />
            <Route path="/building" element={<BuildingEditorPage />} />
            <Route path="/blueprints" element={<BlueprintEditorPage />} />
            <Route path="/blueprints/*" element={<BlueprintEditorPage />} />
            <Route path="/network" element={<NetworkMultiplayerPage />} />
            <Route path="/next" element={<NextCorePage />} />
            <Route path="/admin-test" element={<AdminTest />} />
            <Route
              path="/admin/*"
              element={
                <GaesupAdmin>
                  <WorldPage showEditor showHud={false} />
                </GaesupAdmin>
              }
            />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </ExampleErrorBoundary>
      </Suspense>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
