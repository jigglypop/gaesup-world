import { scriptProp } from './props';
import { defineScript, registerScript } from './registry';

const DEGREES_TO_RADIANS = Math.PI / 180;

export const BUILTIN_SCRIPT_IDS = {
  rotator: 'gaesup.rotator',
  door: 'gaesup.door',
  triggerZone: 'gaesup.triggerZone',
  collectible: 'gaesup.collectible',
  dialogTrigger: 'gaesup.dialogTrigger',
} as const;

export type DialogTriggerService = {
  start: (dialogTreeId: string, npcId?: string) => void;
};

function moveTowards(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

export const rotatorScript = defineScript({
  id: BUILTIN_SCRIPT_IDS.rotator,
  name: '회전체',
  props: {
    degreesPerSecond: scriptProp.number({ default: 45 }),
  },
  create: (ctx, props) => ({
    onUpdate: (delta) => {
      ctx.object.rotation.y += props.degreesPerSecond * DEGREES_TO_RADIANS * delta;
    },
  }),
});

export const doorScript = defineScript({
  id: BUILTIN_SCRIPT_IDS.door,
  name: '문',
  props: {
    openDegrees: scriptProp.number({ default: 90, min: -180, max: 180 }),
    degreesPerSecond: scriptProp.number({ default: 180, min: 1 }),
    requiredItemId: scriptProp.assetRef({ assetKind: 'item', default: null }),
  },
  create: (ctx, props) => {
    const closedYaw = ctx.object.rotation.y;
    let targetYaw = closedYaw;
    return {
      onInteract: () => {
        if (props.requiredItemId) {
          const inventory = ctx.services.get<{ has: (itemId: string, count: number) => boolean }>('inventory');
          if (!inventory?.has(props.requiredItemId, 1)) {
            ctx.emit('door:locked', { objectId: ctx.objectId });
            return;
          }
        }
        const isOpen = targetYaw !== closedYaw;
        targetYaw = isOpen ? closedYaw : closedYaw + props.openDegrees * DEGREES_TO_RADIANS;
        ctx.emit(isOpen ? 'door:closing' : 'door:opening', { objectId: ctx.objectId });
      },
      onUpdate: (delta) => {
        const step = props.degreesPerSecond * DEGREES_TO_RADIANS * delta;
        ctx.object.rotation.y = moveTowards(ctx.object.rotation.y, targetYaw, step);
      },
    };
  },
});

export const triggerZoneScript = defineScript({
  id: BUILTIN_SCRIPT_IDS.triggerZone,
  name: '트리거 존',
  props: {
    enterEvent: scriptProp.string({ default: 'zone:enter' }),
    exitEvent: scriptProp.string({ default: 'zone:exit' }),
    requiredTag: scriptProp.string({ default: '' }),
  },
  create: (ctx, props) => {
    const accepts = (otherId: string) =>
      !props.requiredTag || Boolean(ctx.findOne({ id: otherId, tag: props.requiredTag }));
    return {
      onTriggerEnter: (otherId) => {
        if (accepts(otherId)) ctx.emit(props.enterEvent, { zoneId: ctx.objectId, otherId });
      },
      onTriggerExit: (otherId) => {
        if (accepts(otherId)) ctx.emit(props.exitEvent, { zoneId: ctx.objectId, otherId });
      },
    };
  },
});

export const collectibleScript = defineScript({
  id: BUILTIN_SCRIPT_IDS.collectible,
  name: '수집 아이템',
  props: {
    itemId: scriptProp.string({ default: '' }),
    count: scriptProp.number({ default: 1, min: 1 }),
    collectorTag: scriptProp.string({ default: 'player' }),
    removeOnCollect: scriptProp.boolean({ default: true }),
  },
  create: (ctx, props) => {
    let collected = false;
    return {
      onTriggerEnter: (otherId) => {
        if (collected || !ctx.findOne({ id: otherId, tag: props.collectorTag })) return;
        collected = true;
        const inventory = ctx.services.get<{ add: (itemId: string, count: number) => number }>('inventory');
        if (props.itemId) inventory?.add(props.itemId, props.count);
        ctx.emit('item:collected', { objectId: ctx.objectId, itemId: props.itemId, count: props.count, collectorId: otherId });
        if (props.removeOnCollect) ctx.commit({ type: 'scene-object.delete', objectId: ctx.objectId });
      },
    };
  },
});

export const dialogTriggerScript = defineScript({
  id: BUILTIN_SCRIPT_IDS.dialogTrigger,
  name: '대화 트리거',
  props: {
    dialogTreeId: scriptProp.string({ default: '' }),
    npcId: scriptProp.string({ default: '' }),
  },
  create: (ctx, props) => ({
    onInteract: () => {
      if (!props.dialogTreeId) return;
      const dialog = ctx.services.get<DialogTriggerService>('dialog');
      if (dialog) {
        dialog.start(props.dialogTreeId, props.npcId || undefined);
        return;
      }
      ctx.emit('dialog:request', { dialogTreeId: props.dialogTreeId, npcId: props.npcId });
    },
  }),
});

export function registerBuiltinScripts(): () => void {
  const unregister = [
    registerScript(rotatorScript),
    registerScript(doorScript),
    registerScript(triggerZoneScript),
    registerScript(collectibleScript),
    registerScript(dialogTriggerScript),
  ];
  return () => unregister.forEach((dispose) => dispose());
}
