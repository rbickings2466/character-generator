import JSZip from 'jszip';
import { GeneratedPart, ExportConfig, BodyPart, ViewAngle } from '../types';
import { getMohoFilename } from '../constants/bodyParts';
import { API_CONFIG } from '../constants/api';

// Get filename based on naming convention
const getFilename = (
  part: BodyPart,
  view: ViewAngle,
  naming: ExportConfig['naming']
): string => {
  switch (naming) {
    case 'moho':
      return getMohoFilename(part, view);
    case 'spine':
      const spinePartNames: Record<BodyPart, string> = {
        head: 'head',
        torso: 'torso',
        leftArm: 'arm-left',
        rightArm: 'arm-right',
        leftLeg: 'leg-left',
        rightLeg: 'leg-right'
      };
      return `${spinePartNames[part]}-${view}.png`;
    default:
      return `${part}_${view}.png`;
  }
};

// Download a single part
export const downloadPart = (part: GeneratedPart, naming: ExportConfig['naming'] = 'moho'): void => {
  const imageUrl = part.transparentUrl || part.imageUrl;
  if (!imageUrl) return;

  const filename = getFilename(part.bodyPart, part.viewAngle, naming);

  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Create ZIP archive with all parts
export const exportAsZip = async (
  parts: Map<string, GeneratedPart>,
  characterName: string,
  config: ExportConfig,
  referenceImage?: string
): Promise<void> => {
  const zip = new JSZip();

  // Sanitize character name for folder
  const safeName = characterName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, API_CONFIG.MAX_CHARACTER_NAME_LENGTH) || 'character';

  // Create folder structure
  const folder = zip.folder(safeName);
  if (!folder) {
    throw new Error('Could not create ZIP folder');
  }

  // Add reference image if requested
  if (config.includeReference && referenceImage) {
    const refData = referenceImage.split(',')[1];
    if (refData) {
      folder.file('_reference_sheet.png', refData, { base64: true });
    }
  }

  // Create view subfolders and add parts
  const viewFolders: Record<string, JSZip | null> = {
    front: folder.folder('front'),
    side: folder.folder('side'),
    threeQuarter: folder.folder('3q'),
    back: folder.folder('back')
  };

  for (const [, part] of parts) {
    if (part.status !== 'complete') continue;

    const imageUrl = part.transparentUrl || part.imageUrl;
    if (!imageUrl) continue;

    const viewFolder = viewFolders[part.viewAngle];
    if (!viewFolder) continue;

    const filename = getFilename(part.bodyPart, part.viewAngle, config.naming);
    const imageData = imageUrl.split(',')[1];
    if (imageData) {
      viewFolder.file(filename, imageData, { base64: true });
    }
  }

  // Add metadata JSON
  const metadata = generateMetadata(parts, safeName);
  folder.file('_metadata.json', metadata);

  // Generate and download ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}_moho_assets.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Generate metadata JSON
const generateMetadata = (
  parts: Map<string, GeneratedPart>,
  characterName: string
): string => {
  const metadata = {
    characterName,
    exportedAt: new Date().toISOString(),
    format: 'Moho/Anime Studio',
    totalParts: 24,
    completedParts: Array.from(parts.values()).filter(p => p.status === 'complete').length,
    parts: Array.from(parts.values())
      .filter(p => p.status === 'complete')
      .map(p => ({
        filename: getMohoFilename(p.bodyPart, p.viewAngle),
        bodyPart: p.bodyPart,
        view: p.viewAngle,
        folder: p.viewAngle === 'threeQuarter' ? '3q' : p.viewAngle,
        suggestedBone: getSuggestedBoneName(p.bodyPart)
      }))
  };

  return JSON.stringify(metadata, null, 2);
};

const getSuggestedBoneName = (part: BodyPart): string => {
  const boneNames: Record<BodyPart, string> = {
    head: 'bone_head',
    torso: 'bone_body',
    leftArm: 'bone_arm_L',
    rightArm: 'bone_arm_R',
    leftLeg: 'bone_leg_L',
    rightLeg: 'bone_leg_R'
  };
  return boneNames[part];
};
