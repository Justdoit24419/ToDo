import { useState } from 'react';
import { THEMES, themeConfig } from '../../utils/themes';
import './Navigation.css';

const Navigation = ({ currentTheme, onThemeChange, currentPage, onPageChange, user, onLogout }) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themeOptions = [
    { id: THEMES.DEFAULT, ...themeConfig[THEMES.DEFAULT] },
    { id: THEMES.OCEAN, ...themeConfig[THEMES.OCEAN] },
    { id: THEMES.SUNSET, ...themeConfig[THEMES.SUNSET] }
  ];

  const handleThemeClick = () => {
    setShowThemeMenu(!showThemeMenu);
  };

  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
    setShowThemeMenu(false);
  };

  const handlePageChange = (page) => {
    onPageChange(page);
    setShowThemeMenu(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-left">
        <h1 className="nav-title">포모도로 집중 대시보드</h1>
        {user && (
          <span className="user-badge">
            {user.role === 'admin' ? '👑' : '👤'} {user.username}
          </span>
        )}
      </div>

      <div className="nav-right">
        <button
          className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => handlePageChange('dashboard')}
          type="button"
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-text">대시보드</span>
        </button>

        {user?.role === 'admin' && (
          <button
            className={`nav-button ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => handlePageChange('admin')}
            type="button"
          >
            <span className="nav-icon">👑</span>
            <span className="nav-text">관리자</span>
          </button>
        )}

        <button
          className={`nav-button ${currentPage === 'data' ? 'active' : ''}`}
          onClick={() => handlePageChange('data')}
          type="button"
        >
          <span className="nav-icon">💾</span>
          <span className="nav-text">데이터 관리</span>
        </button>

        <div className="theme-dropdown">
          <button
            className="nav-button theme-button"
            onClick={handleThemeClick}
            type="button"
          >
            <span className="nav-icon">🎨</span>
            <span className="nav-text">테마</span>
            <span className="dropdown-arrow">{showThemeMenu ? '▲' : '▼'}</span>
          </button>

          {showThemeMenu && (
            <div className="theme-menu">
              {themeOptions.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-menu-item ${currentTheme === theme.id ? 'active' : ''}`}
                  onClick={() => handleThemeSelect(theme.id)}
                  type="button"
                >
                  <div
                    className="theme-preview-small"
                    style={{ background: theme.gradient }}
                  />
                  <span className="theme-menu-name">{theme.name}</span>
                  {currentTheme === theme.id && (
                    <span className="theme-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="nav-button logout-button"
          onClick={onLogout}
          type="button"
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-text">로그아웃</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
