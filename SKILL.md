---
name: workbench-ui
description: >-
  Apply the low-chrome "workbench" design language and the phased refactor method
  that turns a messy legacy UI into a token-driven, card-based, accessible desktop
  workbench. Use this skill whenever the user wants to redesign, restyle,
  modernise, themify, or "make it look like a real product" an existing UI, or
  wants to build a NEW app with a consistent visual language — and especially when
  they mention dark mode, design tokens, a UI refactor, a god component, one giant
  stylesheet, hard-coded colours, an inconsistent UI, a "phase plan" for the UI, or
  a reference design to match. Covers brownfield migrations and greenfield builds,
  in any tech stack (React reference implementations included).
---

# Workbench UI

A **method**, not a theme. The value is the set of contracts and the order you do
the work in — the colours are the easy part and the part that matters least.

The goal is a desktop workbench that reads as one product: a quiet borderless
shell, content grouped into inset cards, one accent state per group, a token layer
that owns every colour, and a light/dark pair that stay in step. The method that
gets you there is: **freeze what works, add the indirection that makes theming
possible, pilot on one screen, then expand.**

## The five contracts

Everything below is a restatement of these five. If a decision in your target app
conflicts with one of them, the conflict is worth surfacing to the user rather
than silently resolving.

### 1. Tokens own colour. Nothing else does.

Semantic role tokens (`--color-panel`, `--color-field`, `--color-button-2`), never
named colours (`--color-grey-200`). A role token names *what the thing is for*,
so a component never knows whether it is light or dark.

**The frozen-light rule.** In a brownfield app, the existing light palette is
frozen: never edit a light value to make dark mode work — add a dark-only
override instead. The app's identity, the user's screenshots, the printed output
and any brand guidance all point at those values; changing one silently is a
regression wearing a redesign's clothes. Freeze them by pinning them in a test
(the moment you change a light value deliberately, update the pin in the same
commit, visibly).

**Dark is layered surfaces, not borders.** Hierarchy comes from surface
luminance — canvas < bg < panel < panel-2 — with borders as almost-invisible
hairlines. A large canvas ringed with hairlines reads as noise; surface steps
read as depth.

**Separate ink from chrome.** Colours that describe *content* (a printed page's
white, a stamp's red, a brand mark) are theme-independent by definition and are
inherited into dark mode unchanged. If you find yourself overriding a content
colour in dark mode, you have found a content colour that should not have been
a theme colour.

See `references/design-language.md` for the full token set and the three-block
resolution order.

### 2. The shell pattern

- **The frame is a canvas, the content is cards.** The outer shell is borderless;
  each view groups its content into cards inset by one gutter.
- **One geometry for every card** — `--gutter`, `--radius-card`, `--shadow-card`
  — so the app reads as one system instead of a set of panels.
- **Chrome roles are indirections.** `--color-shell`, `--color-field`,
  `--color-button-2`, `--color-seg*` resolve to *bordered* values in light and
  *filled, borderless* values in dark. This is the single highest-leverage
  decision in the whole method: it lets you change how an entire class of
  controls looks in one theme by editing one token block, with no component
  touched. Without it, dark mode becomes a component-by-component negotiation.
- **One primary action per view.** A filled segmented button or an active tool
  tile is *state*, not a second primary action. If two things are filled, one of
  them is wrong.
- **Bottom chrome is a recessed strip, not a card.** Status bars, transport bars
  and scrubbers belong to the frame.
- **Measure the pane, not the card.** When a pane's width is contractual (a
  draggable splitter measures it), draw the card with a pseudo-element or inset
  padding so the measured width stays exactly the visible card edge. Otherwise
  the splitter's contract drifts from what the user sees.

### 3. A primitives layer, not a component zoo

- **Adopt, don't re-style.** A primitive renders the shared class; `className` is
  for layout only. If a screen needs a different look, change the class and the
  tokens so every screen follows.
- **Rule of three.** A pattern becomes a primitive after its third real use, not
  its first. Two uses might be coincidence.
- **No colour literals** anywhere outside the token block (enforced by lint, not
  by discipline).
- **Every button declares its `type`.** Default to `type="button"`; `submit`
  only inside a real form.
- **Accessibility wiring cannot be forgotten.** A `Field` that clones its child
  and injects `id` / `aria-describedby` / `aria-invalid` is better than a
  documented convention, because the convention will be forgotten in month four.
