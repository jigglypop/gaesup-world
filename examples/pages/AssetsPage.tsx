import { AssetCatalogPanel } from '../components/assets/AssetCatalogPanel';
import './styles/AssetsPage.css';

export function AssetsPage() {
  return (
    <main className="example-assets-page">
      <header className="example-assets-page__header">
        <p className="example-assets-page__eyebrow">Blender to runtime</p>
        <h1>Asset catalog</h1>
        <p>Inspect asset IDs, kinds, slots and tags through the public assets package.</p>
      </header>
      <AssetCatalogPanel mode="page" />
    </main>
  );
}
