import React, { useEffect, useMemo, useState } from 'react';

import {
  FiBox,
  FiCpu,
  FiEdit3,
  FiGrid,
  FiLayers,
  FiPlay,
  FiSave,
  FiShare2,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

import { WorldPage } from './World';
import { createBuildingPlugin, createPluginRegistry, useBuildingStore } from '../../src';

const SAMPLE_BLOCK_IDS = ['showcase-block-a', 'showcase-block-b', 'showcase-block-c', 'showcase-block-d'];

function useShowcaseStats() {
  const wallGroups = useBuildingStore((state) => state.wallGroups);
  const tileGroups = useBuildingStore((state) => state.tileGroups);
  const blocks = useBuildingStore((state) => state.blocks);
  const objects = useBuildingStore((state) => state.objects);

  return useMemo(() => {
    const wallCount = Array.from(wallGroups.values()).reduce((sum, group) => sum + group.walls.length, 0);
    const tileCount = Array.from(tileGroups.values()).reduce((sum, group) => sum + group.tiles.length, 0);
    return {
      walls: wallCount,
      tiles: tileCount,
      blocks: blocks.length,
      objects: objects.length,
    };
  }, [wallGroups, tileGroups, blocks, objects]);
}

function seedSampleBlocks() {
  const state = useBuildingStore.getState();
  state.initializeDefaults();
  const hasSample = state.blocks.some((block) => SAMPLE_BLOCK_IDS.includes(block.id));
  if (hasSample) return;

  const size = 4;
  state.addBlock({
    id: SAMPLE_BLOCK_IDS[0]!,
    position: { x: -size, y: 0, z: -size },
    size: { x: 1, y: 1, z: 1 },
    materialId: 'default-block',
    tags: ['showcase', 'foundation'],
  });
  state.addBlock({
    id: SAMPLE_BLOCK_IDS[1]!,
    position: { x: 0, y: 0, z: -size },
    size: { x: 1, y: 2, z: 1 },
    materialId: 'default-block',
    tags: ['showcase', 'wall'],
  });
  state.addBlock({
    id: SAMPLE_BLOCK_IDS[2]!,
    position: { x: size, y: 0, z: -size },
    size: { x: 1, y: 1, z: 2 },
    materialId: 'default-block',
    tags: ['showcase', 'volume'],
  });
  state.addBlock({
    id: SAMPLE_BLOCK_IDS[3]!,
    position: { x: 0, y: 2, z: -size },
    size: { x: 1, y: 1, z: 1 },
    materialId: 'default-block',
    tags: ['showcase', 'stacked'],
  });
}

function ShowcaseOverlay() {
  const editMode = useBuildingStore((state) => state.editMode);
  const currentTileMultiplier = useBuildingStore((state) => state.currentTileMultiplier);
  const currentTileHeight = useBuildingStore((state) => state.currentTileHeight);
  const setEditMode = useBuildingStore((state) => state.setEditMode);
  const setTileMultiplier = useBuildingStore((state) => state.setTileMultiplier);
  const setTileHeight = useBuildingStore((state) => state.setTileHeight);
  const serialize = useBuildingStore((state) => state.serialize);
  const hydrate = useBuildingStore((state) => state.hydrate);
  const stats = useShowcaseStats();
  const [pluginSummary, setPluginSummary] = useState({ plugins: 0, grids: 0, placement: 0 });

  useEffect(() => {
    let cancelled = false;
    const registry = createPluginRegistry();
    registry.register(createBuildingPlugin({ pluginId: '@gaesup/showcase-building' }));
    registry.setup('@gaesup/showcase-building').then(() => {
      if (cancelled) return;
      setPluginSummary({
        plugins: registry.list().length,
        grids: registry.context.grid.list().length,
        placement: registry.context.placement.list().length,
      });
    }).catch(() => {
      if (!cancelled) setPluginSummary({ plugins: registry.list().length, grids: 0, placement: 0 });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResetSample = () => {
    const snapshot = serialize();
    hydrate({
      ...snapshot,
      blocks: snapshot.blocks.filter((block) => !SAMPLE_BLOCK_IDS.includes(block.id)),
    });
    window.requestAnimationFrame(seedSampleBlocks);
  };

  return (
    <section className="showcase-shell" aria-label="Gaesup feature showcase">
      <div className="showcase-topbar">
        <div className="showcase-brand">
          <span className="showcase-brand-mark">G</span>
          <span className="showcase-brand-text">Gaesup World</span>
        </div>
        <div className="showcase-routebar" aria-label="Example routes">
          <Link to="/edit" className="showcase-route"><FiEdit3 /> Editor</Link>
          <Link to="/building" className="showcase-route"><FiGrid /> Building</Link>
          <Link to="/blueprints" className="showcase-route"><FiLayers /> Blueprints</Link>
          <Link to="/network" className="showcase-route"><FiShare2 /> Network</Link>
        </div>
      </div>

      <div className="showcase-panel showcase-panel-left">
        <div className="showcase-section-title">Runtime Modules</div>
        <div className="showcase-modes" role="group" aria-label="Edit modes">
          <button
            className={`showcase-tool ${editMode === 'none' ? 'active' : ''}`}
            onClick={() => setEditMode('none')}
          >
            <FiPlay /> Play
          </button>
          <button
            className={`showcase-tool ${editMode === 'tile' ? 'active' : ''}`}
            onClick={() => setEditMode('tile')}
          >
            <FiLayers /> Tile
          </button>
          <button
            className={`showcase-tool ${editMode === 'block' ? 'active' : ''}`}
            onClick={() => setEditMode('block')}
          >
            <FiBox /> Block
          </button>
          <button
            className={`showcase-tool ${editMode === 'wall' ? 'active' : ''}`}
            onClick={() => setEditMode('wall')}
          >
            <FiGrid /> Wall
          </button>
        </div>

        <div className="showcase-section-title">Placement</div>
        <div className="showcase-control-row">
          {[1, 2, 3, 4].map((size) => (
            <button
              key={size}
              className={`showcase-step ${currentTileMultiplier === size ? 'active' : ''}`}
              onClick={() => setTileMultiplier(size)}
            >
              {size}x
            </button>
          ))}
        </div>
        <div className="showcase-control-row">
          {[0, 1, 2, 3].map((height) => (
            <button
              key={height}
              className={`showcase-step ${currentTileHeight === height ? 'active' : ''}`}
              onClick={() => setTileHeight(height)}
            >
              L{height}
            </button>
          ))}
        </div>
        <button className="showcase-wide-action" onClick={handleResetSample}>
          <FiBox /> Reset Blocks
        </button>
      </div>

      <div className="showcase-panel showcase-panel-right">
        <div className="showcase-section-title">Scene State</div>
        <div className="showcase-stat-grid">
          <div><span>{stats.tiles}</span><small>tiles</small></div>
          <div><span>{stats.blocks}</span><small>blocks</small></div>
          <div><span>{stats.walls}</span><small>walls</small></div>
          <div><span>{stats.objects}</span><small>objects</small></div>
        </div>

        <div className="showcase-section-title">Plugin Context</div>
        <div className="showcase-plugin-list">
          <div><FiCpu /><span>plugins</span><strong>{pluginSummary.plugins}</strong></div>
          <div><FiGrid /><span>grid</span><strong>{pluginSummary.grids}</strong></div>
          <div><FiSave /><span>placement</span><strong>{pluginSummary.placement}</strong></div>
        </div>
      </div>
    </section>
  );
}

export function ShowcasePage() {
  useEffect(() => {
    seedSampleBlocks();
  }, []);

  return (
    <WorldPage>
      <ShowcaseOverlay />
    </WorldPage>
  );
}
