#!/usr/bin/env node
/**
 * Standalone WCAG contrast checker.
 *
 * No test runner required — useful before the test suite exists, or on a
 * machine where you just want a quick answer.
 *
 * Usage:
 *   node scripts/contrast-check.mjs "#f2f2f2" "#181818"
 *   node scripts/contrast-check.mjs --tokens src/styles/tokens.css
 *
 * With --tokens, it reads the token stylesheet and checks every foreground /
 * surface pair it can infer from the token names, then reports anything below
 * the threshold.
 *
 * Exit code 1 if any pair fails.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/* ── colour maths (WCAG 2.1) ─────────────────────────────────────────────── */

function expand(hex) {
  const value = hex.trim().toLowerCase();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(value);
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  if (/^#[0-9a-f]{8}$/.test(value)) return value.slice(0, 7);
  throw new Error(`not a hex colour: ${hex}`);
}

function luminance(hex) {
  const full = expand(hex);
  const channels = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(full);
  if (!channels) throw new Error(`not a hex colour: ${hex}`);
  const [r, g, b] = [channels[1], channels[2], channels[3]].map((part) => {
    const channel = parseInt(part, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

/* ── modes ───────────────────────────────────────────────────────────────── */

const THRESHOLD = 4.5; // WCAG AA for normal text

const argv = process.argv.slice(2);
if (argv.length >= 2 && !argv[0].startsWith('--')) {
  const ratio = contrast(argv[0], argv[1]);
  const verdict = ratio >= THRESHOLD ? 'PASS' : 'FAIL';
  console.log(
    `${verdict}  ${argv[0]} on ${argv[1]} = ${ratio.toFixed(2)}:1 ` +
      `(AA normal text needs ${THRESHOLD}:1)`,
  );
  process.exit(ratio >= THRESHOLD ? 0 : 1);
}

const tokensIndex = argv.indexOf('--tokens');
if (tokensIndex >= 0) {
  const path = resolve(argv[tokensIndex + 1]);
  const css = readFileSync(path, 'utf8');

  /** Every `--color-x: #hex` in the file, last value wins. */
  const tokens = {};
  for (const m of css.matchAll(/(--color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    tokens[m[1]] = m[2].toLowerCase();
  }

  /** Surfaces that text is drawn on. */
  const surfaces = [
    '--color-bg',
    '--color-panel',
    '--color-panel-2',
    '--color-bg-hover',
    '--color-canvas',
  ];
  /** Foregrounds that must be readable. */
  const foregrounds = ['--color-text', '--color-muted'];

  let failures = 0;
  let checked = 0;
  for (const surface of surfaces) {
    for (const foreground of foregrounds) {
      const bg = tokens[surface];
      const fg = tokens[foreground];
      if (!bg || !fg) continue;
      const ratio = contrast(fg, bg);
      checked += 1;
      const ok = ratio >= THRESHOLD;
      if (!ok) failures += 1;
      console.log(
        `${ok ? 'PASS' : 'FAIL'}  ${foreground} on ${surface} ` +
          `(${fg} on ${bg}) = ${ratio.toFixed(2)}:1`,
      );
    }
  }

  console.log(`\n${checked - failures}/${checked} pairs meet AA (${THRESHOLD}:1).`);
  process.exit(failures === 0 ? 0 : 1);
}

console.error(
  'usage:\n' +
    '  node scripts/contrast-check.mjs "#f2f2f2" "#181818"\n' +
    '  node scripts/contrast-check.mjs --tokens src/styles/tokens.css',
);
process.exit(2);
