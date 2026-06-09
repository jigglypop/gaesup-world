import { Fragment, type ReactNode } from 'react';

import type { AssetRecord } from '../../../../assets';
import type { OutfitSlot } from '../../../types';
import { CHARACTER_MENU_SLOT_SURFACE } from '../config';
import type { CharacterMenuRenderContext, CharacterMenuRenderers } from '../types';

type OutfitSlotSectionProps = {
  context: CharacterMenuRenderContext;
  renderers: CharacterMenuRenderers | undefined;
};

function renderAssetButton(
  context: CharacterMenuRenderContext,
  slot: OutfitSlot,
  asset: AssetRecord,
  active: boolean,
): ReactNode {
  return (
    <button
      type="button"
      title={asset.name}
      className={context.classNameFor(active ? 'activeAssetButton' : 'assetButton')}
      style={context.styleFor(
        active ? 'activeAssetButton' : 'assetButton',
        context.getButtonStyle(active),
      )}
      onClick={() => context.actions.equipOutfit(slot, asset.id)}
    >
      {asset.thumbnailUrl ? (
        <img src={asset.thumbnailUrl} alt={asset.name} className={context.classNameFor('assetImage')} />
      ) : (
        <span className={context.classNameFor('assetInitial')}>{context.getAssetInitial(asset)}</span>
      )}
      <span className={context.classNameFor('assetName')}>{asset.name}</span>
    </button>
  );
}
function renderEmptyAssets(context: CharacterMenuRenderContext): ReactNode {
  return (
    <div
      className={context.classNameFor('emptyState')}
      style={context.styleFor('emptyState', { borderColor: context.preset.theme.borderColor })}
    >
      {context.labels.emptyAssets}
    </div>
  );
}
function renderSlot(
  context: CharacterMenuRenderContext,
  renderers: CharacterMenuRenderers | undefined,
  slot: OutfitSlot,
  assets: AssetRecord[],
): ReactNode {
  if (renderers?.outfitSlot) return renderers.outfitSlot(context, slot, assets);
  return (
    <div
      className={context.classNameFor('slot')}
      style={context.styleFor('slot', {
        background: CHARACTER_MENU_SLOT_SURFACE,
        borderColor: context.preset.theme.borderColor,
      })}
    >
      <div className={context.classNameFor('slotHeader')}>
        <span className={context.classNameFor('slotTitle')}>{context.labelMaps.slots[slot]}</span>
        {context.features.clearSlot && context.outfits[slot] && (
          <button
            type="button"
            className={context.classNameFor('iconButton')}
            style={context.styleFor('iconButton', context.getButtonStyle())}
            onClick={() => context.actions.equipOutfit(slot, null)}
          >
            {context.labels.clearSlot}
          </button>
        )}
      </div>
      {assets.length === 0 ? (
        renderers?.emptyAssets?.(context, slot) ?? renderEmptyAssets(context)
      ) : (
        <div className={context.classNameFor('assetGrid')}>
          {assets.map((asset) => {
            const active = context.outfits[slot] === asset.id;
            return (
              <Fragment key={asset.id}>
                {renderers?.assetButton?.(context, slot, asset, active) ??
                  renderAssetButton(context, slot, asset, active)}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
export function OutfitSlotSection({ context, renderers }: OutfitSlotSectionProps) {
  return (
    <section
      className={context.classNameFor('section')}
      style={context.styleFor('section', context.getSectionStyle())}
    >
      <p className={context.classNameFor('sectionTitle')}>{context.labels.outfits}</p>
      {(context.features.tagFilter || context.features.ownedOnly) && (
        <div className={context.classNameFor('filterRow')}>
          {context.features.tagFilter && (
            <input
              value={context.tagFilter}
              onChange={(event) => context.actions.setTagFilter(event.target.value)}
              placeholder={context.labels.tagFilter}
              className={context.classNameFor('input')}
              style={context.styleFor('input', {
                borderColor: context.preset.theme.borderColor,
                color: context.preset.theme.textColor,
              })}
            />
          )}
          {context.features.ownedOnly && (
            <label className={context.classNameFor('filterLabel')}>
              <input
                type="checkbox"
                checked={context.ownedOnly}
                onChange={(event) => context.actions.setOwnedOnly(event.target.checked)}
                className={context.classNameFor('checkbox')}
              />
              {context.labels.ownedOnly}
            </label>
          )}
        </div>
      )}
      <div className={context.classNameFor('slotList')}>
        {context.selectedSlots.map((slot) => (
          <Fragment key={slot}>
            {renderSlot(context, renderers, slot, context.assetsBySlot[slot] ?? [])}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
