import React from 'react';
import { IconHome, IconGamepad, IconBookOpen, IconUsers, IconSun, IconMoon, IconMonitor } from './Icons';

export function Navigation({ activeView, setActiveView, themeMode, setThemeMode }) {
  const cycleTheme = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('system');
    else setThemeMode('light');
  };

  return (
    <nav className="top-navigation">
      <div className="nav-container">
        <button
          className={`nav-tab ${activeView === 'home' ? 'active' : ''}`}
          onClick={() => setActiveView('home')}
        >
          <IconHome className="nav-icon" />
          <span>Home</span>
        </button>

        <button
          className={`nav-tab ${activeView === 'controller' ? 'active' : ''}`}
          onClick={() => setActiveView('controller')}
        >
          <IconGamepad className="nav-icon" />
          <span>Controller Deck</span>
        </button>

        <button
          className={`nav-tab ${activeView === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveView('resources')}
        >
          <IconBookOpen className="nav-icon" />
          <span>Resources & Docs</span>
        </button>

        <button
          className={`nav-tab ${activeView === 'team' ? 'active' : ''}`}
          onClick={() => setActiveView('team')}
        >
          <IconUsers className="nav-icon" />
          <span>Team Members</span>
        </button>

        {/* Global Theme Switcher Pill */}
        <button
          className="nav-theme-toggle"
          onClick={cycleTheme}
          title={`Current Theme: ${themeMode.toUpperCase()} (Click to toggle)`}
        >
          {themeMode === 'light' ? (
            <IconSun className="theme-toggle-icon" />
          ) : themeMode === 'dark' ? (
            <IconMoon className="theme-toggle-icon" />
          ) : (
            <IconMonitor className="theme-toggle-icon" />
          )}
          <span className="theme-toggle-text">{themeMode}</span>
        </button>
      </div>
    </nav>
  );
}
