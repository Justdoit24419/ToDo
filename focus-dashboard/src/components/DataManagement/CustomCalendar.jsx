import { useState, useEffect } from 'react';
import { useGlobalTimer } from '../../contexts/TimerContext';
import { getTodayDate } from '../../utils/storage';
import './CustomCalendar.css';

const CustomCalendar = ({ focusHistory, todos, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const timer = useGlobalTimer();
  const [updateCounter, setUpdateCounter] = useState(0);

  // 타이머 실행 중일 때 1초마다 달력 업데이트
  useEffect(() => {
    if (timer.isRunning) {
      const interval = setInterval(() => {
        setUpdateCounter(prev => prev + 1); // 카운터 증가로 강제 리렌더링
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer.isRunning]);

  // 현재 월의 첫날과 마지막날 구하기
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 달력 시작 날짜 (일요일부터 시작)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // 달력 종료 날짜 (토요일까지)
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  // 달력에 표시할 모든 날짜 생성
  const calendarDays = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // 날짜별 데이터 가져오기 (updateCounter를 의존성으로 사용)
  const getDateData = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    let focusMinutes = focusHistory[dateStr] || 0;

    // 오늘 날짜이고 타이머가 실행 중이면 경과 시간 추가
    const today = getTodayDate();
    if (dateStr === today && timer.isRunning) {
      const elapsedMinutes = timer.getElapsedMinutes();
      focusMinutes += elapsedMinutes;
    }
    // updateCounter를 사용하여 리렌더링 강제
    void updateCounter;

    const completedTodos = todos.filter(todo => {
      if (!todo.completed || !todo.completedAt) return false;
      const completedDate = new Date(todo.completedAt).toISOString().split('T')[0];
      return completedDate === dateStr;
    });

    return {
      focusMinutes,
      completedCount: completedTodos.length,
      todos: completedTodos
    };
  };

  // 히트맵 색상
  const getHeatmapColor = (minutes) => {
    if (minutes === 0) return '';
    if (minutes < 30) return 'heatmap-low';
    if (minutes < 60) return 'heatmap-medium';
    if (minutes < 120) return 'heatmap-high';
    return 'heatmap-very-high';
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

  // 날짜 클릭 - 모든 날짜에서 모달 열기
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

  return (
    <div className="custom-calendar-container">
      <div className="calendar-header">
        <h3>📅 월별 생산성 달력</h3>
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color heatmap-low"></div>
            <span>30분 미만</span>
          </div>
          <div className="legend-item">
            <div className="legend-color heatmap-medium"></div>
            <span>30-60분</span>
          </div>
          <div className="legend-item">
            <div className="legend-color heatmap-high"></div>
            <span>1-2시간</span>
          </div>
          <div className="legend-item">
            <div className="legend-color heatmap-very-high"></div>
            <span>2시간 이상</span>
          </div>
        </div>
      </div>

      <div className="calendar-navigation">
        <button onClick={() => changeMonth(-1)} className="nav-btn">‹</button>
        <h4 className="current-month">{year}년 {month + 1}월</h4>
        <button onClick={() => changeMonth(1)} className="nav-btn">›</button>
        <button onClick={goToToday} className="today-btn">오늘</button>
      </div>

      <div className="calendar-grid">
        {/* 요일 헤더 */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
          <div key={day} className={`weekday-header ${i === 0 || i === 6 ? 'weekend' : ''}`}>
            {day}
          </div>
        ))}

        {/* 날짜 셀 */}
        {calendarDays.map((date, index) => {
          const data = getDateData(date);
          const heatmapClass = getHeatmapColor(data.focusMinutes);
          const dayOfWeek = date.getDay();

          return (
            <div
              key={index}
              className={`
                calendar-cell
                ${isToday(date) ? 'today' : ''}
                ${!isCurrentMonth(date) ? 'other-month' : ''}
                ${dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : ''}
                ${heatmapClass}
                ${data.focusMinutes > 0 || data.completedCount > 0 ? 'has-data' : ''}
                clickable
              `}
              onClick={() => handleDateClick(date)}
            >
              <div className="date-number">{date.getDate()}</div>
              <div className="date-content">
                {data.completedCount > 0 && (
                  <div className="completed-badge">{data.completedCount}</div>
                )}
                {data.focusMinutes > 0 && (
                  <div className="focus-time">{data.focusMinutes}분</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
