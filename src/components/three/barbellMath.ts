export interface BarbellPoseInput {
  elapsedTime: number;
  pointerX: number;
  pointerY: number;
  dragYaw: number;
  dragPitch: number;
  reducedMotion: boolean;
  /** Scales subtle idle motion & hover amplitude (e.g. 0.55 on mobile, 1.0 on desktop). */
  animationIntensity?: number;
}

export interface BarbellPose {
  rotX: number;
  rotY: number;
  rotZ: number;
  posY: number;
}

export const BASE_TILT_X = 0.2;
export const BASE_TILT_Y = -0.34;
export const BASE_TILT_Z = -0.07;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizePointerOffset(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number }
): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: 0, y: 0 };
  }
  const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
  const ny = ((clientY - rect.top) / rect.height) * 2 - 1;
  return {
    x: clamp(nx, -1, 1),
    y: clamp(ny, -1, 1),
  };
}

export function clampDragPitch(pitch: number): number {
  return clamp(pitch, -0.55, 0.55);
}

export function computeBarbellPose(input: BarbellPoseInput): BarbellPose {
  const intensity = clamp(input.animationIntensity ?? 1, 0, 1);
  const autoYaw = input.reducedMotion ? 0 : input.elapsedTime * 0.24 * intensity;
  const autoFloat = input.reducedMotion
    ? 0
    : Math.sin(input.elapsedTime * 1.15) * 0.065 * intensity;
  const subtleRoll = input.reducedMotion
    ? 0
    : Math.sin(input.elapsedTime * 0.65) * 0.025 * intensity;

  const hoverYaw = clamp(input.pointerX, -1, 1) * 0.22 * intensity;
  const hoverPitch = clamp(input.pointerY, -1, 1) * 0.14 * intensity;

  return {
    rotX: BASE_TILT_X + hoverPitch + clampDragPitch(input.dragPitch),
    rotY: BASE_TILT_Y + autoYaw + hoverYaw + input.dragYaw,
    rotZ: BASE_TILT_Z + subtleRoll,
    posY: 0.08 + autoFloat,
  };
}

export interface HeroScrollOffsets {
  barbellPosX: number;
  barbellPosY: number;
  barbellRotY: number;
  barbellRotX: number;
  cameraPosX: number;
  cameraPosY: number;
  cameraPosZ: number;
}

/**
 * Computes subtle, damped 3D barbell and camera offsets driven by normalized
 * Hero scroll progress [0..1]. Returns zero offsets when reduced motion is active.
 */
export function computeHeroScrollOffsets(
  scrollProgress: number,
  reducedMotion: boolean,
  intensity = 1
): HeroScrollOffsets {
  const p = clamp(scrollProgress, 0, 1);
  const scale = clamp(intensity, 0, 1);
  if (reducedMotion || p === 0 || scale === 0) {
    return {
      barbellPosX: 0,
      barbellPosY: 0,
      barbellRotY: 0,
      barbellRotX: 0,
      cameraPosX: 0,
      cameraPosY: 0,
      cameraPosZ: 0,
    };
  }

  // Smooth ease-in-out curve without bounce
  const smooth = p * p * (3 - 2 * p) * scale;

  return {
    barbellPosX: smooth * 0.28,
    barbellPosY: smooth * 0.24,
    barbellRotY: smooth * 0.42,
    barbellRotX: -smooth * 0.14,
    cameraPosX: -smooth * 0.16,
    cameraPosY: smooth * 0.18,
    cameraPosZ: smooth * 0.34,
  };
}

export interface HeroQualityProfile {
  tier: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  radialSegments: number;
  shaftSegments: number;
  torusTubularSegments: number;
  bushingSegments: number;
  particleCount: number;
  maxDpr: number;
  usePhysicalMaterials: boolean;
  enableShadows: boolean;
  enableEmberPointLight: boolean;
  animationIntensity: number;
}

/**
 * Scales Three.js geometry density, particles, lighting cost, and motion intensity
 * by viewport tier so mobile stays silky-smooth while remaining visually impressive.
 */
export function getHeroQualityProfile(viewportWidth: number): HeroQualityProfile {
  if (viewportWidth < 768) {
    return {
      tier: 'mobile',
      isMobile: true,
      radialSegments: 16,
      shaftSegments: 12,
      torusTubularSegments: 6,
      bushingSegments: 14,
      particleCount: 0,
      maxDpr: 1.25,
      usePhysicalMaterials: false,
      enableShadows: false,
      enableEmberPointLight: false,
      animationIntensity: 0.55,
    };
  }
  if (viewportWidth < 1024) {
    return {
      tier: 'tablet',
      isMobile: true,
      radialSegments: 22,
      shaftSegments: 16,
      torusTubularSegments: 8,
      bushingSegments: 18,
      particleCount: 6,
      maxDpr: 1.5,
      usePhysicalMaterials: true,
      enableShadows: false,
      enableEmberPointLight: true,
      animationIntensity: 0.78,
    };
  }
  return {
    tier: 'desktop',
    isMobile: false,
    radialSegments: 28,
    shaftSegments: 18,
    torusTubularSegments: 8,
    bushingSegments: 20,
    particleCount: 14,
    maxDpr: 2,
    usePhysicalMaterials: true,
    enableShadows: true,
    enableEmberPointLight: true,
    animationIntensity: 1,
  };
}

export function getHeroCameraConfig(viewportWidth: number): {
  position: [number, number, number];
  fov: number;
  isMobile: boolean;
} {
  if (viewportWidth < 400) {
    return { position: [0, 0.44, 7.65], fov: 36, isMobile: true };
  }
  if (viewportWidth < 640) {
    return { position: [0, 0.44, 7.25], fov: 36, isMobile: true };
  }
  if (viewportWidth < 1024) {
    return { position: [0, 0.4, 5.95], fov: 35, isMobile: true };
  }
  if (viewportWidth < 1280) {
    return { position: [0, 0.42, 6.65], fov: 35, isMobile: false };
  }
  return { position: [0, 0.42, 5.75], fov: 34, isMobile: false };
}

let cachedSoftwareWebGL: boolean | null = null;

export function detectSoftwareWebGL(): boolean {
  if (cachedSoftwareWebGL !== null) {
    return cachedSoftwareWebGL;
  }
  if (typeof document === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      cachedSoftwareWebGL = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const rendererName = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedSoftwareWebGL = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(
      rendererName
    );
    return cachedSoftwareWebGL;
  } catch {
    cachedSoftwareWebGL = true;
    return true;
  }
}
