import React from 'react';

export function ResourcesHeader() {
  return (
    <section className="resources-hero">
      <div className="resources-hero-backdrop"></div>
      <div className="resources-hero-content">
        <div className="hero-badge">TECHNICAL REPOSITORY</div>
        <h1 className="resources-hero-title">Resources & Documentation</h1>
        <p className="resources-hero-subtitle">
          Explore technical documentation, embedded firmware source code, fluid hydrodynamics calculations, and circuit blueprints powering the RUEA LOY RC Platform.
        </p>

        <div className="resources-hero-stats">
          <div className="hero-stat-pill">
            <span className="h-stat-num">24+</span>
            <span className="h-stat-label">Resources</span>
          </div>
          <div className="hero-stat-pill">
            <span className="h-stat-num">C++</span>
            <span className="h-stat-label">RUEA_LOY.ino</span>
          </div>
          <div className="hero-stat-pill">
            <span className="h-stat-num">KaTeX</span>
            <span className="h-stat-label">LaTeX Math</span>
          </div>
          <div className="hero-stat-pill">
            <span className="h-stat-num">PWA</span>
            <span className="h-stat-label">React Web</span>
          </div>
        </div>
      </div>
    </section>
  );
}
