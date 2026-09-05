import { AssetCatalogPanel } from '../components/assets/AssetCatalogPanel';
import './styles/AssetsPage.css';

export function AssetsPage() {
  return (
    <main className="example-assets-page">
      <header className="example-assets-page__header">
        <p className="example-assets-page__eyebrow">월드를 채우는 재료</p>
        <h1>에셋 둘러보기</h1>
        <p>캐릭터, 의상, 소품을 찾아보고 종류와 특징을 확인하세요.</p>
      </header>
      <AssetCatalogPanel mode="page" />
    </main>
  );
}
