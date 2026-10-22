# Evaluation results

The skill was evaluated against a purpose-built "before" fixture app, so the
claims here are measured rather than asserted.

## The fixture

`evals/fixture-app/` is a small invoicing app ("Ledgerly") that is deliberately
messy in the ways real apps are messy:

- one 300-line stylesheet with **62 hard-coded hex colours** and no token layer
- no dark mode at all
- `App.tsx` is a god component: toolbar, table, side panel, status footer and
  modal all in one file
- a fixed-width side panel, no resizable panes
- no primitives layer

It has **no `node_modules` and no build step**, so the evaluation needs no
`npm install` and no browser — the checks are plain-Node scripts and file
inspection.

The fixture's light palette is the app's identity. The ten values are listed in
`evals/fixture-app/README.md` and every one of them is expected to survive the
redesign.

## The tasks

| Eval | Task | What it exercises |
|---|---|---|
| 0 `full-redesign-dark-mode` | "Make it look like a proper modern desktop tool: dark mode, proper card surfaces. Don't change how it works, and the light theme has to stay recognizable." | The whole method: tokens, the frozen palette, dark mode, the shell pattern, the card geometry, the plan document |
| 1 `primitives-layer` | "We keep copy-pasting the same button/field/tab markup and they drift. Set up shared UI components, plus somewhere to eyeball all the variants — but it must not ship to production." | The primitives contract, the rule of three, the dev-only gallery, the guard rails |
| 2 `neutral-refactor` | "App.tsx is one giant file. Split it up, but nothing may look different and nothing may break." | The refactor phase, and the discipline of *proving* neutrality rather than asserting it |

Each task was run twice — once with the skill, once without it (the baseline).

## The results

| Eval | With skill | Baseline |
|---|---|---|
| 0 `full-redesign-dark-mode` | **9 / 9** | 5 / 9 |
| 1 `primitives-layer` | 7 / 7 | 7 / 7 |
| 2 `neutral-refactor` | 6 / 6 | 6 / 6 |

Raw numbers: [`benchmark.json`](benchmark.json), [`benchmark.md`](benchmark.md).

## What the numbers actually say

**Only eval 0 discriminates, and it discriminates on vocabulary, not on
outcome.** The four assertions the baseline fails are exactly the skill's
distinctive conventions:

- the chrome-role indirections (`--color-shell`, `--color-field`,
  `--color-button-2`, `--color-seg`)
- the card geometry tokens (`--gutter`, `--radius-card`, `--shadow-card`)
- the theme-independent ink tokens (`--color-paper`, `--color-stamp`,
  `--color-brand`)
- the migration plan document (phases + decisions + definition of done)

The baseline **did** build a token layer, **did** freeze the light palette,
**did** add a dark theme with both resolution blocks, **did** add a colour
lint, and **did** split the god component. So the skill's contribution is not
"do tokens" — it is "use these roles and this vocabulary, and produce the
plan". A different team could arrive at the same outcome with different token
names; the skill exists so that the names, the geometry and the discipline are
the same everywhere, which is what makes theming cheap later.

**Evals 1 and 2 are non-discriminating.** Both configurations scored 100%. The
baselines solved them outright:

- the eval-1 baseline built its own token layer, an 11-component primitives
  set, a styleguide and a 16-check verification script;
- the eval-2 baseline built a real React sandbox from the local npm cache and
  diffed the rendered markup across **all 448 reachable states**, and proved
  the harness was not vacuous with two mutation tests.

These assertions are worth keeping as regression guards, but they carry no
signal about the skill.

**A structural difference the assertions miss.** The with-skill eval-2 run also
split the stylesheet into ten ordered feature files (the method's refactor
phase); the baseline left `styles.css` byte-identical. An assertion on "the
stylesheet was split into ordered feature files" would discriminate eval 2.

**The shipped artifacts get used.** The with-skill runs called the skill's own
`lint-colors.mjs` and `contrast-check.mjs` directly; the baselines wrote
their own tooling. That is the "ship ready-to-copy files" decision paying off
— the skill run had working verification from minute one.

**The cost is time.** With-skill runs took roughly **72% longer** (mean 2914 s
vs 1695 s). Much of that is reading the skill — `SKILL.md`, four references and
seven assets, about 2,500 lines. A shorter "fast path" summary would cut this
without losing the method. That is the most obvious next iteration.

**Both configurations were honest about their limits.** Each stated plainly
that no browser, no `npm install` and no type-check were available on the
host, and each recorded the exact commands to run once dependencies exist.
Neither claimed more than it verified.

## Reproducing it

1. Copy `evals/fixture-app/` into two directories — one for each configuration.
2. Run the task prompt from `evals/evals.json` in each, with and without the
   skill installed.
3. Grade each run against the assertions in `evals/evals.json`. The grading
   was done with a script rather than by eye, because every assertion in this
   set is mechanically checkable.
4. Compare.

The assertions are written to be objective. Where a filename was not the point
— a primitives directory, a dev-only showcase — the check looks for the
*outcome* rather than the name, so a solution that names things differently is
not marked down for it.

## Caveat on the timing

The wall-clock figures are estimated from file modification times, because the
harness in use did not surface per-task token counts or durations. Treat the
time column as directional, not precise; the token column is empty for the
same reason.
