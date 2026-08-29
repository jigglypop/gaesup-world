import React from 'react';

import { Link } from 'react-router-dom';

import { EXAMPLE_ROUTES } from '../config/exampleRoutes';
import './styles/ExampleCatalogPage.css';

export function ExampleCatalogPage() {
  return (
    <main className="example-catalog-page">
      <header className="example-catalog-page__header">
        <p className="example-catalog-page__eyebrow">gaesup-world examples</p>
        <h1 className="example-catalog-page__title">All examples</h1>
        <p className="example-catalog-page__description">
          Every example is a consumer-facing route and imports the library through its public
          package entry points.
        </p>
      </header>
      <div className="example-catalog-page__grid">
        {EXAMPLE_ROUTES.map((example) => (
          <Link key={example.path} to={example.path} className="example-catalog-card">
            <span className="example-catalog-card__category">{example.category}</span>
            <strong className="example-catalog-card__label">{example.label}</strong>
            <span className="example-catalog-card__description">{example.description}</span>
            <span className="example-catalog-card__path">{example.path}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
