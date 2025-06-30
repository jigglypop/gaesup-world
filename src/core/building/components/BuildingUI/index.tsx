import { useBuildingStore } from '../../stores/buildingStore';
import { useAuthStore } from '../../../../admin/store/authStore';
import './styles.css';

export function BuildingUI() {
  const { setEditMode, editMode, isInEditMode, currentTileMultiplier, setTileMultiplier } = useBuildingStore();
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
            
            {editMode === 'tile' && (
              <>
                <div className="building-ui-size-group">
                  <span className="building-ui-label">Tile Size:</span>
                  <div className="building-ui-size-buttons">
                    <button
                      onClick={() => setTileMultiplier(1)}
                      className={`building-ui-size-button ${currentTileMultiplier === 1 ? 'active' : ''}`}
                    >
                      1x1
                    </button>
                    <button
                      onClick={() => setTileMultiplier(2)}
                      className={`building-ui-size-button ${currentTileMultiplier === 2 ? 'active' : ''}`}
                    >
                      2x2
                    </button>
                    <button
                      onClick={() => setTileMultiplier(3)}
                      className={`building-ui-size-button ${currentTileMultiplier === 3 ? 'active' : ''}`}
                    >
                      3x3
                    </button>
                    <button
                      onClick={() => setTileMultiplier(4)}
                      className={`building-ui-size-button ${currentTileMultiplier === 4 ? 'active' : ''}`}
                    >
                      4x4
                    </button>
                  </div>
                </div>
                <div className="building-ui-info">
                  <p>Size: {currentTileMultiplier}x{currentTileMultiplier} ({currentTileMultiplier * 4}m)</p>
                  <p>Click to place tiles</p>
                  <p>Red = Occupied, Green = Available</p>
                </div>
              </>
            )}
            
            {editMode === 'wall' && (
              <div className="building-ui-info">
                <p>Click to place walls</p>
                <p>Click on boxes to delete</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
} 