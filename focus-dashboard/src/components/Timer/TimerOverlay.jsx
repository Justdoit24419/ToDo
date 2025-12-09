import { useState, useEffect } from 'react';
import AnalogTimer from './AnalogTimer';
import DigitalTimer from './DigitalTimer';
import './TimerOverlay.css';

const TimerOverlay = ({ isVisible, timeLeft, totalTime, status, onClose, onPause, onStop, onResume, onReset, todoText }) => {
  const [timerMode, setTimerMode] = useState('analog'); // 'analog' | 'digital'
  const [analogTheme, setAnalogTheme] = useState('classic'); // 'classic' | 'modern' | 'neon'
  const [digitalTheme, setDigitalTheme] = useState('minimal'); // 'minimal' | 'retro' | 'futuristic'

  if (!isVisible) return null;

  return (
    <div className="timer-overlay" onClick={onClose}>
      <div className="timer-overlay-content" onClick={(e) => e.stopPropagation()}>
        <div className="timer-overlay-header">
          <h2 className="timer-overlay-title">집중 타이머</h2>
          {todoText && <p className="timer-overlay-todo">{todoText}</p>}
          <button className="timer-overlay-close" onClick={onClose}>✕</button>
        </div>

        <div className="timer-mode-switch">
          <button
            className={`mode-btn ${timerMode === 'analog' ? 'active' : ''}`}
            onClick={() => setTimerMode('analog')}
          >
            아날로그
          </button>
          <button
            className={`mode-btn ${timerMode === 'digital' ? 'active' : ''}`}
            onClick={() => setTimerMode('digital')}
          >
            디지털
          </button>
        </div>

        {timerMode === 'analog' ? (
          <>
            <div className="theme-selector">
              <button
                className={`theme-btn ${analogTheme === 'classic' ? 'active' : ''}`}
                onClick={() => setAnalogTheme('classic')}
              >
                클래식
              </button>
              <button
                className={`theme-btn ${analogTheme === 'modern' ? 'active' : ''}`}
                onClick={() => setAnalogTheme('modern')}
              >
                모던
              </button>
              <button
                className={`theme-btn ${analogTheme === 'neon' ? 'active' : ''}`}
                onClick={() => setAnalogTheme('neon')}
              >
                네온
              </button>
            </div>
            <AnalogTimer
              timeLeft={timeLeft}
              totalTime={totalTime}
              theme={analogTheme}
            />
          </>
        ) : (
          <>
            <div className="theme-selector">
              <button
                className={`theme-btn ${digitalTheme === 'minimal' ? 'active' : ''}`}
                onClick={() => setDigitalTheme('minimal')}
              >
                미니멀
              </button>
              <button
                className={`theme-btn ${digitalTheme === 'retro' ? 'active' : ''}`}
                onClick={() => setDigitalTheme('retro')}
              >
                레트로
              </button>
              <button
                className={`theme-btn ${digitalTheme === 'futuristic' ? 'active' : ''}`}
                onClick={() => setDigitalTheme('futuristic')}
              >
                미래형
              </button>
            </div>
            <DigitalTimer
              timeLeft={timeLeft}
              totalTime={totalTime}
              theme={digitalTheme}
            />
          </>
        )}

        <div className="timer-overlay-controls">
          <div className="timer-overlay-buttons">
            {status === 'RUNNING' && (
              <>
                <button className="control-btn pause-btn" onClick={onPause}>
                  ⏸ 일시정지
                </button>
                <button className="control-btn stop-btn" onClick={onStop}>
                  ⏹ 정지
                </button>
              </>
            )}
            {(status === 'PAUSED' || status === 'STOPPED') && (
              <button className="control-btn resume-btn" onClick={onResume}>
                ▶ 재개
              </button>
            )}
            <button className="control-btn reset-btn" onClick={onReset}>
              ↻ 초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerOverlay;
