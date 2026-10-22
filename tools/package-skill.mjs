#!/usr/bin/env node
/**
 * Build the distributable `.skill` package.
 *
 * The package is a zip of the skill folder with a `workbench-ui/` prefix.
 * It is built with `git archive`, NOT by walking the working tree, for two
 * reasons:
 *
 *   1. It cannot walk into `.git`. Walking the tree is what makes a naive
 *      packager hang: the object store is thousands of files, and the
 *      "package" is nonsense.
 *   2. It packages the COMMITTED state, so a release always matches a commit.
 *      An uncommitted change is reported as a warning rather than silently
 *      shipped or silently dropped.
 *
 * What is left out is decided by `.gitattributes` (`export-ignore`), not by
 * this script, so the rule lives in one place and applies to any `git archive`
 * of this repo.
 *
 * Usage:
 *   node tools/package-skill.mjs                 # package HEAD into dist/
 *   node tools/package-skill.mjs --out <path>    # package HEAD somewhere else
 *   node tools/package-skill.mjs --ref v1.1.0    # package a tag
 *
 * No dependencies, no Python, and no other skill required.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SKILL_NAME = 'workbench-ui';

/* ── arguments ───────────────────────────────────────────────────────────── */

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const ref = arg('ref', 'HEAD');
const outPath = resolve(ROOT, arg('out', join('dist', `${SKILL_NAME}.skill`)));

/* ── preflight ───────────────────────────────────────────────────────────── */

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', ...opts });
}

try {
  git(['rev-parse', '--git-dir']);
} catch {
  console.error('package-skill: not a git repository. Run this from a clone.');
  process.exit(1);
}

// A dirty tree does not stop the build - the package is the committed state -
// but it is worth saying, because otherwise a change can be "released" by
// accident and be missing from the package.
const dirty = git(['status', '--porcelain']).trim();
if (dirty) {
  console.warn('package-skill: WARNING - the working tree has uncommitted changes.');
  console.warn('  They will NOT be in the package (the package is the committed state).');
  for (const line of dirty.split(/\r?\n/).slice(0, 10)) console.warn(`  ${line}`);
  console.warn('');
}

/* ── build ───────────────────────────────────────────────────────────────── */

mkdirSync(dirname(outPath), { recursive: true });

// --prefix puts everything under a single top-level folder, so the archive
// unpacks as `workbench-ui/...` - which is what an installer expects.
git(['archive', '--format=zip', `--prefix=${SKILL_NAME}/`, '-o', outPath, ref]);

if (!existsSync(outPath)) {
  console.error(`package-skill: git archive did not produce ${outPath}`);
  process.exit(1);
}

/* ── verify ──────────────────────────────────────────────────────────────── */

// Unpack it and look at what is actually inside. A package that silently
// lost its references, or that gained the evaluation set, is worse than a
// build that failed.
const scratch = mkdtempSync(join(tmpdir(), 'skill-pkg-'));
let entries = [];
try {
  // PowerShell's Expand-Archive is the portable way to unzip on Windows, but
  // `tar` ships with Windows 10+ and reads zips fine.
  execFileSync('tar', ['-xf', outPath, '-C', scratch], { stdio: 'pipe' });
  const walk = (dir, out = []) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full, out);
      else out.push(relative(scratch, full).replace(/\\/g, '/'));
    }
    return out;
  };
  entries = walk(scratch);
} catch {
  console.warn('package-skill: could not unpack the archive to verify it (tar missing?).');
  console.warn('  The package was written, but it has NOT been verified.');
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

if (entries.length) {
  const problems = [];
  if (!entries.includes(`${SKILL_NAME}/SKILL.md`)) {
    problems.push(`SKILL.md is missing from the package`);
  }
  const stray = entries.filter((e) => e.startsWith(`${SKILL_NAME}/evals/`));
  if (stray.length) {
    problems.push(`the evaluation set leaked into the package (${stray.length} file(s))`);
  }
  const outside = entries.filter((e) => !e.startsWith(`${SKILL_NAME}/`));
  if (outside.length) {
    problems.push(`${outside.length} file(s) are outside the ${SKILL_NAME}/ folder`);
  }
  const git = entries.filter((e) => e.includes('/.git/'));
  if (git.length) {
    problems.push(`${git.length} .git file(s) leaked into the package`);
  }

  if (problems.length) {
    console.error('package-skill: FAILED - the package is wrong:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  console.log(`package-skill: verified ${entries.length} file(s) in the package.`);
}

/* ── done ────────────────────────────────────────────────────────────────── */

const kb = (statSync(outPath).size / 1024).toFixed(1);
console.log(`package-skill: wrote ${relative(ROOT, outPath)}  (${kb} KB)  from ${ref}`);
console.log('');
console.log('  Attach it to a release:');
console.log(`    curl -X POST -H "Authorization: Bearer $TOKEN" \\`);
console.log(`      -H "Content-Type: application/octet-stream" \\`);
console.log(`      --data-binary "@${relative(ROOT, outPath)}" \\`);
console.log(`      "https://uploads.github.com/repos/<owner>/<repo>/releases/<id>/assets?name=${SKILL_NAME}.skill"`);
