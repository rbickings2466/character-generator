import React, { useState, useCallback, useEffect } from 'react';
import { MohoCharacterAttributes, GeneratedPart, PartViewKey } from './types';
import { generateReferenceSheet, generateAllParts, generateBodyPart } from './services/geminiService';
import { removeBackground } from './services/imageProcessor';
import { useGenerationWorkflow } from './hooks/useGenerationWorkflow';
import { parsePartViewKey } from './constants/bodyParts';
import { logger } from './utils/logger';
import { Button } from './components/Button';
import { CharacterForm } from './components/CharacterForm';
import { PartGrid } from './components/PartGrid';
import { ProgressTracker } from './components/ProgressTracker';
import { ExportPanel } from './components/ExportPanel';

const defaultAttributes: MohoCharacterAttributes = {
  role: 'Fantasy warrior',
  age: 'Young adult',
  gender: 'Female',
  clothing: 'Light armor with shoulder guards, fitted tunic, leather belt with pouches',
  accessories: 'Sword sheath on back, arm bracers',
  artStyle: 'Clean 2D anime style, flat shaded, sharp line art',
  skinTone: 'Light tan',
  hairColor: 'Dark brown',
  hairStyle: 'Long ponytail',
  bodyType: 'athletic'
};

const App: React.FC = () => {
  const [attributes, setAttributes] = useState<MohoCharacterAttributes>(defaultAttributes);
  const [selectedPart, setSelectedPart] = useState<GeneratedPart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state, actions } = useGenerationWorkflow();

  const handleStartGeneration = useCallback(async () => {
    setError(null);
    actions.startSession(attributes);

    try {
      // Step 1: Generate reference sheet
      logger.log('Starting reference generation...');
      const reference = await generateReferenceSheet(attributes);
      logger.log('Reference generated successfully');
      actions.setReferenceGenerated(reference);

      // Step 2: Generate all body parts
      logger.log('Starting body part generation...');
      await generateAllParts(
        attributes,
        reference.imageUrl,
        (key) => {
          logger.log(`Starting: ${key}`);
          actions.setPartStarted(key);
        },
        async (key, imageUrl) => {
          logger.log(`Generated: ${key}`);
          actions.setPartGenerated(key, imageUrl);
          // Step 3: Process for transparency
          try {
            const transparentUrl = await removeBackground(imageUrl);
            actions.setPartProcessed(key, transparentUrl);
          } catch {
            // If background removal fails, use original
            actions.setPartProcessed(key, imageUrl);
          }
        },
        (key, err) => {
          logger.error(`Failed: ${key}`, err);
          actions.setPartFailed(key, err);
        },
        2 // Concurrency
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      logger.error('Generation failed:', err);
      setError(message);
      actions.resetSession();
    }
  }, [attributes, actions]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPart) {
        setSelectedPart(null);
      }
    };

    if (selectedPart) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedPart]);

  const handleRetryPart = useCallback(async (key: PartViewKey) => {
    if (!state.referenceSheet) return;

    actions.retryPart(key);
    const { bodyPart, viewAngle } = parsePartViewKey(key);

    try {
      actions.setPartStarted(key);
      const imageUrl = await generateBodyPart(
        state.character,
        bodyPart,
        viewAngle,
        state.referenceSheet.imageUrl
      );
      actions.setPartGenerated(key, imageUrl);

      try {
        const transparentUrl = await removeBackground(imageUrl);
        actions.setPartProcessed(key, transparentUrl);
      } catch {
        actions.setPartProcessed(key, imageUrl);
      }
    } catch (error) {
      actions.setPartFailed(key, error instanceof Error ? error.message : 'Retry failed');
    }
  }, [state.referenceSheet, state.character, actions]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-7xl mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Moho Animation Asset Generator
          </h1>
          <p className="text-slate-400 mt-1">
            Generate 24 animation-ready body parts with transparent backgrounds
          </p>
        </div>
        {state.overallStatus !== 'idle' && (
          <Button variant="secondary" onClick={actions.resetSession} aria-label="Start over with a new character">
            <i className="fas fa-rotate-left" aria-hidden="true"></i>
            Start Over
          </Button>
        )}
      </header>

      <main className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
        {/* Left Panel - Form or Reference */}
        <section className="w-full lg:w-1/3 space-y-6">
          {state.overallStatus === 'idle' ? (
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <CharacterForm
                attributes={attributes}
                onChange={setAttributes}
                onSubmit={handleStartGeneration}
                isLoading={false}
              />
            </div>
          ) : (
            <>
              {/* Reference Preview */}
              {state.referenceSheet && (
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <i className="fas fa-image text-blue-500" aria-hidden="true"></i>
                    Reference Sheet
                  </h3>
                  <img
                    src={state.referenceSheet.imageUrl}
                    alt="Character reference sheet showing front and side views"
                    className="w-full rounded-lg border border-slate-700"
                  />
                </div>
              )}

              {/* Export Panel (when complete) */}
              {state.overallStatus === 'complete' && (
                <ExportPanel
                  parts={state.parts}
                  characterName={state.character.role}
                  referenceImage={state.referenceSheet?.imageUrl}
                  onReset={actions.resetSession}
                />
              )}
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 p-4 rounded-xl border border-red-900/30" role="alert">
              <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <i className="fas fa-circle-exclamation" aria-hidden="true"></i>
                Generation Error
              </h4>
              <p className="text-xs text-red-300 mt-2">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs text-red-400 underline mt-2"
                aria-label="Dismiss error message"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Limitations Notice */}
          <div className="bg-yellow-900/10 p-4 rounded-xl border border-yellow-900/20" role="note">
            <h4 className="text-sm font-bold text-yellow-300 flex items-center gap-2">
              <i className="fas fa-triangle-exclamation" aria-hidden="true"></i>
              AI Generation Notes
            </h4>
            <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
              <li>Parts may have slight style variations between views</li>
              <li>Background removal is automated - may need touch-up</li>
              <li>Best results with simple, flat-shaded art styles</li>
            </ul>
          </div>
        </section>

        {/* Right Panel - Generation Grid */}
        <section className="w-full lg:w-2/3 space-y-6">
          {/* Progress Tracker */}
          {state.overallStatus !== 'idle' && (
            <ProgressTracker
              status={state.overallStatus}
              progress={state.progress}
            />
          )}

          {/* Parts Grid */}
          {state.overallStatus === 'idle' ? (
            <div className="bg-slate-900 rounded-2xl border-2 border-dashed border-slate-800 p-12 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-puzzle-piece text-slate-600 text-3xl" aria-hidden="true"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-300">Ready to Generate</h3>
              <p className="text-slate-500 mt-2 text-center max-w-md">
                Configure your character on the left and click generate. You'll get 24 separate body parts
                (head, torso, arms, legs) in 4 views each (front, side, 3/4, back).
              </p>
              <div className="mt-6 grid grid-cols-4 gap-2 text-xs text-slate-500">
                <span className="text-center">Front</span>
                <span className="text-center">Side</span>
                <span className="text-center">3/4</span>
                <span className="text-center">Back</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4">
              <PartGrid
                parts={state.parts}
                onRetry={handleRetryPart}
                onPartClick={setSelectedPart}
              />
            </div>
          )}

          {/* Tips */}
          {state.overallStatus === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-900/20 flex gap-4">
                <i className="fas fa-lightbulb text-blue-400 mt-1" aria-hidden="true"></i>
                <div>
                  <h4 className="text-sm font-bold text-blue-300">Tip: Consistency</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Use simple, high-contrast colors for better consistency across all generated parts.
                  </p>
                </div>
              </div>
              <div className="bg-indigo-900/10 p-4 rounded-xl border border-indigo-900/20 flex gap-4">
                <i className="fas fa-bone text-indigo-400 mt-1" aria-hidden="true"></i>
                <div>
                  <h4 className="text-sm font-bold text-indigo-300">Tip: Rigging</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Parts include joint overlap for easier bone attachment in Moho.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Preview Modal */}
      {selectedPart && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedPart(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Part preview"
        >
          <div
            className="max-w-2xl max-h-full bg-slate-900 rounded-2xl p-4 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPart.transparentUrl || selectedPart.imageUrl || ''}
              alt={`Preview of generated body part`}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            <p className="text-center text-slate-400 mt-3 text-sm">
              Click outside or press Escape to close
            </p>
            <button
              type="button"
              onClick={() => setSelectedPart(null)}
              className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
              aria-label="Close preview"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="mt-auto pt-8 pb-4 text-slate-600 text-sm flex items-center gap-2">
        <p>Powered by Gemini AI</p>
        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
        <p>Moho Animation Asset Generator</p>
      </footer>
    </div>
  );
};

export default App;
