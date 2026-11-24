import { clamp } from './barbellMath';

export type EquipmentKind = 'squat-rack' | 'olympic-barbell' | 'dumbbell';

export interface EquipmentInteractionInput {
  isHovered: boolean;
  isActive: boolean;
  pointerX: number;
  pointerY: number;
  tapSpinRad: number;
  hoverElapsed: number;
  reducedMotion: boolean;
}

export interface EquipmentTargetState {
  rotX: number;
  rotY: number;
  rotZ: number;
  posY: number;
  scale: number;
  keyIntensity: number;
  rimIntensity: number;
  fillIntensity: number;
  emberIntensity: number;
}

interface BaseEquipmentPose {
  rotX: number;
  rotY: number;
  rotZ: number;
  posY: number;
  hoverLift: number;
  hoverScale: number;
  hoverYawDelta: number;
}

const BASE_POSES: Record<EquipmentKind, BaseEquipmentPose> = {
  'squat-rack': {
    rotX: 0.09,
    rotY: -0.44,
    rotZ: 0,
    posY: 0.02,
    hoverLift: 0.02,
    hoverScale: 1.045,
    hoverYawDelta: 0.34,
  },
  'olympic-barbell': {
    rotX: 0.2,
    rotY: -0.34,
    rotZ: -0.07,
    posY: 0.1,
    hoverLift: 0.045,
    hoverScale: 1.055,
    hoverYawDelta: 0.38,
  },
  dumbbell: {
    rotX: 0.22,
    rotY: 0.46,
    rotZ: -0.14,
    posY: 0.12,
    hoverLift: 0.045,
    hoverScale: 1.06,
    hoverYawDelta: 0.42,
  },
};

/**
 * Computes subtle target transform and studio lighting intensities for a 3D equipment showcase card.
 * Keeps motion restrained and premium, and respects prefers-reduced-motion.
 */
export function computeEquipmentTargetState(
  kind: EquipmentKind,
  input: EquipmentInteractionInput
): EquipmentTargetState {
  const base = BASE_POSES[kind];
  const engaged = input.isHovered || input.isActive;

  const px = clamp(input.pointerX, -1, 1);
  const py = clamp(input.pointerY, -1, 1);

  if (input.reducedMotion) {
    return {
      rotX: base.rotX,
      rotY: base.rotY + input.tapSpinRad,
      rotZ: base.rotZ,
      posY: base.posY,
      scale: engaged ? 1.015 : 1,
      keyIntensity: engaged ? 2.55 : 2.1,
      rimIntensity: engaged ? 4.35 : 2.85,
      fillIntensity: engaged ? 1.0 : 0.82,
      emberIntensity: engaged ? 5.2 : 3.2,
    };
  }

  const gentleDrift = engaged ? Math.sin(input.hoverElapsed * 0.85) * 0.09 : 0;
  const hoverTurn = engaged ? base.hoverYawDelta + gentleDrift : 0;
  const pointerYaw = input.isHovered ? px * 0.2 : 0;
  const pointerPitch = input.isHovered ? py * 0.11 : 0;

  return {
    rotX: base.rotX + pointerPitch,
    rotY: base.rotY + hoverTurn + pointerYaw + input.tapSpinRad,
    rotZ: base.rotZ,
    posY: base.posY + (engaged ? base.hoverLift : 0),
    scale: engaged ? base.hoverScale : 1,
    keyIntensity: engaged ? 2.65 : 2.1,
    rimIntensity: engaged ? 4.6 : 2.85,
    fillIntensity: engaged ? 1.05 : 0.82,
    emberIntensity: engaged ? 5.6 : 3.2,
  };
}

/**
 * Advances mobile/click spin angle in clean 60-degree increments so users can inspect
 * all angles of a piece of equipment with simple taps.
 */
export function nextEquipmentTapSpin(currentRad: number): number {
  return currentRad + Math.PI / 3;
}

/**
 * Returns camera distance, framing height, and FOV tuned per equipment silhouette and device size.
 */
export function getEquipmentCameraConfig(
  kind: EquipmentKind,
  isMobile: boolean
): { position: [number, number, number]; target: [number, number, number]; fov: number } {
  switch (kind) {
    case 'squat-rack':
      return isMobile
        ? { position: [0, 0.52, 5.45], target: [0, -0.02, 0], fov: 36 }
        : { position: [0, 0.48, 4.98], target: [0, -0.02, 0], fov: 34 };
    case 'olympic-barbell':
      return isMobile
        ? { position: [0, 0.42, 6.75], target: [0, 0.04, 0], fov: 36 }
        : { position: [0, 0.38, 6.35], target: [0, 0.04, 0], fov: 34 };
    case 'dumbbell':
      return isMobile
        ? { position: [0, 0.44, 4.55], target: [0, 0.05, 0], fov: 35 }
        : { position: [0, 0.4, 4.18], target: [0, 0.05, 0], fov: 33 };
  }
}

/**
 * Maps right-column inventory spec IDs to their matching 3D equipment card.
 */
export function mapSpecIdToEquipmentKind(specId: string | null): EquipmentKind | null {
  if (specId === 'racks') return 'squat-rack';
  if (specId === 'plates' || specId === 'platforms') return 'olympic-barbell';
  if (specId === 'dumbbells') return 'dumbbell';
  return null;
}
