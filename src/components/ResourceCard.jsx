import React from 'react';
import * as Icons from 'lucide-react';

export function ResourceCard({ resource, onOpenModal }) {
  // Dynamically resolve icon component from Lucide
  const IconComponent = Icons[resource.iconName] || Icons.FileText;

  const handleClick = () => {
    if (resource.status === 'coming-soon') return;

    if (resource.status === 'link' && resource.externalUrl) {
      window.open(resource.externalUrl, '_blank', 'noopener,noreferrer');
    } else if (resource.modalType) {
      onOpenModal(resource);
    }
  };

  return (
    <div className={`resource-card ${resource.status === 'coming-soon' ? 'card-disabled' : ''}`}>
      <div className="card-top-bar">
        <div className="icon-badge">
          <IconComponent size={22} className="card-icon" />
        </div>
        <div className="badges-group">
          <span className="category-tag">{resource.category}</span>
          <span className="type-pill">{resource.type}</span>
        </div>
      </div>

      <h3 className="card-title">{resource.title}</h3>
      <p className="card-description">{resource.description}</p>

      <div className="card-footer">
        {resource.status === 'coming-soon' ? (
          <button className="btn-resource btn-disabled" disabled>
            <Icons.Clock size={15} /> Coming Soon
          </button>
        ) : resource.status === 'link' ? (
          <button className="btn-resource btn-link" onClick={handleClick}>
            <Icons.ExternalLink size={15} /> {resource.actionLabel || 'Open Link'}
          </button>
        ) : (
          <button className="btn-resource btn-active-view" onClick={handleClick}>
            <Icons.Eye size={15} /> {resource.actionLabel || 'View Resource'}
          </button>
        )}
      </div>
    </div>
  );
}
