import React, { useMemo, useState } from 'react';

import { CharacterMenu, MENU_PRESETS, type CharacterMenuPreset, type CharacterMenuRenderers } from './index';

export function BasicCharacterMenuExample() {
  return <CharacterMenu toggleKey="C" preset="default" />;
}
export function CompactCharacterMenuExample() {
  return <CharacterMenu toggleKey="E" preset="compact" />;
}
export function ControlledCharacterMenuExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open menu
      </button>
      <CharacterMenu open={open} onClose={() => setOpen(false)} preset="default" />
    </>
  );
}
export function RendererCharacterMenuExample() {
  const renderers = useMemo<CharacterMenuRenderers>(
    () => ({
      header: (menu) => (
        <header>
          <strong>{menu.appearance.name}</strong>
          <button type="button" onClick={menu.actions.close}>
            Done
          </button>
        </header>
      ),
      assetButton: (menu, slot, asset, active) => (
        <button type="button" onClick={() => menu.actions.equipOutfit(slot, asset.id)}>
          {active ? 'Selected ' : ''}
          {asset.name}
        </button>
      ),
    }),
    [],
  );
  return <CharacterMenu toggleKey="C" preset="creative" renderers={renderers} />;
}
export function CustomPresetCharacterMenuExample() {
  const preset = useMemo<CharacterMenuPreset>(
    () => ({
      id: 'sidebar-left',
      name: 'Sidebar left',
      layout: 'sidebar-left',
      position: {
        top: 16,
        left: 16,
        width: 320,
        maxHeight: 'calc(100vh - 32px)',
      },
      theme: {
        bgColor: 'rgba(18, 20, 28, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        textColor: '#f3f4f8',
        accentColor: '#7adf90',
        blurEffect: true,
      },
      features: {
        zoomControl: true,
        closeUpMode: true,
        previewRotate: false,
        colorPicker: false,
        assetBrowser: true,
        savePresets: false,
      },
      sections: ['preview', 'identity', 'outfits'],
      slots: ['hat', 'top', 'bottom', 'shoes', 'weapon'],
      compact: true,
    }),
    [],
  );
  return <CharacterMenu toggleKey="C" preset={preset} />;
}
export function PresetSelectorCharacterMenuExample() {
  const [selectedPreset, setSelectedPreset] = useState('default');
  return (
    <>
      <div>
        {Object.values(MENU_PRESETS).map((preset) => (
          <button key={preset.id} type="button" onClick={() => setSelectedPreset(preset.id)}>
            {preset.name}
          </button>
        ))}
      </div>
      <CharacterMenu preset={selectedPreset} toggleKey="C" />
    </>
  );
}
