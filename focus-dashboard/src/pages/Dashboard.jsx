import { useState, useCallback, useEffect } from 'react';
import PomodoroTimer from '../components/Timer/PomodoroTimer';
import TodoList from '../components/Todo/TodoList';
import FocusHeatmap from '../components/Heatmap/FocusHeatmap';
import { useGlobalTimer } from '../contexts/TimerContext';
import { useGlobalTodos } from '../contexts/TodosContext';
import { useFocusHistory } from '../hooks/useFocusHistory';
import './Dashboard.css';

const Dashboard = ({ user, onNavigateToAdmin }) => {
  const timer = useGlobalTimer();
  const [currentTimerMinutes, setCurrentTimerMinutes] = useState(0);
  const { todos, addTodo, toggleTodo, deleteTodo, updateTodoFocusTime, updateTodoDates, addSubtask, toggleSubtask, deleteSubtask, updateAllocatedTime, updateSubtaskWeight, updateSubtask, updateSubtaskAllocatedTime } = useGlobalTodos();
  const { refreshHistory } = useFocusHistory();

  // 전역 타이머의 상태를 감시해서 currentTimerMinutes 업데이트
  useEffect(() => {
    if (timer.isRunning || timer.isPaused) {
      const elapsed = Math.floor((timer.duration - timer.timeLeft) / 60);
      setCurrentTimerMinutes(elapsed);
    } else {
      setCurrentTimerMinutes(0);
    }
  }, [timer.timeLeft, timer.duration, timer.isRunning, timer.isPaused]);

  // 타이머 완료 시 처리 (전역 타이머가 FINISHED 상태가 될 때)
  useEffect(() => {
    if (timer.isFinished && timer.currentTodoId) {
      const completedMinutes = Math.round(timer.duration / 60);
      updateTodoFocusTime(timer.currentTodoId, completedMinutes, timer.currentSubtaskId || null);
      refreshHistory();
    }
  }, [timer.isFinished, timer.currentTodoId, timer.currentSubtaskId, timer.duration, updateTodoFocusTime, refreshHistory]);

  // 투두에서 타이머 시작
  const handleStartTimer = useCallback((todoId, subtaskId = null) => {
    timer.start(todoId, subtaskId);
  }, [timer]);

  return (
    <div className="dashboard">
      <div className="admin-button-container">
        {user?.role === 'admin' && (
          <button
            className="admin-dashboard-button"
            onClick={onNavigateToAdmin}
            type="button"
          >
            <span className="admin-button-icon">👑</span>
            <span className="admin-button-text">관리자 대시보드</span>
          </button>
        )}

        {!user && (
          <button
            className="login-button"
            onClick={() => window.location.reload()}
            type="button"
          >
            <span className="admin-button-icon">🔑</span>
            <span className="admin-button-text">로그인</span>
          </button>
        )}
      </div>

      <main className="dashboard-main">
        <div className="timer-section">
          <PomodoroTimer
            onUpdateAllocatedTime={updateAllocatedTime}
            onUpdateSubtaskAllocatedTime={updateSubtaskAllocatedTime}
            currentTodoId={timer.currentTodoId}
            currentSubtaskId={timer.currentSubtaskId}
            todos={todos}
          />
        </div>

        <div className="todo-section">
          <TodoList
            todos={todos}
            onAdd={addTodo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onStartTimer={handleStartTimer}
            onUpdateDates={updateTodoDates}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
            onDeleteSubtask={deleteSubtask}
            onUpdateAllocatedTime={updateAllocatedTime}
            onUpdateSubtaskWeight={updateSubtaskWeight}
            onUpdateSubtask={updateSubtask}
            currentTimerTodoId={timer.currentTodoId}
            currentTimerSubtaskId={timer.currentSubtaskId}
            currentTimerMinutes={currentTimerMinutes}
          />
        </div>

        <div className="heatmap-section">
          <FocusHeatmap todos={todos} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
