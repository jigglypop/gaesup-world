import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { useAssetStore } from '../../../../assets';
import { useCharacterStore } from '../../../stores/characterStore';
import { CharacterMenu } from '../index';

describe('CharacterMenu 커스텀 UI', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetAppearance();
    useAssetStore.getState().resetAssets();
  });
  test('루트 renderer로 기본 마크업 없이 커스텀 UI를 렌더링한다', () => {
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <CharacterMenu
          open
          labels={{ title: 'Custom Title' }}
          renderers={{
            root: (menu) => (
              <section data-testid="custom-root">
                <button type="button" onClick={menu.actions.close}>
                  {menu.labels.title}
                </button>
              </section>
            ),
          }}
        />,
      );
    });
    const root = renderer as ReactTestRenderer;
    expect(root.root.findByProps({ 'data-testid': 'custom-root' }).children[0]).toBeDefined();
    expect(() => root.root.findByProps({ className: 'character-menu-panel' })).toThrow();
    act(() => {
      root.unmount();
    });
  });
  test('에셋 버튼 renderer와 보유 판정으로 장착 UI를 대체한다', () => {
    useAssetStore.getState().registerAssets([
      {
        id: 'custom-hat-locked',
        name: 'Locked Hat',
        kind: 'characterPart',
        slot: 'hat',
        metadata: { ownedByPlayer: false },
      },
      {
        id: 'custom-hat-owned',
        name: 'Owned Hat',
        kind: 'characterPart',
        slot: 'hat',
        metadata: { ownedByPlayer: true },
      },
    ]);
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <CharacterMenu
          open
          slots={['hat']}
          ownedOnlyDefault
          features={{ tagFilter: false, ownedOnly: true }}
          isAssetOwned={(asset) => asset.metadata?.['ownedByPlayer'] === true}
          renderers={{
            assetButton: (menu, slot, asset, active) => (
              <button
                type="button"
                data-testid="asset-button"
                data-active={active ? 'true' : 'false'}
                onClick={() => menu.actions.equipOutfit(slot, asset.id)}
              >
                {asset.name}
              </button>
            ),
          }}
        />,
      );
    });
    const root = renderer as ReactTestRenderer;
    const buttons = root.root.findAllByProps({ 'data-testid': 'asset-button' });
    expect(buttons).toHaveLength(1);
    expect(buttons[0].children).toEqual(['Owned Hat']);
    const handleClick = buttons[0].props.onClick as () => void;
    act(() => {
      handleClick();
    });
    expect(useCharacterStore.getState().outfits.hat).toBe('custom-hat-owned');
    act(() => {
      root.unmount();
    });
  });
});
