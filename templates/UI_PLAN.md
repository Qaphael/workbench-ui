# <App name> — UI redesign plan

**Status:** Phase 0 next
**Created:** <YYYY-MM-DD>
**Branch:** `<branch-name>`
**Reference:** `<path to the reference image, or "none">`
**Baseline commit:** `<sha>`

This document is the single source of truth for the UI redesign. It is written
so the work can be paused on one machine and resumed on another without losing
the design decisions or the implementation order.

---

## 0. How to use this plan

1. Read the project instructions file first (e.g. `AGENTS.md`). The rules there
   still apply.
2. Work through the phases **in order**. Do not start the screen polish before
   the shell and primitives exist.
3. Keep **one phase per commit** where practical. Visual changes and large
   refactors should not share a commit.
4. Tick the checkboxes as work is completed.
5. Add a row to the **Progress log** at the end of every work session.
6. If you change a decision, update the **Decision log** before implementing it.
7. Create or resume the working branch:

   ```bash
   git switch -c <branch-name>
   ```

---

## 1. Outcome

> **A dark, low-chrome precision workbench** — a large work canvas, quiet tool
> rail, contextual inspector, and calm surfaces — while keeping the existing
> workflow and its light theme.

The reference is a **visual reference only**. Copy the visual language, not the
workflow: no feature that belongs to the reference's domain (a timeline, an AI
prompt panel, media bins, document tabs) and no custom window chrome.

### Design principles

1. **Precision over decoration.** The work surface is the hero; chrome stays
   quiet.
2. **One primary action per screen.** Secondary actions recede.
3. **Show state; never hide it.** Empty, loading, error, dirty, and disabled
   states are explicit.
4. **Dense, but grouped.** Keep the precision fields; remove visual noise
   through spacing, grouping, and progressive disclosure.
5. **Reversible actions are preferred.** Destructive actions are confirmed.
6. **Light mode keeps its identity.** Dark mode is a new surface treatment, not
   a replacement palette for light.
7. **Keyboard and pointer are equals.** Resizing, shortcuts, focus, and touch
   targets all work.

---

## 2. Non-negotiables

- Offline-first: no runtime network calls, CDN assets, telemetry, or remote
  fonts.
- Licence-safe: no new runtime dependency without a written reason and licence
  check.
- The packaged build must keep working.
- Do not change the app's business semantics (numbering, printing, data
  location, API contracts).
- **Do not change the existing light-mode colour values.** The light palette
  stays as it is.
- Dark mode may adopt a layered near-black surface hierarchy.
- Do not import the reference's content accents unless explicitly requested.
- Preserve the header control budget at the narrow supported width.
- Keep every target at least 44 px on coarse pointers; keep the existing
  focus-visible treatment and axe checks.
- Existing tests, lint and build checks must stay green.

---

## 3. Design direction

### 3.1 What to borrow from the reference

| Reference quality | Interpretation here |
|---|---|
| Near-black canvas | The work surface sits on a near-black canvas; the content stays white |
| Charcoal shell | Header, rail and surrounding chrome use layered charcoal surfaces |
| Lighter inspector | The inspector is a slightly raised surface, not a bordered box |
| Hairline borders | Use surface contrast first, borders second |
| Rounded groups | 12 px panels, 8 px controls, pill badges/chips |
| Large friendly headings | For empty states and onboarding, not dense field labels |
| Quiet small labels | Keep field labels small and muted; values stay readable |
| Icon rail | Keep the tool rail, reduce visual weight |
| Canvas as hero | Maximise the work area; reduce surrounding chrome |
| Contextual panel | Inspector / quick actions beside the work |
| Calm empty state | Short heading, one sentence, one primary action |

### 3.2 What not to copy

