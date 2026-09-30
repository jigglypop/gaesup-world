import { Component, type ReactNode } from 'react';

import { GLTF_RETRY_MS } from './GLTFAssetCache';

type AssetBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
  /** What the content loads; content that failed tries again at once when it changes. */
  source?: unknown;
};

/**
 * Draws `fallback` in place of content whose model failed to load, and renders the content again after a pause: the
 * cache downloads the model again once its own retry pause is over, so a model lost to a dropped connection comes back.
 */
export class AssetBoundary extends Component<AssetBoundaryProps, { failed: boolean }> {
  override state = { failed: false };
  private retry: ReturnType<typeof setTimeout> | undefined;

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch() {
    clearTimeout(this.retry);
    this.retry = setTimeout(() => this.setState({ failed: false }), GLTF_RETRY_MS);
  }

  override componentDidUpdate(previous: AssetBoundaryProps) {
    if (this.state.failed && previous.source !== this.props.source) this.setState({ failed: false });
  }

  override componentWillUnmount() {
    clearTimeout(this.retry);
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
