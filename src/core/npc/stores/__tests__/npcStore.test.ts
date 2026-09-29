import type { NPCBrainConfig, NPCInstance } from '../../types';
import { useNPCStore } from '../npcStore';

const initialState = useNPCStore.getState();

function createInstance(id: string, brain?: NPCBrainConfig): NPCInstance {
  return {
    id,
    templateId: 'template',
    name: id,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    ...(brain ? { brain } : {}),
  };
}

function withInstances(instances: NPCInstance[]): void {
  useNPCStore.setState({ instances: new Map(instances.map((instance) => [instance.id, instance])) });
}

afterEach(() => {
  useNPCStore.setState(initialState, true);
});

describe('NPC 스토어 기본값 초기화', () => {
  it('이미 초기화된 뒤에도 사용자가 고른 두뇌 모드를 덮어쓰지 않는다', () => {
    useNPCStore.getState().initializeDefaults();
    withInstances([
      createInstance('none', { mode: 'none' }),
      createInstance('scripted', { mode: 'scripted', blueprintId: 'blueprint' }),
      createInstance('llm', { mode: 'llm' }),
    ]);

    useNPCStore.getState().initializeDefaults();

    const { instances } = useNPCStore.getState();
    expect(instances.get('none')?.brain?.mode).toBe('none');
    expect(instances.get('scripted')?.brain).toEqual({ mode: 'scripted', blueprintId: 'blueprint' });
    expect(instances.get('llm')?.brain?.mode).toBe('llm');
  });

  it('두뇌가 없는 인스턴스에는 기본 강화학습 두뇌를 채운다', () => {
    useNPCStore.getState().initializeDefaults();
    withInstances([createInstance('empty')]);

    useNPCStore.getState().initializeDefaults();

    expect(useNPCStore.getState().instances.get('empty')?.brain).toMatchObject({
      mode: 'reinforcement',
      policyId: 'openai',
    });
  });

  it('정책이 비어 있는 강화학습 두뇌에는 기본 정책을 채우고 지정된 정책은 유지한다', () => {
    useNPCStore.getState().initializeDefaults();
    withInstances([
      createInstance('missing', { mode: 'reinforcement' }),
      createInstance('custom', { mode: 'reinforcement', policyId: 'huggingface' }),
    ]);

    useNPCStore.getState().initializeDefaults();

    const { instances } = useNPCStore.getState();
    expect(instances.get('missing')?.brain?.policyId).toBe('openai');
    expect(instances.get('custom')?.brain?.policyId).toBe('huggingface');
  });
});

describe('NPC 대사 이벤트', () => {
  it('같은 NPC가 반복해서 말해도 대사 이벤트는 하나만 유지하고 최신 내용으로 바꾼다', () => {
    withInstances([createInstance('talker')]);
    const { executeInstanceAction } = useNPCStore.getState();

    executeInstanceAction('talker', { type: 'speak', text: '첫 번째' });
    executeInstanceAction('talker', { type: 'speak', text: '두 번째' });
    executeInstanceAction('talker', { type: 'speak', text: '세 번째' });

    const events = useNPCStore.getState().instances.get('talker')?.events ?? [];
    expect(events).toHaveLength(1);
    expect(events[0]?.payload).toMatchObject({ type: 'dialogue', text: '세 번째' });
  });

  it('id가 다른 이벤트는 그대로 쌓이고 같은 id는 교체된다', () => {
    withInstances([createInstance('talker')]);
    const { addInstanceEvent } = useNPCStore.getState();

    addInstanceEvent('talker', { id: 'a', type: 'onClick', action: 'custom' });
    addInstanceEvent('talker', { id: 'b', type: 'onHover', action: 'custom' });
    addInstanceEvent('talker', { id: 'a', type: 'onProximity', action: 'sound' });

    const events = useNPCStore.getState().instances.get('talker')?.events ?? [];
    expect(events.map((event) => event.id)).toEqual(['b', 'a']);
    expect(events[1]?.type).toBe('onProximity');
  });
});
