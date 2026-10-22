/**
 * Token-level theme guards for the token stylesheet.
 *
 * These are deliberately *not* component tests: they pin the rules directly
 * against the stylesheet, so a design change cannot quietly:
 *
 *   1. edit a light-mode colour (the light palette is frozen), or
 *   2. break the dark surface hierarchy or its text contrast.
 *
 * The colour lint catches literals *outside* the token block; this file catches
 * literal values *inside* it that changed.
 *
 * Vitest. For jest, drop the `describe`/`it` wrappers' imports and keep the
 * bodies — the logic is plain TypeScript.
 *
 * BEFORE YOU USE THIS: replace the values in FROZEN_LIGHT_COLOURS with your
 * app's actual current light palette. The point of the test is to pin what is
 * already there, so that a redesign cannot move it by accident.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** The token stylesheet as text (Node/dev-only: never ships to the bundle). */
const css = readFileSync(new URL('./styles/tokens.css', import.meta.url), 'utf8');

/** Every colour token in the frozen light palette. */
const FROZEN_LIGHT_COLOURS: Record<string, string> = {
  '--color-bg': '#eceee9',
  '--color-panel': '#fbfbf8',
  '--color-panel-2': '#f0f1ec',
  '--color-border': '#d5d8d0',
  '--color-text': '#1f2430',
  '--color-muted': '#5c6472',
  '--color-primary': '#26324d',
  '--color-on-primary': '#fff',
  '--color-selection': '#2f5bd6',
  '--color-danger': '#c8321f',
  '--color-success': '#17794f',
  '--color-warning': '#7a5400',
  '--color-primary-tint': '#e3e8f3',
  '--color-warning-tint': '#f7ecd6',
  '--color-canvas': '#d9dcd4',
  '--color-border-strong': '#b4baac',
  '--color-bg-hover': '#e3e6de',
  '--color-guide': '#0097a7',
  '--color-guide-active': '#ff2d95',
  '--color-spacing': '#ff8a00',
  '--color-overlay': '#000000',
  '--color-on-overlay': '#ffffff',
  '--color-paper': '#ffffff',
  '--color-stamp': '#d00000',
  '--color-brand': '#26324d',
};

/** Read the `--color-*` declarations out of the block that starts at `marker`. */
function colourTokens(marker: string, closeIndent: string): Record<string, string> {
  const start = css.indexOf(marker);
  expect(start, `tokens.css is missing ${marker}`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf('{', start);
  const close = css.indexOf(`\n${closeIndent}}`, open);
  expect(close, `tokens.css has an unterminated ${marker}`).toBeGreaterThan(open);

  const tokens: Record<string, string> = {};
  for (const match of css.slice(open + 1, close).matchAll(/(--color-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens[match[1]] = match[2].trim().toLowerCase();
  }
  return tokens;
}

const light = colourTokens(':root {', '');
const systemDark = colourTokens(':root:not([data-theme="light"]) {', '  ');
const forcedDark = colourTokens(':root[data-theme="dark"] {', '');

/** Relative luminance per WCAG 2.1. */
function luminance(hex: string): number {
  const value = hex.trim().toLowerCase();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(value);
  const full = short
    ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
    : value;
  const channels = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(full);
  if (!channels) throw new Error(`not a hex colour: ${hex}`);
  const [r, g, b] = [channels[1], channels[2], channels[3]].map((part) => {
    const channel = parseInt(part, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string): number {
  const [a, b] = [luminance(foreground), luminance(background)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

describe('light palette', () => {
  it('is frozen: every colour token keeps its approved value', () => {
    expect(light).toEqual(FROZEN_LIGHT_COLOURS);
  });
});

describe('dark palette', () => {
  it('keeps the system and forced-dark blocks identical', () => {
    expect(forcedDark).toEqual(systemDark);
  });

  it('builds the surface hierarchy by luminance, darkest first', () => {
    const order = [
      '--color-canvas',
      '--color-bg',
      '--color-panel',
      '--color-panel-2',
      '--color-bg-hover',
    ];
    const values = order.map((token) => luminance(forcedDark[token]));
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i], `${order[i]} must be lighter than ${order[i - 1]}`).toBeGreaterThan(
        values[i - 1],
      );
    }
  });

  it('keeps ink tokens fixed: paper white, stamp red and brand are inherited', () => {
    for (const token of ['--color-paper', '--color-stamp', '--color-brand']) {
      expect(forcedDark[token]).toBeUndefined();
      expect(systemDark[token]).toBeUndefined();
      expect(light[token]).toBe(FROZEN_LIGHT_COLOURS[token]);
    }
  });

  it.each(['--color-bg', '--color-panel', '--color-panel-2', '--color-bg-hover', '--color-canvas'])(
    'keeps body text and muted text at 4.5:1 or better on %s',
    (surface) => {
      const background = forcedDark[surface];
      expect(contrast(forcedDark['--color-text'], background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(forcedDark['--color-muted'], background)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(['--color-danger', '--color-success', '--color-warning'])(
    'keeps the semantic colour %s readable on panel and canvas',
    (token) => {
      expect(contrast(forcedDark[token], forcedDark['--color-panel'])).toBeGreaterThanOrEqual(4.5);
      expect(contrast(forcedDark[token], forcedDark['--color-canvas'])).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('keeps primary button text readable', () => {
    expect(contrast(forcedDark['--color-on-primary'], forcedDark['--color-primary'])).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});