_(list the reference's features that belong to a different domain)_

### 3.3 Dark theme token targets

Starting values, not final law. Tune only for contrast and comfort. Keep the
light `:root` values untouched.

```css
--color-bg: #111111;
--color-panel: #181818;
--color-panel-2: #202020;
--color-canvas: #000000;
--color-border: #2c2c2c;
--color-border-strong: #3d3d3d;
--color-bg-hover: #242424;
--color-text: #f2f2f2;
--color-muted: #a6a6a6;
```

Keep the fixed-ink tokens unchanged (they describe content, not chrome):

```css
--color-paper: #ffffff;
--color-stamp: #d00000;
--color-brand: #26324d;
```

### 3.4 Typography, spacing, and shape

- Keep the system font stack — no remote font, no CDN.
- Keep the 13 px base for dense controls. Add larger heading tokens only for
  empty states / onboarding.
- Keep the 4/8/12/16/24/32 spacing scale.
- Use 24–32 px padding for the big view panels; 12–16 px for an inspector.
- Use 12 px radius for panels, 8 px for controls, 999 px for pills.
- Use shadows for modals/popovers and the single inset pane card; surfaces
  carry hierarchy otherwise.

### 3.5 The shell pattern (all views)

The pattern is **not screen-specific**: every view uses the same roles, so the
app reads as one product.

| Role | Light | Dark | Where |
|---|---|---|---|
| `--color-shell` | `panel` | `bg` | header, tool rail, status bar |
| card surface | `panel` + `--radius-card` + `--shadow-card` | same | inspector, run controls, summary/table groups |
| `--color-field` / `--color-field-border` | `panel` / `border` | `panel-2` / transparent (border on hover/focus) | inputs, selects |
| `--color-button-2*` | `panel-2` / `border` | `panel-2` / transparent | secondary buttons |
| `--color-seg*` | `panel-2` / `border` / `panel` | `bg` / transparent / `panel-2` | segmented controls |
| active state | filled `primary` tile | filled `primary` tile | tool rail, one accent state per group |

Rules:

- The shell is borderless; hierarchy comes from surfaces. Group a view's content
  into inset cards.
- A card is inset by one gutter with `--radius-card` and `--shadow-card`. Never
  add a hard-coded colour.
- Keep the splitter contract: the wrapper keeps its measured width; the card is
  inset with padding/pseudo-elements, not by shrinking the pane.
- One primary action per view. Active tool/segment fills are state, not a
  second primary action.
- Bottom chrome (status bar, scrubber) is a recessed strip with no top rule,
  not a card.

### 3.6 Resizable panes

Target behaviour:

- 6 px visible divider, larger invisible hit area.
- Drag with pointer capture, so the gesture continues outside the handle.
- Min/max constraints; the work area and inspector can never fully collapse.
- Double-click resets to the default size.
- Keyboard: focus the separator, arrow keys resize, Shift = larger step.
- `role="separator"`, `aria-orientation`, `aria-valuemin`, `aria-valuemax`,
  `aria-valuenow`, and a readable `aria-label`.
- Persist widths in `localStorage`, per view. Do not store them in the
  template, database, or undo history.
- Below the responsive breakpoint, disable the splitter and use the slide-over
  behaviour.

Proposed defaults:

```text
<view>:
[rail 46px] [canvas flexible] │ [inspector 320px, min 280, max 520]
```

---

## 4. Current baseline (at plan creation)

| Item | Baseline |
|---|---|
| `<main component>` | <lines> |
| `<stylesheet>` | <lines>, ~<n> named tokens |
| Shared primitives | <list> |
| Primitives missing | <list> |
| Raw controls | ~<n> `<button>`s, <n> `<input>`s, <n> `<select>`s |
| Component tests | <count> |
| Unit tests | <count> |
| E2E suite | <count> |

Known structural issues this plan addresses:

- <issue>
- <issue>

---

## 5. Target architecture

```text
src/
  app/                   # composition + routing shell only
  features/              # one folder per screen
  components/
    ui/                  # primitives only
  styles/
    tokens.css           # the token layer
    base.css
    <feature>.css
  <pure-logic>.ts        # pure maths, DOM-free, unit-tested
```

Rules:

- Use the **rule of three**: extract a primitive after its third real use.
- Keep pure logic modules where they are; do not bury them in components.
- Do not move files just to match a diagram. Move when it reduces coupling.
- No new runtime dependency for layout, styling, or primitive components.

---

## 6. Phase plan

### Phase 0 — Baseline and safety net

**Goal:** prove the current app is green before changing anything.

- [ ] Record the full check results in this document.
- [ ] Record the current light palette and **pin it in a test**.
- [ ] Hash the built CSS and store the hash — it is the baseline for proving
      later refactors changed nothing.
- [ ] Write down the structural problems you are about to address.

### Phase 1 — Design tokens and dark surface hierarchy

**Goal:** one place that owns every colour, plus a dark theme that layers
surfaces instead of outlining them.

- [ ] Add the token stylesheet: colours, spacing, radii, type, shadows, z-index.
- [ ] Add the **colour lint** in the same commit.
- [ ] Add the **frozen-palette test** in the same commit.
- [ ] Add the dark theme: the three resolution blocks, the pre-paint script.
- [ ] Verify: the light `:root` fingerprint is unchanged; the dark blocks are
      identical to each other; contrast passes on every surface.

### Phase 2 — Resizable shell

**Goal:** the borderless frame, the card geometry, and draggable panes.

- [ ] The window frame: the mat, the padding, the one rounded outline.
- [ ] `--gutter`, `--radius-card`, `--shadow-card`.
- [ ] The chrome roles: `--color-shell`, `--color-field`, `--color-button-2`,
      `--color-seg*`.
- [ ] The pure resize maths module + its unit tests.
- [ ] The splitter component: pointer capture, double-click reset, arrow keys,
      ARIA, persisted widths.
- [ ] Verify: light still looks like the app did; the splitter contract holds.

### Phase 3 — UI primitives

**Goal:** stop the markup drifting between screens.

- [ ] Add the primitives: Button, IconButton, Field, TextInput, NumberInput,
      Select, SegmentedControl, Tabs, Panel, EmptyState, Badge.
- [ ] Write the primitives README (the contract).
- [ ] Add the dev-only gallery, compiled out of production.
- [ ] Add the e2e spec that screenshots the gallery and runs axe over it.

### Phase 4 — First screen pilot

**Goal:** one screen, migrated end to end, proving the contract.

- [ ] Pick the lowest-risk, highest-impact screen.
- [ ] Migrate it to the primitives.
- [ ] Give it the card treatment and the shell pattern.
- [ ] Add its loading / empty / error / dirty states.
- [ ] Verify: axe in both themes, screenshots in both themes.

### Phase 5 — Expand, one screen per commit

- [ ] Screen 2
- [ ] Screen 3
- [ ] Screen 4

### Phase 6 — Polish

- [ ] Quiet the chrome: the header, the rail, the inspector tabs.
- [ ] Empty states: short heading, one sentence, one primary action.
- [ ] Reduced motion and high-contrast support.
- [ ] Readable disabled states (flat fill + muted text, not faded opacity).

### Phase 7 — Refactor (no style change)

**Goal:** the same app, easier to navigate.

- [ ] Split god components into hooks / feature folders.
- [ ] Split the one stylesheet into ordered feature files.
- [ ] **Prove neutrality: the built CSS hash is unchanged.**
- [ ] Verify: full unit suite, full e2e suite, build.

### Phase 8 — QA, docs, release

- [ ] Axe passes in both themes, every screen.
- [ ] Screenshots captured and reviewed in both themes.
- [ ] The light theme's screenshot diffs are structural only.
- [ ] The project instructions file and the README are updated.
- [ ] The plan checklist and progress log are up to date.

---

## 7. Test matrix

| Change | Minimum checks |
|---|---|
| Dark tokens | unit tests, build, colour lint, theme spec, a11y spec |
| Split panes | splitter unit tests, layout spec, build |
| UI primitives | unit tests, build, targeted e2e for affected screens |
| Screen N | that screen's e2e specs, theme spec, a11y spec |
| App/CSS refactor | full unit suite, full e2e suite, build |
| Backend untouched | the backend suite still runs before release |

Visual regression policy:

- Screenshots are expected to change in the pilot and polish phases.
- Update baselines deliberately, one screen at a time.
- A screenshot diff in the **light** theme must be structural only; if a colour
  hue changed, that is a bug unless explicitly approved.

---

## 8. Cross-machine handoff

### 8.1 Prerequisites

- <os> <version>
- <runtime> <version>
- Node.js 20+ and npm.
- Git.
- Playwright Chromium for e2e.

### 8.2 First setup on a machine

```bash
git clone <url>
cd <repo>
git switch <branch>
<install steps>
```

### 8.3 Resume the redesign

```bash
git fetch origin
git switch <branch>
git pull --ff-only
git status --short
git log -3 --oneline
```

Then read this file and continue at the first unchecked item in the current phase.

### 8.4 Run the app locally

```bash
<backend command>
<frontend command>
```

### 8.5 Run checks

```bash
<backend tests>
cd frontend
npm test
npm run build
npm run lint:colors
npm run test:e2e
```

### 8.6 Data safety

- The real app uses `<data dir>`.
- The e2e suite uses a throwaway data dir and a dry-run print flag.
- Stop a running app on the dev port before e2e, or the suite may reuse it and
  touch the real data directory.

### 8.7 Resume prompt for a new agent/session

Copy this into a new session:

```text
You are continuing the <app> UI redesign.

Read <instructions file> and docs/<plan file> first. Then inspect git status,
git log, and the current branch. Run the baseline checks for the phase you are
resuming. Continue at the first unchecked task in the plan.

Hard constraints:
- Light mode colours stay exactly as they are.
- Dark mode uses the layered charcoal surface hierarchy.
- Resizable split panes with persisted widths, keyboard support, min/max, and
  double-click reset.
- <the reference's features that must not appear>
- Offline-first, no new runtime dependencies, no CDN.
- Keep the existing business semantics.
- Keep all tests green; update the plan's checklist and progress log.

Do not skip ahead to the screen polish before the shell and UI primitives are
in place.
```

---

## 9. Decision log

| Date | Decision | Reason |
|---|---|---|
| <date> | Use the reference as a visual language, not a workflow clone | <reason> |
| <date> | Keep light-mode colours unchanged | <reason> |
| <date> | Dark mode uses layered charcoal surfaces | <reason> |
| <date> | Add resizable split panes with persisted widths | <reason> |
| <date> | Build primitives before a full visual pass | <reason> |
| <date> | Start with the shell, then pilot screens, editor last | <reason> |

---

## 10. Open questions

- [ ] <question> Recommendation: <recommendation>.

---

## 11. Progress log

Add a row after each work session.

| Date | Machine / person | Phase | Commit | What changed / next step |
|---|---|---|---|---|
| <date> | <who> | Plan | `<sha>` | Plan created; no implementation yet |
| <date> | <who> | Phase 0 | `<sha>` | Baseline recorded: <results>. Next: Phase 1. |
| <date> | <who> | Phase 1 | `<sha>` | <what changed, the evidence, and what is next> |

---

## 12. Definition of done

- [ ] The resizable shell works in every view that needs it, with persisted
      widths, keyboard support, min/max, and double-click reset.
- [ ] Dark mode matches the low-chrome direction.
- [ ] Light mode colours are unchanged.
- [ ] Every screen shares the same visual language.
- [ ] Repeated UI patterns use primitives where justified.
- [ ] The main components are smaller and easier to navigate.
- [ ] All automated tests pass; axe passes in both themes.
- [ ] Light/dark screenshots are captured and reviewed.
- [ ] The instructions file, README and test plan are updated.
- [ ] The packaged build is verified or explicitly listed as needing
      verification.
- [ ] The plan checklist and progress log are up to date.
