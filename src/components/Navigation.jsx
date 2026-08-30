import React from 'react';

export function Navigation({ activeView, setActiveView }) {
  return (
    <nav className="top-navigation">
      <div className="nav-container">
        <button
          className={`nav-tab ${activeView === 'home' ? 'active' : ''}`}
          onClick={() => setActiveView('home')}
        >
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </button>
        <button
          className={`nav-tab ${activeView === 'controller' ? 'active' : ''}`}
          onClick={() => setActiveView('controller')}
        >
          <span className="nav-icon">🎮</span>
          <span>Controller Deck</span>
        </button>
        <button
          className={`nav-tab ${activeView === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveView('resources')}
        >
          <span className="nav-icon">📚</span>
          <span>Resources & Docs</span>
        </button>
      </div>
    </nav>
  );
}
