import { useBuildingStore } from '../../stores/buildingStore';
import './styles.css';

export function BuildingUI() {
  const { setEditMode, editMode, isInEditMode } = useBuildingStore();
  const isEditing = isInEditMode();
  
  return (
    <>
      {isEditing && (
        <div className="building-edit-mode-overlay" />
      )}
      
      <div className={`building-ui-container ${isEditing ? 'editing' : ''}`}>
        <h3 className="building-ui-title">
          {isEditing ? 'Building Mode Active' : 'Building Editor'}
        </h3>
        
        <div className="building-ui-buttons">
          {!isEditing ? (
            <button 
              onClick={() => setEditMode('wall')} 
              className="building-ui-button primary"
            >
              Enter Building Mode
            </button>
          ) : (
            <>
              <div className="building-ui-mode-group">
                <button 
                  onClick={() => setEditMode('wall')} 
                  className={`building-ui-button ${editMode === 'wall' ? 'active' : ''}`}
                >
                  Wall Mode
                </button>
                <button 
                  onClick={() => setEditMode('tile')}
                  className={`building-ui-button ${editMode === 'tile' ? 'active' : ''}`}
                >
                  Tile Mode
                </button>
              </div>
              
              <button 
                onClick={() => setEditMode('none')}
                className="building-ui-button danger"
              >
                Exit Building Mode
              </button>
            </>
          )}
        </div>
        
        {isEditing && (
          <div className="building-ui-info">
            <p>Click to place {editMode === 'wall' ? 'walls' : 'tiles'}</p>
            <p>Click on red/green boxes to delete</p>
          </div>
        )}
      </div>
    </>
  );
} 