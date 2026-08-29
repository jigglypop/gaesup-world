import type { AppShellProps } from './types';
import { Navigation } from '../../nav/Navigation';
import './styles.css';

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="example-app-shell">
      <Navigation />
      <div className="example-app-shell__content">{children}</div>
    </div>
  );
}
