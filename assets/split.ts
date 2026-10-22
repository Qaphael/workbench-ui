/**
 * Pure maths for the resizable split panes.
 *
 * Nothing here touches the DOM: the pointer and keyboard handlers only
 * translate an event into a number and call these helpers, so the min/max and
 * direction rules are unit-testable in Node — in milliseconds, instead of
 * through a browser.
 *
 * `direction` says which way the *controlled* pane grows:
 *   -1  the pane sits to the right of (or below) the handle, so moving the
 *       pointer left/up makes it bigger (an inspector, a controls column)
 *   +1  the pane sits to the left of (or above) the handle
 */

export type SplitOrientation = 'vertical' | 'horizontal';
export type SplitDirection = 1 | -1;

export interface SizeBounds {
  min: number;
  max: number;
}

export interface SplitGeometry {
  orientation: SplitOrientation;
  direction: SplitDirection;
  bounds: SizeBounds;
}

/** Arrow-key step in CSS px, and the larger step used with Shift. */
export const KEYBOARD_STEP = 8;
export const KEYBOARD_STEP_LARGE = 32;

/**
 * Clamp a pane size into `bounds` and round it to whole CSS pixels.
 *
 * NaN (bad localStorage, a broken measurement) falls back to the minimum
 * instead of propagating into the grid; ±Infinity clamps to the max/min. An
 * inverted range (`max < min`) collapses to the minimum rather than allowing
 * huge panes.
 */
export function clampSize(value: number, bounds: SizeBounds): number {
  const min = Math.max(0, Math.round(bounds.min));
  const max = Math.max(min, Math.round(bounds.max));
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(Math.round(value), min), max);
}

/**
 * Size after dragging the handle by `deltaPx` from where the gesture started.
 *
 * Passing the *start* size (not the previous event's size) keeps the gesture
 * exact: a clamp mid-drag never accumulates rounding error, so dragging back
 * returns to the original width.
 */
export function sizeFromPointer(start: number, deltaPx: number, geometry: SplitGeometry): number {
  if (Number.isNaN(deltaPx)) return clampSize(start, geometry.bounds);
  return clampSize(start + deltaPx * geometry.direction, geometry.bounds);
}

export interface KeyboardOptions extends SplitGeometry {
  shift?: boolean;
  step?: number;
  largeStep?: number;
}

/**
 * Size after an arrow key press, or `null` when the key is not an arrow on this
 * splitter's axis (the caller then leaves the event alone).
 *
 * The divider follows the arrow, so ArrowLeft/ArrowUp grow a right/bottom pane.
 */
export function sizeFromKeyboard(current: number, key: string, options: KeyboardOptions): number | null {
  const step = options.shift
    ? options.largeStep ?? KEYBOARD_STEP_LARGE
    : options.step ?? KEYBOARD_STEP;

  let delta = 0;
  if (options.orientation === 'vertical') {
    if (key === 'ArrowLeft') delta = -step;
    else if (key === 'ArrowRight') delta = step;
  } else if (options.orientation === 'horizontal') {
    if (key === 'ArrowUp') delta = -step;
    else if (key === 'ArrowDown') delta = step;
  }

  if (delta === 0) return null;
  return sizeFromPointer(current, delta, options);
}

/**
 * The ARIA values for a separator element.
 *
 * `role="separator"` that is focusable must expose `aria-valuenow`,
 * `aria-valuemin` and `aria-valuemax`, or a screen reader announces a
 * separator that cannot be resized.
 */
export function separatorAria(
  value: number,
  bounds: SizeBounds,
  orientation: SplitOrientation,
  label: string,
): Record<string, string> {
  const size = clampSize(value, bounds);
  return {
    role: 'separator',
    tabindex: '0',
    'aria-orientation': orientation,
    'aria-valuemin': String(Math.round(bounds.min)),
    'aria-valuemax': String(Math.round(bounds.max)),
    'aria-valuenow': String(size),
    'aria-label': label,
  };
}
