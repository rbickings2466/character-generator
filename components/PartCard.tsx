import React, { memo, useState } from 'react';
import { GeneratedPart } from '../types';
import { PART_DISPLAY_NAMES, VIEW_DISPLAY_NAMES } from '../constants/bodyParts';

interface PartCardProps {
  part: GeneratedPart;
  onRetry?: () => void;
  onClick?: () => void;
}

export const PartCard: React.FC<PartCardProps> = memo(function PartCard({ part, onRetry, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const statusStyles: Record<string, string> = {
    pending: 'bg-slate-800 border-slate-700',
    generating: 'bg-slate-800 border-blue-500 animate-pulse',
    processing: 'bg-slate-800 border-yellow-500',
    complete: 'bg-slate-800 border-green-500/50 hover:border-green-400',
    error: 'bg-red-900/20 border-red-500/50'
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <i className="fas fa-clock text-slate-500 text-lg" aria-hidden="true"></i>,
    generating: (
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Generating"></div>
    ),
    processing: (
      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Processing"></div>
    ),
    complete: <i className="fas fa-check text-green-500 text-lg" aria-hidden="true"></i>,
    error: <i className="fas fa-exclamation-triangle text-red-500 text-lg" aria-hidden="true"></i>
  };

  const partLabel = `${PART_DISPLAY_NAMES[part.bodyPart]} - ${VIEW_DISPLAY_NAMES[part.viewAngle]}`;

  return (
    <div
      className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${part.status === 'complete' ? 'cursor-pointer' : ''} ${statusStyles[part.status]}`}
      onClick={part.status === 'complete' ? onClick : undefined}
      onKeyDown={part.status === 'complete' ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); } : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={part.status === 'complete' ? 'button' : undefined}
      tabIndex={part.status === 'complete' ? 0 : undefined}
      aria-label={part.status === 'complete' ? `View ${partLabel}` : `${partLabel} - ${part.status}`}
    >
      {part.status === 'complete' && (part.transparentUrl || part.imageUrl) ? (
        <>
          <img
            src={part.transparentUrl || part.imageUrl || ''}
            alt={`${PART_DISPLAY_NAMES[part.bodyPart]} - ${VIEW_DISPLAY_NAMES[part.viewAngle]}`}
            className="w-full h-full object-contain p-1 bg-slate-900"
          />
          {/* Regenerate overlay on hover */}
          {isHovered && onRetry && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
                aria-label={`Regenerate ${partLabel}`}
              >
                <i className="fas fa-rotate" aria-hidden="true"></i>
                Regenerate
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
          {statusIcons[part.status]}
          {part.status === 'error' && onRetry && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              className="text-xs text-red-400 hover:text-red-300 underline"
              aria-label={`Retry generating ${partLabel}`}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Status indicator dot */}
      <div className="absolute top-1 right-1">
        {part.status === 'generating' && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
        {part.status === 'processing' && (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
        )}
      </div>
    </div>
  );
});
