import './HeatmapToggle.css';

const HeatmapToggle = ({ viewMode, onToggle }) => {
  return (
    <div className="heatmap-toggle">
      <button
        className={`toggle-btn ${viewMode === '7days' ? 'active' : ''}`}
        onClick={onToggle}
      >
        7일
      </button>
      <button
        className={`toggle-btn ${viewMode === '30days' ? 'active' : ''}`}
        onClick={onToggle}
      >
        30일
      </button>
    </div>
  );
};

export default HeatmapToggle;
