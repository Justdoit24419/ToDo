import { useState } from 'react';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';
import TaskStatistics from './TaskStatistics';
import './TodoList.css';

const TodoList = ({ todos, onAdd, onToggle, onDelete, onStartTimer, onUpdateDates, onAddSubtask, onToggleSubtask, onDeleteSubtask, onUpdateAllocatedTime, onUpdateSubtaskWeight, onUpdateSubtask, currentTimerTodoId, currentTimerSubtaskId, currentTimerMinutes }) => {
  const [showStatistics, setShowStatistics] = useState(false);

  return (
    <div className="todo-list">
      <div className="todo-list-header">
        <h2 className="todo-title">할 일 목록</h2>
        <button
          onClick={() => setShowStatistics(true)}
          className="statistics-btn"
          title="작업 진행 통계"
        >
          📊 통계
        </button>
      </div>
      <TodoInput onAdd={onAdd} />
      <div className="todo-items">
        {todos.length === 0 ? (
          <p className="empty-message">할 일이 없습니다. 추가해보세요!</p>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onStartTimer={onStartTimer}
              onUpdateDates={onUpdateDates}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onUpdateAllocatedTime={onUpdateAllocatedTime}
              onUpdateSubtaskWeight={onUpdateSubtaskWeight}
              onUpdateSubtask={onUpdateSubtask}
              isTimerRunning={currentTimerTodoId === todo.id}
              currentTimerMinutes={currentTimerTodoId === todo.id ? currentTimerMinutes : 0}
              currentTimerSubtaskId={currentTimerTodoId === todo.id ? currentTimerSubtaskId : null}
            />
          ))
        )}
      </div>

      {showStatistics && (
        <TaskStatistics
          todos={todos}
          currentTimerTodoId={currentTimerTodoId}
          currentTimerSubtaskId={currentTimerSubtaskId}
          currentTimerMinutes={currentTimerMinutes}
          onClose={() => setShowStatistics(false)}
        />
      )}
    </div>
  );
};

export default TodoList;
