import { inputStore } from '../stores/inputStore';
import { playerState } from '../stores/playerState';

class EventBridge {
  private initialized = false;
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    window.addEventListener('gaesup:requestInputState', () => {
      const state = inputStore.getState();
      window.dispatchEvent(new CustomEvent('gaesup:inputState', {
        detail: {
          keyboard: state.keyboard,
          mouse: {
            isActive: state.mouse.isActive,
            angle: state.mouse.angle,
          }
        }
      }));
    });
    
    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('gaesup:debug', (event: CustomEvent) => {
        const { type } = event.detail;
        switch (type) {
          case 'playerState':
            console.log('[Gaesup Debug] Player State:', playerState.toJSON());
            break;
          case 'inputState':
            console.log('[Gaesup Debug] Input State:', inputStore.getState());
            break;
          case 'performance':
            console.log('[Gaesup Debug] Performance:', {
              playerActive: playerState.isActive,
              position: playerState.position.toArray(),
              velocity: playerState.velocity.length(),
            });
            break;
        }
      });
    }
  }
  
  destroy() {
    this.initialized = false;
  }
}

export const eventBridge = new EventBridge();
