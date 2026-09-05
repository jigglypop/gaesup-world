import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { AnimationPanel } from '../AnimationPanel';
import { MotionPanel } from '../MotionPanel';

describe('AnimationPanel', () => {
  test('커스텀 탭으로 내용을 교체할 수 있어야 한다', () => {
    render(
      <AnimationPanel
        tabs={[
          { id: 'Player', label: 'Timeline', render: () => <div>Timeline body</div> },
          { id: 'Debug', label: 'Signals', render: () => <div>Signals body</div> },
        ]}
      />,
    );
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Timeline body')).toBeInTheDocument();
  });
  test('탭 전환과 root renderer를 사용할 수 있어야 한다', () => {
    const onTabChange = jest.fn();
    render(
      <AnimationPanel
        onTabChange={onTabChange}
        tabs={[
          { id: 'Player', label: 'Timeline', render: () => <div>Timeline body</div> },
          { id: 'Debug', label: 'Signals', render: () => <div>Signals body</div> },
        ]}
        renderers={{
          root: (_, children) => <section data-testid="animation-root">{children}</section>,
        }}
      />,
    );
    fireEvent.click(screen.getByText('Signals'));
    expect(onTabChange).toHaveBeenCalledWith('Debug');
    expect(screen.getByText('Signals body')).toBeInTheDocument();
    expect(screen.getByTestId('animation-root')).toBeInTheDocument();
  });
});
describe('MotionPanel', () => {
  test('커스텀 탭으로 내용을 교체할 수 있어야 한다', () => {
    render(
      <MotionPanel
        tabs={[
          { id: 'Controller', label: 'Drive', render: () => <div>Drive body</div> },
          { id: 'Debug', label: 'Trace', render: () => <div>Trace body</div> },
        ]}
      />,
    );
    expect(screen.getByText('Drive')).toBeInTheDocument();
    expect(screen.getByText('Drive body')).toBeInTheDocument();
  });
  test('탭 전환과 content renderer를 사용할 수 있어야 한다', () => {
    const onTabChange = jest.fn();
    render(
      <MotionPanel
        onTabChange={onTabChange}
        tabs={[
          { id: 'Controller', label: 'Drive', render: () => <div>Drive body</div> },
          { id: 'Debug', label: 'Trace', render: () => <div>Trace body</div> },
        ]}
        renderers={{
          content: (_, children) => <section data-testid="motion-content">{children}</section>,
        }}
      />,
    );
    fireEvent.click(screen.getByText('Trace'));
    expect(onTabChange).toHaveBeenCalledWith('Debug');
    expect(screen.getByText('Trace body')).toBeInTheDocument();
    expect(screen.getByTestId('motion-content')).toBeInTheDocument();
  });
});
