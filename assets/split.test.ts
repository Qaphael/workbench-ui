/**
 * Unit tests for the pure split-pane maths.
 *
 * These run in Node in milliseconds. The alternative — testing resize
 * behaviour through a browser — is slow, flaky, and tells you less. Keep the
 * maths out of the DOM and it stays testable forever.
 */

import { describe, expect, it } from 'vitest';
import {
  clampSize,
  separatorAria,
  sizeFromKeyboard,
  sizeFromPointer,
  KEYBOARD_STEP,
  KEYBOARD_STEP_LARGE,
  type SplitGeometry,
} from './split';

const bounds = { min: 280, max: 520 };

/** A vertical splitter whose controlled pane is to the right of the handle. */
const rightPane: SplitGeometry = { orientation: 'vertical', direction: -1, bounds };
/** A vertical splitter whose controlled pane is to the left of the handle. */
const leftPane: SplitGeometry = { orientation: 'vertical', direction: 1, bounds };

describe('clampSize', () => {
  it('keeps a value inside the bounds', () => {
    expect(clampSize(320, bounds)).toBe(320);
    expect(clampSize(100, bounds)).toBe(280);
    expect(clampSize(900, bounds)).toBe(520);
  });

  it('rounds to whole pixels', () => {
    expect(clampSize(320.4, bounds)).toBe(320);
    expect(clampSize(320.6, bounds)).toBe(321);
  });

  it('falls back to the minimum for NaN', () => {
    expect(clampSize(Number.NaN, bounds)).toBe(280);
  });

  it('clamps infinities to the ends', () => {
    expect(clampSize(Number.POSITIVE_INFINITY, bounds)).toBe(520);
    expect(clampSize(Number.NEGATIVE_INFINITY, bounds)).toBe(280);
  });

  it('collapses an inverted range to the minimum', () => {
    expect(clampSize(400, { min: 300, max: 200 })).toBe(300);
  });
});

describe('sizeFromPointer', () => {
  it('grows the right-hand pane when the pointer moves left', () => {
    expect(sizeFromPointer(320, -30, rightPane)).toBe(350);
  });

  it('shrinks the right-hand pane when the pointer moves right', () => {
    expect(sizeFromPointer(320, 30, rightPane)).toBe(290);
  });

  it('grows the left-hand pane when the pointer moves right', () => {
    expect(sizeFromPointer(320, 30, leftPane)).toBe(350);
  });

  it('is measured from the gesture start, so a clamped drag returns exactly', () => {
    // Drag far past the maximum, then back: the result is the original size,
    // because every event is computed from the start, not the previous frame.
    const start = 320;
    const past = sizeFromPointer(start, -400, rightPane);
    expect(past).toBe(520);
    const back = sizeFromPointer(start, -400 + 400, rightPane);
    expect(back).toBe(start);
  });

  it('clamps at the bounds', () => {
    expect(sizeFromPointer(320, -1000, rightPane)).toBe(520);
    expect(sizeFromPointer(320, 1000, rightPane)).toBe(280);
  });

  it('ignores a NaN delta', () => {
    expect(sizeFromPointer(320, Number.NaN, rightPane)).toBe(320);
  });
});

describe('sizeFromKeyboard', () => {
  it('resizes with the arrow keys', () => {
    expect(sizeFromKeyboard(320, 'ArrowLeft', rightPane)).toBe(320 - KEYBOARD_STEP);
    expect(sizeFromKeyboard(320, 'ArrowRight', rightPane)).toBe(320 + KEYBOARD_STEP);
  });

  it('uses the larger step with Shift', () => {
    expect(sizeFromKeyboard(320, 'ArrowLeft', { ...rightPane, shift: true })).toBe(
      320 - KEYBOARD_STEP_LARGE,
    );
  });

  it('ignores keys on the other axis', () => {
    expect(sizeFromKeyboard(320, 'ArrowUp', rightPane)).toBeNull();
    expect(sizeFromKeyboard(320, 'ArrowDown', rightPane)).toBeNull();
    expect(sizeFromKeyboard(320, 'Enter', rightPane)).toBeNull();
  });

  it('works on a horizontal splitter', () => {
    const horizontal: SplitGeometry = { orientation: 'horizontal', direction: -1, bounds };
    expect(sizeFromKeyboard(320, 'ArrowUp', horizontal)).toBe(320 - KEYBOARD_STEP);
    expect(sizeFromKeyboard(320, 'ArrowLeft', horizontal)).toBeNull();
  });

  it('still clamps at the bounds', () => {
    expect(sizeFromKeyboard(285, 'ArrowLeft', rightPane)).toBe(280);
  });
});

describe('separatorAria', () => {
  it('exposes the full separator contract', () => {
    expect(separatorAria(320, bounds, 'vertical', 'Resize inspector')).toEqual({
      role: 'separator',
      tabindex: '0',
      'aria-orientation': 'vertical',
      'aria-valuemin': '280',
      'aria-valuemax': '520',
      'aria-valuenow': '320',
      'aria-label': 'Resize inspector',
    });
  });

  it('clamps the reported value', () => {
    expect(separatorAria(900, bounds, 'vertical', 'x')['aria-valuenow']).toBe('520');
  });
});
