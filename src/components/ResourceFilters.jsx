import React from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES } from '../data/resourcesData';

export function ResourceFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  totalResults
}) {
  return (
    <div className="resources-filters-container">
      {/* Search Input Bar */}
      <div className="search-bar-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, keyword, hardware, math formula, or language..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-search-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Pills Row */}
      <div className="category-chips-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="results-count-bar">
        <span>Showing <strong>{totalResults}</strong> resource{totalResults === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
}
