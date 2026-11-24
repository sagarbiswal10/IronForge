import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  BASE_TILT_X,
  BASE_TILT_Y,
  BASE_TILT_Z,
  computeBarbellPose,
  computeHeroScrollOffsets,
  type HeroQualityProfile,
} from './barbellMath';
import {
  createBrushedSteelTexture,
  createDustMoteTexture,
  createKnurlingTexture,
  createSoftShadowTexture,
} from './proceduralTextures';

export interface BarbellInteractionState {
  pointerX: number;
  pointerY: number;
  dragYaw: number;
  dragPitch: number;
  isDragging: boolean;
}

interface OlympicBarbellModelProps {
  interactionRef: React.MutableRefObject<BarbellInteractionState>;
  scrollProgressRef: React.MutableRefObject<number>;
  quality: HeroQualityProfile;
  isSoftwareGl: boolean;
  reducedMotion: boolean;
  isInView: boolean;
  onPoseSample?: (yawRad: number) => void;
}

interface PlateSpec {
  id: string;
  outerRadius: number;
  thickness: number;
  lipWidth: number;
  recessDepth: number;
  xOffset: number;
  hasForgeAccent: boolean;
}

const PLATE_SPECS: PlateSpec[] = [
  // Inner 25 kg competition calibrated plate
  {
    id: '25kg',
    outerRadius: 0.78,
    thickness: 0.14,
    lipWidth: 0.085,
    recessDepth: 0.026,
    xOffset: 1.62,
    hasForgeAccent: true,
  },
  // Middle 20 kg calibrated plate
  {
    id: '20kg',
    outerRadius: 0.72,
    thickness: 0.125,
    lipWidth: 0.075,
    recessDepth: 0.022,
    xOffset: 1.77,
    hasForgeAccent: false,
  },
  // Outer 10 kg calibrated plate
  {
    id: '10kg',
    outerRadius: 0.56,
    thickness: 0.105,
    lipWidth: 0.065,
    recessDepth: 0.018,
    xOffset: 1.905,
    hasForgeAccent: false,
  },
];

/**
 * Builds a low-poly competition calibrated weight plate profile via LatheGeometry
 * with raised outer lip, recessed dish face, chamfered edge, and inner hub boss.
 */
