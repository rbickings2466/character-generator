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
1. FRONT VIEW - T-pose with arms extended horizontally
2. SIDE VIEW (right profile) - Arms at sides

TECHNICAL REQUIREMENTS:
- Pure white (#FFFFFF) background
- Clean vector-style line art with consistent stroke weight
- Flat cel-shaded coloring, NO gradients
- Full body visible from head to feet
- Sharp, clean edges suitable for animation rigging
- Character centered in each view
`.trim();

// Build individual part extraction prompt with detailed instructions for accuracy
export const buildPartPrompt = (
  _attrs: MohoCharacterAttributes,
  part: BodyPart,
  view: ViewAngle
): string => {
  const partDescriptions: Record<BodyPart, string> = {
    head: `the CHARACTER'S HEAD ONLY.
   INCLUDE: Face, all hair, both ears, neck down to the collar/neckline.
   EXCLUDE: Shoulders, torso, arms - cut cleanly at the base of the neck.`,
    torso: `the CHARACTER'S TORSO/BODY ONLY.
   INCLUDE: Chest, stomach, back, hips, clothing on the body, shoulder joints (small circles).
   EXCLUDE: Head, arms, legs - show only the central body mass.`,
    leftArm: `the CHARACTER'S LEFT ARM ONLY (viewer's right side).
   INCLUDE: Shoulder joint to fingertips, entire arm with hand and all fingers.
   EXCLUDE: Body, other arm - show this single arm floating alone.`,
    rightArm: `the CHARACTER'S RIGHT ARM ONLY (viewer's left side).
   INCLUDE: Shoulder joint to fingertips, entire arm with hand and all fingers.
   EXCLUDE: Body, other arm - show this single arm floating alone.`,
    leftLeg: `the CHARACTER'S LEFT LEG ONLY (viewer's right side).
   INCLUDE: Hip joint to foot/shoe, entire leg.
   EXCLUDE: Body, other leg - show this single leg floating alone.`,
    rightLeg: `the CHARACTER'S RIGHT LEG ONLY (viewer's left side).
   INCLUDE: Hip joint to foot/shoe, entire leg.
   EXCLUDE: Body, other leg - show this single leg floating alone.`
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
2. BACKGROUND: Solid bright green (#00FF00) chroma key - no other colors in background
3. CENTER the body part in the frame with space around edges
4. MATCH the reference image exactly - same colors, style, clothing details
5. FLAT cel-shaded coloring, clean vector-style lines
6. Include small joint overlap areas for animation rigging

DO NOT include any other body parts. The part should appear to float alone on the green background.
`.trim();
};