import { useState, useEffect } from 'react';
import { useGlobalTimer } from '../../contexts/TimerContext';
import { getTodayDate } from '../../utils/storage';
import './MonthlyCalendar.css';

// Date 객체를 로컬 시간대의 YYYY-MM-DD 문자열로 변환
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MonthlyCalendar = ({ focusHistory, todos, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const timer = useGlobalTimer();
  const [updateCounter, setUpdateCounter] = useState(0);

  // 타이머 실행 중일 때 1초마다 달력 업데이트
  useEffect(() => {
    if (timer.isRunning) {
      const interval = setInterval(() => {
        setUpdateCounter(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer.isRunning]);

  // 현재 월의 첫날과 마지막날
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 달력 시작 (일요일부터)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // 달력 종료 (토요일까지)
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  // 모든 날짜 생성
  const calendarDays = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // 날짜별 데이터 가져오기
  const getDateData = (date) => {
    const dateStr = formatLocalDate(date);
    let focusMinutes = focusHistory[dateStr] || 0;

    // 오늘 날짜이고 타이머가 실행 중이면 경과 시간 추가
    const today = getTodayDate();
    if (dateStr === today && timer.isRunning) {
      const elapsedMinutes = timer.getElapsedMinutes();
      focusMinutes += elapsedMinutes;
    }
    // updateCounter를 사용하여 리렌더링 트리거
    void updateCounter;

    // 해당 날짜의 할일들 (날짜 범위 내)
    const dateTodos = todos.filter(todo => {
      if (!todo.startDate && !todo.endDate) return false;
      const start = todo.startDate;
      const end = todo.endDate;
      const isInRange = (start && dateStr >= start && (!end || dateStr <= end));

      // 디버깅 로그 (오늘 날짜만)
      if (dateStr === today && todo.text) {
        console.log(`[MonthlyCalendar] 날짜 ${dateStr} - 할일: ${todo.text}, startDate: ${todo.startDate}, endDate: ${todo.endDate}, 범위 내: ${isInRange}`);
      }

      return isInRange;
    });

    // 완료된 할일
    const completedTodos = todos.filter(todo => {
      if (!todo.completed || !todo.completedAt) return false;
      const completedDate = formatLocalDate(new Date(todo.completedAt));
      return completedDate === dateStr;
    });

    return {
      focusMinutes,
      todos: dateTodos,
      completedTodos,
      completedCount: completedTodos.length
    };
  };

  // 월 변경
  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 날짜 클릭
  const handleDateClick = (date) => {
    const data = getDateData(date);
    onDateClick(date, data);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === month;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="monthly-calendar-container">
      <div className="calendar-header">
        <h3>📅 월별 일정 달력</h3>
        <div className="calendar-navigation">
          <button onClick={() => changeMonth(-12)} className="nav-btn">‹‹</button>
          <button onClick={() => changeMonth(-1)} className="nav-btn">‹</button>
          <h4 className="current-month">{year}년 {month + 1}월</h4>
          <button onClick={() => changeMonth(1)} className="nav-btn">›</button>
          <button onClick={() => changeMonth(12)} className="nav-btn">››</button>
          <button onClick={goToToday} className="today-btn">오늘</button>
        </div>
      </div>

      <div className="google-calendar">
        {/* 요일 헤더 */}
        <div className="weekday-header-row">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div key={day} className={`weekday-header ${i === 0 || i === 6 ? 'weekend' : ''}`}>
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="calendar-grid">
          {calendarDays.map((date, index) => {
            const data = getDateData(date);
            const dayOfWeek = date.getDay();

            return (
              <div
                key={index}
                className={`
                  calendar-day-cell
                  ${isToday(date) ? 'today' : ''}
                  ${!isCurrentMonth(date) ? 'other-month' : ''}
                  ${dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                <div className="day-header">
                  <span className="day-number">{date.getDate()}</span>
                  {data.focusMinutes > 0 && (
                    <span className="day-time">{formatTime(data.focusMinutes)}</span>
                  )}
                </div>

                <div className="day-content">
                  {data.todos.slice(0, 3).map(todo => (
                    <div
                      key={todo.id}
                      className={`todo-item ${todo.completed ? 'completed' : ''}`}
                    >
                      <span className="todo-indicator"></span>
                      <span className="todo-text">{todo.text}</span>
                    </div>
                  ))}
                  {data.todos.length > 3 && (
                    <div className="more-items">+{data.todos.length - 3}개 더보기</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendar;
