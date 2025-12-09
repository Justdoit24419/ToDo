import './TimerControls.css';

const TimerControls = ({ status, onStart, onPause, onStop, onResume, onReset, onShowOverlay }) => {
  return (
    <div className="timer-controls">
      {status === 'IDLE' && (
        <button className="btn btn-primary" onClick={onStart}>
          시작
        </button>
      )}

      {status === 'RUNNING' && (
        <>
          <button className="btn btn-warning" onClick={onPause}>
            일시정지
          </button>
          <button className="btn btn-danger" onClick={onStop}>
            정지
          </button>
          <button className="btn btn-secondary" onClick={onReset}>
            리셋
          </button>
          <button className="btn btn-info" onClick={onShowOverlay}>
            타이머 팝업
          </button>
        </>
      )}

      {status === 'PAUSED' && (
        <>
          <button className="btn btn-primary" onClick={onResume}>
            재개
          </button>
          <button className="btn btn-secondary" onClick={onReset}>
            리셋
          </button>
          <button className="btn btn-info" onClick={onShowOverlay}>
            타이머 팝업
          </button>
        </>
      )}

      {status === 'STOPPED' && (
        <>
          <button className="btn btn-primary" onClick={onResume}>
            재개
          </button>
          <button className="btn btn-secondary" onClick={onReset}>
            리셋
          </button>
          <button className="btn btn-info" onClick={onShowOverlay}>
            타이머 팝업
          </button>
        </>
      )}

      {status === 'FINISHED' && (
        <>
          <div className="completion-message">✨ 완료! 잘하셨습니다!</div>
          <button className="btn btn-primary" onClick={onReset}>
            다시 시작
          </button>
        </>
      )}
    </div>
  );
};

export default TimerControls;
