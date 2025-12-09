import './DigitalTimer.css';

const DigitalTimer = ({ timeLeft, totalTime, theme }) => {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // 진행률 계산
  const totalSeconds = totalTime * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <div className={`digital-timer digital-timer-${theme}`}>
      <div className="digital-display">
        <div className="digit-group">
          <span className="digit">{String(hours).padStart(2, '0')[0]}</span>
          <span className="digit">{String(hours).padStart(2, '0')[1]}</span>
        </div>
        <span className="separator">:</span>
        <div className="digit-group">
          <span className="digit">{String(minutes).padStart(2, '0')[0]}</span>
          <span className="digit">{String(minutes).padStart(2, '0')[1]}</span>
        </div>
        <span className="separator">:</span>
        <div className="digit-group">
          <span className="digit">{String(seconds).padStart(2, '0')[0]}</span>
          <span className="digit">{String(seconds).padStart(2, '0')[1]}</span>
        </div>
      </div>

      <div className="digital-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}>
          <div className="progress-glow"></div>
        </div>
      </div>

      <div className="digital-info">
        <div className="info-item">
          <span className="info-label">진행률</span>
          <span className="info-value">{Math.round(progress)}%</span>
        </div>
        <div className="info-item">
          <span className="info-label">남은 시간</span>
          <span className="info-value">
            {hours > 0 && `${hours}시간 `}
            {minutes}분 {seconds}초
          </span>
        </div>
      </div>
    </div>
  );
};

export default DigitalTimer;
