import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_TILT_X,
  BASE_TILT_Y,
  BASE_TILT_Z,
  clampDragPitch,
  computeBarbellPose,
  computeHeroScrollOffsets,
  getHeroCameraConfig,
  getHeroQualityProfile,
  normalizePointerOffset,
} from './barbellMath';

test('normalizePointerOffset maps container coordinates into [-1, 1] and clamps out-of-bounds', () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 };
  assert.deepEqual(normalizePointerOffset(300, 150, rect), { x: 0, y: 0 });
  assert.deepEqual(normalizePointerOffset(100, 50, rect), { x: -1, y: -1 });
  assert.deepEqual(normalizePointerOffset(999, -50, rect), { x: 1, y: -1 });
  assert.deepEqual(normalizePointerOffset(200, 100, { left: 0, top: 0, width: 0, height: 0 }), {
    x: 0,
    y: 0,
  });
});

test('computeBarbellPose applies slow continuous rotation, hover tilt, and drag offsets', () => {
  const t0 = computeBarbellPose({
    elapsedTime: 0,
    pointerX: 0,
    pointerY: 0,
    dragYaw: 0,
    dragPitch: 0,
    reducedMotion: false,
  });
  const t2 = computeBarbellPose({
    elapsedTime: 2,
    pointerX: 1,
    pointerY: -1,
    dragYaw: 0.5,
    dragPitch: 0.2,
    reducedMotion: false,
  });

  assert.equal(t0.rotY, BASE_TILT_Y);
  assert.ok(t2.rotY > t0.rotY + 0.48);
  assert.ok(t2.rotX > BASE_TILT_X);
  assert.notEqual(t2.posY, t0.posY);
});

test('computeBarbellPose scales idle motion down when mobile animationIntensity is lower', () => {
  const full = computeBarbellPose({
    elapsedTime: 3,
    pointerX: 0,
    pointerY: 0,
    dragYaw: 0,
    dragPitch: 0,
    reducedMotion: false,
    animationIntensity: 1,
  });
  const mobile = computeBarbellPose({
    elapsedTime: 3,
    pointerX: 0,
    pointerY: 0,
    dragYaw: 0,
    dragPitch: 0,
    reducedMotion: false,
    animationIntensity: 0.55,
  });

  assert.ok(mobile.rotY - BASE_TILT_Y < full.rotY - BASE_TILT_Y);
  assert.ok(Math.abs(mobile.posY - 0.08) < Math.abs(full.posY - 0.08));
});

test('computeBarbellPose pauses continuous rotation and bob when reducedMotion is enabled', () => {
  const pose = computeBarbellPose({
    elapsedTime: 10,
    pointerX: 0,
    pointerY: 0,
    dragYaw: 0.3,
    dragPitch: 0,
    reducedMotion: true,
  });
  assert.equal(pose.rotY, BASE_TILT_Y + 0.3);
  assert.equal(pose.rotZ, BASE_TILT_Z);
  assert.equal(pose.posY, 0.08);
});

test('clampDragPitch keeps vertical pitch within ergonomic viewing limits', () => {
  assert.equal(clampDragPitch(2), 0.55);
  assert.equal(clampDragPitch(-2), -0.55);
  assert.equal(clampDragPitch(0.25), 0.25);
});

test('getHeroCameraConfig adapts cleanly across 375, 768, 1024, and 1440px viewports', () => {
  const smallMobile = getHeroCameraConfig(375);
  const mobile = getHeroCameraConfig(430);
  const compactDesktop = getHeroCameraConfig(1024);
  const desktop = getHeroCameraConfig(1440);
  assert.equal(smallMobile.isMobile, true);
  assert.equal(mobile.isMobile, true);
  assert.equal(compactDesktop.isMobile, false);
  assert.equal(desktop.isMobile, false);
  assert.ok(smallMobile.position[2] > mobile.position[2]);
  assert.ok(mobile.position[2] > desktop.position[2]);
  assert.ok(compactDesktop.position[2] > desktop.position[2]);
});

test('getHeroQualityProfile reduces geometry, particles, DPR, and animation intensity on mobile', () => {
  const mobile = getHeroQualityProfile(390);
  const tablet = getHeroQualityProfile(768);
  const desktop = getHeroQualityProfile(1440);

  assert.equal(mobile.particleCount, 0);
  assert.ok(tablet.particleCount < desktop.particleCount);
  assert.ok(mobile.radialSegments < desktop.radialSegments);
  assert.ok(mobile.maxDpr < desktop.maxDpr);
  assert.equal(mobile.enableShadows, false);
  assert.equal(mobile.usePhysicalMaterials, false);
  assert.ok(mobile.animationIntensity < desktop.animationIntensity);
});

test('computeHeroScrollOffsets interpolates subtly across [0, 1], scales on mobile, and zeroes out for reducedMotion', () => {
  const atStart = computeHeroScrollOffsets(0, false);
  const atMid = computeHeroScrollOffsets(0.5, false);
  const atEnd = computeHeroScrollOffsets(1, false);
  const mobileEnd = computeHeroScrollOffsets(1, false, 0.55);
  const overEnd = computeHeroScrollOffsets(2.5, false);
  const reduced = computeHeroScrollOffsets(0.8, true);

  assert.equal(atStart.barbellRotY, 0);
  assert.equal(atStart.cameraPosZ, 0);
  assert.ok(atMid.barbellRotY > 0 && atMid.barbellRotY < atEnd.barbellRotY);
  assert.ok(atMid.cameraPosZ > 0 && atMid.cameraPosZ < atEnd.cameraPosZ);
  assert.ok(mobileEnd.barbellRotY < atEnd.barbellRotY);
  assert.deepEqual(overEnd, atEnd);
  assert.deepEqual(reduced, atStart);
});
