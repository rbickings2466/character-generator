import React, { useState } from 'react';
import { GeneratedPart, ExportConfig } from '../types';
import { Button } from './Button';
import { exportAsZip, downloadPart } from '../services/exportService';

interface ExportPanelProps {
  parts: Map<string, GeneratedPart>;
  characterName: string;
  referenceImage?: string;
  onReset: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  parts,
  characterName,
  referenceImage,
  onReset
}) => {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'zip',
    naming: 'moho',
    includeReference: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const completedCount = Array.from(parts.values()).filter(p => p.status === 'complete').length;

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      await exportAsZip(parts, characterName, config, referenceImage);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadAll = () => {
    const completedParts = Array.from(parts.values()).filter(p => p.status === 'complete');
    completedParts.forEach((part, index) => {
      // Stagger downloads to avoid browser blocking
      setTimeout(() => {
        downloadPart(part, config.naming);
      }, index * 200);
    });
  };

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <i className="fas fa-download text-green-500" aria-hidden="true"></i>
        Export Assets
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Naming Convention
          </label>
          <div className="flex gap-2" role="group" aria-label="Naming convention options">
            {(['moho', 'spine', 'custom'] as const).map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setConfig({ ...config, naming: option })}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  config.naming === option
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
                aria-pressed={config.naming === option}
                aria-label={`${option.charAt(0).toUpperCase() + option.slice(1)} naming convention`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.includeReference}
            onChange={(e) => setConfig({ ...config, includeReference: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-300">Include reference sheet in export</span>
        </label>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <Button
            className="w-full"
            onClick={handleExportZip}
            isLoading={isExporting}
            aria-label={`Download ZIP archive with ${completedCount} parts`}
          >
            <i className="fas fa-file-zipper" aria-hidden="true"></i>
            Download ZIP ({completedCount} parts)
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleDownloadAll}
            aria-label="Download all parts as individual PNG files"
          >
            <i className="fas fa-images" aria-hidden="true"></i>
            Download Individual PNGs
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            onClick={onReset}
            aria-label="Start creating a new character"
          >
            <i className="fas fa-rotate-left" aria-hidden="true"></i>
            Start New Character
          </Button>
        </div>

        <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-900/30" role="note">
          <p className="text-xs text-blue-300">
            <i className="fas fa-info-circle mr-1" aria-hidden="true"></i>
            ZIP includes organized folders by view (front, side, 3q, back) and a metadata JSON file for easy import into Moho.
          </p>
        </div>
      </div>
    </div>
  );
};
