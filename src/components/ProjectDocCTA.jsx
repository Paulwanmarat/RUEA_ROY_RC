import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';

export function ProjectDocCTA({ onViewDocumentation }) {
  return (
    <section className="project-doc-cta-card">
      <div className="cta-icon-wrapper">
        <Compass size={32} className="cta-icon" />
      </div>
      <div className="cta-text-content">
        <h3 className="cta-title">Want to learn more about the project?</h3>
        <p className="cta-description">
          Explore how mechanical design, physics, mathematics, electronics, and software were integrated into one remote-controlled floating platform.
        </p>
      </div>
      <button className="btn btn-primary cta-btn glow-cyan" onClick={onViewDocumentation}>
        View Project Documentation <ArrowRight size={18} />
      </button>
    </section>
  );
}
