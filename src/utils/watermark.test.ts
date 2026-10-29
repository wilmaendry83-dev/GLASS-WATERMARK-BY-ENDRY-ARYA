import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatExifString,
  calculateWatermarkBounds,
  formatXiaomiDate,
  clamp
} from './watermark.ts';

test('formatExifString formats camera parameters accurately', () => {
  const result = formatExifString({
    focalLength: 26,
    fNumber: 1.8,
    exposureTime: 1 / 15,
    iso: 1432,
  });
  assert.equal(result, '26mm f/1.8 1/15s ISO1432');
});

test('formatExifString handles partial or string values gracefully', () => {
  const result = formatExifString({
    focalLength: '50mm',
    fNumber: 'f/1.4',
    iso: 'ISO800',
  });
  assert.equal(result, '50mm f/1.4 ISO800');
});

test('formatXiaomiDate formats date with zero-padding', () => {
  const d = new Date(2026, 9, 28, 10, 14); // Note: month 9 is October (0-indexed)
  assert.equal(formatXiaomiDate(d), '2026.10.28 10:14');
});

test('calculateWatermarkBounds computes correct bounding box', () => {
  const bounds = calculateWatermarkBounds(1000, 1500, 96, 100, 10);
  assert.ok(bounds.width > 0);
  assert.ok(bounds.height > 0);
  assert.ok(bounds.x >= 0);
  assert.ok(bounds.y < 1500);
});

test('clamp restricts number to range', () => {
  assert.equal(clamp(150, 0, 100), 100);
  assert.equal(clamp(-10, 0, 100), 0);
  assert.equal(clamp(45, 0, 100), 45);
});
