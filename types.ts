
export interface CharacterAttributes {
  role: string;
  age: string;
  gender: string;
  clothing: string;
  accessories: string;
  artStyle: string;
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

// Body part identifiers
export type BodyPart = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

// View angles
export type ViewAngle = 'front' | 'side' | 'threeQuarter' | 'back';

// Unique identifier for each image (e.g., "head_front", "torso_side")
export type PartViewKey = `${BodyPart}_${ViewAngle}`;

// Status of individual part generation
export type GenerationStatus = 'pending' | 'generating' | 'processing' | 'complete' | 'error';

// Individual generated part
export interface GeneratedPart {
  key: PartViewKey;
  bodyPart: BodyPart;
  viewAngle: ViewAngle;
  status: GenerationStatus;
  imageUrl: string | null;
  transparentUrl: string | null;
  error: string | null;
  timestamp: number | null;
}

// Extended character attributes for Moho
export interface MohoCharacterAttributes extends CharacterAttributes {
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  bodyType: 'slim' | 'average' | 'athletic' | 'heavy';
}

// Reference image used for consistency
export interface ReferenceSheet {
  imageUrl: string;
  generatedAt: number;
}

// Overall workflow status
export type WorkflowStatus = 'idle' | 'generating_reference' | 'generating_parts' | 'complete' | 'error';

// Overall generation session
export interface GenerationSession {
  id: string;
  character: MohoCharacterAttributes;
  referenceSheet: ReferenceSheet | null;
  parts: Map<PartViewKey, GeneratedPart>;
  overallStatus: WorkflowStatus;
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  createdAt: number;
}

// Export configuration
export interface ExportConfig {
  format: 'individual' | 'zip';
  naming: 'moho' | 'spine' | 'custom';
  includeReference: boolean;
}

// Workflow actions for reducer
export type WorkflowAction =
  | { type: 'START_SESSION'; character: MohoCharacterAttributes }
  | { type: 'REFERENCE_GENERATED'; reference: ReferenceSheet }
  | { type: 'PART_STARTED'; key: PartViewKey }
  | { type: 'PART_GENERATED'; key: PartViewKey; imageUrl: string }
  | { type: 'PART_PROCESSED'; key: PartViewKey; transparentUrl: string }
  | { type: 'PART_FAILED'; key: PartViewKey; error: string }
  | { type: 'RETRY_PART'; key: PartViewKey }
  | { type: 'RESET_SESSION' };
