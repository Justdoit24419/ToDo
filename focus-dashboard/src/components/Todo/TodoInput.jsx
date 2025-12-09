import { useState } from 'react';
import { getTodayDate } from '../../utils/storage';
import './TodoInput.css';

const TodoInput = ({ onAdd }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기 (로컬 시간대)
    const today = getTodayDate();
    if (onAdd(inputValue, today, today)) {
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="todo-input">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="할 일을 입력하세요..."
        className="todo-input-field"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      <button onClick={handleSubmit} className="todo-add-btn">
        추가
      </button>
    </div>
  );
};

export default TodoInput;
