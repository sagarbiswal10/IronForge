import {
  Component,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HERO_BARBELL_IMAGE } from '../../data/gymData';
import { ResilientImage } from '../ResilientImage';
import {
  clampDragPitch,
  computeHeroScrollOffsets,
  detectSoftwareWebGL,
  getHeroCameraConfig,
  getHeroQualityProfile,
  normalizePointerOffset,
} from './barbellMath';
import {
  OlympicBarbellModel,
  type BarbellInteractionState,
} from './OlympicBarbellModel';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Generates a procedural RoomEnvironment IBL texture so high-metalness
 * dark steel and chrome catch realistic studio specular reflections without
 * any external HDR network requests.
 */
function StudioEnvironment({ isSoftwareGl }: { isSoftwareGl: boolean }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const target = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = target.texture;
    // Keep studio environment subdued so the dark obsidian & forge rim lights dominate
    if ('environmentIntensity' in scene) {
      (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = 0.52;
    }
    roomEnv.dispose();
    pmrem.dispose();

    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [gl, scene, isSoftwareGl]);

  return null;
}

/**
 * Keeps perspective camera responsive across desktop/mobile and applies
 * a very subtle damped drift as the user scrolls past the Hero section.
 */
function ResponsiveCamera({
  position,
  fov,
  scrollProgressRef,
  reducedMotion,
  animationIntensity,
  isInView,
}: {
  position: [number, number, number];
  fov: number;
  scrollProgressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
  animationIntensity: number;
  isInView: boolean;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(0, -0.02, 0);
  }, [camera, position, fov]);

  useFrame((_, rawDelta) => {
    if (!isInView) return;
    const delta = Math.min(rawDelta, 0.1);
    const offsets = computeHeroScrollOffsets(
      scrollProgressRef.current,
      reducedMotion,
      animationIntensity
    );

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      position[0] + offsets.cameraPosX,
      3.5,
      delta
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      position[1] + offsets.cameraPosY,
      3.5,
      delta
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      position[2] + offsets.cameraPosZ,
      3.5,
      delta
    );
    camera.lookAt(0, -0.02, 0);
  });

  return null;
}

/**
 * Software-WebGL frame pacer: waits for the SwiftShader fence to complete and pauses 80ms
 * before requesting the next demand frame, preventing main-thread starvation while preserving
 * live continuous rotation and mouse interactivity in headless/software environments.
 */
function SoftwareGlPacer({
  enabled,
  reducedMotion,
}: {
  enabled: boolean;
  reducedMotion: boolean;
}) {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    if (!enabled) return;

    let timerId = 0;
    let disposed = false;

    const scheduleAfterDraw = () => {
      if (disposed) return;
      const context = gl.getContext();
      if (context instanceof WebGL2RenderingContext) {
        const sync = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0);
        context.flush();
        const poll = () => {
          if (disposed) {
            if (sync) context.deleteSync(sync);
            return;
          }
          const status = sync ? context.getSyncParameter(sync, context.SYNC_STATUS) : context.SIGNALED;
          if (status === context.UNSIGNALED) {
            timerId = window.setTimeout(poll, 8);
          } else {
            if (sync) context.deleteSync(sync);
            timerId = window.setTimeout(() => {
              if (!disposed) {
                invalidate();
                if (!reducedMotion) {
                  scheduleAfterDraw();
                }
              }
            }, 90);
          }
        };
        timerId = window.setTimeout(poll, 8);
      } else {
        timerId = window.setTimeout(() => {
          if (!disposed) {
            invalidate();
            if (!reducedMotion) scheduleAfterDraw();
          }
        }, 120);
      }
    };

    // Initial render + gentle paced loop
    invalidate();
    if (!reducedMotion) {
      scheduleAfterDraw();
    }

    return () => {
      disposed = true;
      window.clearTimeout(timerId);
    };
  }, [enabled, gl, invalidate, reducedMotion]);

  return null;
}

