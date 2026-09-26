import { BuildingCustomTileForm } from './BuildingCustomTileForm';
import { BuildingTileOptions } from './BuildingTileOptions';
import { BuildingTilePicker } from './BuildingTilePicker';
import type { BuildingUIState } from './useBuildingUIState';

/** Tile mode: presets, categories, shape, height and terrain objects, and custom floors. */
export function BuildingTileSection({ ui }: { ui: BuildingUIState }) {
  const { editMode } = ui;
  return (
    <>
      {editMode === 'tile' && (
        <>
          <BuildingTilePicker ui={ui} />

          <BuildingCustomTileForm ui={ui} />

          <BuildingTileOptions ui={ui} />
        </>
      )}
    </>
  );
}
