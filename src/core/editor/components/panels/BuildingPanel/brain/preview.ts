import type { NPCBehaviorConfig, NPCBrainBlueprintNode } from '../../../../../npc/types';
import { getNPCBrainLabel } from '../helpers';
import type { NPCBrainPreviewState } from './types';

/** What the preview shows: the selected action node, else the NPC's default patrol or wander, else idling. */
export function brainPreviewState(
  selectedNode: NPCBrainBlueprintNode | undefined,
  behavior: NPCBehaviorConfig | undefined,
): NPCBrainPreviewState {
  let state: NPCBrainPreviewState = {
    mode: 'idle',
    label: '대기',
  };

  if (selectedNode?.type === 'action') {
    switch (selectedNode.action.type) {
      case 'moveTo':
        state = {
          mode: 'move',
          label: '지점 이동',
          target: selectedNode.action.target,
          ...(selectedNode.action.animationId
            ? { animationId: selectedNode.action.animationId }
            : {}),
        };
        break;
      case 'patrol':
        state = {
          mode: 'patrol',
          label: '순찰',
          waypoints: selectedNode.action.waypoints,
          ...(selectedNode.action.animationId
            ? { animationId: selectedNode.action.animationId }
            : {}),
        };
        break;
      case 'wander':
        state = {
          mode: 'wander',
          label: '배회',
          ...(selectedNode.action.radius ? { radius: selectedNode.action.radius } : {}),
        };
        break;
      case 'moveToTarget':
        state =
          selectedNode.action.target.type === 'point'
            ? {
                mode: 'move',
                label: '지점 이동',
                target: selectedNode.action.target.value,
                ...(selectedNode.action.animationId
                  ? { animationId: selectedNode.action.animationId }
                  : {}),
              }
            : {
                mode: 'action',
                label: `${getNPCBrainLabel(selectedNode.action.target.type)} 이동`,
                ...(selectedNode.action.animationId
                  ? { animationId: selectedNode.action.animationId }
                  : {}),
              };
        break;
      case 'playAnimation':
        state = {
          mode: 'action',
          label: '애니메이션 재생',
          animationId: selectedNode.action.animationId,
        };
        break;
      case 'speak':
        state = {
          mode: 'action',
          label: `말하기: ${selectedNode.action.text}`,
        };
        break;
      default:
        state = {
          mode: 'action',
          label: getNPCBrainLabel(selectedNode.action.type),
        };
    }
  } else if (behavior?.mode === 'patrol' && behavior.waypoints && behavior.waypoints.length > 0) {
    state = {
      mode: 'patrol',
      label: '기본 행동: 순찰',
      waypoints: behavior.waypoints,
    };
  } else if (behavior?.mode === 'wander') {
    state = {
      mode: 'wander',
      label: '기본 행동: 배회',
      radius: behavior.wanderRadius ?? 4,
    };
  }


  return state;
}
