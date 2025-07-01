import { useState } from 'react';
import { useNPCStore } from '../../stores/npcStore';
import { NPCEvent } from '../../types';
import './styles.css';

interface NPCEventEditorProps {
  instanceId: string;
  onClose: () => void;
}

export function NPCEventEditor({ instanceId, onClose }: NPCEventEditorProps) {
  const { instances, addInstanceEvent, removeInstanceEvent } = useNPCStore();
  const instance = instances.get(instanceId);
  
  const [eventType, setEventType] = useState<NPCEvent['type']>('onClick');
  const [actionType, setActionType] = useState<NPCEvent['action']>('dialogue');
  const [dialogue, setDialogue] = useState('');
  const [animationId, setAnimationId] = useState('');
  
  if (!instance) {
    return null;
  }
  
  const handleAddEvent = () => {
    let payload: any = {};
    
    switch (actionType) {
      case 'dialogue':
        payload = { text: dialogue };
        break;
      case 'animation':
        payload = { animationId };
        break;
      case 'sound':
        payload = { soundUrl: '' };
        break;
      case 'custom':
        payload = { script: '' };
        break;
    }
    
    const newEvent: NPCEvent = {
      id: `event-${Date.now()}`,
      type: eventType,
      action: actionType,
      payload
    };
    
    addInstanceEvent(instanceId, newEvent);
    
    // Reset form
    setDialogue('');
    setAnimationId('');
  };
  
  return (
    <div className="npc-event-editor">
      <div className="npc-event-editor-header">
        <h3>Event Editor: {instance.name}</h3>
        <button onClick={onClose} className="npc-event-editor-close">×</button>
      </div>
      
      <div className="npc-event-editor-content">
        <div className="npc-event-editor-section">
          <h4>Current Events</h4>
          {instance.events && instance.events.length > 0 ? (
            <ul className="npc-event-list">
              {instance.events.map(event => (
                <li key={event.id} className="npc-event-item">
                  <span>{event.type} → {event.action}</span>
                  <button 
                    onClick={() => removeInstanceEvent(instanceId, event.id)}
                    className="npc-event-remove"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="npc-event-empty">No events configured</p>
          )}
        </div>
        
        <div className="npc-event-editor-section">
          <h4>Add New Event</h4>
          
          <div className="npc-event-editor-field">
            <label>Event Type:</label>
            <select 
              value={eventType} 
              onChange={(e) => setEventType(e.target.value as NPCEvent['type'])}
              className="npc-event-editor-select"
            >
              <option value="onClick">On Click</option>
              <option value="onHover">On Hover</option>
              <option value="onInteract">On Interact</option>
              <option value="onProximity">On Proximity</option>
            </select>
          </div>
          
          <div className="npc-event-editor-field">
            <label>Action Type:</label>
            <select 
              value={actionType} 
              onChange={(e) => setActionType(e.target.value as NPCEvent['action'])}
              className="npc-event-editor-select"
            >
              <option value="dialogue">Show Dialogue</option>
              <option value="animation">Play Animation</option>
              <option value="sound">Play Sound</option>
              <option value="custom">Custom Action</option>
            </select>
          </div>
          
          {actionType === 'dialogue' && (
            <div className="npc-event-editor-field">
              <label>Dialogue Text:</label>
              <textarea
                value={dialogue}
                onChange={(e) => setDialogue(e.target.value)}
                placeholder="Enter dialogue text..."
                className="npc-event-editor-textarea"
              />
            </div>
          )}
          
          {actionType === 'animation' && (
            <div className="npc-event-editor-field">
              <label>Animation:</label>
              <select
                value={animationId}
                onChange={(e) => setAnimationId(e.target.value)}
                className="npc-event-editor-select"
              >
                <option value="">Select animation...</option>
                <option value="idle">Idle</option>
                <option value="walk">Walk</option>
                <option value="talk">Talk</option>
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
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
} 