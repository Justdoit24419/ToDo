import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getTodayDate } from '../utils/storage';
import * as api from '../utils/api';
import { useVoiceSettings } from '../hooks/useVoiceSettings';

const TIMER_STATUS = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED',
  FINISHED: 'FINISHED'
};

const DEFAULT_DURATION = 25 * 60; // 25분

const TimerContext = createContext(null);

export const useGlobalTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useGlobalTimer must be used within TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children, onComplete, onTick }) => {
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [status, setStatus] = useState(TIMER_STATUS.IDLE);
  const [currentTodoId, setCurrentTodoId] = useState(null);
  const [currentSubtaskId, setCurrentSubtaskId] = useState(null);
  const { voiceEnabled, toggleVoice } = useVoiceSettings();

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0); // 일시정지된 총 시간 추적
  const durationRef = useRef(DEFAULT_DURATION);
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);
  const startHourRef = useRef(null);

  // onTick, onComplete 참조 업데이트
  useEffect(() => {
    onTickRef.current = onTick;
    onCompleteRef.current = onComplete;
  }, [onTick, onComplete]);

  const tick = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const remaining = durationRef.current - elapsed;

    // onTick 콜백 호출
    if (onTickRef.current && currentTodoId) {
      onTickRef.current(currentTodoId, currentSubtaskId, elapsed);
    }

    if (remaining <= 0) {
      setTimeLeft(0);
      setStatus(TIMER_STATUS.FINISHED);

      const today = getTodayDate();
      // 실제 경과 시간 = 전체 시간 - 일시정지된 시간
      const actualElapsedSeconds = elapsed - totalPausedTimeRef.current;
      const completedMinutes = Math.round(actualElapsedSeconds / 60);

      // 시간대별 기록 업데이트
      if (startHourRef.current !== null) {
        const startHour = startHourRef.current;
        api.updateHourlyFocusTime(today, startHour, completedMinutes).catch(error => {
          console.error('시간대별 집중 시간 업데이트 실패:', error);
        });
      }

      // 집중 시간 업데이트
      api.updateFocusTime(today, completedMinutes).catch(error => {
        console.error('집중 시간 업데이트 실패:', error);
      });

      // 완료 콜백
      if (onCompleteRef.current) {
        onCompleteRef.current(currentTodoId, currentSubtaskId, completedMinutes);
      }

      // 브라우저 알림
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('포모도로 완료!', {
          body: `${completedMinutes}분 집중 세션이 완료되었습니다. 잠시 휴식하세요.`,
          icon: '/vite.svg'
        });
      }

      // 음성 알림 (설정이 켜져있을 때만)
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `수고하셨습니다. ${completedMinutes}분이 완료되었습니다. 다른 설정을 해주세요.`
        );
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }

      // 인터벌 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      startHourRef.current = null;
      totalPausedTimeRef.current = 0;
    } else {
      setTimeLeft(remaining);
    }
  }, [currentTodoId, currentSubtaskId]);

  const setTimerDuration = useCallback((minutes) => {
    // 타이머가 실행 중이거나 일시정지 상태면 현재 경과 시간 먼저 저장
    if ((status === TIMER_STATUS.RUNNING || status === TIMER_STATUS.PAUSED || status === TIMER_STATUS.STOPPED) && startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const actualElapsedSeconds = elapsed - totalPausedTimeRef.current;
      const completedMinutes = Math.round(actualElapsedSeconds / 60);

      if (completedMinutes > 0) {
        const today = getTodayDate();

        // 시간대별 기록 업데이트
        if (startHourRef.current !== null) {
          const startHour = startHourRef.current;
          api.updateHourlyFocusTime(today, startHour, completedMinutes).catch(error => {
            console.error('시간대별 집중 시간 업데이트 실패:', error);
          });
        }

        // 집중 시간 업데이트
        api.updateFocusTime(today, completedMinutes).catch(error => {
          console.error('집중 시간 업데이트 실패:', error);
        });

        // 완료 콜백
        if (onCompleteRef.current) {
          onCompleteRef.current(currentTodoId, currentSubtaskId, completedMinutes);
        }
      }
    }

    const seconds = minutes * 60;
    setDuration(seconds);
    setTimeLeft(seconds);
    durationRef.current = seconds;
  }, [status, currentTodoId, currentSubtaskId]);

  const start = useCallback((todoId = null, subtaskId = null) => {
    setCurrentTodoId(todoId);
    setCurrentSubtaskId(subtaskId);
    setStatus(TIMER_STATUS.RUNNING);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = null;
    totalPausedTimeRef.current = 0;

    // 시작 시간대 기록
    startHourRef.current = new Date().getHours();

    // 브라우저 알림 권한 요청
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const pause = useCallback(() => {
    if (status !== TIMER_STATUS.RUNNING) return;

    setStatus(TIMER_STATUS.PAUSED);
    pausedTimeRef.current = Date.now();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status]);

  const stop = useCallback(() => {
    if (status !== TIMER_STATUS.RUNNING && status !== TIMER_STATUS.PAUSED) return;

    // 경과 시간 계산 및 저장
    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const actualElapsedSeconds = elapsed - totalPausedTimeRef.current;
      const completedMinutes = Math.round(actualElapsedSeconds / 60);

      if (completedMinutes > 0) {
        const today = getTodayDate();

        // 시간대별 기록 업데이트
        if (startHourRef.current !== null) {
          const startHour = startHourRef.current;
          api.updateHourlyFocusTime(today, startHour, completedMinutes).catch(error => {
            console.error('시간대별 집중 시간 업데이트 실패:', error);
          });
        }

        // 집중 시간 업데이트
        api.updateFocusTime(today, completedMinutes).catch(error => {
          console.error('집중 시간 업데이트 실패:', error);
        });

        // 완료 콜백
        if (onCompleteRef.current) {
          onCompleteRef.current(currentTodoId, currentSubtaskId, completedMinutes);
        }
      }
    }

    setStatus(TIMER_STATUS.STOPPED);
    pausedTimeRef.current = Date.now();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status, currentTodoId, currentSubtaskId]);

  const resume = useCallback(() => {
    if (status !== TIMER_STATUS.PAUSED && status !== TIMER_STATUS.STOPPED) return;

    const wasStopped = status === TIMER_STATUS.STOPPED;
    setStatus(TIMER_STATUS.RUNNING);

    if (pausedTimeRef.current && startTimeRef.current) {
      const pausedDuration = Date.now() - pausedTimeRef.current;

      if (wasStopped) {
        // STOPPED 상태였다면 일시정지 시간을 합계에서 제외
        totalPausedTimeRef.current += Math.floor(pausedDuration / 1000);
      }

      // 타이머 시간 조정
      startTimeRef.current += pausedDuration;
    }

    pausedTimeRef.current = null;
  }, [status]);

  const reset = useCallback(() => {
    // 리셋하기 전에 타이머가 실행 중이었다면 경과 시간 저장
    if ((status === TIMER_STATUS.RUNNING || status === TIMER_STATUS.PAUSED || status === TIMER_STATUS.STOPPED) && startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const actualElapsedSeconds = elapsed - totalPausedTimeRef.current;
      const completedMinutes = Math.round(actualElapsedSeconds / 60);

      if (completedMinutes > 0) {
        const today = getTodayDate();

        // 시간대별 기록 업데이트
        if (startHourRef.current !== null) {
          const startHour = startHourRef.current;
          api.updateHourlyFocusTime(today, startHour, completedMinutes).catch(error => {
            console.error('시간대별 집중 시간 업데이트 실패:', error);
          });
        }

        // 집중 시간 업데이트
        api.updateFocusTime(today, completedMinutes).catch(error => {
          console.error('집중 시간 업데이트 실패:', error);
        });

        // 완료 콜백
        if (onCompleteRef.current) {
          onCompleteRef.current(currentTodoId, currentSubtaskId, completedMinutes);
        }
      }
    }

    setTimeLeft(durationRef.current);
    setStatus(TIMER_STATUS.IDLE);
    setCurrentTodoId(null);
    setCurrentSubtaskId(null);
    startTimeRef.current = null;
    pausedTimeRef.current = null;
    totalPausedTimeRef.current = 0;
    startHourRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status, currentTodoId, currentSubtaskId]);

  // RUNNING 상태일 때 인터벌 시작
  useEffect(() => {
    if (status === TIMER_STATUS.RUNNING) {
      intervalRef.current = setInterval(tick, 100);

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

  // 현재 세션의 경과 시간 계산 (초 단위) - 일시정지 시간 제외
  const getElapsedTime = useCallback(() => {
    if (!startTimeRef.current) {
      console.log('[getElapsedTime] No startTime');
      return 0;
    }
    if (status !== TIMER_STATUS.RUNNING && status !== TIMER_STATUS.PAUSED && status !== TIMER_STATUS.STOPPED) {
      console.log('[getElapsedTime] Wrong status:', status);
      return 0;
    }

    const totalElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const actualElapsed = totalElapsed - totalPausedTimeRef.current;

    console.log('[getElapsedTime]', {
      status,
      totalElapsed,
      totalPaused: totalPausedTimeRef.current,
      actualElapsed,
      startTime: startTimeRef.current,
      now: Date.now()
    });

    // STOPPED 상태인 경우 현재 정지 시간도 제외
    if (status === TIMER_STATUS.STOPPED && pausedTimeRef.current) {
      const currentStoppedTime = Math.floor((Date.now() - pausedTimeRef.current) / 1000);
      return actualElapsed - currentStoppedTime;
    }

    return actualElapsed;
  }, [status]);

  // 현재 세션의 경과 시간 (분 단위)
  const getElapsedMinutes = useCallback(() => {
    return Math.floor(getElapsedTime() / 60);
  }, [getElapsedTime]);

  const value = {
    duration,
    timeLeft,
    status,
    currentTodoId,
    currentSubtaskId,
    start,
    pause,
    stop,
    resume,
    reset,
    setTimerDuration,
    getElapsedTime,
    getElapsedMinutes,
    isIdle: status === TIMER_STATUS.IDLE,
    isRunning: status === TIMER_STATUS.RUNNING,
    isPaused: status === TIMER_STATUS.PAUSED,
    isStopped: status === TIMER_STATUS.STOPPED,
    isFinished: status === TIMER_STATUS.FINISHED,
    voiceEnabled,
    toggleVoice
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export { TIMER_STATUS };
