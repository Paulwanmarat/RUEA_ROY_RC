import React, { useEffect } from 'react';
import { X, Copy, Check, FileText, Code, GitBranch } from 'lucide-react';

export function ResourceViewerModal({ resource, onClose }) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!resource) return null;

  const handleCopy = () => {
    if (resource.content) {
      navigator.clipboard.writeText(resource.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            {resource.modalType === 'code' ? (
              <Code size={20} className="modal-type-icon" />
            ) : resource.modalType === 'schematic' ? (
              <GitBranch size={20} className="modal-type-icon" />
            ) : (
              <FileText size={20} className="modal-type-icon" />
            )}
            <div>
              <h3 className="modal-title">{resource.title}</h3>
              <span className="modal-subtitle">{resource.category} &bull; {resource.type}</span>
            </div>
          </div>

          <div className="modal-actions">
            {resource.content && (
              <button className="btn-copy" onClick={handleCopy}>
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
            <button className="btn-close-modal" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {resource.modalType === 'code' ? (
            <pre className="code-block">
              <code>{resource.content}</code>
            </pre>
          ) : resource.modalType === 'schematic' ? (
            <pre className="schematic-block">
              <code>{resource.content}</code>
            </pre>
          ) : (
            <div className="markdown-content">
              {resource.content ? (
                <div dangerouslySetInnerHTML={{
                  __html: formatSimpleMarkdown(resource.content)
                }} />
              ) : (
                <p>{resource.description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Lightweight helper to format markdown headers, bold, code tags, and tables safely
 */
function formatSimpleMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}
