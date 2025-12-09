import { useEffect, useState } from 'react';
import { useGlobalTimer } from '../../contexts/TimerContext';
import CircularProgress from './CircularProgress';
import TimerControls from './TimerControls';
import TimePresets from './TimePresets';
import TimerOverlay from './TimerOverlay';
import './PomodoroTimer.css';

const PomodoroTimer = ({ onUpdateAllocatedTime, onUpdateSubtaskAllocatedTime, currentTodoId, currentSubtaskId, todos = [] }) => {
  const timer = useGlobalTimer();
  const [selectedTodoId, setSelectedTodoId] = useState(currentTodoId || '');
  const [selectedSubtaskId, setSelectedSubtaskId] = useState(currentSubtaskId || '');
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    setSelectedTodoId(currentTodoId || '');
  }, [currentTodoId]);

  useEffect(() => {
    setSelectedSubtaskId(currentSubtaskId || '');
  }, [currentSubtaskId, currentTodoId]);

  const handleStart = () => {
    timer.start(selectedTodoId || null, selectedSubtaskId || null);
    setShowOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
  };

  const handleShowOverlay = () => {
    setShowOverlay(true);
  };

  const handleTimeChange = (minutes) => {
    console.log('handleTimeChange 호출:', { minutes, selectedTodoId, selectedSubtaskId });

    timer.setTimerDuration(minutes);

    // 주작업이 선택된 경우, 할당 시간 업데이트
    if (selectedTodoId && onUpdateAllocatedTime) {
      console.log('주작업 할당 시간 업데이트:', selectedTodoId, minutes);
      onUpdateAllocatedTime(selectedTodoId, minutes);
    } else {
      console.log('주작업 할당 시간 업데이트 스킵:', { selectedTodoId존재: !!selectedTodoId, 콜백존재: !!onUpdateAllocatedTime });
    }

    // 보조작업이 선택된 경우, 보조작업 할당 시간 업데이트
    if (selectedTodoId && selectedSubtaskId && onUpdateSubtaskAllocatedTime) {
      console.log('보조작업 할당 시간 업데이트:', selectedTodoId, selectedSubtaskId, minutes);
      onUpdateSubtaskAllocatedTime(selectedTodoId, selectedSubtaskId, minutes);
    }
  };

  const selectedTodo = todos.find(todo => todo.id === selectedTodoId);
  const subtaskOptions = selectedTodo?.subtasks || [];
  const isTimerActive = timer.isRunning || timer.isPaused;

  useEffect(() => {
    if (selectedSubtaskId && !subtaskOptions.find(st => st.id === selectedSubtaskId)) {
      setSelectedSubtaskId('');
    }
  }, [selectedTodoId, selectedSubtaskId, subtaskOptions]);

  // 선택된 투두의 텍스트 가져오기
  const getCurrentTodoText = () => {
    if (selectedSubtaskId) {
      const subtask = subtaskOptions.find(st => st.id === selectedSubtaskId);
      return subtask ? `${selectedTodo.text} > ${subtask.text}` : selectedTodo?.text || '';
    }
    return selectedTodo?.text || '';
  };

  return (
    <>
      <div className="pomodoro-timer">
        <div className="timer-header">
          <h2 className="timer-title">포모도로 타이머</h2>
          <button
            className={`voice-toggle-btn ${timer.voiceEnabled ? 'active' : ''}`}
            onClick={timer.toggleVoice}
            title={timer.voiceEnabled ? '음성 알림 끄기' : '음성 알림 켜기'}
          >
            {timer.voiceEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <CircularProgress
          timeLeft={timer.timeLeft}
          totalTime={timer.duration}
          size={250}
        />

        <TimePresets
          onSelectTime={handleTimeChange}
          currentDuration={timer.duration}
          isTimerActive={isTimerActive}
        />

        {todos && todos.length > 0 && (
          <div className="todo-selector">
            <label className="todo-selector-label">주작업:</label>
            <select
              className="todo-selector-dropdown"
              value={selectedTodoId}
              onChange={(e) => setSelectedTodoId(e.target.value)}
              disabled={isTimerActive}
            >
              <option value="">선택 안 함</option>
              {todos
                .filter(todo => !todo.completed)
                .map(todo => (
                  <option key={todo.id} value={todo.id}>
                    {todo.text}
                  </option>
                ))
              }
            </select>
          </div>
        )}

        {selectedTodo && subtaskOptions.length > 0 && (
          <div className="todo-selector">
            <label className="todo-selector-label">보조작업:</label>
            <select
              className="todo-selector-dropdown"
              value={selectedSubtaskId}
              onChange={(e) => setSelectedSubtaskId(e.target.value)}
              disabled={isTimerActive}
            >
              <option value="">선택 안 함</option>
              {subtaskOptions.map(subtask => (
                <option key={subtask.id} value={subtask.id}>
                  {subtask.text}
                </option>
              ))}
            </select>
          </div>
        )}

        <TimerControls
          status={timer.status}
          onStart={handleStart}
          onPause={timer.pause}
          onStop={timer.stop}
          onResume={timer.resume}
          onReset={timer.reset}
          onShowOverlay={handleShowOverlay}
        />
      </div>

      <TimerOverlay
        isVisible={showOverlay}
        timeLeft={timer.timeLeft}
        totalTime={timer.duration / 60}
        status={timer.status}
        onClose={handleCloseOverlay}
        onPause={timer.pause}
        onStop={timer.stop}
        onResume={timer.resume}
        onReset={timer.reset}
        todoText={getCurrentTodoText()}
      />
    </>
  );
};

export default PomodoroTimer;
