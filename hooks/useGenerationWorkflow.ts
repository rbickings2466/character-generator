import { useReducer, useCallback } from 'react';
import {
  GenerationSession,
  MohoCharacterAttributes,
  GeneratedPart,
  PartViewKey,
  WorkflowAction,
  ReferenceSheet
} from '../types';
import { ALL_PART_VIEW_KEYS, parsePartViewKey } from '../constants/bodyParts';

const createInitialParts = (): Map<PartViewKey, GeneratedPart> => {
  const parts = new Map<PartViewKey, GeneratedPart>();

  for (const key of ALL_PART_VIEW_KEYS) {
    const { bodyPart, viewAngle } = parsePartViewKey(key);
    parts.set(key, {
      key,
      bodyPart,
      viewAngle,
      status: 'pending',
      imageUrl: null,
      transparentUrl: null,
      error: null,
      timestamp: null
    });
  }

  return parts;
};

const createInitialState = (): GenerationSession => ({
  id: '',
  character: {
    role: '',
    age: '',
    gender: '',
    clothing: '',
    accessories: '',
    artStyle: '',
    skinTone: '',
    hairColor: '',
    hairStyle: '',
    bodyType: 'average'
  },
  referenceSheet: null,
  parts: createInitialParts(),
  overallStatus: 'idle',
  progress: { total: 24, completed: 0, failed: 0 },
  createdAt: 0
});

const workflowReducer = (
  state: GenerationSession,
  action: WorkflowAction
): GenerationSession => {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...createInitialState(),
        id: crypto.randomUUID(),
        character: action.character,
        parts: createInitialParts(),
        overallStatus: 'generating_reference',
        createdAt: Date.now()
      };

    case 'REFERENCE_GENERATED':
      return {
        ...state,
        referenceSheet: action.reference,
        overallStatus: 'generating_parts'
      };

    case 'PART_STARTED': {
      const parts = new Map(state.parts);
      const part = parts.get(action.key);
      if (part) {
        parts.set(action.key, { ...part, status: 'generating' });
      }
      return { ...state, parts };
    }

    case 'PART_GENERATED': {
      const parts = new Map(state.parts);
      const part = parts.get(action.key);
      if (part) {
        parts.set(action.key, {
          ...part,
          status: 'processing',
          imageUrl: action.imageUrl,
          timestamp: Date.now()
        });
      }
      return { ...state, parts };
    }

    case 'PART_PROCESSED': {
      const parts = new Map(state.parts);
      const part = parts.get(action.key);
      if (part) {
        parts.set(action.key, {
          ...part,
          status: 'complete',
          transparentUrl: action.transparentUrl
        });
      }

      const completed = Array.from(parts.values())
        .filter(p => p.status === 'complete').length;
      const failed = Array.from(parts.values())
        .filter(p => p.status === 'error').length;

      const allDone = completed + failed === 24;

      return {
        ...state,
        parts,
        progress: { ...state.progress, completed, failed },
        overallStatus: allDone ? 'complete' : state.overallStatus
      };
    }

    case 'PART_FAILED': {
      const parts = new Map(state.parts);
      const part = parts.get(action.key);
      if (part) {
        parts.set(action.key, {
          ...part,
          status: 'error',
          error: action.error
        });
      }

      const completed = Array.from(parts.values())
        .filter(p => p.status === 'complete').length;
      const failed = Array.from(parts.values())
        .filter(p => p.status === 'error').length;

      const allDone = completed + failed === 24;

      return {
        ...state,
        parts,
        progress: { ...state.progress, completed, failed },
        overallStatus: allDone ? 'complete' : state.overallStatus
      };
    }

    case 'RETRY_PART': {
      const parts = new Map(state.parts);
      const part = parts.get(action.key);
      if (part) {
        parts.set(action.key, {
          ...part,
          status: 'pending',
          error: null,
          imageUrl: null,
          transparentUrl: null
        });
      }

      const failed = Array.from(parts.values())
        .filter(p => p.status === 'error').length;

      return {
        ...state,
        parts,
        progress: { ...state.progress, failed },
        overallStatus: 'generating_parts'
      };
    }

    case 'RESET_SESSION':
      return createInitialState();

    default:
      return state;
  }
};

export const useGenerationWorkflow = () => {
  const [state, dispatch] = useReducer(workflowReducer, createInitialState());

  const startSession = useCallback((character: MohoCharacterAttributes) => {
    dispatch({ type: 'START_SESSION', character });
  }, []);

  const setReferenceGenerated = useCallback((reference: ReferenceSheet) => {
    dispatch({ type: 'REFERENCE_GENERATED', reference });
  }, []);

  const setPartStarted = useCallback((key: PartViewKey) => {
    dispatch({ type: 'PART_STARTED', key });
  }, []);

  const setPartGenerated = useCallback((key: PartViewKey, imageUrl: string) => {
    dispatch({ type: 'PART_GENERATED', key, imageUrl });
  }, []);

  const setPartProcessed = useCallback((key: PartViewKey, transparentUrl: string) => {
    dispatch({ type: 'PART_PROCESSED', key, transparentUrl });
  }, []);

  const setPartFailed = useCallback((key: PartViewKey, error: string) => {
    dispatch({ type: 'PART_FAILED', key, error });
  }, []);

  const retryPart = useCallback((key: PartViewKey) => {
    dispatch({ type: 'RETRY_PART', key });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  return {
    state,
    actions: {
      startSession,
      setReferenceGenerated,
      setPartStarted,
      setPartGenerated,
      setPartProcessed,
      setPartFailed,
      retryPart,
      resetSession
    }
  };
};
