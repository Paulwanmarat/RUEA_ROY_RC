import React from 'react';
import { IconHome, IconGamepad, IconBookOpen } from './Icons';

export function Navigation({ activeView, setActiveView }) {
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
      </div>
    </nav>
  );
}
