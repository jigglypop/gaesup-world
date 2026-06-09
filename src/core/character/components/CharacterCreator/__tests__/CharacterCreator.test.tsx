import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { CharacterCreator } from '../index';

describe('CharacterCreator 커스텀 UI', () => {
  test('CharacterMenu renderer를 그대로 받아 생성 화면을 대체한다', () => {
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <CharacterCreator
          open
          renderers={{
            root: (menu) => (
              <section data-testid="creator-root">
                <span>{menu.labels.title}</span>
                <span>{menu.preset.id}</span>
              </section>
            ),
          }}
        />,
      );
    });
    const root = renderer as ReactTestRenderer;
    const customRoot = root.root.findByProps({ 'data-testid': 'creator-root' });
    expect(customRoot.findAllByType('span').map((node) => node.children[0])).toEqual([
      'Character Creator',
      'creative',
    ]);
    act(() => {
      root.unmount();
    });
  });
  test('사용자 라벨과 기능 설정을 기본 생성 설정보다 우선한다', () => {
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <CharacterCreator
          open
          labels={{ title: 'Avatar Lab' }}
          features={{ ownedOnly: false }}
          renderers={{
            root: (menu) => (
              <section data-testid="creator-root">
                <span>{menu.labels.title}</span>
                <span>{String(menu.features.ownedOnly)}</span>
              </section>
            ),
          }}
        />,
      );
    });
    const root = renderer as ReactTestRenderer;
    const customRoot = root.root.findByProps({ 'data-testid': 'creator-root' });
    expect(customRoot.findAllByType('span').map((node) => node.children[0])).toEqual([
      'Avatar Lab',
      'false',
    ]);
    act(() => {
      root.unmount();
    });
  });
});
