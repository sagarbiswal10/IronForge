import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NAVBAR_HEIGHT_PX,
  computeScrollTargetTop,
  resolveActiveSection,
  type SectionLayoutMetric,
} from './navigation';

const MOCK_SECTIONS: SectionLayoutMetric[] = [
  { id: 'home', top: 0, height: 800 },
  { id: 'about', top: 800, height: 700 },
  { id: 'programs', top: 1500, height: 800 },
  { id: 'equipment', top: 2300, height: 900 },
  { id: 'membership', top: 3200, height: 800 },
  { id: 'trainers', top: 4000, height: 750 },
  { id: 'contact', top: 4750, height: 850 },
];

const DOCUMENT_HEIGHT = 6200; // Includes Final CTA Banner + Footer
const VIEWPORT_HEIGHT = 900;

test('computeScrollTargetTop returns 0 for home regardless of offset', () => {
  assert.equal(computeScrollTargetTop('home', 72), 0);
  assert.equal(computeScrollTargetTop('home', 0), 0);
});

test('computeScrollTargetTop subtracts navbar height and clamps at zero', () => {
  assert.equal(computeScrollTargetTop('about', 800), 800 - NAVBAR_HEIGHT_PX);
  assert.equal(computeScrollTargetTop('programs', 1500, 72), 1428);
  assert.equal(computeScrollTargetTop('about', 40, 72), 0);
});

test('resolveActiveSection highlights home at the top of the page', () => {
  assert.equal(
    resolveActiveSection(MOCK_SECTIONS, 0, VIEWPORT_HEIGHT, DOCUMENT_HEIGHT),
    'home',
  );
  assert.equal(
    resolveActiveSection(MOCK_SECTIONS, 20, VIEWPORT_HEIGHT, DOCUMENT_HEIGHT),
    'home',
  );
});

test('resolveActiveSection tracks each section accurately while scrolling down', () => {
  assert.equal(
    resolveActiveSection(MOCK_SECTIONS, 728, VIEWPORT_HEIGHT, DOCUMENT_HEIGHT),
    'about',
  );
  assert.equal(
    resolveActiveSection(MOCK_SECTIONS, 1428, VIEWPORT_HEIGHT, DOCUMENT_HEIGHT),
    'programs',
  );
  assert.equal(
    resolveActiveSection(MOCK_SECTIONS, 2228, VIEWPORT_HEIGHT, DOCUMENT_HEIGHT),
    'equipment',
  );
  assert.equal(
    resolveActiveSection(MOCK_SECTIONS, 3128, VIEWPORT_HEIGHT, DOCUMENT_HEIGHT),
    'membership',
  );
  assert.equal(
    resolveActiveSection(MOCK_SECTIONS, 3928, VIEWPORT_HEIGHT, DOCUMENT_HEIGHT),
    'trainers',
  );
  assert.equal(
    resolveActiveSection(MOCK_SECTIONS, 4678, VIEWPORT_HEIGHT, DOCUMENT_HEIGHT),
    'contact',
  );
});

test('resolveActiveSection highlights the last section near document bottom', () => {
  assert.equal(
    resolveActiveSection(
      MOCK_SECTIONS,
      DOCUMENT_HEIGHT - VIEWPORT_HEIGHT,
      VIEWPORT_HEIGHT,
      DOCUMENT_HEIGHT,
    ),
    'contact',
  );
});
