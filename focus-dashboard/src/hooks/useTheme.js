import { useState, useEffect } from 'react';
import { THEMES, applyTheme } from '../utils/themes';

const STORAGE_KEY = 'miniDashboard.theme';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // localStorage에서 저장된 테마 가져오기
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || THEMES.DEFAULT;
    } catch (error) {
      console.error('테마 로드 에러:', error);
      return THEMES.DEFAULT;
    }
  });

  // 테마 변경 함수
  const changeTheme = (themeName) => {
    if (!THEMES[themeName.toUpperCase()]) {
      console.error('유효하지 않은 테마:', themeName);
      return;
    }

    setCurrentTheme(themeName);
    applyTheme(themeName);

    // localStorage에 저장
    try {
      localStorage.setItem(STORAGE_KEY, themeName);
    } catch (error) {
      console.error('테마 저장 에러:', error);
    }
  };

  // 초기 테마 적용
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  return {
    currentTheme,
    changeTheme,
    availableThemes: THEMES
  };
};
