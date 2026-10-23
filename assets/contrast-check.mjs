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
 *   node scripts/contrast-check.mjs --tokens src/styles/tokens.css --theme light
 *
 * With --tokens it reads the token stylesheet, resolves BOTH themes (light
 * from the `:root` blocks, dark from the `[data-theme="dark"]` and
 * `:not([data-theme="light"])` blocks), and checks every text pair in each.
 *
 * --theme light|dark|both   which theme(s) to check. Default: both.
 *
 * Text is checked on the surfaces text is actually drawn on (--color-bg,
 * --color-panel, --color-panel-2, --color-bg-hover). --color-canvas is the
 * well the work sits in, not a text surface, so it is reported for interest
 * and never fails the run.
 *
 * Exit code 1 if any text pair fails, 2 on a usage error.
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

/* ── stylesheet parsing ──────────────────────────────────────────────────── */

/**
 * Remove `/* ... *\/` comments before parsing.
 *
 * Token stylesheets routinely carry CSS examples inside their header comments
 * (`@media (...) { :root:not(...) }`), and a stray brace in a comment would
 * desynchronise a brace-matching parser.
 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Body of the block whose `{` is at `open`, matched to its closing `}`. */
function blockBody(css, open) {
  let depth = 1;
  let i = open;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') depth -= 1;
    i += 1;
  }
  return css.slice(open, i - 1);
}

/** Selector text of a `selector {` match, with any trailing comment removed. */
function selectorOf(raw) {
  return raw.replace(/\/\*[\s\S]*?\*\//g, '').trim();
}

/** Remove the whole block whose selector contains `needle`. */
function stripBlock(css, needle) {
  const re = /([^{}]+)\{/g;
  let m;
  while ((m = re.exec(css))) {
    if (selectorOf(m[1]).includes(needle)) {
      const open = m.index + m[0].length;
      const body = blockBody(css, open);
      return css.slice(0, m.index) + css.slice(open + body.length + 1);
    }
  }
  return css;
}

/** Bodies of every block whose selector is exactly `selector`. */
function blocksFor(css, selector) {
  const out = [];
  const re = /([^{}]+)\{/g;
  let m;
  while ((m = re.exec(css))) {
    if (selectorOf(m[1]) === selector) out.push(blockBody(css, m.index + m[0].length));
  }
  return out;
}

/** Every `--color-x: #hex` across the bodies, last value wins. */
function collect(bodies) {
  const tokens = {};
  for (const body of bodies) {
    for (const m of body.matchAll(/(--color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
      tokens[m[1]] = m[2].toLowerCase();
    }
  }
  return tokens;
}

/**
 * Resolve both themes from a token stylesheet.
 * Dark falls back to light for tokens it does not override, exactly as CSS does.
 */
function themesFrom(rawCss) {
  const css = stripComments(rawCss);

  // Light: every `:root` block that is not the dark media query.
  const withoutDarkQuery = stripBlock(css, '@media (prefers-color-scheme: dark)');
  const light = collect(blocksFor(withoutDarkQuery, ':root'));

  const darkOverrides = collect([
    ...blocksFor(css, ':root[data-theme="dark"]'),
    ...blocksFor(css, ':root:not([data-theme="light"])'),
  ]);
  const dark = { ...light, ...darkOverrides };

  return { light, dark };
}

/* ── what is checked ─────────────────────────────────────────────────────── */

const THRESHOLD = 4.5; // WCAG AA for normal text

/** Surfaces that text is actually drawn on. */
const TEXT_SURFACES = ['--color-bg', '--color-panel', '--color-panel-2', '--color-bg-hover'];
/** The well/mat the work sits in. Reported, never failed. */
const NON_TEXT_SURFACES = ['--color-canvas'];
/** Foregrounds that must be readable. */
const FOREGROUNDS = ['--color-text', '--color-muted'];

/* ── CLI ─────────────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);

function usage(problem) {
  if (problem) console.error(`error: ${problem}\n`);
  console.error(
    'usage:\n' +
      '  node scripts/contrast-check.mjs "#f2f2f2" "#181818"\n' +
      '  node scripts/contrast-check.mjs --tokens src/styles/tokens.css [--theme light|dark|both]',
  );
  process.exit(2);
}

// Two-colour mode.
if (argv.length >= 2 && !argv[0].startsWith('--')) {
  let ratio;
  try {
    ratio = contrast(argv[0], argv[1]);
  } catch (error) {
    usage(error.message);
  }
  const verdict = ratio >= THRESHOLD ? 'PASS' : 'FAIL';
  console.log(
    `${verdict}  ${argv[0]} on ${argv[1]} = ${ratio.toFixed(2)}:1 ` +
      `(AA normal text needs ${THRESHOLD}:1)`,
  );
  process.exit(ratio >= THRESHOLD ? 0 : 1);
}

let tokensPath = null;
let theme = 'both';
const THEMES = ['light', 'dark', 'both'];

for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--tokens') {
    tokensPath = argv[i + 1];
    if (!tokensPath || tokensPath.startsWith('--')) usage('--tokens needs a path');
    i += 1;
  } else if (arg === '--theme') {
    theme = argv[i + 1];
    if (!THEMES.includes(theme)) usage(`--theme must be one of ${THEMES.join(', ')} (got ${argv[i + 1] ?? '<nothing>'})`);
    i += 1;
  } else if (arg.startsWith('--')) {
    usage(`unknown flag: ${arg}`);
  } else {
    usage(`unexpected argument: ${arg}`);
  }
}

if (!tokensPath) usage('--tokens is required in stylesheet mode');

let css;
try {
  css = readFileSync(resolve(tokensPath), 'utf8');
} catch (error) {
  usage(`cannot read ${tokensPath}: ${error.message}`);
}

const themes = themesFrom(css);
const wanted = theme === 'both' ? ['light', 'dark'] : [theme];

let failures = 0;
let checked = 0;

for (const name of wanted) {
  const tokens = themes[name];
  const missingSurface = [...TEXT_SURFACES, ...NON_TEXT_SURFACES].find((s) => !tokens[s]);
  const missingFg = FOREGROUNDS.find((f) => !tokens[f]);
  if (missingSurface || missingFg) {
    console.error(`error: the ${name} theme is missing ${missingSurface ?? missingFg}`);
    process.exit(2);
  }

  console.log(`\n${name} theme`);
  for (const surface of TEXT_SURFACES) {
    for (const foreground of FOREGROUNDS) {
      const ratio = contrast(tokens[foreground], tokens[surface]);
      const ok = ratio >= THRESHOLD;
      checked += 1;
      if (!ok) failures += 1;
      console.log(
        `  ${ok ? 'PASS' : 'FAIL'}  ${foreground} on ${surface} ` +
          `(${tokens[foreground]} on ${tokens[surface]}) = ${ratio.toFixed(2)}:1`,
      );
    }
  }
  // The well is not a text surface: show the numbers, never fail on them.
  for (const surface of NON_TEXT_SURFACES) {
    for (const foreground of FOREGROUNDS) {
      const ratio = contrast(tokens[foreground], tokens[surface]);
      console.log(
        `  info  ${foreground} on ${surface} ` +
          `(${tokens[foreground]} on ${tokens[surface]}) = ${ratio.toFixed(2)}:1  (the well, not a text surface)`,
      );
    }
  }
}

console.log(
  `\n${checked - failures}/${checked} text pairs meet AA (${THRESHOLD}:1) across ` +
    `${wanted.join(' + ')}.`,
);
process.exit(failures === 0 ? 0 : 1);
