import './styles.css';

export default function LeftSlider() {
  return (
    <div className="left-slider">
      <div className="slider-header">
        <h3>Tools</h3>
      </div>
      <div className="slider-content">
        <div className="tool-category">
          <h4>Environment</h4>
          <div className="tool-buttons">
            <button className="tool-btn">Tile</button>
            <button className="tool-btn">Wall</button>
            <button className="tool-btn">Object</button>
          </div>
        </div>
        <div className="tool-category">
          <h4>Characters</h4>
          <div className="tool-buttons">
            <button className="tool-btn">NPC</button>
            <button className="tool-btn">Player</button>
          </div>
        </div>
        <div className="tool-category">
          <h4>Special</h4>
          <div className="tool-buttons">
            <button className="tool-btn">Portal</button>
            <button className="tool-btn">Trigger</button>
          </div>
        </div>
      </div>
    </div>
  );
} 