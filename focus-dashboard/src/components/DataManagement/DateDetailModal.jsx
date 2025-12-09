import './DateDetailModal.css';

const DateDetailModal = ({
  isOpen,
  onClose,
  date,
  data
}) => {
  if (!isOpen || !date) return null;

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const allTodos = data?.todos || [];
  const completedTodos = data?.completedTodos || [];
  const pendingTodos = allTodos.filter(t => !t.completed);

  return (
    <div className="date-detail-overlay" onClick={onClose}>
      <div className="date-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{formatDate(date)}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {/* 집중 시간 요약 */}
          <div className="focus-summary-compact">
            <div className="summary-icon">⏰</div>
            <div className="summary-info">
              <div className="summary-label">총 집중 시간</div>
              <div className="summary-value">{formatTime(data?.focusMinutes || 0)}</div>
            </div>
          </div>

          {/* 할일 목록 */}
          {allTodos.length > 0 ? (
            <div className="todos-summary">
              {/* 진행 중인 할일 */}
              {pendingTodos.length > 0 && (
                <div className="todo-section">
                  <div className="section-title">
                    <span>📌 진행 중</span>
                    <span className="count-badge pending">{pendingTodos.length}개</span>
                  </div>
                  <div className="todos-list-compact">
                    {pendingTodos.map(todo => (
                      <div key={todo.id} className="todo-item-compact">
                        <span className="todo-indicator pending"></span>
                        <span className="todo-text">{todo.text}</span>
                        {todo.allocatedTime > 0 && (
                          <span className="todo-allocated">{todo.allocatedTime}분</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 완료한 할일 */}
              {completedTodos.length > 0 && (
                <div className="todo-section">
                  <div className="section-title">
                    <span>✅ 완료</span>
                    <span className="count-badge completed">{completedTodos.length}개</span>
                  </div>
                  <div className="todos-list-compact">
                    {completedTodos.map(todo => (
                      <div key={todo.id} className="todo-item-compact completed">
                        <span className="todo-indicator completed"></span>
                        <span className="todo-text">{todo.text}</span>
                        {todo.focusTime > 0 && (
                          <span className="todo-time">{formatTime(todo.focusTime)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-text">이 날짜에 일정이 없습니다</div>
            </div>
          )}

          {/* 통계 요약 */}
          {allTodos.length > 0 && (
            <div className="stats-summary">
              <div className="stat-item">
                <div className="stat-label">전체 할일</div>
                <div className="stat-value">{allTodos.length}개</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">완료율</div>
                <div className="stat-value">
                  {Math.round((completedTodos.length / allTodos.length) * 100)}%
                </div>
              </div>
              {data?.focusMinutes > 0 && (
                <div className="stat-item">
                  <div className="stat-label">집중 시간</div>
                  <div className="stat-value">{formatTime(data.focusMinutes)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateDetailModal;
