import React, { memo } from 'react';
import { WorkflowStatus } from '../types';

interface ProgressTrackerProps {
  status: WorkflowStatus;
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = memo(function ProgressTracker({ status, progress }) {
  const percentage = Math.round((progress.completed / progress.total) * 100);
  const inProgress = progress.total - progress.completed - progress.failed;

  const getStatusText = () => {
    switch (status) {
      case 'generating_reference':
        return 'Generating reference sheet...';
      case 'generating_parts':
        return `Generating body parts (${progress.completed}/${progress.total})`;
      case 'complete':
        return 'Generation complete!';
      case 'error':
        return 'Generation encountered errors';
      default:
        return 'Ready to generate';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'generating_reference':
      case 'generating_parts':
        return (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        );
      case 'complete':
        return <i className="fas fa-check-circle text-green-500 text-xl"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>;
      default:
        return <i className="fas fa-hourglass text-slate-500 text-xl"></i>;
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
      <div className="flex items-center gap-4 mb-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-medium text-slate-200">{getStatusText()}</p>
          {status === 'generating_parts' && (
            <p className="text-xs text-slate-500 mt-0.5">
              {inProgress} in progress{progress.failed > 0 ? `, ${progress.failed} failed` : ''}
            </p>
          )}
        </div>
        {status !== 'idle' && (
          <span className="text-2xl font-bold text-blue-400">{percentage}%</span>
        )}
      </div>

      {status !== 'idle' && (
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}

      {progress.failed > 0 && status === 'complete' && (
        <p className="text-xs text-yellow-500 mt-2">
          <i className="fas fa-warning mr-1"></i>
          {progress.failed} part(s) failed to generate. You can retry them individually.
        </p>
      )}
    </div>
  );
});
