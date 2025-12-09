import './TaskStatistics.css';

const minutesToTime = (minutes = 0) => {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  if (hours > 0) return `${hours}시간 ${mins}분`;
  return `${mins}분`;
};

const percent = (num, den) => {
  if (!den || den <= 0) return 0;
  return Math.min(100, Math.round((num / den) * 100));
};

const TaskStatistics = ({ todos, onClose, currentTimerTodoId, currentTimerSubtaskId, currentTimerMinutes }) => {
  // 작업/보조작업 통계
  const taskStats = todos.map(todo => {
    const runningBonus = todo.id === currentTimerTodoId ? currentTimerMinutes : 0;
    const used = (todo.focusTime || 0) + runningBonus;
    const weightTotal = (todo.subtasks || []).reduce((sum, st) => sum + (st.weight || 0), 0);

    const subtasks = (todo.subtasks || []).map(subtask => {
      const isActive = todo.id === currentTimerTodoId && subtask.id === currentTimerSubtaskId;
      const subUsed = (subtask.focusTime || 0) + (isActive ? currentTimerMinutes : 0);
      const explicitAlloc = subtask.allocatedTime || 0;
      const weightedAlloc = todo.allocatedTime && weightTotal > 0
        ? Math.round((todo.allocatedTime * (subtask.weight || 0)) / weightTotal)
        : 0;
      const subAllocated = explicitAlloc || weightedAlloc;
      const subRemaining = subAllocated > 0 ? Math.max(0, subAllocated - subUsed) : 0;
      const subProgress = subAllocated > 0 ? percent(subUsed, subAllocated) : 0;
      return {
        ...subtask,
        subAllocated,
        subUsed,
        subRemaining,
        subProgress,
        isActive
      };
    });

    const subAllocSum = subtasks.reduce((sum, st) => sum + (st.subAllocated || 0), 0);
    const allocated = todo.allocatedTime || subAllocSum || 0;
    const remaining = Math.max(0, allocated - used);
    const progress = allocated > 0 ? percent(used, allocated) : 0;

    return {
      ...todo,
      allocated,
      used,
      remaining,
      progress,
      subtasks,
      subtaskCount: subtasks.length
    };
  });

  const totalAllocated = taskStats.reduce((sum, task) => sum + (task.allocated || 0), 0);
  const totalUsed = taskStats.reduce((sum, task) => sum + (task.used || 0), 0);
  const availableTime = totalAllocated > 0 ? totalAllocated : 24 * 60;
  const remainingTime = Math.max(0, availableTime - totalUsed);
  const overallProgress = availableTime > 0 ? percent(totalUsed, availableTime) : 0;
  const todayLabel = new Date().toISOString().split('T')[0].replace(/-/g, '. ');

  return (
    <div className="statistics-overlay" onClick={onClose}>
      <div className="statistics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="statistics-header">
          <h2>작업 진행 통계</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="statistics-summary">
          <div className="summary-item">
            <div className="summary-label">사용 가능 시간</div>
            <div className="summary-value highlight">{minutesToTime(availableTime)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">사용한 시간</div>
            <div className="summary-value">{minutesToTime(totalUsed)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">남은 시간</div>
            <div className="summary-value">{minutesToTime(remainingTime)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">기준일</div>
            <div className="summary-value">{todayLabel}</div>
          </div>
        </div>

        <div className="overall-progress">
          <div className="overall-row">
            <span className="overall-label">총 진행률</span>
            <span className="overall-value">{overallProgress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <div className="statistics-section">
          <h3>보조작업별 진행 상황</h3>

          {taskStats.length === 0 ? (
            <p className="empty-stats">작업이 없습니다.</p>
          ) : (
            <div className="task-stats-list">
              {taskStats.map(task => (
                <div key={task.id} className="task-stat-item">
                  <div className="task-stat-header">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="stat-checkbox"
                    />
                    <div className="task-stat-title">{task.text}</div>
                    <div className="task-stat-badge">
                      진행률: {task.progress}%
                    </div>
                  </div>

                  <div className="task-stat-details">
                    <div className="stat-detail">
                      <span className="stat-label">할당 시간</span>
                      <span className="stat-value">{minutesToTime(task.allocated)}</span>
                    </div>
                    <div className="stat-detail">
                      <span className="stat-label">사용 시간</span>
                      <span className="stat-value">{minutesToTime(task.used)}</span>
                    </div>
                    <div className="stat-detail">
                      <span className="stat-label">남은 시간</span>
                      <span className="stat-value">{minutesToTime(task.remaining)}</span>
                    </div>
                    <div className="stat-detail">
                      <span className="stat-label">보조작업</span>
                      <span className="stat-value">
                        {task.subtaskCount > 0 ? `${task.subtaskCount}개` : '없음'}
                      </span>
                    </div>
                  </div>

                  <div className="progress-bar-container task">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="progress-text">{task.progress}%</span>
                  </div>

                  {task.subtasks.length > 0 && (
                    <div className="subtask-stats-list">
                      {task.subtasks.map(subtask => (
                        <div key={subtask.id} className="subtask-stat">
                          <div className="subtask-row">
                            <div className="subtask-name">
                              <input type="checkbox" readOnly checked={subtask.completed} className="stat-checkbox small" />
                              <span className={`subtask-text ${subtask.completed ? 'completed' : ''}`}>
                                {subtask.text}
                              </span>
                            </div>
                            <div className="subtask-badge">비중: {subtask.weight || 0}%</div>
                          </div>
                          <div className="subtask-stats">
                            <div className="stat-detail compact">
                              <span className="stat-label">할당</span>
                              <span className="stat-value">{minutesToTime(subtask.subAllocated)}</span>
                            </div>
                            <div className="stat-detail compact">
                              <span className="stat-label">사용</span>
                              <span className="stat-value">
                                {minutesToTime(subtask.subUsed)}
                                {subtask.isActive && <span className="timer-indicator"> ⏱️</span>}
                              </span>
                            </div>
                            <div className="stat-detail compact">
                              <span className="stat-label">남음</span>
                              <span className="stat-value">{minutesToTime(subtask.subRemaining)}</span>
                            </div>
                            <div className="stat-detail compact">
                              <span className="stat-label">진행률</span>
                              <span className="stat-value">{subtask.subProgress}%</span>
                            </div>
                          </div>
                          <div className="progress-bar-container subtask">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${subtask.subProgress}%` }}
                              />
                            </div>
                            <span className="progress-text">{subtask.subProgress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskStatistics;
