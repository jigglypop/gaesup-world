import './styles.css';

export default function RightSlider() {
  return (
    <div className="right-slider">
      <div className="slider-header">
        <h3>Properties</h3>
      </div>
      <div className="slider-content">
        <div className="property-section">
          <h4>Object Properties</h4>
          <div className="property-item">
            <label>Position X:</label>
            <input type="number" defaultValue={0} />
          </div>
          <div className="property-item">
            <label>Position Y:</label>
            <input type="number" defaultValue={0} />
          </div>
          <div className="property-item">
            <label>Position Z:</label>
            <input type="number" defaultValue={0} />
          </div>
        </div>
        
        <div className="property-section">
          <h4>Rotation</h4>
          <div className="property-item">
            <label>Rotation X:</label>
            <input type="number" defaultValue={0} />
          </div>
          <div className="property-item">
            <label>Rotation Y:</label>
            <input type="number" defaultValue={0} />
          </div>
          <div className="property-item">
            <label>Rotation Z:</label>
            <input type="number" defaultValue={0} />
          </div>
        </div>

        <div className="property-section">
          <h4>Scale</h4>
          <div className="property-item">
            <label>Scale X:</label>
            <input type="number" defaultValue={1} />
          </div>
          <div className="property-item">
            <label>Scale Y:</label>
            <input type="number" defaultValue={1} />
          </div>
          <div className="property-item">
            <label>Scale Z:</label>
            <input type="number" defaultValue={1} />
          </div>
        </div>
      </div>
    </div>
  );
} 