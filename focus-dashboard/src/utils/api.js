// LocalStorage 기반 API (백엔드 불필요)
import * as storage from './localStorage';

// ========== 할일 API ==========

export const getTodos = async () => {
  const user = storage.getCurrentUser();
  const userId = user?.id || 'default-user';
  return storage.getTodos(userId);
};

export const saveTodos = async (todos) => {
  const user = storage.getCurrentUser();
  const userId = user?.id || 'default-user';
  storage.saveTodos(todos, userId);
  return { message: '저장되었습니다' };
};

// ========== 집중 기록 API ==========

export const getFocusHistory = async () => {
  const user = storage.getCurrentUser();
  const userId = user?.id || 'default-user';
  return storage.getFocusHistory(userId);
};

export const saveFocusHistory = async (history) => {
  const user = storage.getCurrentUser();
  const userId = user?.id || 'default-user';
  storage.saveFocusHistory(history, userId);
  return { message: '저장되었습니다' };
};

export const updateFocusTime = async (date, minutes) => {
  const user = storage.getCurrentUser();
  const userId = user?.id || 'default-user';
  storage.updateFocusTime(date, minutes, userId);
  return { message: '저장되었습니다' };
};

// ========== 시간대별 집중 기록 API ==========

export const getHourlyFocusData = async () => {
  const user = storage.getCurrentUser();
  const userId = user?.id || 'default-user';
  return storage.getHourlyFocusData(userId);
};

export const updateHourlyFocusTime = async (date, hour, minutes) => {
  const user = storage.getCurrentUser();
  const userId = user?.id || 'default-user';
  storage.updateHourlyFocusTime(date, hour, minutes, userId);
  return { message: '시간대별 집중 시간이 업데이트되었습니다' };
};

// ========== 계정 API ==========

export const changePassword = async () => {
  // LocalStorage 모드에서는 비밀번호 변경 불필요
  throw new Error('LocalStorage 모드에서는 비밀번호 변경이 지원되지 않습니다');
};

// ========== 관리자 API ==========

export const getAdminUsers = async () => {
  return storage.getAllUsersStats();
};

export const getAdminStats = async () => {
  return storage.getAdminStats();
};
