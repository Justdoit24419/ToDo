// LocalStorage 유틸리티 함수들

const STORAGE_KEYS = {
  USER: 'pomodoro_user',
  TODOS: 'pomodoro_todos',
  FOCUS_HISTORY: 'pomodoro_focus_history',
  HOURLY_FOCUS: 'pomodoro_hourly_focus',
  STATS: 'pomodoro_stats'
};

// ========== 사용자 관리 ==========

export const getUsers = () => {
  const users = localStorage.getItem('pomodoro_users');
  return users ? JSON.parse(users) : [
    {
      id: 'default-user',
      username: 'user',
      role: 'user',
      createdAt: new Date().toISOString()
    }
  ];
};

export const saveUsers = (users) => {
  localStorage.setItem('pomodoro_users', JSON.stringify(users));
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const removeCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// ========== 할일 관리 ==========

export const getTodos = (userId = 'default-user') => {
  const allTodos = localStorage.getItem(STORAGE_KEYS.TODOS);
  const todosData = allTodos ? JSON.parse(allTodos) : {};
  return todosData[userId] || [];
};

export const saveTodos = (todos, userId = 'default-user') => {
  const allTodos = localStorage.getItem(STORAGE_KEYS.TODOS);
  const todosData = allTodos ? JSON.parse(allTodos) : {};
  todosData[userId] = todos;
  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todosData));
};

// ========== 집중 기록 관리 ==========

export const getFocusHistory = (userId = 'default-user') => {
  const allHistory = localStorage.getItem(STORAGE_KEYS.FOCUS_HISTORY);
  const historyData = allHistory ? JSON.parse(allHistory) : {};
  return historyData[userId] || {};
};

export const saveFocusHistory = (history, userId = 'default-user') => {
  const allHistory = localStorage.getItem(STORAGE_KEYS.FOCUS_HISTORY);
  const historyData = allHistory ? JSON.parse(allHistory) : {};
  historyData[userId] = history;
  localStorage.setItem(STORAGE_KEYS.FOCUS_HISTORY, JSON.stringify(historyData));
};

export const updateFocusTime = (date, minutes, userId = 'default-user') => {
  const history = getFocusHistory(userId);
  history[date] = (history[date] || 0) + minutes;
  saveFocusHistory(history, userId);

  // 통계도 업데이트
  updateStats(userId);
};

// ========== 시간대별 집중 기록 관리 ==========

export const getHourlyFocusData = (userId = 'default-user') => {
  const allHourly = localStorage.getItem(STORAGE_KEYS.HOURLY_FOCUS);
  const hourlyData = allHourly ? JSON.parse(allHourly) : {};
  return hourlyData[userId] || {};
};

export const updateHourlyFocusTime = (date, hour, minutes, userId = 'default-user') => {
  const allHourly = localStorage.getItem(STORAGE_KEYS.HOURLY_FOCUS);
  const hourlyData = allHourly ? JSON.parse(allHourly) : {};

  if (!hourlyData[userId]) {
    hourlyData[userId] = {};
  }

  if (!hourlyData[userId][date]) {
    hourlyData[userId][date] = {};
  }

  const hourKey = hour.toString();
  hourlyData[userId][date][hourKey] = (hourlyData[userId][date][hourKey] || 0) + minutes;

  localStorage.setItem(STORAGE_KEYS.HOURLY_FOCUS, JSON.stringify(hourlyData));
};

// ========== 통계 관리 ==========

export const getStats = (userId = 'default-user') => {
  const allStats = localStorage.getItem(STORAGE_KEYS.STATS);
  const statsData = allStats ? JSON.parse(allStats) : {};
  return statsData[userId] || {
    totalFocusTime: 0,
    totalSessions: 0,
    lastActive: new Date().toISOString()
  };
};

export const updateStats = (userId = 'default-user') => {
  const history = getFocusHistory(userId);
  const totalFocusTime = Object.values(history).reduce((sum, minutes) => sum + minutes, 0);

  const allStats = localStorage.getItem(STORAGE_KEYS.STATS);
  const statsData = allStats ? JSON.parse(allStats) : {};

  statsData[userId] = {
    totalFocusTime,
    totalSessions: Math.floor(totalFocusTime / 25),
    lastActive: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(statsData));
};

// ========== 관리자용 함수 ==========

export const getAllUsersStats = () => {
  const users = getUsers();
  return users.filter(u => u.role === 'user').map(u => ({
    id: u.id,
    username: u.username,
    createdAt: u.createdAt,
    stats: getStats(u.id)
  }));
};

export const getAdminStats = () => {
  const users = getUsers().filter(u => u.role === 'user');
  const totalUsers = users.length;

  let totalFocusTime = 0;
  let totalSessions = 0;

  users.forEach(u => {
    const stats = getStats(u.id);
    totalFocusTime += stats.totalFocusTime || 0;
    totalSessions += stats.totalSessions || 0;
  });

  return {
    totalUsers,
    totalFocusTime,
    totalSessions,
    averageFocusTimePerUser: totalUsers > 0 ? Math.round(totalFocusTime / totalUsers) : 0
  };
};
