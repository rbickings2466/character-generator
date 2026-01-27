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

// Build individual part extraction prompt - optimized for token efficiency
// Character details come from the reference image, so we only describe the technical requirements
export const buildPartPrompt = (
  _attrs: MohoCharacterAttributes,
  part: BodyPart,
  view: ViewAngle
): string => {
  const partDescriptions: Record<BodyPart, string> = {
    head: 'HEAD (face, hair, ears, neck to collar)',
    torso: 'TORSO (neck to hips, no arms/legs)',
    leftArm: 'LEFT ARM (shoulder to fingertips)',
    rightArm: 'RIGHT ARM (shoulder to fingertips)',
    leftLeg: 'LEFT LEG (hip to foot)',
    rightLeg: 'RIGHT LEG (hip to foot)'
  };

  const viewDescriptions: Record<ViewAngle, string> = {
    front: 'FRONT view',
    side: 'SIDE view (right profile)',
    threeQuarter: '3/4 view (facing right)',
    back: 'BACK view'
  };

  return `
Extract ${partDescriptions[part]}, ${viewDescriptions[view]} from the reference image.

REQUIREMENTS:
- ISOLATED: Only this body part, detached
- BACKGROUND: #00FF00 green chroma key
- CENTERED: Padding around edges
- STYLE: Match reference exactly - flat cel-shaded, vector line art
- JOINTS: Include overlap at joints for rigging
- Square aspect ratio
`.trim();
};