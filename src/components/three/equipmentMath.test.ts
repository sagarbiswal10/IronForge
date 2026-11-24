import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeEquipmentTargetState,
  getEquipmentCameraConfig,
  mapSpecIdToEquipmentKind,
  nextEquipmentTapSpin,
  type EquipmentKind,
} from './equipmentMath';

const KINDS: EquipmentKind[] = ['squat-rack', 'olympic-barbell', 'dumbbell'];

test('computeEquipmentTargetState elevates scale, yaw, and lighting subtly on hover', () => {
  for (const kind of KINDS) {
    const rest = computeEquipmentTargetState(kind, {
      isHovered: false,
      isActive: false,
      pointerX: 0,
      pointerY: 0,
      tapSpinRad: 0,
      hoverElapsed: 0,
      reducedMotion: false,
    });
    const hovered = computeEquipmentTargetState(kind, {
      isHovered: true,
      isActive: false,
      pointerX: 0.5,
      pointerY: -0.4,
      tapSpinRad: 0,
      hoverElapsed: 1.2,
      reducedMotion: false,
    });

    assert.equal(rest.scale, 1);
    assert.ok(hovered.scale > 1.03 && hovered.scale < 1.1);
    assert.ok(hovered.rotY > rest.rotY);
    assert.ok(hovered.rimIntensity > rest.rimIntensity);
    assert.ok(hovered.keyIntensity > rest.keyIntensity);
    assert.ok(hovered.emberIntensity > rest.emberIntensity);
  }
});

test('computeEquipmentTargetState respects reducedMotion while preserving lighting highlight', () => {
  const rest = computeEquipmentTargetState('dumbbell', {
    isHovered: false,
    isActive: false,
    pointerX: 0,
    pointerY: 0,
    tapSpinRad: 0,
    hoverElapsed: 0,
    reducedMotion: true,
  });
  const hovered = computeEquipmentTargetState('dumbbell', {
    isHovered: true,
    isActive: false,
    pointerX: 1,
    pointerY: 1,
    tapSpinRad: 0,
    hoverElapsed: 4,
    reducedMotion: true,
  });

  assert.equal(hovered.rotX, rest.rotX);
  assert.equal(hovered.rotY, rest.rotY);
  assert.ok(hovered.scale <= 1.02);
  assert.ok(hovered.rimIntensity > rest.rimIntensity);
});

test('nextEquipmentTapSpin advances angle cleanly in 60-degree increments', () => {
  const step1 = nextEquipmentTapSpin(0);
  const step2 = nextEquipmentTapSpin(step1);
  assert.ok(Math.abs(step1 - Math.PI / 3) < 1e-6);
  assert.ok(Math.abs(step2 - (2 * Math.PI) / 3) < 1e-6);
});

test('getEquipmentCameraConfig pulls camera back slightly on mobile for every equipment piece', () => {
  for (const kind of KINDS) {
    const desktop = getEquipmentCameraConfig(kind, false);
    const mobile = getEquipmentCameraConfig(kind, true);
    assert.ok(mobile.position[2] > desktop.position[2]);
  }
});

test('mapSpecIdToEquipmentKind links inventory rows to corresponding 3D equipment cards', () => {
  assert.equal(mapSpecIdToEquipmentKind('racks'), 'squat-rack');
  assert.equal(mapSpecIdToEquipmentKind('plates'), 'olympic-barbell');
  assert.equal(mapSpecIdToEquipmentKind('dumbbells'), 'dumbbell');
  assert.equal(mapSpecIdToEquipmentKind('machines'), null);
  assert.equal(mapSpecIdToEquipmentKind(null), null);
});
