import React, { useEffect } from 'react';
import { X, Copy, Check, FileText, Code, GitBranch } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
            <div className="markdown-content" dangerouslySetInnerHTML={{
              __html: resource.content
            }} />
          ) : (
            <div className="markdown-content">
              {resource.content ? (
                <div dangerouslySetInnerHTML={{
                  __html: formatLaTeXAndMarkdown(resource.content)
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
 * Parse markdown tables into HTML tables
 */
function parseMarkdownTables(text) {
  const lines = text.split('\n');
  let result = [];
  let i = 0;

  while (i < lines.length) {
    // Detect table: a line with | and the next line is a separator (|---|)
    if (
      lines[i] && lines[i].trim().startsWith('|') &&
      i + 1 < lines.length && /^\|[\s\-:|]+\|/.test(lines[i + 1].trim())
    ) {
      // Parse header
      const headerCells = lines[i].split('|').filter(c => c.trim() !== '');
      // Skip separator line
      let tableRows = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith('|')) {
        const rowCells = lines[j].split('|').filter(c => c.trim() !== '');
        tableRows.push(rowCells);
        j++;
      }

      // Build HTML table
      let tableHtml = '<div class="md-table-wrapper"><table class="md-table"><thead><tr>';
      headerCells.forEach(cell => {
        tableHtml += `<th>${cell.trim()}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      tableRows.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => {
          tableHtml += `<td>${cell.trim()}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table></div>';
      result.push(tableHtml);
      i = j;
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result.join('\n');
}

/**
 * Parse markdown unordered lists into HTML lists
 */
function parseMarkdownLists(text) {
  const lines = text.split('\n');
  let result = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const listMatch = lines[i].match(/^(\s*)- (.+)$/);
    if (listMatch) {
      if (!inList) {
        result.push('<ul class="md-list">');
        inList = true;
      }
      result.push(`<li>${listMatch[2]}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(lines[i]);
    }
  }
  if (inList) result.push('</ul>');

  return result.join('\n');
}

/**
 * Formats mathematical equations ($...$ and $$...$$) with KaTeX LaTeX math engine,
 * plus markdown tables, lists, headers, bold, and inline code.
 */
function formatLaTeXAndMarkdown(text) {
  if (!text) return '';

  // 1. Process Display/Block Math: $$ ... $$
  let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
    try {
      return `<div class="katex-block-wrapper">${katex.renderToString(equation.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return match;
    }
  });

  // 2. Process Inline Math: $ ... $
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, equation) => {
    try {
      return katex.renderToString(equation.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // 3. Parse tables
  processed = parseMarkdownTables(processed);

  // 4. Parse lists
  processed = parseMarkdownLists(processed);

  // 5. Format Headers, Bold, Code, linebreaks
  return processed
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}
