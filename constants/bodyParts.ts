import { BodyPart, ViewAngle, PartViewKey } from '../types';

export const BODY_PARTS: BodyPart[] = [
  'head',
  'torso',
  'leftUpperArm',
  'leftLowerArm',
  'leftHand',
  'rightUpperArm',
  'rightLowerArm',
  'rightHand',
  'leftUpperLeg',
  'leftLowerLeg',
  'leftFoot',
  'rightUpperLeg',
  'rightLowerLeg',
  'rightFoot'
];

export const VIEW_ANGLES: ViewAngle[] = ['front', 'side', 'threeQuarter', 'back'];

export const PART_DISPLAY_NAMES: Record<BodyPart, string> = {
  head: 'Head',
  torso: 'Torso',
  leftUpperArm: 'L Upper Arm',
  leftLowerArm: 'L Lower Arm',
  leftHand: 'L Hand',
  rightUpperArm: 'R Upper Arm',
  rightLowerArm: 'R Lower Arm',
  rightHand: 'R Hand',
  leftUpperLeg: 'L Upper Leg',
  leftLowerLeg: 'L Lower Leg',
  leftFoot: 'L Foot',
  rightUpperLeg: 'R Upper Leg',
  rightLowerLeg: 'R Lower Leg',
  rightFoot: 'R Foot'
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
    leftUpperArm: 'upper_arm_L',
    leftLowerArm: 'lower_arm_L',
    leftHand: 'hand_L',
    rightUpperArm: 'upper_arm_R',
    rightLowerArm: 'lower_arm_R',
    rightHand: 'hand_R',
    leftUpperLeg: 'upper_leg_L',
    leftLowerLeg: 'lower_leg_L',
    leftFoot: 'foot_L',
    rightUpperLeg: 'upper_leg_R',
    rightLowerLeg: 'lower_leg_R',
    rightFoot: 'foot_R'
  };
  const viewNames: Record<ViewAngle, string> = {
    front: 'front',
    side: 'side',
    threeQuarter: '3q',
    back: 'back'
  };
  return `${partNames[part]}_${viewNames[view]}.png`;
};

// All 56 combinations (14 parts × 4 views)
export const ALL_PART_VIEW_KEYS: PartViewKey[] =
  BODY_PARTS.flatMap(part =>
    VIEW_ANGLES.map(view => `${part}_${view}` as PartViewKey)
  );

// Parse a PartViewKey into its components
export const parsePartViewKey = (key: PartViewKey): { bodyPart: BodyPart; viewAngle: ViewAngle } => {
  // Find the last underscore to split part from view (body parts use camelCase, no underscores)
  const lastUnderscore = key.lastIndexOf('_');
  const bodyPart = key.substring(0, lastUnderscore) as BodyPart;
  const viewAngle = key.substring(lastUnderscore + 1) as ViewAngle;
  return { bodyPart, viewAngle };
};
