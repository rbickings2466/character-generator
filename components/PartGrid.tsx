import React from 'react';
import { GeneratedPart, PartViewKey } from '../types';
import { BODY_PARTS, VIEW_ANGLES, PART_DISPLAY_NAMES, VIEW_DISPLAY_NAMES } from '../constants/bodyParts';
import { PartCard } from './PartCard';

interface PartGridProps {
  parts: Map<PartViewKey, GeneratedPart>;
  onRetry?: (key: PartViewKey) => void;
  onPartClick?: (part: GeneratedPart) => void;
}

export const PartGrid: React.FC<PartGridProps> = ({ parts, onRetry, onPartClick }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-sm font-medium text-slate-400 w-24"></th>
            {VIEW_ANGLES.map(view => (
              <th key={view} className="p-2 text-center text-sm font-medium text-slate-300">
                {VIEW_DISPLAY_NAMES[view]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BODY_PARTS.map(bodyPart => (
            <tr key={bodyPart}>
              <td className="p-2 text-sm font-medium text-slate-300 align-middle">
                {PART_DISPLAY_NAMES[bodyPart]}
              </td>
              {VIEW_ANGLES.map(view => {
                const key = `${bodyPart}_${view}` as PartViewKey;
                const part = parts.get(key);
                if (!part) return <td key={key} className="p-1"></td>;

                return (
                  <td key={key} className="p-1">
                    <PartCard
                      part={part}
                      onRetry={onRetry ? () => onRetry(key) : undefined}
                      onClick={onPartClick ? () => onPartClick(part) : undefined}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
