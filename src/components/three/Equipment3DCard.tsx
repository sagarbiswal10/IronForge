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
import { ResilientImage } from '../ResilientImage';
import { detectSoftwareWebGL, normalizePointerOffset } from './barbellMath';
import {
  computeEquipmentTargetState,
  getEquipmentCameraConfig,
  nextEquipmentTapSpin,
  type EquipmentKind,
} from './equipmentMath';
import { EquipmentModel } from './EquipmentModels';

interface CardErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface CardErrorBoundaryState {
  hasError: boolean;
}

class EquipmentCanvasErrorBoundary extends Component<
  CardErrorBoundaryProps,
  CardErrorBoundaryState
> {
  state: CardErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CardErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface CardInteractionRef {
  isHovered: boolean;
  isActive: boolean;
  pointerX: number;
  pointerY: number;
  tapSpinRad: number;
  hoverElapsed: number;
}

function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const target = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = target.texture;
    if ('environmentIntensity' in scene) {
      (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = 0.55;
    }
    roomEnv.dispose();
    pmrem.dispose();

    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [gl, scene]);

  return null;
}

function EquipmentCameraRig({
  kind,
  isMobile,
}: {
  kind: EquipmentKind;
  isMobile: boolean;
}) {
  const { camera, invalidate } = useThree();
  const cfg = useMemo(() => getEquipmentCameraConfig(kind, isMobile), [kind, isMobile]);

  useEffect(() => {
    camera.position.set(cfg.position[0], cfg.position[1], cfg.position[2]);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = cfg.fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(cfg.target[0], cfg.target[1], cfg.target[2]);
    invalidate();
  }, [camera, cfg, invalidate]);

  return null;
}

function EquipmentStageScene({
  kind,
  isMobile,
  isSoftwareGl,
  reducedMotion,
  isInView,
  interactionRef,
  onYawSample,
}: {
  kind: EquipmentKind;
  isMobile: boolean;
  isSoftwareGl: boolean;
  reducedMotion: boolean;
  isInView: boolean;
  interactionRef: React.MutableRefObject<CardInteractionRef>;
  onYawSample: (yaw: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const emberLightRef = useRef<THREE.PointLight>(null);
  const softwareTimerRef = useRef<number>(0);
  const lastSampledYawRef = useRef<number>(Number.NaN);

  const { gl, invalidate } = useThree();

  // Initialize exact rest pose on mount
  useEffect(() => {
    const rest = computeEquipmentTargetState(kind, {
      isHovered: false,
      isActive: false,
      pointerX: 0,
      pointerY: 0,
      tapSpinRad: 0,
      hoverElapsed: 0,
      reducedMotion,
    });
    if (groupRef.current) {
      groupRef.current.rotation.set(rest.rotX, rest.rotY, rest.rotZ);
      groupRef.current.position.set(0, rest.posY, 0);
      groupRef.current.scale.setScalar(rest.scale);
      onYawSample(rest.rotY);
    }
    invalidate();
  }, [kind, reducedMotion, invalidate, onYawSample]);

  useEffect(() => {
    return () => {
      window.clearTimeout(softwareTimerRef.current);
    };
  }, []);

  const scheduleSoftwareNextFrame = useCallback(() => {
    window.clearTimeout(softwareTimerRef.current);
    const context = gl.getContext();
    if (context instanceof WebGL2RenderingContext) {
      const sync = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0);
      context.flush();
      const poll = () => {
        const status = sync
          ? context.getSyncParameter(sync, context.SYNC_STATUS)
          : context.SIGNALED;
        if (status === context.UNSIGNALED) {
          softwareTimerRef.current = window.setTimeout(poll, 8);
        } else {
          if (sync) context.deleteSync(sync);
          softwareTimerRef.current = window.setTimeout(() => {
            invalidate();
          }, 85);
        }
      };
      softwareTimerRef.current = window.setTimeout(poll, 8);
    } else {
      softwareTimerRef.current = window.setTimeout(() => invalidate(), 100);
    }
  }, [gl, invalidate]);

  useFrame((_, rawDelta) => {
    if (!isInView) return;
    const group = groupRef.current;
    if (!group) return;

    const delta = Math.min(rawDelta, 0.1);
    const state = interactionRef.current;
    const engaged = state.isHovered || state.isActive;

    if (engaged && !reducedMotion) {
      state.hoverElapsed += delta;
    }

    const target = computeEquipmentTargetState(kind, {
      isHovered: state.isHovered,
      isActive: state.isActive,
      pointerX: state.pointerX,
      pointerY: state.pointerY,
      tapSpinRad: state.tapSpinRad,
      hoverElapsed: state.hoverElapsed,
      reducedMotion,
    });

    const dampSpeed = isSoftwareGl ? 12 : 6.2;
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, target.rotX, dampSpeed, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, target.rotY, dampSpeed, delta);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, target.rotZ, dampSpeed, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, target.posY, dampSpeed, delta);

    const nextScale = THREE.MathUtils.damp(group.scale.x, target.scale, dampSpeed, delta);
    group.scale.setScalar(nextScale);

    if (keyLightRef.current) {
      keyLightRef.current.intensity = THREE.MathUtils.damp(
        keyLightRef.current.intensity,
        target.keyIntensity,
        dampSpeed,
        delta
      );
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = THREE.MathUtils.damp(
        rimLightRef.current.intensity,
        target.rimIntensity,
        dampSpeed,
        delta
      );
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = THREE.MathUtils.damp(
        fillLightRef.current.intensity,
        target.fillIntensity,
        dampSpeed,
        delta
      );
    }
    if (emberLightRef.current) {
      emberLightRef.current.intensity = THREE.MathUtils.damp(
        emberLightRef.current.intensity,
        target.emberIntensity,
        dampSpeed,
        delta
      );
    }

    if (
      Number.isNaN(lastSampledYawRef.current) ||
      Math.abs(group.rotation.y - lastSampledYawRef.current) > 0.015
    ) {
      lastSampledYawRef.current = group.rotation.y;
      onYawSample(group.rotation.y);
    }

    // Check if transform or lighting is still settling toward target
    const settled =
      Math.abs(group.rotation.x - target.rotX) < 0.002 &&
      Math.abs(group.rotation.y - target.rotY) < 0.002 &&
      Math.abs(group.scale.x - target.scale) < 0.001 &&
      (!rimLightRef.current || Math.abs(rimLightRef.current.intensity - target.rimIntensity) < 0.03);

    // Keep animating smoothly while settling, or while desktop GPU user hovers/engages
    const shouldContinue = !settled || (engaged && !reducedMotion && !isSoftwareGl);
    if (shouldContinue) {
      if (isSoftwareGl) {
        scheduleSoftwareNextFrame();
      } else {
        invalidate();
      }
    }
  });

  return (
    <>
      <EquipmentCameraRig kind={kind} isMobile={isMobile} />
      <StudioEnvironment />

      {/* Warm/Cool Balanced Dark Gym Studio Lighting Rig */}
      <hemisphereLight args={['#8aa4c2', '#1a0c07', 0.5]} />
      <directionalLight
        ref={keyLightRef}
        position={[2.4, 4.6, 3.8]}
        intensity={2.1}
        color="#fff3e4"
      />
      <directionalLight
        ref={rimLightRef}
        position={[3.8, 2.2, -3.2]}
        intensity={isMobile ? 3.35 : 2.85}
        color="#FF4D1C"
      />
      <directionalLight
        ref={fillLightRef}
        position={[-4.0, 2.4, 2.4]}
        intensity={0.82}
        color="#96b2d4"
      />
      {!isMobile && (
        <pointLight
          ref={emberLightRef}
          position={[-2.6, -0.5, -2.0]}
          intensity={3.2}
          distance={9}
          decay={2}
          color="#ff3b10"
        />
      )}

      <group ref={groupRef}>
        <EquipmentModel kind={kind} isMobile={isMobile} />
      </group>
    </>
  );
}