function buildCalibratedPlateGeometry(
  outerRadius: number,
  thickness: number,
  lipWidth: number,
  recessDepth: number,
  radialSegments: number
): THREE.LatheGeometry {
  const halfT = thickness * 0.5;
  const bevel = 0.014;
  const innerHole = 0.095;
  const hubRadius = 0.21;
  const lipInner = outerRadius - lipWidth;
  const dishHalfT = halfT - recessDepth;

  const points = [
    new THREE.Vector2(innerHole, -halfT + 0.008),
    new THREE.Vector2(hubRadius, -halfT + 0.008),
    new THREE.Vector2(hubRadius + 0.03, -dishHalfT),
    new THREE.Vector2(lipInner - 0.025, -dishHalfT),
    new THREE.Vector2(lipInner, -halfT),
    new THREE.Vector2(outerRadius - bevel, -halfT),
    new THREE.Vector2(outerRadius, -halfT + bevel),
    new THREE.Vector2(outerRadius, halfT - bevel),
    new THREE.Vector2(outerRadius - bevel, halfT),
    new THREE.Vector2(lipInner, halfT),
    new THREE.Vector2(lipInner - 0.025, dishHalfT),
    new THREE.Vector2(hubRadius + 0.03, dishHalfT),
    new THREE.Vector2(hubRadius, halfT - 0.008),
    new THREE.Vector2(innerHole, halfT - 0.008),
  ];

  const geom = new THREE.LatheGeometry(points, radialSegments);
  // Orient lathe axis (Y) onto barbell X axis
  geom.rotateZ(Math.PI / 2);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Minimal atmospheric floating dust motes (scaled down on tablet, disabled on mobile).
 */
const AtmosphericChalkMotes = memo(function AtmosphericChalkMotes({
  count,
  reducedMotion,
  isInView,
}: {
  count: number;
  reducedMotion: boolean;
  isInView: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, texture, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Deterministic golden-angle spread around the barbell volume
      const angle = i * 2.39996;
      const radius = 1.4 + (i % 5) * 0.42;
      positions[i * 3] = Math.cos(angle) * radius * 1.45;
      positions[i * 3 + 1] = ((i % 7) - 3) * 0.36;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.75;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const tex = createDustMoteTexture();
    const mat = new THREE.PointsMaterial({
      map: tex,
      size: 0.075,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return {
      geometry: geo,
      texture: tex,
      material: mat,
    };
  }, [count]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [geometry, material, texture]);

  useFrame((_, delta) => {
    if (!pointsRef.current || reducedMotion || !isInView) return;
    pointsRef.current.rotation.y += Math.min(delta, 0.1) * 0.045;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
  );
});

export const OlympicBarbellModel = memo(function OlympicBarbellModel({
  interactionRef,
  scrollProgressRef,
  quality,
  isSoftwareGl,
  reducedMotion,
  isInView,
  onPoseSample,
}: OlympicBarbellModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);
  const lastSampleRef = useRef(0);
  const lastSampledYawRef = useRef(Number.NaN);
  const { gl } = useThree();

  const {
    radialSegments,
    shaftSegments,
    torusTubularSegments,
    bushingSegments,
    usePhysicalMaterials,
    enableShadows,
    particleCount,
    animationIntensity,
  } = quality;
  const castShadows = !isSoftwareGl && enableShadows;

  // Build reusable procedural textures, geometries, and calibrated PBR materials once
  const resources = useMemo(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    const knurlTex = createKnurlingTexture(maxAniso);
    const steelTex = createBrushedSteelTexture(maxAniso);
    const shadowTex = createSoftShadowTexture();

    // Shared PBR Materials with deliberate roughness/metalness contrast (>= 0.25 delta)
    // Uses lighter MeshStandardMaterial on mobile to avoid extra clearcoat shader passes.
    const darkOxideShaftMat = usePhysicalMaterials
      ? new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#272A30'),
          metalness: 0.92,
          roughness: 0.28,
          clearcoat: 0.18,
          clearcoatRoughness: 0.3,
          bumpMap: steelTex,
          bumpScale: 0.0025,
        })
      : new THREE.MeshStandardMaterial({
          color: new THREE.Color('#2A2E35'),
          metalness: 0.9,
          roughness: 0.28,
          bumpMap: steelTex,
          bumpScale: 0.0025,
        });

    const knurledSteelMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#22252A'),
      metalness: 0.76,
      roughness: 0.62,
      bumpMap: knurlTex,
      bumpScale: 0.014,
      roughnessMap: knurlTex,
    });

    const machinedChromeMat = usePhysicalMaterials
      ? new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#9EA4AE'),
          metalness: 0.96,
          roughness: 0.16,
          clearcoat: 0.35,
          clearcoatRoughness: 0.15,
          bumpMap: steelTex,
          bumpScale: 0.003,
        })
      : new THREE.MeshStandardMaterial({
          color: new THREE.Color('#A6ACB6'),
          metalness: 0.94,
          roughness: 0.18,
          bumpMap: steelTex,
          bumpScale: 0.003,
        });

    const sleeveSteelMat = usePhysicalMaterials
      ? new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#4A4F59'),
          metalness: 0.94,
          roughness: 0.24,
          bumpMap: steelTex,
          bumpScale: 0.006,
        })
      : new THREE.MeshStandardMaterial({
          color: new THREE.Color('#4E5460'),
          metalness: 0.92,
          roughness: 0.24,
          bumpMap: steelTex,
          bumpScale: 0.006,
        });

    const matteIronPlateMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#181A1E'),
      metalness: 0.42,
      roughness: 0.64,
      bumpMap: steelTex,
      bumpScale: 0.003,
    });

    const forgeAccentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF4D1C'),
      emissive: new THREE.Color('#661805'),
      emissiveIntensity: 0.35,
      metalness: 0.35,
      roughness: 0.32,
    });

    const collarLockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2D3138'),
      metalness: 0.86,
      roughness: 0.32,
    });

    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.84,
      depthWrite: false,
    });

    const plateGeometries = PLATE_SPECS.map((spec) =>
      buildCalibratedPlateGeometry(
        spec.outerRadius,
        spec.thickness,
        spec.lipWidth,
        spec.recessDepth,
        radialSegments
      )
    );

    const shaftGeo = new THREE.CylinderGeometry(0.052, 0.052, 2.86, shaftSegments, 1);
    shaftGeo.rotateZ(Math.PI / 2);

    const centerKnurlGeo = new THREE.CylinderGeometry(0.0545, 0.0545, 0.36, shaftSegments, 1);
    centerKnurlGeo.rotateZ(Math.PI / 2);

    const gripKnurlGeo = new THREE.CylinderGeometry(0.0545, 0.0545, 0.72, shaftSegments, 1);
    gripKnurlGeo.rotateZ(Math.PI / 2);

    const gripRingGeo = new THREE.CylinderGeometry(0.056, 0.056, 0.022, shaftSegments, 1);
    gripRingGeo.rotateZ(Math.PI / 2);

    const innerFlangeGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.095, radialSegments, 1);
    innerFlangeGeo.rotateZ(Math.PI / 2);

    const sleeveGeo = new THREE.CylinderGeometry(0.092, 0.092, 0.96, radialSegments, 1);
    sleeveGeo.rotateZ(Math.PI / 2);

    const endCapGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.024, radialSegments, 1);
    endCapGeo.rotateZ(Math.PI / 2);

    const endAccentRingGeo = new THREE.TorusGeometry(
      0.072,
      0.0085,
      torusTubularSegments,
      radialSegments
    );
    endAccentRingGeo.rotateY(Math.PI / 2);

    const lockCollarGeo = new THREE.CylinderGeometry(0.142, 0.142, 0.085, radialSegments, 1);
    lockCollarGeo.rotateZ(Math.PI / 2);

    const lockLeverGeo = new THREE.BoxGeometry(0.055, 0.12, 0.036);

    const plateAccentRings = PLATE_SPECS.map((spec) => {
      const ring = new THREE.TorusGeometry(
        spec.outerRadius - 0.004,
        0.011,
        torusTubularSegments,
        radialSegments
      );
      ring.rotateY(Math.PI / 2);
      return ring;
    });

    const plateBushingGeo = new THREE.TorusGeometry(
      0.14,
      0.016,
      torusTubularSegments,
      bushingSegments
    );
    plateBushingGeo.rotateY(Math.PI / 2);

    const shadowPlaneGeo = new THREE.PlaneGeometry(5.6, 1.85);

    return {
      textures: [knurlTex, steelTex, shadowTex],
      materials: {
        darkOxideShaftMat,
        knurledSteelMat,
        machinedChromeMat,
        sleeveSteelMat,
        matteIronPlateMat,
        forgeAccentMat,
        collarLockMat,
        shadowPlaneMat,
      },
      geometries: {
        shaftGeo,
        centerKnurlGeo,
        gripKnurlGeo,
        gripRingGeo,
        innerFlangeGeo,
        sleeveGeo,
        endCapGeo,
        endAccentRingGeo,
        lockCollarGeo,
        lockLeverGeo,
        plateGeometries,
        plateAccentRings,
        plateBushingGeo,
        shadowPlaneGeo,
      },
    };
  }, [
    gl,
    radialSegments,
    shaftSegments,
    torusTubularSegments,
    bushingSegments,
    usePhysicalMaterials,
  ]);

  useEffect(() => {
    return () => {
      resources.textures.forEach((tex) => tex.dispose());
      Object.values(resources.materials).forEach((mat) => mat.dispose());
      resources.geometries.shaftGeo.dispose();
      resources.geometries.centerKnurlGeo.dispose();
      resources.geometries.gripKnurlGeo.dispose();
      resources.geometries.gripRingGeo.dispose();
      resources.geometries.innerFlangeGeo.dispose();
      resources.geometries.sleeveGeo.dispose();
      resources.geometries.endCapGeo.dispose();
      resources.geometries.endAccentRingGeo.dispose();
      resources.geometries.lockCollarGeo.dispose();
      resources.geometries.lockLeverGeo.dispose();
      resources.geometries.plateGeometries.forEach((g) => g.dispose());
      resources.geometries.plateAccentRings.forEach((g) => g.dispose());
      resources.geometries.plateBushingGeo.dispose();
      resources.geometries.shadowPlaneGeo.dispose();
    };
  }, [resources]);

  useFrame((_, rawDelta) => {
    if (!isInView) return;
    const group = groupRef.current;
    if (!group) return;

    const delta = Math.min(rawDelta, 0.1);
    elapsedRef.current += delta;

    const input = interactionRef.current;
    const target = computeBarbellPose({
      elapsedTime: elapsedRef.current,
      pointerX: input.pointerX,
      pointerY: input.pointerY,
      dragYaw: input.dragYaw,
      dragPitch: input.dragPitch,
      reducedMotion,
      animationIntensity,
    });
    const scrollOffsets = computeHeroScrollOffsets(
      scrollProgressRef.current,
      reducedMotion,
      animationIntensity
    );

    const dampLambda = input.isDragging ? 14 : 4.2;
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      target.rotX + scrollOffsets.barbellRotX,
      dampLambda,
      delta
    );
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      target.rotY + scrollOffsets.barbellRotY,
      dampLambda,
      delta
    );
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, target.rotZ, dampLambda, delta);
    group.position.x = THREE.MathUtils.damp(
      group.position.x,
      scrollOffsets.barbellPosX,
      3.4,
      delta
    );
    group.position.y = THREE.MathUtils.damp(
      group.position.y,
      target.posY + scrollOffsets.barbellPosY,
      3.6,
      delta
    );

    if (
      onPoseSample &&
      elapsedRef.current - lastSampleRef.current > 0.25 &&
      (Number.isNaN(lastSampledYawRef.current) ||
        Math.abs(group.rotation.y - lastSampledYawRef.current) > 0.015)
    ) {
      lastSampleRef.current = elapsedRef.current;
      lastSampledYawRef.current = group.rotation.y;
      onPoseSample(group.rotation.y);
    }
  });

  const { geometries, materials } = resources;

  return (
    <group>
      {/* Main Rotating Olympic Barbell Assembly */}
      <group
        ref={groupRef}
        rotation={[BASE_TILT_X, BASE_TILT_Y, BASE_TILT_Z]}
        position={[0, 0.08, 0]}
      >
        {/* Central Bar Shaft */}
        <mesh
          geometry={geometries.shaftGeo}
          material={materials.darkOxideShaftMat}
          castShadow={castShadows}
          receiveShadow={castShadows}
        />

        {/* Center Squat Knurling Band */}
        <mesh
          geometry={geometries.centerKnurlGeo}
          material={materials.knurledSteelMat}
          castShadow={castShadows}
        />

        {/* Left & Right Symmetrical Assemblies */}
        {([-1, 1] as const).map((side) => (
          <group key={side}>
            {/* Grip Knurling Band */}
            <mesh
              position={[side * 0.76, 0, 0]}
              geometry={geometries.gripKnurlGeo}
              material={materials.knurledSteelMat}
              castShadow={castShadows}
            />

            {/* Polished Chrome Competition Grip Marking Ring */}
            <mesh
              position={[side * 0.81, 0, 0]}
              geometry={geometries.gripRingGeo}
              material={materials.machinedChromeMat}
            />

            {/* Machined Inner Sleeve Flange / Shoulder */}
            <mesh
              position={[side * 1.47, 0, 0]}
              geometry={geometries.innerFlangeGeo}
              material={materials.machinedChromeMat}
              castShadow={castShadows}
              receiveShadow={castShadows}
            />

            {/* Rotating Olympic Sleeve */}
            <mesh
              position={[side * 1.98, 0, 0]}
              geometry={geometries.sleeveGeo}
              material={materials.sleeveSteelMat}
              castShadow={castShadows}
              receiveShadow={castShadows}
            />

            {/* Sleeve End Cap & Forge Accent Ring */}
            <mesh
              position={[side * 2.465, 0, 0]}
              geometry={geometries.endCapGeo}
              material={materials.machinedChromeMat}
            />
            <mesh
              position={[side * 2.478, 0, 0]}
              geometry={geometries.endAccentRingGeo}
              material={materials.forgeAccentMat}
            />

            {/* Calibrated Competition Weight Plates (25 kg, 20 kg, 10 kg) */}
            {PLATE_SPECS.map((spec, idx) => (
              <group key={spec.id} position={[side * spec.xOffset, 0, 0]}>
                <mesh
                  geometry={geometries.plateGeometries[idx]}
                  material={materials.matteIronPlateMat}
                  castShadow={castShadows}
                  receiveShadow={castShadows}
                />
                {/* Machined Chrome Center Hub Ring on Outer Face */}
                <mesh
                  position={[side * (spec.thickness * 0.5 - 0.012), 0, 0]}
                  geometry={geometries.plateBushingGeo}
                  material={materials.machinedChromeMat}
                />
                {/* Machined Chrome Outer Edge Rim or Forge-Orange Competition Band */}
                <mesh
                  geometry={geometries.plateAccentRings[idx]}
                  material={
                    spec.hasForgeAccent
                      ? materials.forgeAccentMat
                      : materials.machinedChromeMat
                  }
                />
              </group>
            ))}

            {/* Competition Clamping Lock Collar */}
            <group position={[side * 2.02, 0, 0]}>
              <mesh
                geometry={geometries.lockCollarGeo}
                material={materials.collarLockMat}
                castShadow={castShadows}
              />
              <mesh
                position={[0, 0.145, 0]}
                geometry={geometries.lockLeverGeo}
                material={materials.forgeAccentMat}
              />
            </group>
          </group>
        ))}
      </group>

      {/* Soft Studio Contact Shadow Plane (Single Draw Call Grounded Under-Shadow) */}
      <mesh
        position={[0, -1.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={geometries.shadowPlaneGeo}
        material={materials.shadowPlaneMat}
        receiveShadow={castShadows}
      />

      {/* Minimal Atmospheric Dust Motes (0 on mobile, scaled by tier) */}
      {particleCount > 0 && (
        <AtmosphericChalkMotes
          count={particleCount}
          reducedMotion={reducedMotion}
          isInView={isInView}
        />
      )}
    </group>
  );
});
