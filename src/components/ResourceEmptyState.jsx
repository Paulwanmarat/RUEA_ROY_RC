import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

export function ResourceEmptyState({ onReset }) {
  return (
    <div className="empty-state-container">
      <div className="empty-icon-wrapper">
        <SearchX size={48} className="empty-icon" />
      </div>
      <h3 className="empty-title">No resources found</h3>
      <p className="empty-text">
        No project documentation or technical materials matched your search query or selected category.
      </p>
      <button className="btn btn-primary btn-reset" onClick={onReset}>
        <RotateCcw size={16} /> Reset Search & Filters
      </button>
    </div>
  );
}