export interface Equipment3DCardProps {
  kind: EquipmentKind;
  name: string;
  caption: string;
  fallbackSrc: string;
  fallbackAlt: string;
  aspectClassName: string;
  isActive: boolean;
  onActivate: () => void;
}

export const Equipment3DCard = memo(function Equipment3DCard({
  kind,
  name,
  caption,
  fallbackSrc,
  fallbackAlt,
  aspectClassName,
  isActive,
  onActivate,
}: Equipment3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const contextCleanupRef = useRef<(() => void) | null>(null);
  const interactionRef = useRef<CardInteractionRef>({
    isHovered: false,
    isActive,
    pointerX: 0,
    pointerY: 0,
    tapSpinRad: 0,
    hoverElapsed: 0,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [hasMountedCanvas, setHasMountedCanvas] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );
  const [isReady, setIsReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);

  useEffect(() => {
    let rafId = 0;
    const syncMobile = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const nextMobile = window.innerWidth < 768;
        setIsMobile((prev) => (prev === nextMobile ? prev : nextMobile));
      });
    };

    setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', syncMobile, { passive: true });

    let ro: ResizeObserver | null = null;
    const el = cardRef.current;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(syncMobile);
      ro.observe(el);
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener('change', onMotionChange);

    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsPageVisible(visible);
      if (visible) invalidateRef.current?.();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', syncMobile);
      ro?.disconnect();
      mq.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      contextCleanupRef.current?.();
      contextCleanupRef.current = null;
    };
  }, []);

  // Lazy-mount WebGL canvas when approaching viewport and gate active frames by visibility
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setHasMountedCanvas(true);
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasMountedCanvas(true);
          invalidateRef.current?.();
        }
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sync external active state (e.g. clicking an equipment row on the right) into 3D scene
  useEffect(() => {
    interactionRef.current.isActive = isActive;
    invalidateRef.current?.();
  }, [isActive]);

  const handleYawSample = useCallback((yawRad: number) => {
    if (cardRef.current) {
      cardRef.current.dataset.yaw = yawRad.toFixed(2);
    }
  }, []);

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    interactionRef.current.isHovered = true;
    setIsHovered(true);
    invalidateRef.current?.();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const el = cardRef.current;
    if (!el) return;
    const norm = normalizePointerOffset(event.clientX, event.clientY, el.getBoundingClientRect());
    interactionRef.current.pointerX = norm.x;
    interactionRef.current.pointerY = norm.y;
    if (!interactionRef.current.isHovered) {
      interactionRef.current.isHovered = true;
      setIsHovered(true);
    }
    invalidateRef.current?.();
  };

  const handlePointerLeave = () => {
    interactionRef.current.isHovered = false;
    interactionRef.current.pointerX = 0;
    interactionRef.current.pointerY = 0;
    setIsHovered(false);
    invalidateRef.current?.();
  };

  const handleInteractClick = () => {
    // Advance clean 60° inspection angle on tap/click so mobile & keyboard users can rotate easily
    interactionRef.current.tapSpinRad = nextEquipmentTapSpin(interactionRef.current.tapSpinRad);
    onActivate();
    invalidateRef.current?.();
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
      invalidate();
    },
    []
  );

  const engaged = isHovered || isActive;

  const fallbackView = (
    <ResilientImage
      src={fallbackSrc}
      alt={fallbackAlt}
      className="w-full h-full object-cover object-center"
    />
  );

  return (
    <article
      ref={cardRef}
      data-anim="equipment-media"
      data-testid={`equipment-3d-${kind}`}
      data-ready={isReady ? 'true' : 'false'}
      data-hovered={isHovered ? 'true' : 'false'}
      data-active={isActive ? 'true' : 'false'}
      data-yaw="0.00"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`group relative ${aspectClassName} w-full max-w-full min-w-0 overflow-hidden border transition-colors duration-300 bg-[#0d0d0d] select-none touch-pan-y ${
        engaged ? 'border-[#FF4D1C]/45' : 'border-white/[0.08]'
      }`}
    >
      {/* Subtle Radial Studio Ember Backdrop — warms smoothly on hover/tap */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          engaged
            ? 'opacity-100 bg-[radial-gradient(ellipse_68%_64%_at_52%_48%,rgba(255,77,28,0.20)_0%,rgba(255,77,28,0.06)_46%,rgba(11,11,12,0.96)_100%)]'
            : 'opacity-65 bg-[radial-gradient(ellipse_62%_58%_at_52%_50%,rgba(255,77,28,0.11)_0%,rgba(16,17,19,0.72)_52%,rgba(10,10,11,0.98)_100%)]'
        }`}
      />

      {/* Lightweight Interactive 3D Viewport */}
      <div className="absolute inset-0 overflow-hidden [&_canvas]:!max-w-full">
        {!hasMountedCanvas || contextLost ? (
          fallbackView
        ) : (
          <EquipmentCanvasErrorBoundary fallback={fallbackView}>
            <Canvas
              frameloop="demand"
              shadows={false}
              dpr={isSoftwareGl ? 1 : isMobile ? 1 : [1, 1.5]}
              resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
              style={{ width: '100%', height: '100%', display: 'block' }}
              gl={{
                antialias: !isSoftwareGl,
                alpha: true,
                powerPreference: 'high-performance',
                preserveDrawingBuffer: false,
              }}
              onCreated={handleCreated}
              className="w-full h-full block"
            >
              <EquipmentStageScene
                kind={kind}
                isMobile={isMobile}
                isSoftwareGl={isSoftwareGl}
                reducedMotion={reducedMotion}
                isInView={isInView && isPageVisible}
                interactionRef={interactionRef}
                onYawSample={handleYawSample}
              />
            </Canvas>
          </EquipmentCanvasErrorBoundary>
        )}
      </div>

      {/* Bottom Cinematic Vignette for Crisp Equipment Typography */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
      />

      {/* Minimal Top-Right Interaction Hint */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute right-4 top-3.5 font-mono text-[9.5px] uppercase tracking-[0.18em] transition-colors duration-300 ${
          engaged ? 'text-[#FF4D1C]' : 'text-neutral-500'
        }`}
      >
        <span className="hidden sm:inline">{engaged ? '3D INSPECT' : 'HOVER · 3D'}</span>
        <span className="sm:hidden">{isActive ? 'TAP · ROTATE' : 'TAP · 3D'}</span>
      </span>

      {/* Clear Equipment Name & Spec Caption (matching UX Pilot RACK ROW caption style) */}
      <div className="pointer-events-none absolute left-4 sm:left-5 bottom-3.5 sm:bottom-4 right-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base sm:text-lg uppercase tracking-[0.04em] text-white leading-none">
          {name}
        </h3>
        <span className="font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.16em] text-neutral-400 truncate">
          {caption}
        </span>
      </div>

      {/* Accessible Full-Card Button for Touch, Click & Keyboard Inspection */}
      <button
        type="button"
        onClick={handleInteractClick}
        aria-pressed={isActive}
        aria-label={`Inspect 3D ${name} — tap or press Enter to rotate`}
        className="absolute inset-0 z-10 w-full h-full cursor-pointer bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#FF4D1C]"
      />
    </article>
  );
});

export default Equipment3DCard;
