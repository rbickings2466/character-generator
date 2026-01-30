import { MohoCharacterAttributes, BodyPart, ViewAngle } from '../types';

// Build the reference sheet prompt - creates the "source of truth"
export const buildReferencePrompt = (attrs: MohoCharacterAttributes): string => `
Create a 2D character design reference sheet for animation production.

CHARACTER SPECIFICATIONS:
- Role: ${attrs.role}
- Age: ${attrs.age}, Gender: ${attrs.gender}
- Body Type: ${attrs.bodyType}
- Skin Tone: ${attrs.skinTone}
- Hair: ${attrs.hairColor} ${attrs.hairStyle}
- Clothing: ${attrs.clothing}
- Accessories: ${attrs.accessories}
- Art Style: ${attrs.artStyle}

LAYOUT: Show the character in TWO poses side by side:
1. FRONT VIEW - T-pose with arms extended horizontally, fingers spread, legs shoulder-width apart
2. SIDE VIEW (right profile) - Arms at sides, standing straight

TECHNICAL REQUIREMENTS:
- Pure white (#FFFFFF) background
- Clean vector-style line art with consistent stroke weight
- Flat cel-shaded coloring, NO gradients
- Full body visible from head to feet
- Sharp, clean edges suitable for animation rigging
- Character centered in each view
- HIGH RESOLUTION: Make the character large and detailed
`.trim();

// Build individual part extraction prompt with detailed Moho-ready instructions
export const buildPartPrompt = (
  _attrs: MohoCharacterAttributes,
  part: BodyPart,
  view: ViewAngle
): string => {
  const partDescriptions: Record<BodyPart, string> = {
    head: `the CHARACTER'S HEAD ONLY.
   INCLUDE: Face, all hair, both ears, neck down to the collar/neckline.
   EXCLUDE: Shoulders, torso, arms - cut cleanly at the base of the neck.
   OVERLAP: Extend neck 10-15% past the cut line for rigging overlap with torso.`,
    torso: `the CHARACTER'S TORSO/BODY ONLY.
   INCLUDE: Neck base, chest, stomach, back, hips, all clothing on the body.
   EXCLUDE: Head, arms, legs - show only the central body mass.
   OVERLAP: Include small shoulder socket circles and hip joint circles for rigging overlap.`,
    leftUpperArm: `the CHARACTER'S LEFT UPPER ARM ONLY (viewer's right side).
   INCLUDE: Shoulder ball joint to elbow, including sleeve/clothing.
   EXCLUDE: Lower arm, hand, body - just the upper arm segment.
   OVERLAP: Extend 10-15% past shoulder and elbow for rigging overlap.`,
    leftLowerArm: `the CHARACTER'S LEFT FOREARM ONLY (viewer's right side).
   INCLUDE: Elbow to wrist, including sleeve/clothing.
   EXCLUDE: Upper arm, hand, body - just the forearm segment.
   OVERLAP: Extend 10-15% past elbow and wrist for rigging overlap.`,
    leftHand: `the CHARACTER'S LEFT HAND ONLY (viewer's right side).
   INCLUDE: Wrist to fingertips, all five fingers spread slightly apart.
   EXCLUDE: Forearm, body - just the hand.
   OVERLAP: Extend 10-15% past wrist for rigging overlap.`,
    rightUpperArm: `the CHARACTER'S RIGHT UPPER ARM ONLY (viewer's left side).
   INCLUDE: Shoulder ball joint to elbow, including sleeve/clothing.
   EXCLUDE: Lower arm, hand, body - just the upper arm segment.
   OVERLAP: Extend 10-15% past shoulder and elbow for rigging overlap.`,
    rightLowerArm: `the CHARACTER'S RIGHT FOREARM ONLY (viewer's left side).
   INCLUDE: Elbow to wrist, including sleeve/clothing.
   EXCLUDE: Upper arm, hand, body - just the forearm segment.
   OVERLAP: Extend 10-15% past elbow and wrist for rigging overlap.`,
    rightHand: `the CHARACTER'S RIGHT HAND ONLY (viewer's left side).
   INCLUDE: Wrist to fingertips, all five fingers spread slightly apart.
   EXCLUDE: Forearm, body - just the hand.
   OVERLAP: Extend 10-15% past wrist for rigging overlap.`,
    leftUpperLeg: `the CHARACTER'S LEFT THIGH ONLY (viewer's right side).
   INCLUDE: Hip joint to knee, including pants/clothing.
   EXCLUDE: Lower leg, foot, body - just the thigh segment.
   OVERLAP: Extend 10-15% past hip and knee for rigging overlap.`,
    leftLowerLeg: `the CHARACTER'S LEFT SHIN/CALF ONLY (viewer's right side).
   INCLUDE: Knee to ankle, including pants/clothing.
   EXCLUDE: Thigh, foot, body - just the lower leg segment.
   OVERLAP: Extend 10-15% past knee and ankle for rigging overlap.`,
    leftFoot: `the CHARACTER'S LEFT FOOT ONLY (viewer's right side).
   INCLUDE: Ankle to toes, including shoe/footwear.
   EXCLUDE: Leg, body - just the foot.
   OVERLAP: Extend 10-15% past ankle for rigging overlap.`,
    rightUpperLeg: `the CHARACTER'S RIGHT THIGH ONLY (viewer's left side).
   INCLUDE: Hip joint to knee, including pants/clothing.
   EXCLUDE: Lower leg, foot, body - just the thigh segment.
   OVERLAP: Extend 10-15% past hip and knee for rigging overlap.`,
    rightLowerLeg: `the CHARACTER'S RIGHT SHIN/CALF ONLY (viewer's left side).
   INCLUDE: Knee to ankle, including pants/clothing.
   EXCLUDE: Thigh, foot, body - just the lower leg segment.
   OVERLAP: Extend 10-15% past knee and ankle for rigging overlap.`,
    rightFoot: `the CHARACTER'S RIGHT FOOT ONLY (viewer's left side).
   INCLUDE: Ankle to toes, including shoe/footwear.
   EXCLUDE: Leg, body - just the foot.
   OVERLAP: Extend 10-15% past ankle for rigging overlap.`
  };

  const viewDescriptions: Record<ViewAngle, string> = {
    front: `FRONT VIEW - Character facing directly toward the camera/viewer.
   The face looks straight at you. Both eyes visible. Symmetrical pose.`,
    side: `SIDE/PROFILE VIEW - Character facing to the RIGHT.
   You see one side of the face in profile. Nose points right.`,
    threeQuarter: `3/4 ANGLE VIEW - Character turned 45 degrees to the RIGHT.
   Face is angled, showing more of one side. Between front and side view.`,
    back: `BACK VIEW - Character facing AWAY from camera/viewer.
   You see the back of the head/body. No face visible.`
  };

  return `
TASK: Draw ${partDescriptions[part]}

ANGLE: ${viewDescriptions[view]}

CRITICAL REQUIREMENTS:
1. ONLY draw this ONE body part - nothing else
2. BACKGROUND: Solid bright green (#00FF00) chroma key - the ENTIRE background must be pure green
3. CENTER the body part in the frame with padding around all edges
4. MATCH the reference image exactly - same colors, clothing, style, proportions
5. FLAT cel-shaded coloring, clean vector-style lines, NO gradients
6. Include joint overlap areas (10-15% extension) as described above
7. HIGH RESOLUTION: Draw the part large and detailed, filling most of the frame
8. Square aspect ratio

DO NOT include any other body parts. The part should float alone on the solid green background.
`.trim();
};
