import { useState } from 'react';

import { NPCEventEditorProps } from './types';
import { useNPCStore } from '../../stores/npcStore';
import type { NPCEvent, NPCEventPayload } from '../../types';
import './styles.css';

const EVENT_LABELS: Record<NPCEvent['type'], string> = {
  onClick: '클릭할 때',
  onHover: '커서를 올릴 때',
  onInteract: '상호작용할 때',
  onProximity: '가까이 다가갈 때',
};
const ACTION_LABELS: Record<NPCEvent['action'], string> = {
  dialogue: '대화 표시',
  animation: '애니메이션 재생',
  sound: '소리 재생',
  custom: '사용자 지정 동작',
};

export function NPCEventEditor({ instanceId, onClose }: NPCEventEditorProps) {
  const instance = useNPCStore((state) => state.instances.get(instanceId));
  const addInstanceEvent = useNPCStore((state) => state.addInstanceEvent);
  const removeInstanceEvent = useNPCStore((state) => state.removeInstanceEvent);
  const [eventType, setEventType] = useState<NPCEvent['type']>('onClick');
  const [actionType, setActionType] = useState<NPCEvent['action']>('dialogue');
  const [dialogue, setDialogue] = useState('');
  const [animationId, setAnimationId] = useState('');
  if (!instance) {
    return null;
  }
  const handleAddEvent = () => {
    let payload: NPCEventPayload | undefined;
    switch (actionType) {
      case 'dialogue':
        payload = { type: 'dialogue', text: dialogue };
        break;
      case 'animation':
        payload = { type: 'animation', animationId };
        break;
      case 'sound':
        payload = { type: 'sound', soundUrl: '' };
        break;
      case 'custom':
        payload = { type: 'custom', data: { script: '' } };
        break;
    }

    const newEvent: NPCEvent = {
      id: `event-${Date.now()}`,
      type: eventType,
      action: actionType,
      ...(payload ? { payload } : {}),
    };

    addInstanceEvent(instanceId, newEvent);
    setDialogue('');
    setAnimationId('');
  };

  return (
    <div className="npc-event-editor">
      <div className="npc-event-editor-header">
        <h3>이벤트 편집: {instance.name}</h3>
        <button
          type="button"
          aria-label="이벤트 편집 닫기"
          onClick={onClose}
          className="npc-event-editor-close"
        >
          ×
        </button>
      </div>

      <div className="npc-event-editor-content">
        <div className="npc-event-editor-section">
          <h4>등록된 이벤트</h4>
          {instance.events && instance.events.length > 0 ? (
            <ul className="npc-event-list">
              {instance.events.map((event) => (
                <li key={event.id} className="npc-event-item">
                  <span>
                    {EVENT_LABELS[event.type]} → {ACTION_LABELS[event.action]}
                  </span>
                  <button
                    onClick={() => removeInstanceEvent(instanceId, event.id)}
                    className="npc-event-remove"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="npc-event-empty">등록된 이벤트가 없습니다</p>
          )}
        </div>

        <div className="npc-event-editor-section">
          <h4>새 이벤트 추가</h4>

          <div className="npc-event-editor-field">
            <label>발생 조건:</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as NPCEvent['type'])}
              className="npc-event-editor-select"
            >
              <option value="onClick">클릭할 때</option>
              <option value="onHover">커서를 올릴 때</option>
              <option value="onInteract">상호작용할 때</option>
              <option value="onProximity">가까이 다가갈 때</option>
            </select>
          </div>

          <div className="npc-event-editor-field">
            <label>실행 동작:</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as NPCEvent['action'])}
              className="npc-event-editor-select"
            >
              <option value="dialogue">대화 표시</option>
              <option value="animation">애니메이션 재생</option>
              <option value="sound">소리 재생</option>
              <option value="custom">사용자 지정 동작</option>
            </select>
          </div>

          {actionType === 'dialogue' && (
            <div className="npc-event-editor-field">
              <label>대화 내용:</label>
              <textarea
                value={dialogue}
                onChange={(e) => setDialogue(e.target.value)}
                placeholder="대화 내용을 입력하세요…"
                className="npc-event-editor-textarea"
              />
            </div>
          )}

          {actionType === 'animation' && (
            <div className="npc-event-editor-field">
              <label>애니메이션:</label>
              <select
                value={animationId}
                onChange={(e) => setAnimationId(e.target.value)}
                className="npc-event-editor-select"
              >
                <option value="">애니메이션 선택…</option>
                <option value="idle">대기</option>
                <option value="walk">걷기</option>
                <option value="talk">대화</option>
              </select>
            </div>
          )}

          <button
            onClick={handleAddEvent}
            className="npc-event-editor-add-button"
            disabled={
              (actionType === 'dialogue' && !dialogue) ||
              (actionType === 'animation' && !animationId)
            }
          >
            이벤트 추가
          </button>
        </div>
      </div>
    </div>
  );
}
