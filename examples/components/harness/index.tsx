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

  override componentDidUpdate(previous: ExampleErrorBoundaryProps) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <section className="example-harness-error" role="alert">
        <p className="example-harness-error__eyebrow">예제를 표시할 수 없습니다</p>
        <h1 className="example-harness-error__title">화면을 불러오지 못했습니다.</h1>
        <p className="example-harness-error__message">
          다시 불러오거나 상단 메뉴에서 다른 시나리오를 선택해 주세요.
        </p>
        <details className="example-harness-error__details">
          <summary>개발자용 오류 상세</summary>
          <pre>{error.message}</pre>
        </details>
        <button
          type="button"
          className="example-harness-error__button"
          onClick={() => window.location.reload()}
        >
          다시 불러오기
        </button>
      </section>
    );
  }
}