- **A dev gallery**, compiled out of production, renders every primitive and
  state in one page — and is screenshotted by e2e so the gallery itself cannot
  rot.

### 4. Pure logic stays pure

Resize maths, theme resolution, numbering, validation — keep them in DOM-free
modules with their own unit tests, and let the components translate events into
numbers. This is what makes the awkward parts (clamping, direction, persisted
widths) testable in milliseconds instead of through a browser.

### 5. The method: phases, guard rails, proof

The detailed phase plan lives in `references/migration-playbook.md`. The shape:

```
0  Baseline          prove the suite is green, record the light palette
1  Tokens            add the token layer + the lint + the frozen-palette test
2  Shell             borderless shell, cards, roles, resizable panes
3  Primitives        the shared component layer + dev gallery
4  Pilot screens     one screen end-to-end, lowest risk, highest impact
5  Expand            one screen per commit
6  Polish            chrome, empty states, motion, contrast
7  Refactor          split god components, split the stylesheet — NO style change
8  QA                axe in both themes, screenshots, docs, release
```

Rules that make it work:

- **One phase per commit.** A visual change and a large refactor never share a
  commit — you want to be able to revert one without losing the other.
- **Install the guard rail in the same commit as what it protects.** The colour
  lint lands with the tokens; the frozen-palette test lands with the tokens.
  A guard rail added later meets a codebase that has already grown violations.
- **Prove neutrality.** For a behaviour- or style-preserving refactor, hash the
  built CSS and show it is unchanged. This is the single most valuable trick in
  the method: it converts "I believe this refactor changed nothing" into a
  fact you can put in a commit message.
- **Pilot before you expand.** One screen, fully migrated, is worth more than
  four screens half-migrated, because the pilot is where you discover the
  contract is wrong.
- **Log decisions before implementing them**, and log progress every session.
  A redesign spans weeks and machines; the log is what stops it from
  re-litigating itself.

## Choosing the path

**Brownfield (an app that already exists)** — the common case:

1. Record the current light palette and pin it in a test *before* you touch
   anything. The pin is the thing that makes the freeze real.
2. Add the token layer and the lint. Do **not** restyle yet — the tokens must
   first resolve to the app's existing look, so the refactor is invisible.
3. Add the chrome-role indirections. Light resolves to today's values; dark
   resolves to the new treatment.
4. Pilot one screen. Then expand.

**Greenfield (a new app)** — same method, minus the archaeology: tokens from
day one, dark theme from day one, primitives layer from the third component
rather than the third screen. Still pin the palette once it is approved, so a
later "let's just nudge that grey" is a visible decision.

**An app that already uses a component library** — check `references/portability.md`
§8 before starting. If the library *is* the app's identity (Material,
Bootstrap, an in-house design system), then most of this method does not
apply, and telling the user that plainly is more useful than applying it and
apologising later. What still transfers is the freeze, the frame, and the
composition rules (one primary action, one accent per group). If the library
is incidental (copied components, a stray import), this skill's primitives
layer replaces it — but delete the library in its own phase, after the screens
are migrated, not during.

## Non-negotiables

Carried over from every project that used this method, because they are what
made it survivable:

- **Offline-first.** No CDN assets, no remote fonts, no runtime network calls.
- **No new runtime dependency** for layout, styling, or primitives. Dev-only
  dependencies are fine.
- **Do not change semantics.** Numbering, printing, data locations and API
  contracts are not a design project.
- **Contrast ≥ 4.5:1 for body text in both themes**, and disabled states stay
  *readable* — a flat fill with muted text, not a faded opacity.
- **Keyboard and pointer are equals.** Every drag has a keyboard equivalent;
  every tab list has arrow-key navigation.
- **Never add a second styling system.** Tailwind, CSS modules, CSS-in-JS and
  hand-written CSS can coexist, but only one of them may own colour and spacing.

## Verifying the work

The method is only as good as its evidence. At minimum:

```
the colour lint passes                  (no hex outside the token block)
the frozen-palette test passes           (light unchanged, dark ordered, contrast ok)
the build passes                         (no type errors, no new chunk bloat)
axe passes in BOTH themes                (not just the default one)
the screenshots exist for both themes    (a redesign nobody looked at is a guess)
```

Add the visual-regression rule: a screenshot diff in the *light* theme must be
structural only. If a hue moved, that is a bug until someone says otherwise.

