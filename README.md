# workbench-ui

A **method**, not a theme — for turning a messy UI into a token-driven,
card-based, accessible desktop workbench.

The value is the set of contracts and the order you do the work in. The colours
are the easy part, and the part that matters least.

> **A dark, low-chrome precision workbench** — a large work canvas, quiet tool
> rail, contextual inspector, and calm surfaces — while keeping the existing
> workflow and its light theme.

## Install

```bash
npx skills add Qaphael/workbench-ui -g -y
```

Or download the packaged skill from the
[latest release](https://github.com/Qaphael/workbench-ui/releases) and drop the
`workbench-ui.skill` file into your agent's skills directory.

The skill then triggers automatically when you ask to redesign, restyle,
modernise or themify an existing UI — or to build a new app with a consistent
visual language.

## What it does

It captures five contracts:

1. **Tokens own colour. Nothing else does.** Semantic role tokens, a frozen
   light palette in existing apps, dark mode as layered *surfaces* rather than
   borders, and ink colours (a printed page's white, a stamp's red) kept
   theme-independent.
2. **The shell pattern.** A borderless window frame, content grouped into
   inset cards, one gutter / radius / shadow geometry for all of them, chrome
   roles as indirections so a whole class of controls changes character in one
   theme, and one filled accent per group.
3. **A primitives layer, not a component zoo.** Adopt-don't-re-style, the rule
   of three, no colour literals, and accessibility wiring a primitive cannot
   forget.
4. **Pure logic stays pure.** DOM-free modules with unit tests, so the awkward
   parts are testable in milliseconds.
5. **The method.** Baseline → tokens → shell → primitives → pilot → expand →
   polish → refactor → QA, with the guard rails landing in the same commit as
   what they protect.

It works on **brownfield and greenfield** apps, in **any stack** — the token
layer, shell and guard rails are stack-agnostic, with React reference
implementations.

## What's in here

| Path | What it is |
|---|---|
| `SKILL.md` | The entry point: the five contracts, the phase order, the anti-pattern table |
| `references/design-language.md` | The full spec — every colour code, the window frame, the shell anatomy, the gutter system, the panel/card geometry, accessibility |
| `references/migration-playbook.md` | The phases in detail, brownfield vs greenfield, proving neutrality |
| `references/checklists.md` | Per-phase checklists, the test matrix, the definition of done, the report format |
| `references/portability.md` | Vue, Svelte, plain HTML, Tailwind, CSS-in-JS, native shells, existing component libraries |
| `assets/tokens.css` | The copy-paste token layer — palette, roles, geometry, the three-block resolution order |
| `assets/lint-colors.mjs` | Fails the build on any hex literal outside the token block |
| `assets/theme-tokens.test.ts` | Pins the light palette; asserts dark surface ordering and 4.5:1 contrast |
| `assets/contrast-check.mjs` | Standalone WCAG checker — no test runner needed |
| `assets/split.ts` + `split.test.ts` | Pure, DOM-free resize maths for draggable panes, and its tests |
| `assets/primitives-README.md` | The primitives contract template |
| `assets/theme-boot.html` | The pre-paint theme script, so there is never a flash of the wrong theme |
| `templates/UI_PLAN.md` | The plan document: phases, decision log, progress log, resume prompt |
| `evals/` | The evaluation set, the "before" fixture app, and the benchmark results |
| `PROMPTS.md` | Copy-paste prompts for **maintaining this skill** — folding new app structure into it, or adding a theme |
| `PROGRESS.md` | The change log: what each version added, its evidence, and the app commit it was synced from |
| `VERSION` | The single source of truth for the skill's version |
| `tools/package-skill.mjs` | Builds the distributable `.skill` with `git archive` and verifies the result |
| `.gitattributes` | Decides what `git archive` leaves out — the evaluation set, build noise |

## Keeping the skill in sync

This skill was extracted from a real application, and that application keeps
moving. `PROMPTS.md` is how the skill keeps up — without absorbing the
application's specifics.

```bash
git clone https://github.com/Qaphael/workbench-ui.git
cd workbench-ui
```

Then hand an agent the **P1** prompt from `PROMPTS.md`. It will:

1. **harvest** every new or changed visual rule from the application, in a
   consistent shape (Context / Goal / Files / Changes / Do not / Acceptance /
   Evidence);
2. **gate** each one behind a promotion test — it must be a *rule* rather than
   an implementation detail, its "why" must not name the application, and it
   must have an automatable check. Rules that fail are reported as
   *considered and rejected*, with the reason;
3. **place** each promoted rule in exactly one reference file — never in
   `SKILL.md`, which is the map;
4. **prove** it with a check that fails without the rule;
5. **ship** it: bump `VERSION`, add a `PROGRESS.md` row, commit, push, and
   attach a rebuilt `.skill` to a new release.

Then refresh your installed copy:

```bash
npx skills update -g
```

`PROMPTS.md` also has a **P2** prompt for adding a new theme, and documents the
rule-record shape both prompts use.

### Releasing

The distributable package is built with `git archive`, not by walking the
working tree:

```bash
node tools/package-skill.mjs        # -> dist/workbench-ui.skill
```

That matters for two reasons. A tree-walking packager has to be told what to
skip, and it will eventually walk into `.git` and hang — which is exactly what
happened to the first attempt here. `git archive` cannot: there is no `.git`
in an archive. It also packages the **committed** state, so a release always
matches a commit, and an uncommitted change is reported rather than silently
shipped or silently dropped.

What is left out is decided by `.gitattributes` (`export-ignore`), in one
place, so it applies to any `git archive` of this repo. The script unpacks its
own output and fails if `SKILL.md` is missing, if the evaluation set leaked
in, or if any path escaped the skill folder.

## A quick example

Ask your agent:

> *"Apply the workbench design language to our invoicing app. We want dark
> mode and proper card surfaces, but the light theme has to stay recognizable."*

It will freeze the current light palette in a test, build the token layer and
its lint, apply the shell pattern, pilot one screen, and leave you a plan
document with the phases and the decisions.

## Provenance

Extracted from a real nine-phase UI redesign of a Windows desktop app
(FastAPI + React + TypeScript + Vite), where the work was carried out over a
phased branch with one phase per commit and a measured CSS hash proving each
refactor was style-neutral.

The skill was evaluated against a purpose-built "before" fixture app — three
tasks, each run with and without the skill. See
[`evals/RESULTS.md`](evals/RESULTS.md).

## Licence

MIT — see [LICENSE](LICENSE).

The colour palette, shell geometry and phase method are original to this
repository. The bundled `assets/split.ts` resize maths is adapted from the
same project; the MIT notice in `LICENSE` covers it.
