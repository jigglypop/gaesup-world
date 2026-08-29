import { Link } from 'react-router-dom';

import { PRODUCT_ROUTES } from '../config/exampleRoutes';
import './styles/HomePage.css';

export function HomePage() {
  return (
    <main className="example-home-page">
      <section className="example-home-page__hero">
        <p className="example-home-page__eyebrow">Persistent 3D social worlds</p>
        <h1 className="example-home-page__title">Build a world. Live in it together.</h1>
        <p className="example-home-page__summary">
          Gaesup World combines a playable React 3D runtime, world creation, public asset APIs,
          multiplayer foundations and a data-oriented path toward WebGPU.
        </p>
        <div className="example-home-page__actions">
          <Link
            className="example-home-page__action example-home-page__action--primary"
            to="/world"
          >
            Enter World
          </Link>
          <Link className="example-home-page__action" to="/creator">
            Open Creator
          </Link>
        </div>
      </section>
      <section className="example-home-page__scenarios" aria-labelledby="scenario-title">
        <div className="example-home-page__section-heading">
          <p className="example-home-page__eyebrow">Product scenarios</p>
          <h2 id="scenario-title">One platform, five clear entry points</h2>
        </div>
        <div className="example-home-page__grid">
          {PRODUCT_ROUTES.map((route) => (
            <Link key={route.path} className="example-home-card" to={route.path}>
              <span className="example-home-card__category">{route.category}</span>
              <strong className="example-home-card__label">{route.label}</strong>
              <span className="example-home-card__description">{route.description}</span>
              <span className="example-home-card__path">{route.path}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
