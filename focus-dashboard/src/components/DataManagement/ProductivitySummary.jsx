import { useMemo, useEffect, useState } from 'react';
import { useGlobalTimer } from '../../contexts/TimerContext';
import { getTodayDate } from '../../utils/storage';
import './ProductivitySummary.css';

const ProductivitySummary = ({ focusHistory, todos }) => {
  const timer = useGlobalTimer();
  const [updateCounter, setUpdateCounter] = useState(0);

  // 타이머 실행 중일 때 1초마다 통계 업데이트
  useEffect(() => {
    if (timer.isRunning) {
      const interval = setInterval(() => {
        setUpdateCounter(prev => prev + 1); // 카운터 증가로 강제 리렌더링
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer.isRunning]);

  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 오늘 집중 시간 (타이머 실행 중이면 경과 시간 추가)
    let todayMinutes = focusHistory[todayStr] || 0;
    const todayDate = getTodayDate();
    if (todayStr === todayDate && timer.isRunning) {
      const elapsedMinutes = timer.getElapsedMinutes();
      todayMinutes += elapsedMinutes;
    }
    // updateCounter를 의존성으로 사용
    void updateCounter;

    // 이번 주 시작일 (월요일)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 일요일이면 -6, 아니면 월요일까지 차이
    startOfWeek.setDate(today.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // 이번 주 총 시간 (타이머 실행 중이면 오늘 날짜에 경과 시간 추가)
    let weekTotal = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      let dayMinutes = focusHistory[dateStr] || 0;

      // 오늘 날짜이고 타이머 실행 중이면 경과 시간 추가
      if (dateStr === todayDate && timer.isRunning) {
        const elapsedMinutes = timer.getElapsedMinutes();
        dayMinutes += elapsedMinutes;
      }

      weekTotal += dayMinutes;
    }

    // 지난 30일 평균
    let thirtyDaysTotal = 0;
    let daysWithData = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const minutes = focusHistory[dateStr] || 0;
      if (minutes > 0) {
        thirtyDaysTotal += minutes;
        daysWithData++;
      }
    }
    const averageMinutes = daysWithData > 0 ? Math.round(thirtyDaysTotal / daysWithData) : 0;

    // 할일 완료율 (전체)
    const totalTodos = todos.length;
    const completedTodos = todos.filter(todo => todo.completed).length;
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

    return {
      todayMinutes,
      weekTotal,
      averageMinutes,
      completionRate
    };
  }, [focusHistory, todos, timer.isRunning, timer.getElapsedMinutes, updateCounter]);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  return (
    <div className="productivity-summary">
      <div className="summary-card">
        <div className="card-icon">📅</div>
        <div className="card-content">
          <div className="card-label">이번 주 총 시간</div>
          <div className="card-value">{formatTime(stats.weekTotal)}</div>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">⏰</div>
        <div className="card-content">
          <div className="card-label">오늘 집중 시간</div>
          <div className="card-value">{formatTime(stats.todayMinutes)}</div>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">📊</div>
        <div className="card-content">
          <div className="card-label">일평균 (30일)</div>
          <div className="card-value">{formatTime(stats.averageMinutes)}</div>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">🎯</div>
        <div className="card-content">
          <div className="card-label">할일 완료율</div>
          <div className="card-value">{stats.completionRate}%</div>
        </div>
      </div>
    </div>
  );
};

export default ProductivitySummary;
