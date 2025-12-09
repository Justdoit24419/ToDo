import { useState } from 'react';
import './TimePresets.css';

const TimePresets = ({ onSelectTime, currentDuration, isTimerActive }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const presets = [
    { label: '15분', minutes: 15 },
    { label: '25분', minutes: 25 },
    { label: '45분', minutes: 45 }
  ];

  const handlePresetClick = (minutes) => {
    if (isTimerActive) return;
    onSelectTime(minutes);
    setShowCustomInput(false);
  };

  const handleCustomClick = () => {
    if (isTimerActive) return;
    setShowCustomInput(true);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const minutes = parseInt(customMinutes);
    if (minutes > 0 && minutes <= 999) {
      onSelectTime(minutes);
      setCustomMinutes('');
      setShowCustomInput(false);
    }
  };

  const isActive = (minutes) => {
    return Math.round(currentDuration / 60) === minutes;
  };

  return (
    <div className="time-presets">
      <div className="presets-label">집중 시간</div>
      <div className="presets-buttons">
        {presets.map((preset) => (
          <button
            key={preset.minutes}
            className={`preset-btn ${isActive(preset.minutes) ? 'active' : ''} ${isTimerActive ? 'disabled' : ''}`}
            onClick={() => handlePresetClick(preset.minutes)}
            disabled={isTimerActive}
          >
            {preset.label}
          </button>
        ))}
        <button
          className={`preset-btn custom-btn ${isTimerActive ? 'disabled' : ''}`}
          onClick={handleCustomClick}
          disabled={isTimerActive}
        >
          커스텀
        </button>
      </div>

      {showCustomInput && (
        <form className="custom-input-form" onSubmit={handleCustomSubmit}>
          <input
            type="number"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            placeholder="분 입력"
            className="custom-input"
            min="1"
            max="999"
            autoFocus
          />
          <button type="submit" className="custom-submit">확인</button>
          <button
            type="button"
            className="custom-cancel"
            onClick={() => {
              setShowCustomInput(false);
              setCustomMinutes('');
            }}
          >
            취소
          </button>
        </form>
      )}
    </div>
  );
};

export default TimePresets;