Full command list and per-phase checklist: `references/checklists.md`.

## Anti-patterns this method exists to prevent

| Anti-pattern | What it costs |
|---|---|
| Big-bang rewrite | Unreviewable, unrevertable, unfinishable |
| Editing light values to satisfy dark | Silently rebrands the app |
| Hex literals in components | Themes drift apart within a sprint |
| Borders instead of surface depth in dark | Noisy, flat, tiring |
| A second primary action per screen | No hierarchy; nothing reads as the next step |
| Extracting a primitive on first use | Wrong shape, used forever after |
| Moving files to match a diagram | Churn with no coupling win |
| Guard rails added "later" | Too late; violations already shipped |
| Claiming a refactor was neutral without a hash | Rework, or a silent behaviour change |

## Bundled artifacts

Copy these into the target app. They are deliberately generic — adjust paths,
names and the frozen palette values, but keep the shape.

| File | Copy to | Purpose |
|---|---|---|
| `assets/tokens.css` | `src/styles/tokens.css` | The token layer template, with the resolution order and the frozen-light rule explained inline |
| `assets/lint-colors.mjs` | `frontend/scripts/lint-colors.mjs` | Fails the build on any hex literal outside the token block |
| `assets/theme-tokens.test.ts` | `src/themeTokens.test.ts` | Pins the light palette, asserts dark surface ordering and 4.5:1 contrast (vitest; port the assertions to jest if needed) |
| `assets/contrast-check.mjs` | `scripts/contrast-check.mjs` | Standalone WCAG checker — no test runner required |
| `assets/split.ts` | `src/split.ts` | Pure, DOM-free resize maths for draggable panes |
| `assets/split.test.ts` | `src/split.test.ts` | Its unit tests (vitest) |
| `assets/primitives-README.md` | `src/components/ui/README.md` | The primitives contract template — adopt-don't-restyle, rule of three, the rules |
| `assets/theme-boot.html` | `index.html` | The pre-paint theme script, so there is never a flash of the wrong theme |
| `templates/UI_PLAN.md` | `docs/UI_PLAN.md` | The plan document: phases, decision log, progress log, test matrix, definition of done |

## Keeping this skill in sync

This skill was extracted from a real application, and that application keeps
moving — so the skill needs a way to keep up, without absorbing the
application's specifics. Three files make that work:

| File | What it is |
|---|---|
| `PROMPTS.md` | Copy-paste prompts for maintaining the skill: fold the application's new structure into it, or add a theme. Each has a **promotion gate** — a rule ships only if it is a rule (not an implementation detail), its "why" does not name the application, and it has an automatable check. |
| `VERSION` | The single source of truth for the skill's version. |
| `PROGRESS.md` | The change log: what each version added, the evidence for it, and the application commit it was synced from — so a reader can tell "the skill is out of date" from "the skill never covered this". |

Use them rather than editing the skill by hand. The prompts enforce the two
things that matter: a new rule goes in **exactly one** reference file (never in
`SKILL.md`, which is the map), and it arrives with a check that fails without
it.

To cut a release, run `node tools/package-skill.mjs`. It builds the package
with `git archive` — which cannot contain a `.git`, so the build cannot walk
into the object store and hang — packages the committed state, and then unpacks
and verifies its own output.

## Reference files

- `references/design-language.md` — the full visual contract: token set, shell
  and card CSS, chrome roles, the chrome budget, panel disclosure, primitives,
  accessibility rules, keyboard ownership, dark theme.
- `references/migration-playbook.md` — the phases in detail, with per-phase
  checklists, the brownfield and greenfield variants, and how to run the method
  across sessions and machines.
- `references/checklists.md` — the test matrix, the command list per stack, and
  the definition of done.
- `references/portability.md` — expressing the same contract outside React:
  Vue, Svelte, plain HTML, Tailwind, and CSS-only cores.

## Working with the user

The user may want only the visual language, or the whole migration. The method
has a natural order and the later phases depend on the earlier ones (a refactor
before the primitives exist will just relocate the mess), so when the request is
ambiguous, offer the phase plan rather than silently starting at whatever is
easiest. If the user explicitly wants to skip the ceremony — "just make it look
better, no plan" — honour that, but still do the freeze and the lint, because
those two are what stop the work from being undone by the next person.
