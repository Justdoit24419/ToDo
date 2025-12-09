// LocalStorage 유틸리티 함수들

const STORAGE_KEYS = {
  TODOS: 'miniDashboard.todos',
  FOCUS_HISTORY: 'miniDashboard.focusHistory'
};

/**
 * 투두 리스트 조회
 * @returns {Array} 투두 배열
 */
export const getTodos = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TODOS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('getTodos 에러:', error);
    return [];
  }
};

/**
 * 투두 리스트 저장
 * @param {Array} todos - 투두 배열
 */
export const saveTodos = (todos) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    return true;
  } catch (error) {
    console.error('saveTodos 에러:', error);
    return false;
  }
};

/**
 * 집중 시간 기록 조회
 * @returns {Object} { "2025-02-01": 45, ... }
 */
export const getFocusHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FOCUS_HISTORY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('getFocusHistory 에러:', error);
    return {};
  }
};

/**
 * 집중 시간 기록 저장
 * @param {Object} history - 집중 시간 객체
 */
export const saveFocusHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FOCUS_HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('saveFocusHistory 에러:', error);
    return false;
  }
};

/**
 * 특정 날짜의 집중 시간 업데이트
 * @param {string} date - 날짜 (YYYY-MM-DD)
 * @param {number} minutes - 추가할 분
 */
export const updateFocusTime = (date, minutes) => {
  try {
    const history = getFocusHistory();
    history[date] = (history[date] || 0) + minutes;
    return saveFocusHistory(history);
  } catch (error) {
    console.error('updateFocusTime 에러:', error);
    return false;
  }
};

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns {string}
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 날짜 배열 생성 (오늘부터 과거로)
 * @param {number} days - 날짜 개수
 * @returns {Array<string>} 날짜 배열 (YYYY-MM-DD)
 */
export const getDateRange = (days) => {
  const dates = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
};

/**
 * LocalStorage 데이터 백업 (JSON 파일 다운로드)
 */
export const backupData = () => {
  try {
    const data = {
      todos: getTodos(),
      focusHistory: getFocusHistory(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomodoro-backup-${getTodayDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('backupData 에러:', error);
    return false;
  }
};

/**
 * LocalStorage 데이터 복원 (JSON 파일 업로드)
 * @param {File} file - 백업 JSON 파일
 * @returns {Promise<boolean>}
 */
export const restoreData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.todos) {
          saveTodos(data.todos);
        }

        if (data.focusHistory) {
          saveFocusHistory(data.focusHistory);
        }

        resolve(true);
      } catch (error) {
        console.error('restoreData 파싱 에러:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'));
    };

    reader.readAsText(file);
  });
};

/**
 * LocalStorage 모든 데이터 초기화
 */
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TODOS);
    localStorage.removeItem(STORAGE_KEYS.FOCUS_HISTORY);
    return true;
  } catch (error) {
    console.error('clearAllData 에러:', error);
    return false;
  }
};
