import { memo, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createBrushedSteelTexture,
  createKnurlingTexture,
  createSoftShadowTexture,
} from './proceduralTextures';
import type { EquipmentKind } from './equipmentMath';

interface EquipmentModelProps {
  kind: EquipmentKind;
  isMobile: boolean;
}

interface EquipmentMaterials {
  knurledSteel: THREE.MeshStandardMaterial;
  polishedChrome: THREE.MeshStandardMaterial;
  matteBlackSteel: THREE.MeshStandardMaterial;
  forgedIron: THREE.MeshStandardMaterial;
  forgeAccent: THREE.MeshStandardMaterial;
  rubberMatte: THREE.MeshStandardMaterial;
  shadowPlane: THREE.MeshBasicMaterial;
  dispose: () => void;
}

function useEquipmentMaterials(isMobile: boolean): EquipmentMaterials {
  const { gl } = useThree();

  const bundle = useMemo<EquipmentMaterials>(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    // Skip micro-bump procedural textures on mobile to reduce VRAM & fragment lookups
    const knurlTex = isMobile ? null : createKnurlingTexture(maxAniso);
    const brushedTex = isMobile ? null : createBrushedSteelTexture(maxAniso);
    const shadowTex = createSoftShadowTexture();

    const knurledSteel = new THREE.MeshStandardMaterial({
      color: '#2c3037',
      metalness: 0.88,
      roughness: 0.36,
      ...(knurlTex ? { bumpMap: knurlTex, bumpScale: 0.015 } : {}),
    });

    const polishedChrome = new THREE.MeshStandardMaterial({
      color: '#c8cfd8',
      metalness: 0.95,
      roughness: 0.18,
      ...(brushedTex ? { bumpMap: brushedTex, bumpScale: 0.005 } : {}),
    });

    const matteBlackSteel = new THREE.MeshStandardMaterial({
      color: '#191b1f',
      metalness: 0.52,
      roughness: 0.62,
    });

    const forgedIron = new THREE.MeshStandardMaterial({
      color: '#1f2126',
      metalness: 0.72,
      roughness: 0.44,
      ...(brushedTex ? { bumpMap: brushedTex, bumpScale: 0.004 } : {}),
    });

    const forgeAccent = new THREE.MeshStandardMaterial({
      color: '#FF4D1C',
      metalness: 0.35,
      roughness: 0.38,
      emissive: '#591606',
      emissiveIntensity: 0.45,
    });

    const rubberMatte = new THREE.MeshStandardMaterial({
      color: '#101113',
      metalness: 0.06,
      roughness: 0.88,
    });

    const shadowPlane = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
    });

    return {
      knurledSteel,
      polishedChrome,
      matteBlackSteel,
      forgedIron,
      forgeAccent,
      rubberMatte,
      shadowPlane,
      dispose: () => {
        knurlTex?.dispose();
        brushedTex?.dispose();
        shadowTex.dispose();
        knurledSteel.dispose();
        polishedChrome.dispose();
        matteBlackSteel.dispose();
        forgedIron.dispose();
        forgeAccent.dispose();
        rubberMatte.dispose();
        shadowPlane.dispose();
      },
    };
  }, [gl, isMobile]);

  useEffect(() => {
    return () => bundle.dispose();
  }, [bundle]);

  return bundle;
}

const RACK_X_POST = 0.82;
const RACK_Z_FRONT = 0.56;
const RACK_Z_BACK = -0.56;
const RACK_BASE_Y = -1.04;
const RACK_HEIGHT = 2.16;
const RACK_TOP_Y = RACK_BASE_Y + RACK_HEIGHT;
const RACK_UPRIGHT_CENTER_Y = RACK_BASE_Y + RACK_HEIGHT * 0.5;
const RACK_UPRIGHTS: ReadonlyArray<readonly [number, number, boolean]> = [
  [-RACK_X_POST, RACK_Z_FRONT, true],
  [RACK_X_POST, RACK_Z_FRONT, true],
  [-RACK_X_POST, RACK_Z_BACK, false],
  [RACK_X_POST, RACK_Z_BACK, false],
];

/**
 * 1. Competition Squat / Power Rack with shared, explicitly disposed BufferGeometries.
 */
