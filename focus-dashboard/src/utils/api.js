// API 호출 유틸리티

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// ========== 할일 API ==========

export const getTodos = async () => {
  const response = await fetch(`${API_URL}/todos`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('할일 목록을 불러올 수 없습니다');
  }

  return response.json();
};

export const saveTodos = async (todos) => {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ todos })
  });

  if (!response.ok) {
    throw new Error('할일 저장에 실패했습니다');
  }

  return response.json();
};

// ========== 집중 기록 API ==========

export const getFocusHistory = async () => {
  const response = await fetch(`${API_URL}/focus-history`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('집중 기록을 불러올 수 없습니다');
  }

  return response.json();
};

export const saveFocusHistory = async (history) => {
  const response = await fetch(`${API_URL}/focus-history`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ history })
  });

  if (!response.ok) {
    throw new Error('집중 기록 저장에 실패했습니다');
  }

  return response.json();
};

export const updateFocusTime = async (date, minutes) => {
  const response = await fetch(`${API_URL}/focus-history/update`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, minutes })
  });

  if (!response.ok) {
    throw new Error('집중 시간 업데이트에 실패했습니다');
  }

  return response.json();
};

// ========== 시간대별 집중 기록 API ==========

export const getHourlyFocusData = async () => {
  const response = await fetch(`${API_URL}/hourly-focus`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('시간대별 집중 기록을 불러올 수 없습니다');
  }

  return response.json();
};

export const updateHourlyFocusTime = async (date, hour, minutes) => {
  const response = await fetch(`${API_URL}/hourly-focus/update`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, hour, minutes })
  });

  if (!response.ok) {
    throw new Error('시간대별 집중 시간 업데이트에 실패했습니다');
  }

  return response.json();
};

// ========== 계정 API ==========

export const changePassword = async (currentPassword, newPassword) => {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || '비밀번호 변경에 실패했습니다');
  }

  return data;
};