function StaticBarbellFallback() {
  return (
    <div className="relative w-full max-w-[600px] aspect-[16/9] overflow-hidden [mask-image:radial-gradient(ellipse_74%_66%_at_50%_50%,black_44%,transparent_96%)] [-webkit-mask-image:radial-gradient(ellipse_74%_66%_at_50%_50%,black_44%,transparent_96%)]">
      <ResilientImage
        src={HERO_BARBELL_IMAGE}
        alt="Matte black 20 kg competition Olympic barbell under warm forge studio lighting"
        loading="eager"
        className="w-full h-full object-cover object-center mix-blend-lighten opacity-95"
      />
    </div>
  );
}

interface HeroBarbellCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

export const HeroBarbellCanvas = memo(function HeroBarbellCanvas({
  scrollProgressRef,
}: HeroBarbellCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const contextCleanupRef = useRef<(() => void) | null>(null);
  const interactionRef = useRef<BarbellInteractionState>({
    pointerX: 0,
    pointerY: 0,
    dragYaw: 0,
    dragPitch: 0,
    isDragging: false,
  });
  const lastDragPosRef = useRef<{ x: number; y: number } | null>(null);

  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [contextLost, setContextLost] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isDraggingUi, setIsDraggingUi] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );

  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);
  const cameraConfig = useMemo(
    () => getHeroCameraConfig(viewportWidth),
    [viewportWidth]
  );
  const quality = useMemo(
    () => getHeroQualityProfile(viewportWidth),
    [viewportWidth]
  );
  const isRenderActive = isInView && isPageVisible;

  useEffect(() => {
    let rafId = 0;
    const syncWidth = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const nextWidth = window.innerWidth;
        setViewportWidth((prev) => (prev === nextWidth ? prev : nextWidth));
      });
    };

    setViewportWidth(window.innerWidth);
    window.addEventListener('resize', syncWidth, { passive: true });

    let ro: ResizeObserver | null = null;
    const el = containerRef.current;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(syncWidth);
      ro.observe(el);
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsPageVisible(visible);
      if (visible) {
        invalidateRef.current?.();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', syncWidth);
      ro?.disconnect();
      mediaQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      contextCleanupRef.current?.();
      contextCleanupRef.current = null;
    };
  }, []);

  // Pause active WebGL loop when the hero canvas scrolls off-screen to preserve mobile battery & scroll smoothness
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          invalidateRef.current?.();
        }
      },
      { rootMargin: '120px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePoseSample = useCallback((yawRad: number) => {
    if (containerRef.current) {
      containerRef.current.dataset.barbellYaw = yawRad.toFixed(2);
    }
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const normalized = normalizePointerOffset(
      event.clientX,
      event.clientY,
      el.getBoundingClientRect()
    );
    interactionRef.current.pointerX = normalized.x;
    interactionRef.current.pointerY = normalized.y;

    if (interactionRef.current.isDragging && lastDragPosRef.current) {
      const dx = event.clientX - lastDragPosRef.current.x;
      const dy = event.clientY - lastDragPosRef.current.y;
      lastDragPosRef.current = { x: event.clientX, y: event.clientY };

      interactionRef.current.dragYaw += dx * 0.008;
      interactionRef.current.dragPitch = clampDragPitch(
        interactionRef.current.dragPitch + dy * 0.006
      );
    }

    if (isSoftwareGl && invalidateRef.current) {
      invalidateRef.current();
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    interactionRef.current.isDragging = true;
    lastDragPosRef.current = { x: event.clientX, y: event.clientY };
    setIsDraggingUi(true);
  };

  const handlePointerUpOrCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    interactionRef.current.isDragging = false;
    lastDragPosRef.current = null;
    setIsDraggingUi(false);
  };

  const handlePointerLeave = () => {
    if (!interactionRef.current.isDragging) {
      interactionRef.current.pointerX = 0;
      interactionRef.current.pointerY = 0;
    }
  };

  const handleCreated = useCallback(
    ({ gl, invalidate }: { gl: THREE.WebGLRenderer; invalidate: () => void }) => {
      invalidateRef.current = invalidate;
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.15;
      gl.outputColorSpace = THREE.SRGBColorSpace;

      const domEl = gl.domElement;
      const onLost = (e: Event) => {
        e.preventDefault();
        setContextLost(true);
      };
      const onRestored = () => {
        setContextLost(false);
        invalidate();
      };
      contextCleanupRef.current?.();
      domEl.addEventListener('webglcontextlost', onLost, false);
      domEl.addEventListener('webglcontextrestored', onRestored, false);
      contextCleanupRef.current = () => {
        domEl.removeEventListener('webglcontextlost', onLost, false);
        domEl.removeEventListener('webglcontextrestored', onRestored, false);
      };
      setIsReady(true);
    },
    []
  );

  if (contextLost) {
    return <StaticBarbellFallback />;
  }

  return (
    <div
      ref={containerRef}
      data-testid="hero-3d-canvas"
      data-barbell-ready={isReady ? 'true' : 'false'}
      data-barbell-yaw="0.00"
      data-quality-tier={quality.tier}
      data-particles={String(quality.particleCount)}
      role="img"
      aria-label="Interactive 3D competition Olympic barbell with calibrated weight plates"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full max-w-full min-w-0 overflow-hidden [&_canvas]:!max-w-full h-[230px] sm:h-[310px] lg:h-[380px] select-none touch-pan-y ${
        isDraggingUi ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <CanvasErrorBoundary fallback={<StaticBarbellFallback />}>
        <Canvas
          frameloop={isSoftwareGl || !isRenderActive ? 'demand' : 'always'}
          shadows={!isSoftwareGl && quality.enableShadows}
          dpr={isSoftwareGl ? 1 : [1, quality.maxDpr]}
          resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
          style={{ width: '100%', height: '100%', display: 'block' }}
          camera={{
            position: cameraConfig.position,
            fov: cameraConfig.fov,
            near: 0.1,
            far: 40,
          }}
          gl={{
            antialias: !isSoftwareGl,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
          }}
          onCreated={handleCreated}
          className="w-full h-full block"
        >
          <ResponsiveCamera
            position={cameraConfig.position}
            fov={cameraConfig.fov}
            scrollProgressRef={scrollProgressRef}
            reducedMotion={reducedMotion}
            animationIntensity={quality.animationIntensity}
            isInView={isRenderActive}
          />
          <StudioEnvironment isSoftwareGl={isSoftwareGl} />
          <SoftwareGlPacer
            enabled={isSoftwareGl && isRenderActive}
            reducedMotion={reducedMotion}
          />

          {/* Balanced Dark Cinematic Studio Lighting Rig */}
          <hemisphereLight args={['#8aa4c2', '#1b0c06', 0.54]} />

          {/* Overhead Warm-White Studio Key Light */}
          <directionalLight
            position={[2.4, 5.2, 4.2]}
            intensity={2.25}
            color="#fff4e6"
            castShadow={!isSoftwareGl && quality.enableShadows}
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
            shadow-camera-near={1}
            shadow-camera-far={16}
            shadow-camera-left={-3.6}
            shadow-camera-right={3.6}
            shadow-camera-top={2.5}
            shadow-camera-bottom={-2.5}
            shadow-bias={-0.0005}
            shadow-normalBias={0.02}
          />

          {/* Signature Red-Orange Forge Rim Light (Top-Right Back) */}
          <directionalLight
            position={[4.2, 2.4, -3.6]}
            intensity={quality.enableEmberPointLight ? 3.8 : 4.35}
            color="#FF4D1C"
          />

          {/* Subtle Lower Ember Underglow Rim (Tablet & Desktop Only) */}
          {quality.enableEmberPointLight && (
            <pointLight
              position={[-3.2, -0.6, -2.4]}
              intensity={4.2}
              distance={10}
              decay={2}
              color="#ff320a"
            />
          )}

          {/* Cool Steel Edge Fill Light (Left-Top) */}
          <directionalLight
            position={[-4.5, 2.8, 2.2]}
            intensity={0.85}
            color="#9ab6d6"
          />

          {/* Procedural Low-Poly Olympic Barbell + Weight Plates (includes single-pass soft contact shadow) */}
          <OlympicBarbellModel
            interactionRef={interactionRef}
            scrollProgressRef={scrollProgressRef}
            quality={quality}
            isSoftwareGl={isSoftwareGl}
            reducedMotion={reducedMotion}
            isInView={isRenderActive}
            onPoseSample={handlePoseSample}
          />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
});

export default HeroBarbellCanvas;
