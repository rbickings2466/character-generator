import { BodyPart, ViewAngle, PartViewKey } from '../types';

export const BODY_PARTS: BodyPart[] = ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

export const VIEW_ANGLES: ViewAngle[] = ['front', 'side', 'threeQuarter', 'back'];

export const PART_DISPLAY_NAMES: Record<BodyPart, string> = {
  head: 'Head',
  torso: 'Torso',
  leftArm: 'Left Arm',
  rightArm: 'Right Arm',
  leftLeg: 'Left Leg',
  rightLeg: 'Right Leg'
};

export const VIEW_DISPLAY_NAMES: Record<ViewAngle, string> = {
  front: 'Front',
  side: 'Side',
  threeQuarter: '3/4',
  back: 'Back'
};

// Moho-compatible file naming
export const getMohoFilename = (part: BodyPart, view: ViewAngle): string => {
  const partNames: Record<BodyPart, string> = {
    head: 'head',
    torso: 'body',
    leftArm: 'arm_L',
    rightArm: 'arm_R',
    leftLeg: 'leg_L',
    rightLeg: 'leg_R'
  };
  const viewNames: Record<ViewAngle, string> = {
    front: 'front',
    side: 'side',
    threeQuarter: '3q',
    back: 'back'
  };
  return `${partNames[part]}_${viewNames[view]}.png`;
};

// All 24 combinations
export const ALL_PART_VIEW_KEYS: PartViewKey[] =
  BODY_PARTS.flatMap(part =>
    VIEW_ANGLES.map(view => `${part}_${view}` as PartViewKey)
  );

// Parse a PartViewKey into its components
export const parsePartViewKey = (key: PartViewKey): { bodyPart: BodyPart; viewAngle: ViewAngle } => {
  const [bodyPart, viewAngle] = key.split('_') as [BodyPart, ViewAngle];
  return { bodyPart, viewAngle };
};
