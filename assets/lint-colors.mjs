#!/usr/bin/env node
/**
 * Colour lint — keeps every colour in the UI inside the design-token block.
 *
 * Every colour the interface uses must come from a custom property declared in
 * the token stylesheet, so that light and dark mode stay in step and a new
 * hard-coded colour cannot silently break a theme.
 *
 * This fails (exit code 1) when a hex colour literal appears in a `.css`, `.ts`
 * or `.tsx` file under the source tree unless the line is one of:
 *
 *   1. a token declaration, i.e. a CSS custom property:  `--color-bg: #eceee9;`
 *   2. an explicitly allow-listed literal (see ALLOWED_HEX below), for the
 *      rare case where a colour is *data* rather than styling — e.g. an API
 *      stores a user-chosen colour as a `#RRGGBB` string, which cannot be a CSS
 *      `var()`. Mark such a line with a `colour-token` comment so it is
 *      reviewable.
 *   3. inside the token stylesheet itself.
 *
 * Test files (`*.test.*`, `*.spec.*`) are not scanned.
 *
 * Usage:
 *   node scripts/lint-colors.mjs
 *   node scripts/lint-colors.mjs --src src --tokens src/styles/tokens.css
 *
 * Wire it into the build:
 *   "lint:colors": "node scripts/lint-colors.mjs"
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/* ── configuration ───────────────────────────────────────────────────────── */

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const ROOT = resolve(arg('root', join(HERE, '..')));
const SRC = resolve(ROOT, arg('src', 'src'));
/** The token stylesheet(s) are the one place hex literals are legal. Accept a
 *  comma-separated list, for projects that split the token layer over more than
 *  one file. */
const TOKENS_FILES = arg('tokens', join('src', 'styles', 'tokens.css'))
  .split(',')
  .map((t) => resolve(ROOT, t.trim()));

/** Hex literals that are allowed outside the token block. Keep this list tiny
 *  and justify every entry — each one is a deliberate exception. */
const ALLOWED_HEX = [
  // '#ffffff',  // e.g. the paper white of a rendered page
];

/* ── patterns ─────────────────────────────────────────────────────────────── */

/** #rgb, #rgba, #rrggbb or #rrggbbaa. */
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;
/** A CSS custom-property declaration (`--name: value`). */
const TOKEN_DECL = /^\s*--[\w-]+\s*:/;
/** Explicit, reviewable opt-out for a literal that is data, not styling. */
const MARKER = /colour-token/i;

const SCANNED_EXTENSIONS = ['.css', '.ts', '.tsx', '.jsx', '.vue', '.svelte'];
const SKIPPED = /\.(test|spec)\.[cm]?[jt]sx?$/;

/* ── scan ────────────────────────────────────────────────────────────────── */

/** Every scannable source file under `dir`. */
function sourceFiles(dir) {
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    console.error(`lint:colors cannot read the source directory: ${dir}`);
    process.exit(1);
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(sourceFiles(full));
    } else if (
      SCANNED_EXTENSIONS.some((ext) => entry.name.endsWith(ext)) &&
      !SKIPPED.test(entry.name)
    ) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];

for (const file of sourceFiles(SRC)) {
  // The token stylesheets are where literals are supposed to live.
  if (TOKENS_FILES.includes(resolve(file))) continue;

  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (TOKEN_DECL.test(line) || MARKER.test(line)) return;
    const matches = line.match(HEX);
    if (!matches) return;
    const offenders = matches.filter(
      (hex) => !ALLOWED_HEX.includes(hex.toLowerCase()),
    );
    if (offenders.length === 0) return;
    violations.push({
      file: relative(ROOT, file),
      line: index + 1,
      hexes: offenders.join(', '),
      text: line.trim(),
    });
  });
}

/* ── report ──────────────────────────────────────────────────────────────── */

if (violations.length === 0) {
  console.log(
    `lint:colors OK - no hard-coded colours outside the design tokens ` +
      `(${TOKENS_FILES.map((f) => relative(ROOT, f)).join(', ')}).`,
  );
  process.exit(0);
}

console.error(`lint:colors found ${violations.length} hard-coded colour(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.hexes}`);
  console.error(`    ${v.text}`);
}
console.error(
  '\nMove each colour into the token stylesheet and use `var(--color-...)`.\n' +
    'A literal that is data rather than styling takes an explicit\n' +
    '`colour-token` comment on the same line.',
);
process.exit(1);