const SquatRackGeometry = memo(function SquatRackGeometry({
  materials,
  isMobile,
}: {
  materials: EquipmentMaterials;
  isMobile: boolean;
}) {
  const geos = useMemo(() => {
    const seg = isMobile ? 10 : 16;
    const plateSeg = seg + 4;

    const skid = new THREE.BoxGeometry(0.11, 0.08, 1.48);
    const rubberFoot = new THREE.BoxGeometry(0.14, 0.025, 0.2);
    const rearStabilizer = new THREE.BoxGeometry(RACK_X_POST * 2 + 0.1, 0.08, 0.1);
    const upright = new THREE.BoxGeometry(0.095, RACK_HEIGHT, 0.095);
    const indexTrim = new THREE.BoxGeometry(0.018, RACK_HEIGHT - 0.22, 0.008);
    const topSideCross = new THREE.BoxGeometry(0.095, 0.095, 1.22);
    const topRearBeam = new THREE.BoxGeometry(RACK_X_POST * 2 + 0.08, 0.11, 0.095);
    const headerAccent = new THREE.BoxGeometry(0.64, 0.028, 0.012);
    const pullupBar = new THREE.CylinderGeometry(0.028, 0.028, RACK_X_POST * 2, seg);
    const safetyBar = new THREE.BoxGeometry(0.055, 0.065, 1.12);
    const jcupBody = new THREE.BoxGeometry(0.11, 0.14, 0.12);
    const jcupLiner = new THREE.BoxGeometry(0.095, 0.032, 0.085);
    const jcupLip = new THREE.BoxGeometry(0.11, 0.08, 0.025);
    const rackedShaft = new THREE.CylinderGeometry(0.022, 0.022, 1.98, seg);
    const rackedSleeve = new THREE.CylinderGeometry(0.038, 0.038, 0.42, seg);
    const rackedFlange = new THREE.CylinderGeometry(0.052, 0.052, 0.038, seg);
    const storagePeg = new THREE.CylinderGeometry(0.024, 0.024, 0.26, seg);
    const storagePlateBig = new THREE.CylinderGeometry(0.28, 0.28, 0.055, plateSeg);
    const storagePlateSmall = new THREE.CylinderGeometry(0.23, 0.23, 0.048, plateSeg);
    const storageRing = new THREE.TorusGeometry(0.282, 0.008, 6, plateSeg);
    const shadow = new THREE.PlaneGeometry(2.9, 2.2);

    const all: THREE.BufferGeometry[] = [
      skid,
      rubberFoot,
      rearStabilizer,
      upright,
      indexTrim,
      topSideCross,
      topRearBeam,
      headerAccent,
      pullupBar,
      safetyBar,
      jcupBody,
      jcupLiner,
      jcupLip,
      rackedShaft,
      rackedSleeve,
      rackedFlange,
      storagePeg,
      storagePlateBig,
      storagePlateSmall,
      storageRing,
      shadow,
    ];

    return {
      skid,
      rubberFoot,
      rearStabilizer,
      upright,
      indexTrim,
      topSideCross,
      topRearBeam,
      headerAccent,
      pullupBar,
      safetyBar,
      jcupBody,
      jcupLiner,
      jcupLip,
      rackedShaft,
      rackedSleeve,
      rackedFlange,
      storagePeg,
      storagePlateBig,
      storagePlateSmall,
      storageRing,
      shadow,
      dispose: () => all.forEach((g) => g.dispose()),
    };
  }, [isMobile]);

  useEffect(() => {
    return () => geos.dispose();
  }, [geos]);

  return (
    <group>
      {/* Floor Base Skids & Rubber Feet */}
      {([-RACK_X_POST, RACK_X_POST] as const).map((x) => (
        <group key={`skid-${x}`} position={[x, RACK_BASE_Y + 0.04, 0]}>
          <mesh geometry={geos.skid} material={materials.matteBlackSteel} />
          <mesh position={[0, -0.045, 0.62]} geometry={geos.rubberFoot} material={materials.rubberMatte} />
          <mesh position={[0, -0.045, -0.62]} geometry={geos.rubberFoot} material={materials.rubberMatte} />
        </group>
      ))}

      {/* Rear Floor Stabilizer Beam */}
      <mesh
        position={[0, RACK_BASE_Y + 0.04, RACK_Z_BACK]}
        geometry={geos.rearStabilizer}
        material={materials.matteBlackSteel}
      />

      {/* Four 3x3" Structural Steel Uprights + Brushed Index Trim on Front Posts */}
      {RACK_UPRIGHTS.map(([x, z, isFront], i) => (
        <group key={`upright-${i}`} position={[x, RACK_UPRIGHT_CENTER_Y, z]}>
          <mesh geometry={geos.upright} material={materials.matteBlackSteel} />
          {isFront && (
            <mesh position={[0, 0, 0.05]} geometry={geos.indexTrim} material={materials.polishedChrome} />
          )}
        </group>
      ))}

      {/* Upper Side Crossmembers & Rear Top Beam */}
      {([-RACK_X_POST, RACK_X_POST] as const).map((x) => (
        <mesh
          key={`top-side-${x}`}
          position={[x, RACK_TOP_Y - 0.05, 0]}
          geometry={geos.topSideCross}
          material={materials.matteBlackSteel}
        />
      ))}
      <mesh
        position={[0, RACK_TOP_Y - 0.05, RACK_Z_BACK]}
        geometry={geos.topRearBeam}
        material={materials.matteBlackSteel}
      />
      <mesh
        position={[0, RACK_TOP_Y - 0.05, RACK_Z_BACK + 0.052]}
        geometry={geos.headerAccent}
        material={materials.forgeAccent}
      />

      {/* Top Front Knurled Pull-Up Bar */}
      <mesh
        position={[0, RACK_TOP_Y - 0.05, RACK_Z_FRONT]}
        rotation={[0, 0, Math.PI / 2]}
        geometry={geos.pullupBar}
        material={materials.knurledSteel}
      />

      {/* Mid-Height Steel Safety Spotter Bars */}
      {([-RACK_X_POST, RACK_X_POST] as const).map((x) => (
        <mesh
          key={`safety-${x}`}
          position={[x, -0.34, 0]}
          geometry={geos.safetyBar}
          material={materials.forgedIron}
        />
      ))}

      {/* Competition J-Cups with Forge-Orange UHMW Liners */}
      {([-RACK_X_POST, RACK_X_POST] as const).map((x) => (
        <group key={`jcup-${x}`} position={[x, 0.34, RACK_Z_FRONT + 0.08]}>
          <mesh geometry={geos.jcupBody} material={materials.forgedIron} />
          <mesh position={[0, -0.02, 0.04]} geometry={geos.jcupLiner} material={materials.forgeAccent} />
          <mesh position={[0, 0.02, 0.075]} geometry={geos.jcupLip} material={materials.forgedIron} />
        </group>
      ))}

      {/* Racked Competition Barbell Across Front J-Cups */}
      <group position={[0, 0.38, RACK_Z_FRONT + 0.1]}>
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          geometry={geos.rackedShaft}
          material={materials.knurledSteel}
        />
        {([-1, 1] as const).map((side) => (
          <group key={`rack-bar-${side}`} position={[side * 1.18, 0, 0]}>
            <mesh
              rotation={[0, 0, Math.PI / 2]}
              geometry={geos.rackedSleeve}
              material={materials.polishedChrome}
            />
            <mesh
              position={[-side * 0.21, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
              geometry={geos.rackedFlange}
              material={materials.polishedChrome}
            />
          </group>
        ))}
      </group>

      {/* Rear Storage Weight Pegs + Stacked Plates */}
      {([-1, 1] as const).map((side) => (
        <group key={`storage-${side}`} position={[side * (RACK_X_POST + 0.12), -0.58, RACK_Z_BACK]}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            geometry={geos.storagePeg}
            material={materials.polishedChrome}
          />
          <mesh
            position={[-side * 0.03, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            geometry={geos.storagePlateBig}
            material={materials.forgedIron}
          />
          <mesh
            position={[side * 0.04, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            geometry={geos.storagePlateSmall}
            material={materials.forgedIron}
          />
          <mesh
            position={[-side * 0.03, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            geometry={geos.storageRing}
            material={materials.forgeAccent}
          />
        </group>
      ))}

      {/* Soft Contact Shadow Grounding Plane */}
      <mesh
        position={[0, RACK_BASE_Y - 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={geos.shadow}
        material={materials.shadowPlane}
      />
    </group>
  );
});

const BARBELL_PLATES = [
  { offset: 1.44, radius: 0.72, thickness: 0.095, accent: true },
  { offset: 1.56, radius: 0.65, thickness: 0.08, accent: false },
  { offset: 1.66, radius: 0.52, thickness: 0.068, accent: false },
] as const;

/**
 * 2. Olympic Barbell with shared, explicitly disposed BufferGeometries.
 */
const EquipmentBarbellGeometry = memo(function EquipmentBarbellGeometry({
  materials,
  isMobile,
}: {
  materials: EquipmentMaterials;
  isMobile: boolean;
}) {
  const geos = useMemo(() => {
    const seg = isMobile ? 12 : 20;
    const plateSeg = seg + 4;

    const shaft = new THREE.CylinderGeometry(0.048, 0.048, 2.54, seg);
    const gripRing = new THREE.CylinderGeometry(0.05, 0.05, 0.03, seg);
    const flange = new THREE.CylinderGeometry(0.105, 0.105, 0.085, seg);
    const sleeve = new THREE.CylinderGeometry(0.075, 0.075, 0.8, seg);
    const collar = new THREE.CylinderGeometry(0.115, 0.115, 0.09, seg);
    const collarLatch = new THREE.BoxGeometry(0.055, 0.045, 0.045);
    const shadow = new THREE.PlaneGeometry(4.4, 1.4);

    const plateDiscs = BARBELL_PLATES.map(
      (p) => new THREE.CylinderGeometry(p.radius, p.radius, p.thickness, plateSeg)
    );
    const plateLips = BARBELL_PLATES.map(
      (p) => new THREE.TorusGeometry(p.radius - 0.015, 0.022, 6, plateSeg)
    );
    const accentRing = new THREE.TorusGeometry(BARBELL_PLATES[0].radius + 0.005, 0.013, 6, plateSeg);

    const all: THREE.BufferGeometry[] = [
      shaft,
      gripRing,
      flange,
      sleeve,
      collar,
      collarLatch,
      shadow,
      accentRing,
      ...plateDiscs,
      ...plateLips,
    ];

    return {
      shaft,
      gripRing,
      flange,
      sleeve,
      collar,
      collarLatch,
      shadow,
      plateDiscs,
      plateLips,
      accentRing,
      dispose: () => all.forEach((g) => g.dispose()),
    };
  }, [isMobile]);

  useEffect(() => {
    return () => geos.dispose();
  }, [geos]);

  return (
    <group>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        geometry={geos.shaft}
        material={materials.knurledSteel}
      />

      {([-0.72, 0.72] as const).map((x) => (
        <mesh
          key={`grip-ring-${x}`}
          position={[x, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          geometry={geos.gripRing}
          material={materials.polishedChrome}
        />
      ))}

      {([-1, 1] as const).map((side) => (
        <group key={`bar-side-${side}`}>
          <mesh
            position={[side * 1.29, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            geometry={geos.flange}
            material={materials.polishedChrome}
          />
          <mesh
            position={[side * 1.72, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            geometry={geos.sleeve}
            material={materials.polishedChrome}
          />

          {BARBELL_PLATES.map((plate, idx) => (
            <group key={`disc-${side}-${idx}`} position={[side * plate.offset, 0, 0]}>
              <mesh
                rotation={[0, 0, Math.PI / 2]}
                geometry={geos.plateDiscs[idx]}
                material={materials.forgedIron}
              />
              <mesh
                rotation={[0, Math.PI / 2, 0]}
                geometry={geos.plateLips[idx]}
                material={materials.matteBlackSteel}
              />
              {plate.accent && (
                <mesh
                  rotation={[0, Math.PI / 2, 0]}
                  geometry={geos.accentRing}
                  material={materials.forgeAccent}
                />
              )}
            </group>
          ))}

          <group position={[side * 1.78, 0, 0]}>
            <mesh
              rotation={[0, 0, Math.PI / 2]}
              geometry={geos.collar}
              material={materials.matteBlackSteel}
            />
            <mesh
              position={[0, 0.11, 0]}
              geometry={geos.collarLatch}
              material={materials.forgeAccent}
            />
          </group>
        </group>
      ))}

      <mesh
        position={[0, -0.92, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={geos.shadow}
        material={materials.shadowPlane}
      />
    </group>
  );
});

/**
 * 3. Heavy Competition Pro-Style Solid Steel Dumbbell with shared, disposed BufferGeometries.
 */
const DumbbellGeometry = memo(function DumbbellGeometry({
  materials,
  isMobile,
}: {
  materials: EquipmentMaterials;
  isMobile: boolean;
}) {
  const geos = useMemo(() => {
    const seg = isMobile ? 10 : 18;

    const grip = new THREE.CylinderGeometry(0.095, 0.095, 0.92, seg);
    const flange = new THREE.CylinderGeometry(0.13, 0.105, 0.16, seg);
    const calibRing = new THREE.TorusGeometry(0.32, 0.018, 6, seg);
    const innerBevelPos = new THREE.CylinderGeometry(0.44, 0.56, 0.12, 8);
    const innerBevelNeg = new THREE.CylinderGeometry(0.56, 0.44, 0.12, 8);
    const octHead = new THREE.CylinderGeometry(0.56, 0.56, 0.34, 8);
    const outerBevelPos = new THREE.CylinderGeometry(0.56, 0.42, 0.11, 8);
    const outerBevelNeg = new THREE.CylinderGeometry(0.42, 0.56, 0.11, 8);
    const endCap = new THREE.CylinderGeometry(0.31, 0.31, 0.025, seg);
    const centerBolt = new THREE.CylinderGeometry(0.11, 0.11, 0.024, 6);
    const shadow = new THREE.PlaneGeometry(2.9, 1.35);

    const all: THREE.BufferGeometry[] = [
      grip,
      flange,
      calibRing,
      innerBevelPos,
      innerBevelNeg,
      octHead,
      outerBevelPos,
      outerBevelNeg,
      endCap,
      centerBolt,
      shadow,
    ];

    return {
      grip,
      flange,
      calibRing,
      innerBevelPos,
      innerBevelNeg,
      octHead,
      outerBevelPos,
      outerBevelNeg,
      endCap,
      centerBolt,
      shadow,
      dispose: () => all.forEach((g) => g.dispose()),
    };
  }, [isMobile]);

  useEffect(() => {
    return () => geos.dispose();
  }, [geos]);

  return (
    <group>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        geometry={geos.grip}
        material={materials.knurledSteel}
      />

      {([-1, 1] as const).map((side) => (
        <group key={`db-side-${side}`}>
          <mesh
            position={[side * 0.53, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            geometry={geos.flange}
            material={materials.polishedChrome}
          />
          <mesh
            position={[side * 0.62, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            geometry={geos.calibRing}
            material={materials.forgeAccent}
          />
          <mesh
            position={[side * 0.68, 0, 0]}
            rotation={[Math.PI / 8, 0, Math.PI / 2]}
            geometry={side === 1 ? geos.innerBevelPos : geos.innerBevelNeg}
            material={materials.forgedIron}
          />
          <mesh
            position={[side * 0.9, 0, 0]}
            rotation={[Math.PI / 8, 0, Math.PI / 2]}
            geometry={geos.octHead}
            material={materials.forgedIron}
          />
          <mesh
            position={[side * 1.12, 0, 0]}
            rotation={[Math.PI / 8, 0, Math.PI / 2]}
            geometry={side === 1 ? geos.outerBevelPos : geos.outerBevelNeg}
            material={materials.matteBlackSteel}
          />
          <mesh
            position={[side * 1.18, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            geometry={geos.endCap}
            material={materials.rubberMatte}
          />
          <mesh
            position={[side * 1.2, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            geometry={geos.centerBolt}
            material={materials.polishedChrome}
          />
        </group>
      ))}

      <mesh
        position={[0, -0.78, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={geos.shadow}
        material={materials.shadowPlane}
      />
    </group>
  );
});

export const EquipmentModel = memo(function EquipmentModel({
  kind,
  isMobile,
}: EquipmentModelProps) {
  const materials = useEquipmentMaterials(isMobile);

  switch (kind) {
    case 'squat-rack':
      return <SquatRackGeometry materials={materials} isMobile={isMobile} />;
    case 'olympic-barbell':
      return <EquipmentBarbellGeometry materials={materials} isMobile={isMobile} />;
    case 'dumbbell':
      return <DumbbellGeometry materials={materials} isMobile={isMobile} />;
  }
});
