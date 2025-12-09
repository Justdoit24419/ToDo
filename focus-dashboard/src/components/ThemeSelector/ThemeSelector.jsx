import { useState } from 'react';
import { THEMES, themeConfig } from '../../utils/themes';
import './ThemeSelector.css';

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    { id: THEMES.DEFAULT, ...themeConfig[THEMES.DEFAULT] },
    { id: THEMES.OCEAN, ...themeConfig[THEMES.OCEAN] },
    { id: THEMES.SUNSET, ...themeConfig[THEMES.SUNSET] }
  ];

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle clicked, current isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  const handleThemeChange = (themeId) => {
    console.log('Theme changed to:', themeId);
    onThemeChange(themeId);
    setIsOpen(false);
  };

  return (
    <div className={`theme-selector ${isOpen ? 'open' : ''}`}>
      <button
        className="theme-selector-header"
        onClick={handleToggle}
        type="button"
      >
        <span className="theme-icon">🎨</span>
        <span className="theme-label">테마</span>
        <span className="theme-toggle">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="theme-options">
          {themeOptions.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
              title={theme.name}
              type="button"
            >
              <div
                className="theme-preview"
                style={{ background: theme.gradient }}
              />
              <span className="theme-name">{theme.name}</span>
              {currentTheme === theme.id && (
                <span className="theme-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
