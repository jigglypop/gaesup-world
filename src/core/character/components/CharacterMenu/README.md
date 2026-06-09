# CharacterMenu

`CharacterMenu` is exported from `gaesup-world` and can be used as a ready-made menu or as a controller-backed custom UI.

## Basic Usage

```tsx
import { CharacterMenu } from 'gaesup-world';

<CharacterMenu toggleKey="C" />;
```

## Replace UI Parts

Every major UI part can be replaced through `renderers`. A `root` renderer can ignore the default children and render a fully custom surface with the same state and actions.

```tsx
import { CharacterMenu, type CharacterMenuRenderers } from 'gaesup-world';

const renderers: CharacterMenuRenderers = {
  header: (menu) => (
    <header>
      <strong>{menu.appearance.name}</strong>
      <button onClick={menu.actions.close}>Done</button>
    </header>
  ),
  assetButton: (menu, slot, asset, active) => (
    <button onClick={() => menu.actions.equipOutfit(slot, asset.id)}>
      {active ? 'Selected ' : ''}
      {asset.name}
    </button>
  ),
};

<CharacterMenu toggleKey="C" renderers={renderers} />;
```

## Selective Exposure

Use `sections`, `hiddenSections`, `slots`, `hiddenSlots`, `features`, label maps, option lists, and asset filters to decide which controls and data are exposed.

```tsx
<CharacterMenu
  toggleKey="C"
  sections={['preview', 'identity', 'outfits']}
  hiddenSlots={['face', 'glasses']}
  features={{ colorPicker: false, tagFilter: true, ownedOnly: true }}
  labelMaps={{ slots: { weapon: 'Tool' } }}
  isAssetOwned={(asset) => asset.metadata?.ownedByPlayer === true}
/>;
```
