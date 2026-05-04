import { defineGaesupPlugin } from './template';
import type { GaesupPlugin } from './types';

const COZY_LIFE_PLUGIN_ID = '@gaesup/sample-cozy-life';
const HIGH_GRAPHICS_PLUGIN_ID = '@gaesup/sample-high-graphics';
const SHOOTER_KIT_PLUGIN_ID = '@gaesup/sample-shooter-kit';

export function createCozyLifeSamplePlugin(): GaesupPlugin {
  return defineGaesupPlugin({
    id: COZY_LIFE_PLUGIN_ID,
    name: 'Cozy Life Sample',
    version: '0.1.0',
    runtime: 'both',
    capabilities: ['catalog:cozy-life', 'quests:daily-life', 'npc:schedules'],
    setup(ctx) {
      ctx.catalog.register('sample.cozy-life.catalogPack', {
        itemTypes: ['crop', 'fish', 'bug', 'furniture'],
        starterItems: ['seed-turnip', 'rod', 'wood'],
      }, COZY_LIFE_PLUGIN_ID);
      ctx.quests.register('sample.cozy-life.dailyQuestPack', {
        objectiveTypes: ['collect', 'talk', 'deliver'],
        rewardTypes: ['bells', 'friendship', 'item'],
      }, COZY_LIFE_PLUGIN_ID);
      ctx.npc.register('sample.cozy-life.schedulePack', {
        activities: ['idle', 'shop', 'work', 'sleep'],
      }, COZY_LIFE_PLUGIN_ID);
      ctx.events.emit('plugin:sample-ready', { pluginId: COZY_LIFE_PLUGIN_ID });
    },
    dispose(ctx) {
      ctx.catalog.remove('sample.cozy-life.catalogPack');
      ctx.quests.remove('sample.cozy-life.dailyQuestPack');
      ctx.npc.remove('sample.cozy-life.schedulePack');
    },
  });
}

export function createHighGraphicsSamplePlugin(): GaesupPlugin {
  return defineGaesupPlugin({
    id: HIGH_GRAPHICS_PLUGIN_ID,
    name: 'High Graphics Sample',
    version: '0.1.0',
    runtime: 'client',
    capabilities: ['rendering:high-graphics'],
    setup(ctx) {
      ctx.rendering.register('sample.high-graphics.preset', {
        shadows: 'high',
        toneMapping: 'filmic',
        postprocess: ['bloom', 'color-grade', 'ambient-occlusion'],
      }, HIGH_GRAPHICS_PLUGIN_ID);
      ctx.assets.register('sample.high-graphics.assetPolicy', {
        preferredFormats: ['ktx2', 'webp', 'glb'],
        fallbackFormats: ['png', 'jpg', 'gltf'],
      }, HIGH_GRAPHICS_PLUGIN_ID);
      ctx.events.emit('plugin:sample-ready', { pluginId: HIGH_GRAPHICS_PLUGIN_ID });
    },
    dispose(ctx) {
      ctx.rendering.remove('sample.high-graphics.preset');
      ctx.assets.remove('sample.high-graphics.assetPolicy');
    },
  });
}

export function createShooterKitSamplePlugin(): GaesupPlugin {
  return defineGaesupPlugin({
    id: SHOOTER_KIT_PLUGIN_ID,
    name: 'Shooter Kit Sample',
    version: '0.1.0',
    runtime: 'both',
    capabilities: ['catalog:weapons', 'input:shooter', 'interactions:damage'],
    setup(ctx) {
      ctx.catalog.register('sample.shooter-kit.weaponTypes', {
        itemTypes: ['weapon', 'ammo', 'armor'],
        stats: ['damage', 'range', 'fireRate', 'reloadTime'],
      }, SHOOTER_KIT_PLUGIN_ID);
      ctx.input.register('sample.shooter-kit.bindings', {
        actions: {
          fire: ['Mouse0', 'GamepadRT'],
          aim: ['Mouse1', 'GamepadLT'],
          reload: ['KeyR', 'GamepadX'],
        },
      }, SHOOTER_KIT_PLUGIN_ID);
      ctx.interactions.register('sample.shooter-kit.damageable', {
        events: ['damage:request', 'damage:confirmed'],
        authority: 'server',
      }, SHOOTER_KIT_PLUGIN_ID);
      ctx.events.emit('plugin:sample-ready', { pluginId: SHOOTER_KIT_PLUGIN_ID });
    },
    dispose(ctx) {
      ctx.catalog.remove('sample.shooter-kit.weaponTypes');
      ctx.input.remove('sample.shooter-kit.bindings');
      ctx.interactions.remove('sample.shooter-kit.damageable');
    },
  });
}
