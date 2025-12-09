import { useState, useEffect, useRef, useCallback } from 'react';
import { updateFocusTime, getTodayDate } from '../utils/storage';

const TIMER_DURATION = 25 * 60; // 25분 = 1500초
const TIMER_STATUS = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED'
};

export const useTimer = (onComplete) => {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [status, setStatus] = useState(TIMER_STATUS.IDLE);
  const [currentTodoId, setCurrentTodoId] = useState(null);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(null);

  // 타이머 정확도를 위해 시작 시간 기록 방식 사용
  const tick = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const remaining = TIMER_DURATION - elapsed;

    if (remaining <= 0) {
      setTimeLeft(0);
      setStatus(TIMER_STATUS.FINISHED);

      // 타이머 완료 처리
      const today = getTodayDate();
      updateFocusTime(today, 25);

      // 완료 콜백 호출
      if (onComplete) {
        onComplete(currentTodoId);
      }

      // 브라우저 알림
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('포모도로 완료!', {
          body: '25분 집중 세션이 완료되었습니다. 잠시 휴식하세요.',
          icon: '/vite.svg'
        });
      }

      // 인터벌 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      setTimeLeft(remaining);
    }
  }, [currentTodoId, onComplete]);

  // 타이머 시작
  const start = useCallback((todoId = null) => {
    setCurrentTodoId(todoId);
    setStatus(TIMER_STATUS.RUNNING);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = null;

    // 브라우저 알림 권한 요청
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 일시정지
  const pause = useCallback(() => {
    if (status !== TIMER_STATUS.RUNNING) return;

    setStatus(TIMER_STATUS.PAUSED);
    pausedTimeRef.current = Date.now();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status]);

  // 재개
  const resume = useCallback(() => {
    if (status !== TIMER_STATUS.PAUSED) return;

    setStatus(TIMER_STATUS.RUNNING);

    // 일시정지된 시간만큼 시작 시간 조정
    if (pausedTimeRef.current && startTimeRef.current) {
      const pausedDuration = Date.now() - pausedTimeRef.current;
      startTimeRef.current += pausedDuration;
    }

    pausedTimeRef.current = null;
  }, [status]);

  // 리셋
  const reset = useCallback(() => {
    setTimeLeft(TIMER_DURATION);
    setStatus(TIMER_STATUS.IDLE);
    setCurrentTodoId(null);
    startTimeRef.current = null;
    pausedTimeRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // RUNNING 상태일 때 인터벌 시작
  useEffect(() => {
    if (status === TIMER_STATUS.RUNNING) {
      intervalRef.current = setInterval(tick, 100); // 100ms마다 체크 (더 정확한 표시)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [status, tick]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    status,
    currentTodoId,
    start,
    pause,
    resume,
    reset,
    isIdle: status === TIMER_STATUS.IDLE,
    isRunning: status === TIMER_STATUS.RUNNING,
    isPaused: status === TIMER_STATUS.PAUSED,
    isFinished: status === TIMER_STATUS.FINISHED
  };
};

export { TIMER_STATUS };
