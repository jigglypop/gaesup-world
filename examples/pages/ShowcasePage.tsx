import React, { useLayoutEffect } from 'react';

import { WorldPage } from './World';
import { useBuildingStore, useGaesupStore } from '../../src';
import { CAMERA_PRESETS } from '../components/info/constants';

const SAMPLE_BLOCK_SIZE = 4;
const SAMPLE_BLOCKS = [
  {
    id: 'showcase-block-a',
    position: { x: -SAMPLE_BLOCK_SIZE, y: 0, z: -SAMPLE_BLOCK_SIZE },
    size: { x: 1, y: 1, z: 1 },
    materialId: 'default-block',
    tags: ['showcase', 'foundation'],
  },
  {
    id: 'showcase-block-b',
    position: { x: 0, y: 0, z: -SAMPLE_BLOCK_SIZE },
    size: { x: 1, y: 2, z: 1 },
    materialId: 'default-block',
    tags: ['showcase', 'wall'],
  },
  {
    id: 'showcase-block-c',
    position: { x: SAMPLE_BLOCK_SIZE, y: 0, z: -SAMPLE_BLOCK_SIZE },
    size: { x: 1, y: 1, z: 2 },
    materialId: 'default-block',
    tags: ['showcase', 'volume'],
  },
  {
    id: 'showcase-block-d',
    position: { x: 0, y: 2, z: -SAMPLE_BLOCK_SIZE },
    size: { x: 1, y: 1, z: 1 },
    materialId: 'default-block',
    tags: ['showcase', 'stacked'],
  },
];
const SAMPLE_BLOCK_IDS = SAMPLE_BLOCKS.map((block) => block.id);

function seedSampleBlocks() {
  const state = useBuildingStore.getState();
  state.initializeDefaults();
  const hasSample = state.blocks.some((block) => SAMPLE_BLOCK_IDS.includes(block.id));
  if (hasSample) return;

  SAMPLE_BLOCKS.forEach((block) => state.addBlock(block));
}

export function ShowcasePage() {
  useLayoutEffect(() => {
    const store = useGaesupStore.getState();
    store.setMode({ type: 'character', controller: 'keyboard', control: 'thirdPerson' });
    store.setCameraOption(CAMERA_PRESETS.thirdPerson);
    seedSampleBlocks();
  }, []);

  return <WorldPage showHud={false} />;
}
