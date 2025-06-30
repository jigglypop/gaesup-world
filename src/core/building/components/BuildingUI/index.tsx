import { useBuildingStore } from '../../stores/buildingStore';
import { useAuthStore } from '../../../../admin/store/authStore';
import './styles.css';

export function BuildingUI() {
  const { setEditMode, editMode, isInEditMode } = useBuildingStore();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isEditing = isInEditMode();
  
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <>
      {isEditing && (
        <div className="building-edit-mode-overlay" />
      )}
      
      <div className="building-ui-container">
        {!isEditing ? (
          <button 
            onClick={() => setEditMode('wall')} 
            className="building-ui-toggle"
          >
            Building Editor
          </button>
        ) : (
          <div className="building-ui-panel">
            <div className="building-ui-header">
              <span className="building-ui-title">Building Mode</span>
              <button 
                onClick={() => setEditMode('none')}
                className="building-ui-close"
              >
                ×
              </button>
            </div>
            
            <div className="building-ui-mode-group">
              <button 
                onClick={() => setEditMode('wall')} 
                className={`building-ui-mode-button ${editMode === 'wall' ? 'active' : ''}`}
              >
                Wall Mode
              </button>
              <button 
                onClick={() => setEditMode('tile')}
                className={`building-ui-mode-button ${editMode === 'tile' ? 'active' : ''}`}
              >
                Tile Mode
              </button>
            </div>
            
            <div className="building-ui-info">
              <p>Click to place {editMode === 'wall' ? 'walls' : 'tiles'}</p>
              <p>Click on red/green boxes to delete</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 