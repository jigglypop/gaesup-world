import { Link } from 'react-router-dom';

import { PRODUCT_ROUTES } from '../config/exampleRoutes';
import './styles/HomePage.css';

export function HomePage() {
  return (
    <main className="example-home-page">
      <section className="example-home-page__hero">
        <p className="example-home-page__eyebrow">함께 만드는 3D 세상</p>
        <h1 className="example-home-page__title">나만의 공간을 만들고, 함께 즐겨요.</h1>
        <p className="example-home-page__summary">
          캐릭터와 함께 마을을 둘러보고, 집을 꾸미고, 친구를 만나보세요. 원하는 체험을 골라 바로
          시작할 수 있어요.
        </p>
        <div className="example-home-page__actions">
          <Link
            className="example-home-page__action example-home-page__action--primary"
            to="/world"
          >
            월드 들어가기
          </Link>
          <Link className="example-home-page__action" to="/creator">
            월드 꾸미기
          </Link>
        </div>
      </section>
      <section className="example-home-page__scenarios" aria-labelledby="scenario-title">
        <div className="example-home-page__section-heading">
          <p className="example-home-page__eyebrow">어떤 체험을 해볼까요?</p>
          <h2 id="scenario-title">탐험부터 제작까지</h2>
        </div>
        <div className="example-home-page__grid">
          {PRODUCT_ROUTES.map((route) => (
            <Link key={route.path} className="example-home-card" to={route.path}>
              <span className="example-home-card__category">{route.category}</span>
              <strong className="example-home-card__label">{route.label}</strong>
              <span className="example-home-card__description">{route.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
