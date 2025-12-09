import { useState, useEffect, useCallback } from 'react';
import { getDateRange } from '../utils/storage';
import * as api from '../utils/api';

export const useFocusHistory = () => {
  const [focusHistory, setFocusHistory] = useState({});
  const [viewMode, setViewMode] = useState('7days'); // '7days' | '30days' | 'custom'
  const [customRange, setCustomRange] = useState(null);

  // 집중 기록 로드
  const loadHistory = useCallback(async () => {
    try {
      const history = await api.getFocusHistory();
      setFocusHistory(history);
    } catch (error) {
      console.error('집중 기록 로드 실패:', error);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 현재 뷰 모드에 맞는 날짜 배열 가져오기
  const getDisplayDates = useCallback(() => {
    if (viewMode === 'custom' && customRange) {
      const { startDate, endDate } = customRange;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dates = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
      }

      return dates;
    }

    const days = viewMode === '7days' ? 7 : 30;
    return getDateRange(days);
  }, [viewMode, customRange]);

  // 특정 날짜의 집중 시간 가져오기
  const getFocusMinutes = useCallback((date) => {
    return focusHistory[date] || 0;
  }, [focusHistory]);

  // 뷰 모드 변경
  const changeViewMode = useCallback((mode, range) => {
    setViewMode(mode);
    if (mode === 'custom' && range) {
      setCustomRange(range);
    }
  }, []);

  return {
    focusHistory,
    viewMode,
    getDisplayDates,
    getFocusMinutes,
    setViewMode: changeViewMode,
    refreshHistory: loadHistory
  };
};
