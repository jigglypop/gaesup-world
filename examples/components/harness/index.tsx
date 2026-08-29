import React from 'react';

import type { ExampleErrorBoundaryProps, ExampleErrorBoundaryState } from './types';
import './styles.css';

export class ExampleErrorBoundary extends React.Component<
  ExampleErrorBoundaryProps,
  ExampleErrorBoundaryState
> {
  override state: ExampleErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ExampleErrorBoundaryState {
    return { error };
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <section className="example-harness-error" role="alert">
        <p className="example-harness-error__eyebrow">Example unavailable</p>
        <h1 className="example-harness-error__title">This example could not render.</h1>
        <p className="example-harness-error__message">{error.message}</p>
        <button
          type="button"
          className="example-harness-error__button"
          onClick={() => window.location.reload()}
        >
          Reload example
        </button>
      </section>
    );
  }
}
