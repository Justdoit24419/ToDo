import { useEffect, useState } from 'react';
import { AiOutlineClockCircle, AiOutlineCalendar, AiOutlinePlus } from 'react-icons/ai';
import { IoMdClose } from 'react-icons/io';
import './TodoItem.css';

const TodoItem = ({ todo, onToggle, onDelete, onStartTimer, onUpdateDates, onAddSubtask, onToggleSubtask, onDeleteSubtask, onUpdateAllocatedTime, onUpdateSubtaskWeight, onUpdateSubtask, isTimerRunning, currentTimerMinutes, currentTimerSubtaskId }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(todo.startDate || '');
  const [endDate, setEndDate] = useState(todo.endDate || '');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [subtaskText, setSubtaskText] = useState('');
  const [subtaskWeight, setSubtaskWeight] = useState(0);
  const [subtaskAllocatedTime, setSubtaskAllocatedTime] = useState(0);
  const [showAllocatedTimeInput, setShowAllocatedTimeInput] = useState(false);
  const [allocatedTime, setAllocatedTime] = useState(todo.allocatedTime || 0);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editWeight, setEditWeight] = useState(0);
  const [editAllocated, setEditAllocated] = useState(0);

  // 현재 사용 시간 계산 (저장된 시간 + 타이머 진행 시간)
  const currentFocusTime = (todo.focusTime || 0) + (isTimerRunning ? currentTimerMinutes : 0);
  const subtaskCount = todo.subtasks?.length || 0;

  // 할당 시간은 항상 todo.allocatedTime을 사용 (실시간 업데이트 반영)
  const displayAllocatedTime = todo.allocatedTime || 0;

  const progressPercent = displayAllocatedTime > 0
    ? Math.min(100, Math.round((currentFocusTime / displayAllocatedTime) * 100))
    : 0;

  // 디버깅 로그 - 진행률 계산 확인
  console.log(`[TodoItem] ${todo.text} 진행 상태:`, {
    할당시간: displayAllocatedTime,
    저장된사용시간: todo.focusTime,
    타이머진행중: isTimerRunning,
    타이머진행시간: currentTimerMinutes,
    총사용시간: currentFocusTime,
    진행률: progressPercent,
    계산식: `${currentFocusTime} / ${displayAllocatedTime} * 100 = ${progressPercent}%`
  });

  useEffect(() => {
    setAllocatedTime(todo.allocatedTime || 0);
    setStartDate(todo.startDate || '');
    setEndDate(todo.endDate || '');
  }, [todo.allocatedTime, todo.startDate, todo.endDate]);

  const handleApplyDates = () => {
    onUpdateDates(todo.id, startDate, endDate);
    setShowDatePicker(false);
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (subtaskText.trim()) {
      onAddSubtask(todo.id, subtaskText, subtaskWeight, subtaskAllocatedTime);
      setSubtaskText('');
      setSubtaskWeight(0);
      setSubtaskAllocatedTime(0);
      setShowSubtaskInput(false);
    }
  };

  const handleApplyAllocatedTime = () => {
    console.log('handleApplyAllocatedTime 호출:', { todoId: todo.id, allocatedTime });
    if (allocatedTime > 0) {
      onUpdateAllocatedTime(todo.id, allocatedTime);
      setShowAllocatedTimeInput(false);
    } else {
      alert('할당 시간은 0보다 커야 합니다.');
    }
  };

  const startEditingSubtask = (subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditText(subtask.text);
    setEditWeight(subtask.weight || 0);
    setEditAllocated(subtask.allocatedTime || 0);
  };

  const handleSaveSubtask = (subtask) => {
    if (!editText.trim()) return;
    onUpdateSubtask(todo.id, subtask.id, editText, editWeight, editAllocated);
    setEditingSubtaskId(null);
    setEditText('');
    setEditWeight(0);
    setEditAllocated(0);
  };

  // 시간 포맷팅 함수 (한국어)
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
    return `${mins}분`;
  };

  // 총 비중 계산
  const totalWeight = (todo.subtasks || []).reduce((sum, st) => sum + (st.weight || 0), 0);

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-main-row">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
        />
        <span className="todo-text">{todo.text}</span>
        <button
          onClick={() => setShowAllocatedTimeInput(!showAllocatedTimeInput)}
          className="icon-btn time-btn"
          title="할당 시간 설정"
        >
          <AiOutlineClockCircle />
        </button>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="icon-btn calendar-btn"
          title="날짜 설정"
        >
          <AiOutlineCalendar />
        </button>
        <button
          onClick={() => setShowSubtaskInput(!showSubtaskInput)}
          className="icon-btn subtask-add-icon-btn"
          title="보조작업 추가"
        >
          <AiOutlinePlus />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="icon-btn delete-btn"
          title="삭제"
        >
          <IoMdClose />
        </button>
      </div>

      {showAllocatedTimeInput && (
        <div className="allocated-time-input">
          <label>
            할당 시간 (분):
            <input
              type="number"
              value={allocatedTime}
              onChange={(e) => setAllocatedTime(parseInt(e.target.value) || 0)}
              min="0"
              placeholder="분 단위"
            />
          </label>
          <button onClick={handleApplyAllocatedTime} className="apply-allocated-time-btn">
            적용
          </button>
        </div>
      )}

      {showDatePicker && (
        <div className="todo-date-picker">
          <label>
            시작일:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            종료일:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button onClick={handleApplyDates} className="apply-todo-date-btn">
            적용
          </button>
        </div>
      )}

      {/* 작업 요약 정보 */}
      <div className="task-summary-compact">
        {(startDate || endDate) && (
          <>
            <span className="summary-text">
              {startDate && endDate
                ? `${startDate} ~ ${endDate}`
                : startDate || endDate}
            </span>
            <span className="summary-divider">|</span>
          </>
        )}
        <span className="summary-text">할당 {formatTime(displayAllocatedTime)}</span>
        <span className="summary-divider">|</span>
        <span className="summary-text">
          사용 {formatTime(currentFocusTime)}
          {isTimerRunning && <span className="timer-indicator">⏱️</span>}
        </span>
        <span className="summary-divider">|</span>
        <span className="summary-text">
          남음 {formatTime(Math.max(0, displayAllocatedTime - currentFocusTime))}
        </span>
        <span className="summary-divider">|</span>
        <span className="summary-text">진행 {progressPercent}%</span>
        {subtaskCount > 0 && (
          <>
            <span className="summary-divider">|</span>
            <span className="summary-text">보조 {subtaskCount}개</span>
          </>
        )}
      </div>

      {/* 서브태스크 목록 */}
      {todo.subtasks && todo.subtasks.length > 0 && (
        <div className="subtasks-list">
            {todo.subtasks.map(subtask => {
            const allocatedFromWeight = (todo.allocatedTime && totalWeight > 0)
              ? Math.round((todo.allocatedTime * (subtask.weight || 0)) / totalWeight)
              : 0;
            const subtaskAllocatedTime = subtask.allocatedTime || allocatedFromWeight;
            const isActiveSubtask = isTimerRunning && currentTimerSubtaskId === subtask.id;
            const subtaskFocusTime = (subtask.focusTime || 0) + (isActiveSubtask ? currentTimerMinutes : 0);
            const subtaskProgress = subtaskAllocatedTime > 0
              ? Math.min(100, Math.round((subtaskFocusTime / subtaskAllocatedTime) * 100))
              : 0;
            const remaining = subtaskAllocatedTime > 0
              ? Math.max(0, subtaskAllocatedTime - subtaskFocusTime)
              : 0;
            const progressTone = subtaskProgress >= 100 ? 'danger' : subtaskProgress >= 80 ? 'warn' : 'safe';

            return (
              <div key={subtask.id} className="subtask-item-extended">
                <div className="subtask-header">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => onToggleSubtask(todo.id, subtask.id)}
                    className="subtask-checkbox"
                  />
                  <span className={`subtask-text ${subtask.completed ? 'completed' : ''}`}>
                    {subtask.text}
                  </span>
                  {subtask.weight > 0 && (
                    <span className="subtask-weight-badge">{subtask.weight}%</span>
                  )}
                  <button
                    onClick={() => startEditingSubtask(subtask)}
                    className="subtask-edit-btn"
                    title="보조작업 수정"
                    type="button"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => onDeleteSubtask(todo.id, subtask.id)}
                    className="subtask-delete-btn"
                    title="삭제"
                  >
                    ✕
                  </button>
                </div>

                  {editingSubtaskId === subtask.id ? (
                    <div className="subtask-edit-form">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="subtask-input"
                        placeholder="보조작업 수정"
                      />
                      <input
                        type="number"
                        value={editWeight}
                        onChange={(e) => setEditWeight(parseInt(e.target.value) || 0)}
                        className="subtask-weight-input"
                        min="0"
                        max="100"
                        placeholder="비중 (%)"
                      />
                      <input
                        type="number"
                        value={editAllocated}
                        onChange={(e) => setEditAllocated(parseInt(e.target.value) || 0)}
                        className="subtask-allocated-input"
                        min="0"
                        placeholder="할당(분)"
                      />
                      <div className="subtask-edit-actions">
                        <button
                          type="button"
                          className="subtask-save-btn"
                          onClick={() => handleSaveSubtask(subtask)}
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          className="subtask-cancel-btn"
                          onClick={() => {
                            setEditingSubtaskId(null);
                            setEditText('');
                            setEditWeight(0);
                            setEditAllocated(0);
                          }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="subtask-progress-section">
                      <div className="subtask-time-info">
                        <span className="subtask-time-label">할당: {formatTime(subtaskAllocatedTime)}</span>
                        <span className="subtask-time-divider">|</span>
                        <span className="subtask-time-label">
                          사용: {formatTime(subtaskFocusTime)}
                          {isActiveSubtask && <span className="timer-indicator"> ⏱️</span>}
                        </span>
                        {subtaskAllocatedTime > 0 && (
                          <>
                            <span className="subtask-time-divider">|</span>
                            <span className="subtask-time-label">남음: {formatTime(remaining)}</span>
                          </>
                        )}
                      </div>
                      <div className="subtask-progress-bar-container">
                        <div className="subtask-progress-bar">
                          <div
                            className={`subtask-progress-fill ${progressTone}`}
                            style={{ width: `${subtaskProgress}%` }}
                          />
                        </div>
                        <span className="subtask-progress-text">{subtaskProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      )}

      {/* 보조작업 추가 UI */}
      {showSubtaskInput && (
        <form onSubmit={handleAddSubtask} className="subtask-input-form">
          <input
            type="text"
            value={subtaskText}
            onChange={(e) => setSubtaskText(e.target.value)}
            placeholder="보조작업 입력..."
            className="subtask-input"
            autoFocus
          />
          <input
            type="number"
            value={subtaskWeight}
            onChange={(e) => setSubtaskWeight(parseInt(e.target.value) || 0)}
            placeholder="비중 (%)"
            className="subtask-weight-input"
            min="0"
            max="100"
          />
          <input
            type="number"
            value={subtaskAllocatedTime}
            onChange={(e) => setSubtaskAllocatedTime(parseInt(e.target.value) || 0)}
            placeholder="할당 시간(분)"
            className="subtask-allocated-input"
            min="0"
          />
          <button type="submit" className="subtask-add-btn">추가</button>
          <button
            type="button"
            onClick={() => {
              setShowSubtaskInput(false);
              setSubtaskText('');
              setSubtaskWeight(0);
              setSubtaskAllocatedTime(0);
            }}
            className="subtask-cancel-btn"
          >
            취소
          </button>
        </form>
      )}
    </div>
  );
};

export default TodoItem;
